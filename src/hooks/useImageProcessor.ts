import { useRef, useCallback } from 'react';
import type { MappedPixel, PaletteColor, PixelationMode } from '../types';
import type { WorkerMessage, WorkerResponse } from '../workers/imageProcessor.worker';

export interface UseImageProcessorOptions {
  onProgress?: (progress: number) => void;
  onComplete?: (result: MappedPixel[][]) => void;
  onError?: (error: string) => void;
}

export function useImageProcessor(options: UseImageProcessorOptions = {}) {
  const workerRef = useRef<Worker | null>(null);
  const { onProgress, onComplete, onError } = options;

  // 初始化 Worker
  const initWorker = useCallback(() => {
    if (workerRef.current) {
      return workerRef.current;
    }

    const worker = new Worker(
      new URL('../workers/imageProcessor.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, data, progress, error } = e.data;

      switch (type) {
        case 'progress':
          if (progress !== undefined && onProgress) {
            onProgress(progress);
          }
          break;

        case 'complete':
          if (data && onComplete) {
            onComplete(data);
          }
          break;

        case 'error':
          if (error && onError) {
            onError(error);
          }
          break;
      }
    };

    worker.onerror = (error) => {
      console.error('Worker error:', error);
      if (onError) {
        onError(error.message);
      }
    };

    workerRef.current = worker;
    return worker;
  }, [onProgress, onComplete, onError]);

  // 像素化处理
  const pixelate = useCallback(
    (
      imageData: ImageData,
      width: number,
      height: number,
      N: number,
      M: number,
      palette: PaletteColor[],
      mode: PixelationMode
    ) => {
      const worker = initWorker();
      const message: WorkerMessage = {
        type: 'pixelate',
        data: { imageData, width, height, N, M, palette, mode },
      };
      worker.postMessage(message);
    },
    [initWorker]
  );

  // 颜色合并处理
  const mergeColors = useCallback(
    (grid: MappedPixel[][], threshold: number) => {
      const worker = initWorker();
      const message: WorkerMessage = {
        type: 'mergeColors',
        data: { grid, threshold },
      };
      worker.postMessage(message);
    },
    [initWorker]
  );

  // 背景移除处理
  const removeBackground = useCallback(
    (grid: MappedPixel[][]) => {
      const worker = initWorker();
      const message: WorkerMessage = {
        type: 'removeBackground',
        data: { grid },
      };
      worker.postMessage(message);
    },
    [initWorker]
  );

  // 清理 Worker
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    pixelate,
    mergeColors,
    removeBackground,
    terminate,
  };
}
