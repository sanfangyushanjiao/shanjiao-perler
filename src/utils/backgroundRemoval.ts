import type { MappedPixel } from '../types';
import { colorDistance, hexToRgb } from '../core/colorUtils';

/**
 * 背景颜色定义（白色和浅色系）
 * 这些颜色通常被认为是背景色
 */
const BACKGROUND_COLORS = [
  '#FFFFFF', // 纯白
  '#FFFFD5', // 浅黄
  '#FAF4C8', // 米白
  '#F3F4F6', // 浅灰
  '#FFFFE0', // 浅黄色
  '#F5F5F5', // 白烟色
  '#FAFAFA', // 极浅灰
];

/**
 * 判断颜色是否为背景色
 * 使用颜色相似度判断，而不是完全匹配
 */
function isBackgroundColor(hex: string): boolean {
  const upperHex = hex.toUpperCase();

  // 首先检查完全匹配
  if (BACKGROUND_COLORS.some(bgColor => bgColor === upperHex)) {
    return true;
  }

  // 然后检查相似度（与白色的距离）
  try {
    const targetRgb = hexToRgb(hex);
    const whiteRgb = { r: 255, g: 255, b: 255 };
    const distance = colorDistance(targetRgb, whiteRgb);

    // 如果与白色的距离小于 50，认为是背景色
    return distance < 50;
  } catch {
    return false;
  }
}

/**
 * 洪水填充算法标记外部背景区域
 * 从边界开始，标记所有连通的背景色单元格为外部区域
 */
export function markExternalCells(grid: MappedPixel[][]): MappedPixel[][] {
  const M = grid.length;
  const N = grid[0]?.length || 0;

  // 创建结果网格（深拷贝）
  const result: MappedPixel[][] = grid.map((row) =>
    row.map((pixel) => ({ ...pixel, isExternal: false }))
  );

  // 创建访问标记
  const visited: boolean[][] = Array(M)
    .fill(null)
    .map(() => Array(N).fill(false));

  // 从四个边界开始洪水填充
  const queue: [number, number][] = [];

  // 添加所有边界单元格到队列
  for (let col = 0; col < N; col++) {
    // 顶部边界
    if (isBackgroundColor(grid[0][col].paletteColor.hex)) {
      queue.push([0, col]);
      visited[0][col] = true;
    }
    // 底部边界
    if (isBackgroundColor(grid[M - 1][col].paletteColor.hex)) {
      queue.push([M - 1, col]);
      visited[M - 1][col] = true;
    }
  }

  for (let row = 0; row < M; row++) {
    // 左边界
    if (isBackgroundColor(grid[row][0].paletteColor.hex)) {
      queue.push([row, 0]);
      visited[row][0] = true;
    }
    // 右边界
    if (isBackgroundColor(grid[row][N - 1].paletteColor.hex)) {
      queue.push([row, N - 1]);
      visited[row][N - 1] = true;
    }
  }

  // BFS 洪水填充
  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    result[row][col].isExternal = true;

    // 检查四个方向的邻居
    const neighbors: [number, number][] = [
      [row - 1, col], // 上
      [row + 1, col], // 下
      [row, col - 1], // 左
      [row, col + 1], // 右
    ];

    for (const [nRow, nCol] of neighbors) {
      // 检查边界
      if (nRow < 0 || nRow >= M || nCol < 0 || nCol >= N) continue;

      // 检查是否已访问
      if (visited[nRow][nCol]) continue;

      // 检查是否为背景色
      if (isBackgroundColor(grid[nRow][nCol].paletteColor.hex)) {
        visited[nRow][nCol] = true;
        queue.push([nRow, nCol]);
      }
    }
  }

  // 统计标记的外部单元格数量
  let externalCount = 0;
  for (let row = 0; row < M; row++) {
    for (let col = 0; col < N; col++) {
      if (result[row][col].isExternal) {
        externalCount++;
      }
    }
  }

  console.log(`背景移除完成：标记了 ${externalCount} 个外部单元格（共 ${M * N} 个）`);

  return result;
}
