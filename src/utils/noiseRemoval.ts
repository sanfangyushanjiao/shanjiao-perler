import type { MappedPixel, PaletteColor } from '../types';
import { colorDistance } from '../core/colorUtils';

/**
 * 去除杂色：将指定颜色的单元格重新映射到最接近的可用颜色
 * @param grid - 像素网格
 * @param excludedColors - 要排除的颜色集合（hex 值）
 * @param palette - 完整的调色板
 * @returns 重新映射后的网格
 */
export function removeNoiseColors(
  grid: MappedPixel[][],
  excludedColors: Set<string>,
  palette: PaletteColor[]
): MappedPixel[][] {
  if (excludedColors.size === 0) {
    return grid;
  }

  // 创建可用颜色的调色板（排除被选中的颜色）
  const availablePalette = palette.filter(
    (color) => !excludedColors.has(color.hex.toUpperCase())
  );

  if (availablePalette.length === 0) {
    console.warn('没有可用的颜色进行重新映射');
    return grid;
  }

  // 创建结果网格
  const result: MappedPixel[][] = grid.map((row) =>
    row.map((pixel) => {
      // 如果是外部区域，不处理
      if (pixel.isExternal) {
        return pixel;
      }

      const pixelHex = pixel.paletteColor.hex.toUpperCase();

      // 如果颜色在排除列表中，重新映射
      if (excludedColors.has(pixelHex)) {
        const closestColor = findClosestColor(
          pixel.paletteColor,
          availablePalette
        );
        return {
          ...pixel,
          paletteColor: closestColor,
        };
      }

      return pixel;
    })
  );

  return result;
}

/**
 * 查找最接近的颜色
 */
function findClosestColor(
  targetColor: PaletteColor,
  palette: PaletteColor[]
): PaletteColor {
  if (palette.length === 0) {
    throw new Error('调色板为空');
  }

  let minDistance = Infinity;
  let closestColor = palette[0];

  for (const paletteColor of palette) {
    const distance = colorDistance(targetColor.rgb, paletteColor.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = paletteColor;
    }
  }

  return closestColor;
}
