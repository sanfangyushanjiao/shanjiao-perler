import { describe, it, expect } from 'vitest';
import { hexToRgb, rgbToHex, colorDistance, findClosestPaletteColor, isTransparent } from '../colorUtils';
import type { PaletteColor } from '../../types';

describe('colorUtils', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB', () => {
      expect(hexToRgb('#FF6B9D')).toEqual({ r: 255, g: 107, b: 157 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should handle hex without # prefix', () => {
      expect(hexToRgb('FF6B9D')).toEqual({ r: 255, g: 107, b: 157 });
    });

    it('should throw error for invalid hex', () => {
      expect(() => hexToRgb('invalid')).toThrow('Invalid hex color');
      expect(() => hexToRgb('#GGG')).toThrow('Invalid hex color');
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      expect(rgbToHex({ r: 255, g: 107, b: 157 })).toBe('#FF6B9D');
      expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
      expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF');
    });

    it('should handle decimal values by rounding', () => {
      expect(rgbToHex({ r: 255.4, g: 107.6, b: 157.2 })).toBe('#FF6C9D');
    });
  });

  describe('colorDistance', () => {
    it('should calculate Euclidean distance', () => {
      const color1 = { r: 255, g: 0, b: 0 };
      const color2 = { r: 0, g: 0, b: 0 };
      expect(colorDistance(color1, color2)).toBe(255);
    });

    it('should return 0 for identical colors', () => {
      const color = { r: 100, g: 150, b: 200 };
      expect(colorDistance(color, color)).toBe(0);
    });

    it('should calculate correct distance for different colors', () => {
      const color1 = { r: 0, g: 0, b: 0 };
      const color2 = { r: 3, g: 4, b: 0 };
      expect(colorDistance(color1, color2)).toBe(5); // 3-4-5 triangle
    });
  });

  describe('findClosestPaletteColor', () => {
    const palette: PaletteColor[] = [
      { hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 }, codes: {} },
      { hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 }, codes: {} },
      { hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 }, codes: {} },
    ];

    it('should find exact match', () => {
      const result = findClosestPaletteColor({ r: 255, g: 0, b: 0 }, palette);
      expect(result.hex).toBe('#FF0000');
    });

    it('should find closest color', () => {
      const result = findClosestPaletteColor({ r: 250, g: 10, b: 10 }, palette);
      expect(result.hex).toBe('#FF0000');
    });

    it('should throw error for empty palette', () => {
      expect(() => findClosestPaletteColor({ r: 0, g: 0, b: 0 }, [])).toThrow('Palette is empty');
    });
  });

  describe('isTransparent', () => {
    it('should return true for alpha < 128', () => {
      expect(isTransparent(0)).toBe(true);
      expect(isTransparent(127)).toBe(true);
    });

    it('should return false for alpha >= 128', () => {
      expect(isTransparent(128)).toBe(false);
      expect(isTransparent(255)).toBe(false);
    });
  });
});
