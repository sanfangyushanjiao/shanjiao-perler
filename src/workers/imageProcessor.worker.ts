import type { MappedPixel, PaletteColor, PixelationMode } from '../types';
import { calculatePixelGrid } from '../core/pixelation';
import { mergeColors } from '../utils/colorMerge';
import { markExternalCells } from '../utils/backgroundRemoval';

export interface WorkerMessage {
  type: 'pixelate' | 'mergeColors' | 'removeBackground';
  data: any;
}

export interface WorkerResponse {
  type: 'complete' | 'progress' | 'error';
  data?: any;
  progress?: number;
  error?: string;
}

// 像素化处理
function handlePixelate(data: {
  imageData: ImageData;
  width: number;
  height: number;
  N: number;
  M: number;
  palette: PaletteColor[];
  mode: PixelationMode;
}): MappedPixel[][] {
  const { imageData, width, height, N, M, palette, mode } = data;

  // 创建离屏 Canvas 用于处理
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // 将 ImageData 写入 Canvas
  ctx.putImageData(imageData, 0, 0);

  // 使用核心像素化函数（包含新的网格分块降采样逻辑）
  const grid = calculatePixelGrid(canvas as any, N, M, palette, mode);

  return grid;
}

// 颜色合并处理
function handleMergeColors(data: {
  grid: MappedPixel[][];
  threshold: number;
}): MappedPixel[][] {
  return mergeColors(data.grid, data.threshold);
}

// 背景移除处理
function handleRemoveBackground(data: {
  grid: MappedPixel[][];
}): MappedPixel[][] {
  return markExternalCells(data.grid);
}

// 监听主线程消息
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;

  try {
    let result: any;

    switch (type) {
      case 'pixelate':
        result = handlePixelate(data);
        break;

      case 'mergeColors':
        result = handleMergeColors(data);
        break;

      case 'removeBackground':
        result = handleRemoveBackground(data);
        break;

      default:
        throw new Error(`Unknown worker message type: ${type}`);
    }

    self.postMessage({
      type: 'complete',
      data: result,
    } as WorkerResponse);
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error),
    } as WorkerResponse);
  }
};
