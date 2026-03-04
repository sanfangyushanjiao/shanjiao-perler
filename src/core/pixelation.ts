import type { RgbColor, PaletteColor, MappedPixel, PixelationMode } from '../types';
import { findClosestPaletteColor, isTransparent } from './colorUtils';

/**
 * 计算单元格的代表色
 * @param imageData - 原始图像数据
 * @param startX - 单元格起始 X 坐标
 * @param startY - 单元格起始 Y 坐标
 * @param cellWidth - 单元格宽度
 * @param cellHeight - 单元格高度
 * @param mode - 计算模式：'realistic'（真实模式-平均色）或 'cartoon'（卡通模式-主导色）
 * @returns RGB 颜色或 null（如果单元格完全透明）
 */
export function calculateCellRepresentativeColor(
  imageData: ImageData,
  startX: number,
  startY: number,
  cellWidth: number,
  cellHeight: number,
  mode: PixelationMode
): RgbColor | null {
  const { data, width } = imageData;
  const colorMap = new Map<string, number>(); // 颜色 -> 出现次数
  let totalR = 0;
  let totalG = 0;
  let totalB = 0;
  let validPixelCount = 0;

  // 遍历单元格内的所有像素
  for (let y = startY; y < startY + cellHeight; y++) {
    for (let x = startX; x < startX + cellWidth; x++) {
      // 确保坐标在图像范围内
      if (x >= width || y >= imageData.height) continue;

      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // 跳过透明像素
      if (isTransparent(a)) continue;

      validPixelCount++;

      if (mode === 'cartoon') {
        // 卡通模式：统计每种颜色的出现次数（主导色算法）
        const colorKey = `${r},${g},${b}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      } else {
        // 真实模式：累加 RGB 值（平均色算法）
        totalR += r;
        totalG += g;
        totalB += b;
      }
    }
  }

  // 如果单元格内没有有效像素，返回 null
  if (validPixelCount === 0) {
    return null;
  }

  if (mode === 'cartoon') {
    // 找出出现次数最多的颜色（主导色）
    let maxCount = 0;
    let dominantColor = '';

    for (const [color, count] of colorMap.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    }

    const [r, g, b] = dominantColor.split(',').map(Number);
    return { r, g, b };
  } else {
    // 返回平均颜色
    return {
      r: Math.round(totalR / validPixelCount),
      g: Math.round(totalG / validPixelCount),
      b: Math.round(totalB / validPixelCount),
    };
  }
}

/**
 * 像素化主函数
 * 将原始图像转换为拼豆网格
 * @param canvas - 包含原始图像的 Canvas
 * @param N - 网格列数
 * @param M - 网格行数
 * @param palette - 调色板（拼豆颜色列表）
 * @param mode - 像素化模式
 * @returns 映射后的像素网格
 */
export function calculatePixelGrid(
  canvas: HTMLCanvasElement,
  N: number,
  M: number,
  palette: PaletteColor[],
  mode: PixelationMode
): MappedPixel[][] {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  // 计算每个单元格的尺寸
  const cellWidth = imgWidth / N;
  const cellHeight = imgHeight / M;

  // 获取图像数据
  const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight);

  // 创建结果网格
  const grid: MappedPixel[][] = [];

  // 遍历每个单元格
  for (let row = 0; row < M; row++) {
    const rowPixels: MappedPixel[] = [];

    for (let col = 0; col < N; col++) {
      const startX = Math.floor(col * cellWidth);
      const startY = Math.floor(row * cellHeight);
      const endX = Math.floor((col + 1) * cellWidth);
      const endY = Math.floor((row + 1) * cellHeight);

      // 计算单元格的代表色
      const representativeColor = calculateCellRepresentativeColor(
        imageData,
        startX,
        startY,
        endX - startX,
        endY - startY,
        mode
      );

      // 如果单元格是透明的，使用白色作为默认颜色
      const targetColor = representativeColor || { r: 255, g: 255, b: 255 };

      // 找到最接近的调色板颜色
      const paletteColor = findClosestPaletteColor(targetColor, palette);

      rowPixels.push({
        paletteColor,
        position: { x: col, y: row },
      });
    }

    grid.push(rowPixels);
  }

  return grid;
}

/**
 * 根据目标尺寸计算网格大小
 * @param imgWidth - 图像宽度
 * @param imgHeight - 图像高度
 * @param targetSize - 目标珠子数量（较长边）
 * @returns { N: 列数, M: 行数 }
 */
export function calculateGridSize(
  imgWidth: number,
  imgHeight: number,
  targetSize: number
): { N: number; M: number } {
  const aspectRatio = imgWidth / imgHeight;

  if (imgWidth >= imgHeight) {
    // 横向图片
    const N = targetSize;
    const M = Math.round(targetSize / aspectRatio);
    return { N, M };
  } else {
    // 纵向图片
    const M = targetSize;
    const N = Math.round(targetSize * aspectRatio);
    return { N, M };
  }
}
