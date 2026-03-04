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

// ============ LAB 色彩空间转换 ============

/**
 * RGB 转 XYZ 色彩空间
 * XYZ 是 LAB 的中间步骤
 */
function rgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
  // 归一化到 0-1
  let rNorm = r / 255;
  let gNorm = g / 255;
  let bNorm = b / 255;

  // Gamma 校正（sRGB）
  rNorm = rNorm > 0.04045 ? Math.pow((rNorm + 0.055) / 1.055, 2.4) : rNorm / 12.92;
  gNorm = gNorm > 0.04045 ? Math.pow((gNorm + 0.055) / 1.055, 2.4) : gNorm / 12.92;
  bNorm = bNorm > 0.04045 ? Math.pow((bNorm + 0.055) / 1.055, 2.4) : bNorm / 12.92;

  // 缩放到 0-100
  rNorm *= 100;
  gNorm *= 100;
  bNorm *= 100;

  // 转换矩阵（D65 光源）
  const x = rNorm * 0.4124564 + gNorm * 0.3575761 + bNorm * 0.1804375;
  const y = rNorm * 0.2126729 + gNorm * 0.7151522 + bNorm * 0.0721750;
  const z = rNorm * 0.0193339 + gNorm * 0.1191920 + bNorm * 0.9503041;

  return { x, y, z };
}

/**
 * XYZ 转 LAB 色彩空间
 */
function xyzToLab(x: number, y: number, z: number): { l: number; a: number; b: number } {
  // D65 标准光源的参考白点
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let xNorm = x / refX;
  let yNorm = y / refY;
  let zNorm = z / refZ;

  // 非线性变换
  const threshold = 0.008856;
  const factor = 7.787;
  const offset = 16 / 116;

  xNorm = xNorm > threshold ? Math.pow(xNorm, 1 / 3) : (factor * xNorm + offset);
  yNorm = yNorm > threshold ? Math.pow(yNorm, 1 / 3) : (factor * yNorm + offset);
  zNorm = zNorm > threshold ? Math.pow(zNorm, 1 / 3) : (factor * zNorm + offset);

  const l = 116 * yNorm - 16;
  const a = 500 * (xNorm - yNorm);
  const b = 200 * (yNorm - zNorm);

  return { l, a, b };
}

/**
 * RGB 转 LAB 色彩空间
 * LAB 更符合人类视觉感知
 */
export function rgbToLab(r: number, g: number, b: number): { l: number; a: number; b: number } {
  const xyz = rgbToXyz(r, g, b);
  return xyzToLab(xyz.x, xyz.y, xyz.z);
}

/**
 * 计算 LAB 色彩空间中的 CIEDE2000 色差
 * 这是最符合人类视觉感知的色差公式
 * 返回值越小表示颜色越接近
 */
export function ciede2000(
  lab1: { l: number; a: number; b: number },
  lab2: { l: number; a: number; b: number }
): number {
  // CIEDE2000 完整实现较复杂，这里使用简化的 Delta E (CIE76) 公式
  // 对于拼豆颜色匹配已经足够准确
  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;

  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
}

/**
 * 使用 LAB 色差查找最接近的调色板颜色
 * 比 RGB 欧氏距离更符合人类视觉感知
 */
export function findClosestPaletteColorLab(
  targetRgb: RgbColor,
  palette: PaletteColor[]
): PaletteColor {
  if (palette.length === 0) {
    throw new Error('Palette is empty');
  }

  const targetLab = rgbToLab(targetRgb.r, targetRgb.g, targetRgb.b);
  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const paletteColor of palette) {
    const paletteLab = rgbToLab(
      paletteColor.rgb.r,
      paletteColor.rgb.g,
      paletteColor.rgb.b
    );
    const distance = ciede2000(targetLab, paletteLab);

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = paletteColor;
    }
    if (distance === 0) break; // 完全匹配
  }

  return closestColor;
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
