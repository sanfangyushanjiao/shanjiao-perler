import { describe, it, expect } from 'vitest';
import { mergeColors } from '../colorMerge';
import type { MappedPixel, PaletteColor } from '../../types';

describe('colorMerge', () => {
  const createColor = (hex: string, r: number, g: number, b: number): PaletteColor => ({
    hex,
    rgb: { r, g, b },
    codes: {},
  });

  const red = createColor('#FF0000', 255, 0, 0);
  const darkRed = createColor('#CC0000', 204, 0, 0);
  const blue = createColor('#0000FF', 0, 0, 255);
  const green = createColor('#00FF00', 0, 255, 0);

  const createPixel = (color: PaletteColor, x: number, y: number): MappedPixel => ({
    paletteColor: color,
    position: { x, y },
  });

  describe('mergeColors', () => {
    it('should return original grid when threshold is 0', () => {
      const grid = [
        [createPixel(red, 0, 0), createPixel(blue, 1, 0)],
        [createPixel(green, 0, 1), createPixel(red, 1, 1)],
      ];

      const result = mergeColors(grid, 0);
      expect(result).toEqual(grid);
    });

    it('should merge similar colors in connected region', () => {
      // 创建一个 2x2 网格，左上和右上是相似的红色
      const grid = [
        [createPixel(red, 0, 0), createPixel(darkRed, 1, 0)],
        [createPixel(blue, 0, 1), createPixel(green, 1, 1)],
      ];

      // 阈值设为 60，足以合并 red 和 darkRed（距离约 51）
      const result = mergeColors(grid, 60);

      // 两个红色应该合并为同一颜色（出现次数多的那个）
      expect(result[0][0].paletteColor.hex).toBe(result[0][1].paletteColor.hex);
    });

    it('should not merge colors beyond threshold', () => {
      const grid = [
        [createPixel(red, 0, 0), createPixel(blue, 1, 0)],
      ];

      // 阈值很小，不足以合并红色和蓝色
      const result = mergeColors(grid, 10);

      // 颜色应该保持不变
      expect(result[0][0].paletteColor.hex).toBe('#FF0000');
      expect(result[0][1].paletteColor.hex).toBe('#0000FF');
    });

    it('should merge larger connected regions', () => {
      // 创建一个 3x3 网格，中间是相似红色的连通区域
      const grid = [
        [createPixel(blue, 0, 0), createPixel(red, 1, 0), createPixel(blue, 2, 0)],
        [createPixel(red, 0, 1), createPixel(darkRed, 1, 1), createPixel(red, 2, 1)],
        [createPixel(blue, 0, 2), createPixel(red, 1, 2), createPixel(blue, 2, 2)],
      ];

      const result = mergeColors(grid, 60);

      // 所有红色区域应该合并为同一颜色
      const redPixels = [
        result[0][1],
        result[1][0],
        result[1][1],
        result[1][2],
        result[2][1],
      ];

      const firstRedHex = redPixels[0].paletteColor.hex;
      for (const pixel of redPixels) {
        expect(pixel.paletteColor.hex).toBe(firstRedHex);
      }
    });

    it('should handle single pixel grid', () => {
      const grid = [[createPixel(red, 0, 0)]];
      const result = mergeColors(grid, 50);
      expect(result[0][0].paletteColor.hex).toBe('#FF0000');
    });

    it('should not modify original grid', () => {
      const grid = [
        [createPixel(red, 0, 0), createPixel(darkRed, 1, 0)],
      ];

      const originalHex = grid[0][1].paletteColor.hex;
      mergeColors(grid, 60);

      // 原始网格不应该被修改
      expect(grid[0][1].paletteColor.hex).toBe(originalHex);
    });
  });
});
