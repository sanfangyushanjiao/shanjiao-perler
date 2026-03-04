// 基础类型定义

// RGB 颜色类型
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

// 调色板颜色（拼豆颜色）
export interface PaletteColor {
  hex: string;
  rgb: RgbColor;
  codes: Partial<Record<BrandName, string>>; // 品牌 -> 色号映射（部分品牌可能没有）
}

// 映射后的像素
export interface MappedPixel {
  paletteColor: PaletteColor;
  position: {
    x: number;
    y: number;
  };
  isExternal?: boolean; // 是否为外部背景区域
}

// 像素化模式
export type PixelationMode = 'realistic' | 'cartoon';

// 支持的品牌
export type BrandName = 'MARD' | 'COCO' | '漫漫' | '盼盼' | '咪小窝' | '小舞家' | '黄豆豆' | '优肯197色' | '优肯418色';

// 图像状态
export interface ImageState {
  originalImage: HTMLImageElement | null;
  processedGrid: MappedPixel[][] | null;
  dimensions: {
    N: number; // 列数
    M: number; // 行数
  };
}

// 配置状态
export interface ConfigState {
  gridSize: number; // 网格尺寸（珠子数量）
  mergeThreshold: number; // 颜色合并阈值
  mode: PixelationMode; // 像素化模式
  brand: BrandName; // 当前选择的品牌
}

// 颜色统计
export interface ColorStat {
  paletteColor: PaletteColor;
  count: number;
  code: string; // 当前品牌的色号
}

// 色卡数据格式（JSON 文件格式）
// 使用 Partial 因为不是所有品牌都有完整的色号映射
export type ColorMapping = Record<string, Partial<Record<BrandName, string>>>;
