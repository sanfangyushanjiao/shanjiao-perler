import type { MappedPixel, PaletteColor, PixelationMode } from '../types';
import { calculateCellRepresentativeColor } from '../core/pixelation';
import { findClosestPaletteColor } from '../core/colorUtils';
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
  const { imageData, N, M, palette, mode } = data;
  const cellWidth = imageData.width / N;
  const cellHeight = imageData.height / M;
  const grid: MappedPixel[][] = [];

  for (let row = 0; row < M; row++) {
    const rowPixels: MappedPixel[] = [];

    for (let col = 0; col < N; col++) {
      const startX = Math.floor(col * cellWidth);
      const startY = Math.floor(row * cellHeight);
      const endX = Math.floor((col + 1) * cellWidth);
      const endY = Math.floor((row + 1) * cellHeight);

      const representativeColor = calculateCellRepresentativeColor(
        imageData,
        startX,
        startY,
        endX - startX,
        endY - startY,
        mode
      );

      const targetColor = representativeColor || { r: 255, g: 255, b: 255 };
      const paletteColor = findClosestPaletteColor(targetColor, palette);

      rowPixels.push({
        paletteColor,
        position: { x: col, y: row },
      });
    }

    // 发送进度更新
    const progress = ((row + 1) / M) * 100;
    self.postMessage({
      type: 'progress',
      progress,
    } as WorkerResponse);

    grid.push(rowPixels);
  }

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
