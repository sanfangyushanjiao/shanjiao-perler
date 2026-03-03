import { describe, it, expect } from 'vitest';
import { markExternalCells } from '../backgroundRemoval';
import type { MappedPixel, PaletteColor } from '../../types';

describe('backgroundRemoval', () => {
  const createColor = (hex: string, r: number, g: number, b: number): PaletteColor => ({
    hex,
    rgb: { r, g, b },
    codes: {},
  });

  const white = createColor('#FFFFFF', 255, 255, 255);
  const red = createColor('#FF0000', 255, 0, 0);
  const blue = createColor('#0000FF', 0, 0, 255);

  const createPixel = (color: PaletteColor, x: number, y: number): MappedPixel => ({
    paletteColor: color,
    position: { x, y },
    isExternal: false,
  });

  describe('markExternalCells', () => {
    it('should mark border white cells as external', () => {
      // 创建一个 3x3 网格，边界是白色，中间是红色
      const grid = [
        [createPixel(white, 0, 0), createPixel(white, 1, 0), createPixel(white, 2, 0)],
        [createPixel(white, 0, 1), createPixel(red, 1, 1), createPixel(white, 2, 1)],
        [createPixel(white, 0, 2), createPixel(white, 1, 2), createPixel(white, 2, 2)],
      ];

      const result = markExternalCells(grid);

      // 所有白色单元格应该被标记为外部
      expect(result[0][0].isExternal).toBe(true);
      expect(result[0][1].isExternal).toBe(true);
      expect(result[0][2].isExternal).toBe(true);
      expect(result[1][0].isExternal).toBe(true);
      expect(result[1][2].isExternal).toBe(true);
      expect(result[2][0].isExternal).toBe(true);
      expect(result[2][1].isExternal).toBe(true);
      expect(result[2][2].isExternal).toBe(true);

      // 中间的红色不应该被标记
      expect(result[1][1].isExternal).toBe(false);
    });

    it('should not mark internal white cells', () => {
      // 创建一个 5x5 网格，中间有白色但被红色包围
      const grid = [
        [createPixel(white, 0, 0), createPixel(white, 1, 0), createPixel(white, 2, 0), createPixel(white, 3, 0), createPixel(white, 4, 0)],
        [createPixel(white, 0, 1), createPixel(red, 1, 1), createPixel(red, 2, 1), createPixel(red, 3, 1), createPixel(white, 4, 1)],
        [createPixel(white, 0, 2), createPixel(red, 1, 2), createPixel(white, 2, 2), createPixel(red, 3, 2), createPixel(white, 4, 2)],
        [createPixel(white, 0, 3), createPixel(red, 1, 3), createPixel(red, 2, 3), createPixel(red, 3, 3), createPixel(white, 4, 3)],
        [createPixel(white, 0, 4), createPixel(white, 1, 4), createPixel(white, 2, 4), createPixel(white, 3, 4), createPixel(white, 4, 4)],
      ];

      const result = markExternalCells(grid);

      // 边界白色应该被标记
      expect(result[0][0].isExternal).toBe(true);

      // 中间被红色包围的白色不应该被标记
      expect(result[2][2].isExternal).toBe(false);

      // 红色不应该被标记
      expect(result[1][1].isExternal).toBe(false);
    });

    it('should handle all non-white grid', () => {
      const grid = [
        [createPixel(red, 0, 0), createPixel(blue, 1, 0)],
        [createPixel(blue, 0, 1), createPixel(red, 1, 1)],
      ];

      const result = markExternalCells(grid);

      // 没有白色，所以都不应该被标记
      expect(result[0][0].isExternal).toBe(false);
      expect(result[0][1].isExternal).toBe(false);
      expect(result[1][0].isExternal).toBe(false);
      expect(result[1][1].isExternal).toBe(false);
    });

    it('should handle all white grid', () => {
      const grid = [
        [createPixel(white, 0, 0), createPixel(white, 1, 0)],
        [createPixel(white, 0, 1), createPixel(white, 1, 1)],
      ];

      const result = markExternalCells(grid);

      // 所有单元格都应该被标记
      expect(result[0][0].isExternal).toBe(true);
      expect(result[0][1].isExternal).toBe(true);
      expect(result[1][0].isExternal).toBe(true);
      expect(result[1][1].isExternal).toBe(true);
    });

    it('should not modify original grid', () => {
      const grid = [
        [createPixel(white, 0, 0), createPixel(red, 1, 0)],
      ];

      markExternalCells(grid);

      // 原始网格不应该被修改
      expect(grid[0][0].isExternal).toBe(false);
    });
  });
});
