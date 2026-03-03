import type { RgbColor, PaletteColor, ColorMapping, BrandName } from '../types';
import colorMappingData from '../data/colorMapping.json';

/**
 * 将十六进制颜色转换为 RGB
 */
export function hexToRgb(hex: string): RgbColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * 将 RGB 转换为十六进制颜色
 */
export function rgbToHex(rgb: RgbColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * 计算两个 RGB 颜色之间的欧氏距离
 * 使用标准的 RGB 欧氏距离公式
 */
export function colorDistance(rgb1: RgbColor, rgb2: RgbColor): number {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * 加载调色板数据
 * 将 JSON 格式的色卡数据转换为 PaletteColor 数组
 */
export function loadPalette(): PaletteColor[] {
  const mapping = colorMappingData as unknown as ColorMapping;
  const palette: PaletteColor[] = [];

  for (const [hex, codes] of Object.entries(mapping)) {
    try {
      const rgb = hexToRgb(hex);
      palette.push({
        hex,
        rgb,
        codes: codes as Partial<Record<BrandName, string>>,
      });
    } catch (error) {
      console.warn(`Failed to parse color ${hex}:`, error);
    }
  }

  return palette;
}

/**
 * 查找最接近的调色板颜色
 * 使用 RGB 欧氏距离算法
 */
export function findClosestPaletteColor(
  targetRgb: RgbColor,
  palette: PaletteColor[]
): PaletteColor {
  if (palette.length === 0) {
    throw new Error('Palette is empty');
  }

  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const paletteColor of palette) {
    const distance = colorDistance(targetRgb, paletteColor.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = paletteColor;
    }
  }

  return closestColor;
}

/**
 * 判断颜色是否接近透明
 * alpha < 128 视为透明
 */
export function isTransparent(alpha: number): boolean {
  return alpha < 128;
}
