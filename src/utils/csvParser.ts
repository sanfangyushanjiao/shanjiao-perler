import type { MappedPixel, PaletteColor } from '../types';
import { hexToRgb, colorDistance } from '../core/colorUtils';

/**
 * CSV 像素数据接口
 */
export interface CSVPixel {
  x: number;
  y: number;
  color: string;
  code?: string;
}

/**
 * 解析 CSV 文本为像素数据数组
 *
 * CSV 格式要求：
 * - 必须包含 x, y, color 列
 * - 可选包含 code 列（品牌色号）
 * - 第一行为表头
 *
 * @param csvText CSV 文本内容
 * @returns 像素数据数组
 * @throws 如果 CSV 格式不正确
 */
export function parseCSV(csvText: string): CSVPixel[] {
  const lines = csvText.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV 文件为空或格式不正确');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // 验证必需的列
  if (!headers.includes('x') || !headers.includes('y') || !headers.includes('color')) {
    throw new Error('CSV 文件必须包含 x, y, color 列');
  }

  const xIndex = headers.indexOf('x');
  const yIndex = headers.indexOf('y');
  const colorIndex = headers.indexOf('color');
  const codeIndex = headers.indexOf('code');

  const pixels: CSVPixel[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // 跳过空行

    const values = line.split(',').map(v => v.trim());
    if (values.length < 3) {
      console.warn(`第 ${i + 1} 行数据不完整，已跳过`);
      continue;
    }

    const x = parseInt(values[xIndex]);
    const y = parseInt(values[yIndex]);

    if (isNaN(x) || isNaN(y)) {
      console.warn(`第 ${i + 1} 行坐标无效，已跳过`);
      continue;
    }

    pixels.push({
      x,
      y,
      color: values[colorIndex],
      code: codeIndex >= 0 ? values[codeIndex] : undefined,
    });
  }

  if (pixels.length === 0) {
    throw new Error('CSV 文件中没有有效的像素数据');
  }

  return pixels;
}

/**
 * 将 CSV 像素数据转换为像素网格
 *
 * @param pixels CSV 像素数据数组
 * @param palette 调色板
 * @returns 像素网格
 */
export function csvToPixelGrid(
  pixels: CSVPixel[],
  palette: PaletteColor[]
): MappedPixel[][] {
  // 计算网格尺寸
  const maxX = Math.max(...pixels.map(p => p.x));
  const maxY = Math.max(...pixels.map(p => p.y));
  const width = maxX + 1;
  const height = maxY + 1;

  console.log(`CSV 网格尺寸: ${width} x ${height}`);

  // 创建空网格（默认使用白色）
  const whiteColor = palette.find(c => c.hex.toLowerCase() === '#ffffff') || palette[0];
  const grid: MappedPixel[][] = Array(height).fill(null).map((_, y) =>
    Array(width).fill(null).map((_, x) => ({
      paletteColor: whiteColor,
      position: { x, y },
      isExternal: false,
    }))
  );

  // 填充像素数据
  let matchedCount = 0;
  let unmatchedCount = 0;

  pixels.forEach(pixel => {
    if (pixel.y >= height || pixel.x >= width || pixel.y < 0 || pixel.x < 0) {
      console.warn(`像素坐标超出范围: (${pixel.x}, ${pixel.y})`);
      return;
    }

    // 查找匹配的调色板颜色
    const paletteColor = palette.find(c =>
      c.hex.toLowerCase() === pixel.color.toLowerCase()
    );

    if (!paletteColor) {
      console.warn(`颜色 ${pixel.color} 不在调色板中，使用最接近的颜色`);
      unmatchedCount++;
      // 使用最接近的颜色
      const closestColor = findClosestColor(pixel.color, palette);
      grid[pixel.y][pixel.x] = {
        paletteColor: closestColor,
        position: { x: pixel.x, y: pixel.y },
        isExternal: false,
      };
    } else {
      matchedCount++;
      grid[pixel.y][pixel.x] = {
        paletteColor: paletteColor,
        position: { x: pixel.x, y: pixel.y },
        isExternal: false,
      };
    }
  });

  console.log(`CSV 解析完成: ${matchedCount} 个颜色匹配, ${unmatchedCount} 个颜色未匹配`);

  return grid;
}

/**
 * 查找最接近的调色板颜色
 */
function findClosestColor(hexColor: string, palette: PaletteColor[]): PaletteColor {
  const rgb = hexToRgb(hexColor);

  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const color of palette) {
    const distance = colorDistance(rgb, color.rgb);

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}
