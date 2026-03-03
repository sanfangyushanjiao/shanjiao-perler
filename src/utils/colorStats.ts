import type { MappedPixel, ColorStat, BrandName } from '../types';

/**
 * 统计颜色使用情况
 * @param grid - 像素网格
 * @param brand - 当前选择的品牌
 * @returns 颜色统计数组，按使用数量降序排列
 */
export function calculateColorStats(
  grid: MappedPixel[][],
  brand: BrandName
): ColorStat[] {
  const colorMap = new Map<string, ColorStat>();

  // 遍历网格统计每种颜色的使用次数（排除外部背景）
  for (const row of grid) {
    for (const pixel of row) {
      // 跳过外部背景区域
      if (pixel.isExternal) continue;

      const { paletteColor } = pixel;
      const hex = paletteColor.hex;

      if (colorMap.has(hex)) {
        const stat = colorMap.get(hex)!;
        stat.count++;
      } else {
        colorMap.set(hex, {
          paletteColor,
          count: 1,
          code: paletteColor.codes[brand] || 'N/A',
        });
      }
    }
  }

  // 转换为数组并按数量降序排序
  const stats = Array.from(colorMap.values());
  stats.sort((a, b) => b.count - a.count);

  return stats;
}

/**
 * 计算总珠子数
 */
export function getTotalBeadCount(stats: ColorStat[]): number {
  return stats.reduce((sum, stat) => sum + stat.count, 0);
}

/**
 * 获取使用的颜色种类数
 */
export function getColorCount(stats: ColorStat[]): number {
  return stats.length;
}
