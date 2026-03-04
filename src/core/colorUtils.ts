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

/**
 * RGB 转 HSL
 * @param r - 红色值 (0-255)
 * @param g - 绿色值 (0-255)
 * @param b - 蓝色值 (0-255)
 * @returns { h: 色相(0-360), s: 饱和度(0-1), l: 亮度(0-1) }
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

/**
 * HSL 转 RGB
 * @param h - 色相 (0-360)
 * @param s - 饱和度 (0-1)
 * @param l - 亮度 (0-1)
 * @returns RGB 颜色对象
 */
export function hslToRgb(h: number, s: number, l: number): RgbColor {
  h = h / 360;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * 颜色量化
 * 将 RGB 颜色量化到较少的级别
 * @param r - 红色值 (0-255)
 * @param g - 绿色值 (0-255)
 * @param b - 蓝色值 (0-255)
 * @param levels - 量化级别数（默认16）
 * @returns 量化后的 RGB 颜色
 */
export function quantizeColor(r: number, g: number, b: number, levels: number = 16): RgbColor {
  const step = 256 / levels;
  return {
    r: Math.floor(r / step) * step,
    g: Math.floor(g / step) * step,
    b: Math.floor(b / step) * step,
  };
}

/**
 * 增强饱和度
 * @param s - 原始饱和度 (0-1)
 * @param factor - 增强因子（默认1.4，即增强40%）
 * @returns 增强后的饱和度，限制在 0-1 范围内
 */
export function enhanceSaturation(s: number, factor: number = 1.4): number {
  return Math.min(1, s * factor);
}

/**
 * 增强对比度（使用 S 曲线）
 * 亮色更亮，暗色更暗
 * @param l - 原始亮度 (0-1)
 * @param factor - 对比度因子（默认1.3）
 * @returns 增强后的亮度，限制在 0-1 范围内
 */
export function enhanceContrast(l: number, factor: number = 1.3): number {
  if (l > 0.5) {
    l = 0.5 + (l - 0.5) * factor;
  } else {
    l = 0.5 - (0.5 - l) * factor;
  }
  return Math.max(0, Math.min(1, l));
}
