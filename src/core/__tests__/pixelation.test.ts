import { describe, it, expect } from 'vitest';
import { calculateCellRepresentativeColor, calculateGridSize } from '../pixelation';

describe('pixelation', () => {
  describe('calculateCellRepresentativeColor', () => {
    it('should calculate average color', () => {
      // 创建一个 2x2 的测试图像数据（红色和蓝色）
      const imageData = new ImageData(2, 2);
      const data = imageData.data;

      // 像素 (0,0): 红色
      data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255;
      // 像素 (1,0): 红色
      data[4] = 255; data[5] = 0; data[6] = 0; data[7] = 255;
      // 像素 (0,1): 蓝色
      data[8] = 0; data[9] = 0; data[10] = 255; data[11] = 255;
      // 像素 (1,1): 蓝色
      data[12] = 0; data[13] = 0; data[14] = 255; data[15] = 255;

      const result = calculateCellRepresentativeColor(imageData, 0, 0, 2, 2, 'average');

      // 平均色应该是 (128, 0, 128)
      expect(result).toEqual({ r: 128, g: 0, b: 128 });
    });

    it('should calculate dominant color', () => {
      const imageData = new ImageData(2, 2);
      const data = imageData.data;

      // 3个红色像素，1个蓝色像素
      data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255;
      data[4] = 255; data[5] = 0; data[6] = 0; data[7] = 255;
      data[8] = 255; data[9] = 0; data[10] = 0; data[11] = 255;
      data[12] = 0; data[13] = 0; data[14] = 255; data[15] = 255;

      const result = calculateCellRepresentativeColor(imageData, 0, 0, 2, 2, 'dominant');

      // 主色调应该是红色
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return null for fully transparent cell', () => {
      const imageData = new ImageData(2, 2);
      const data = imageData.data;

      // 所有像素都是透明的（alpha = 0）
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 0; // 透明
      }

      const result = calculateCellRepresentativeColor(imageData, 0, 0, 2, 2, 'average');
      expect(result).toBeNull();
    });

    it('should skip transparent pixels', () => {
      const imageData = new ImageData(2, 2);
      const data = imageData.data;

      // 2个红色不透明像素，2个透明像素
      data[0] = 255; data[1] = 0; data[2] = 0; data[3] = 255;
      data[4] = 255; data[5] = 0; data[6] = 0; data[7] = 255;
      data[8] = 0; data[9] = 0; data[10] = 255; data[11] = 0; // 透明
      data[12] = 0; data[13] = 0; data[14] = 255; data[15] = 0; // 透明

      const result = calculateCellRepresentativeColor(imageData, 0, 0, 2, 2, 'average');

      // 应该只计算不透明像素的平均值（红色）
      expect(result).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  describe('calculateGridSize', () => {
    it('should calculate grid size for landscape image', () => {
      const result = calculateGridSize(800, 600, 40);
      expect(result).toEqual({ N: 40, M: 30 });
    });

    it('should calculate grid size for portrait image', () => {
      const result = calculateGridSize(600, 800, 40);
      expect(result).toEqual({ N: 30, M: 40 });
    });

    it('should calculate grid size for square image', () => {
      const result = calculateGridSize(500, 500, 50);
      expect(result).toEqual({ N: 50, M: 50 });
    });

    it('should round to nearest integer', () => {
      const result = calculateGridSize(1000, 333, 30);
      expect(result.N).toBe(30);
      expect(result.M).toBe(10); // 30 / (1000/333) ≈ 10
    });
  });
});
