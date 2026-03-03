import { describe, it, expect } from 'vitest';
import { parseCSV, csvToPixelGrid } from '../csvParser';
import type { PaletteColor } from '../../types';

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV', () => {
      const csv = `x,y,color,code
0,0,#FF0000,A01
1,0,#00FF00,A02
0,1,#0000FF,A03`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ x: 0, y: 0, color: '#FF0000', code: 'A01' });
      expect(result[1]).toEqual({ x: 1, y: 0, color: '#00FF00', code: 'A02' });
      expect(result[2]).toEqual({ x: 0, y: 1, color: '#0000FF', code: 'A03' });
    });

    it('should parse CSV without code column', () => {
      const csv = `x,y,color
0,0,#FF0000
1,0,#00FF00`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ x: 0, y: 0, color: '#FF0000', code: undefined });
      expect(result[1]).toEqual({ x: 1, y: 0, color: '#00FF00', code: undefined });
    });

    it('should handle case-insensitive headers', () => {
      const csv = `X,Y,COLOR
0,0,#FF0000`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ x: 0, y: 0, color: '#FF0000', code: undefined });
    });

    it('should skip empty lines', () => {
      const csv = `x,y,color
0,0,#FF0000

1,0,#00FF00`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
    });

    it('should skip invalid lines', () => {
      const csv = `x,y,color
0,0,#FF0000
invalid,line
1,0,#00FF00`;

      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
    });

    it('should throw error for empty CSV', () => {
      expect(() => parseCSV('')).toThrow('CSV 文件为空或格式不正确');
      expect(() => parseCSV('\n')).toThrow('CSV 文件为空或格式不正确');
    });

    it('should throw error for CSV with no valid data', () => {
      const csv = `x,y,color
invalid,invalid,invalid`;
      expect(() => parseCSV(csv)).toThrow('CSV 文件中没有有效的像素数据');
    });

    it('should throw error for missing required columns', () => {
      const csv = `x,y
0,0`;

      expect(() => parseCSV(csv)).toThrow('CSV 文件必须包含 x, y, color 列');
    });
  });

  describe('csvToPixelGrid', () => {
    const palette: PaletteColor[] = [
      { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, codes: {} },
      { hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 }, codes: {} },
      { hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, codes: {} },
      { hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, codes: {} },
    ];

    it('should convert CSV pixels to grid', () => {
      const pixels = [
        { x: 0, y: 0, color: '#FF0000' },
        { x: 1, y: 0, color: '#00FF00' },
        { x: 0, y: 1, color: '#0000FF' },
        { x: 1, y: 1, color: '#FFFFFF' },
      ];

      const result = csvToPixelGrid(pixels, palette);

      expect(result).toHaveLength(2); // 2 rows
      expect(result[0]).toHaveLength(2); // 2 columns
      expect(result[0][0].paletteColor.hex).toBe('#FF0000');
      expect(result[0][1].paletteColor.hex).toBe('#00FF00');
      expect(result[1][0].paletteColor.hex).toBe('#0000FF');
      expect(result[1][1].paletteColor.hex).toBe('#FFFFFF');
    });

    it('should handle sparse grids', () => {
      const pixels = [
        { x: 0, y: 0, color: '#FF0000' },
        { x: 2, y: 2, color: '#0000FF' },
      ];

      const result = csvToPixelGrid(pixels, palette);

      expect(result).toHaveLength(3); // 3 rows (0-2)
      expect(result[0]).toHaveLength(3); // 3 columns (0-2)
      expect(result[0][0].paletteColor.hex).toBe('#FF0000');
      expect(result[2][2].paletteColor.hex).toBe('#0000FF');
      // 其他位置应该是白色（默认）
      expect(result[0][1].paletteColor.hex).toBe('#FFFFFF');
    });

    it('should find closest color for unmatched colors', () => {
      const pixels = [
        { x: 0, y: 0, color: '#FE0000' }, // 接近红色但不完全匹配
      ];

      const result = csvToPixelGrid(pixels, palette);

      // 应该匹配到最接近的红色
      expect(result[0][0].paletteColor.hex).toBe('#FF0000');
    });

    it('should set correct positions', () => {
      const pixels = [
        { x: 1, y: 2, color: '#FF0000' },
      ];

      const result = csvToPixelGrid(pixels, palette);

      expect(result[2][1].position).toEqual({ x: 1, y: 2 });
    });
  });
});
