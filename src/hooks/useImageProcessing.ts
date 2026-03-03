import { useState, useCallback, useRef } from 'react';
import type { MappedPixel, PaletteColor, PixelationMode } from '../types';
import { calculatePixelGrid } from '../core/pixelation';
import { mergeColors } from '../utils/colorMerge';
import { markExternalCells } from '../utils/backgroundRemoval';

export interface ProcessingOptions {
  useWorker?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Hook for processing images with optional Web Worker support
 * Falls back to main thread if Worker is not available
 */
export function useImageProcessing(options: ProcessingOptions = {}) {
  const { useWorker = true, onProgress } = options;
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const workerRef = useRef<Worker | null>(null);

  // 初始化 Worker
  const initWorker = useCallback(() => {
    if (!useWorker) return null;
    if (workerRef.current) return workerRef.current;

    try {
      const worker = new Worker(
        new URL('../workers/imageProcessor.worker.ts', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;
      return worker;
    } catch (error) {
      console.warn('Failed to create worker, falling back to main thread:', error);
      return null;
    }
  }, [useWorker]);

  // 像素化处理
  const pixelate = useCallback(
    (
      canvas: HTMLCanvasElement,
      N: number,
      M: number,
      palette: PaletteColor[],
      mode: PixelationMode
    ): Promise<MappedPixel[][]> => {
      return new Promise((resolve, reject) => {
        setIsProcessing(true);
        setProgress(0);

        const worker = initWorker();

        if (worker) {
          // 使用 Worker
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          const handleMessage = (e: MessageEvent) => {
            const { type, data, progress: workerProgress, error } = e.data;

            if (type === 'progress' && workerProgress !== undefined) {
              setProgress(workerProgress);
              onProgress?.(workerProgress);
            } else if (type === 'complete') {
              worker.removeEventListener('message', handleMessage);
              setIsProcessing(false);
              setProgress(100);
              resolve(data);
            } else if (type === 'error') {
              worker.removeEventListener('message', handleMessage);
              setIsProcessing(false);
              reject(new Error(error));
            }
          };

          worker.addEventListener('message', handleMessage);
          worker.postMessage({
            type: 'pixelate',
            data: {
              imageData,
              width: canvas.width,
              height: canvas.height,
              N,
              M,
              palette,
              mode,
            },
          });
        } else {
          // 回退到主线程
          setTimeout(() => {
            try {
              const grid = calculatePixelGrid(canvas, N, M, palette, mode);
              setIsProcessing(false);
              setProgress(100);
              resolve(grid);
            } catch (error) {
              setIsProcessing(false);
              reject(error);
            }
          }, 0);
        }
      });
    },
    [initWorker, onProgress]
  );

  // 颜色合并处理
  const processMergeColors = useCallback(
    (grid: MappedPixel[][], threshold: number): Promise<MappedPixel[][]> => {
      return new Promise((resolve, reject) => {
        setIsProcessing(true);

        const worker = initWorker();

        if (worker && threshold > 0) {
          // 使用 Worker（仅当阈值 > 0 时，因为小阈值在主线程更快）
          const handleMessage = (e: MessageEvent) => {
            const { type, data, error } = e.data;

            if (type === 'complete') {
              worker.removeEventListener('message', handleMessage);
              setIsProcessing(false);
              resolve(data);
            } else if (type === 'error') {
              worker.removeEventListener('message', handleMessage);
              setIsProcessing(false);
              reject(new Error(error));
            }
          };

          worker.addEventListener('message', handleMessage);
          worker.postMessage({
            type: 'mergeColors',
            data: { grid, threshold },
          });
        } else {
          // 回退到主线程
          setTimeout(() => {
            try {
              const result = mergeColors(grid, threshold);
              setIsProcessing(false);
              resolve(result);
            } catch (error) {
              setIsProcessing(false);
              reject(error);
            }
          }, 0);
        }
      });
    },
    [initWorker]
  );

  // 背景移除处理
  const processRemoveBackground = useCallback(
    (grid: MappedPixel[][]): Promise<MappedPixel[][]> => {
      return new Promise((resolve, reject) => {
        setIsProcessing(true);

        const worker = initWorker();

        if (worker) {
          // 使用 Worker
          const handleMessage = (e: MessageEvent) => {
            const { type, data, error } = e.data;

            if (type === 'complete') {
              worker.removeEventListener('message', handleMessage);
              setIsProcessing(false);
              resolve(data);
            } else if (type === 'error') {
              worker.removeEventListener('message', handleMessage);
              setIsProcessing(false);
              reject(new Error(error));
            }
          };

          worker.addEventListener('message', handleMessage);
          worker.postMessage({
            type: 'removeBackground',
            data: { grid },
          });
        } else {
          // 回退到主线程
          setTimeout(() => {
            try {
              const result = markExternalCells(grid);
              setIsProcessing(false);
              resolve(result);
            } catch (error) {
              setIsProcessing(false);
              reject(error);
            }
          }, 0);
        }
      });
    },
    [initWorker]
  );

  // 清理 Worker
  const cleanup = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    pixelate,
    processMergeColors,
    processRemoveBackground,
    isProcessing,
    progress,
    cleanup,
  };
}
