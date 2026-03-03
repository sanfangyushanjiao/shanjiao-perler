import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, colorDistance, loadPalette } from '../src/core/colorUtils';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
    });

    it('should handle lowercase hex', () => {
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#FF0000');
      expect(rgbToHex({ r: 0, g: 255, b: 0 })).toBe('#00FF00');
      expect(rgbToHex({ r: 0, g: 0, b: 255 })).toBe('#0000FF');
    });
  });

  describe('colorDistance', () => {
    it('should calculate distance between two colors', () => {
      const red = { r: 255, g: 0, b: 0 };
      const blue = { r: 0, g: 0, b: 255 };
      const distance = colorDistance(red, blue);
      expect(distance).toBeCloseTo(360.62, 1);
    });

    it('should return 0 for identical colors', () => {
      const color = { r: 100, g: 150, b: 200 };
      expect(colorDistance(color, color)).toBe(0);
    });
  });

  describe('loadPalette', () => {
    it('should load palette data', () => {
      const palette = loadPalette();
      expect(palette.length).toBeGreaterThan(0);
      expect(palette[0]).toHaveProperty('hex');
      expect(palette[0]).toHaveProperty('rgb');
      expect(palette[0]).toHaveProperty('codes');
    });
  });
});
