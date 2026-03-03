import type { MappedPixel, PaletteColor } from '../types';
import { colorDistance } from '../core/colorUtils';

/**
 * 颜色合并算法
 * 使用 BFS 查找相似颜色的连通区域，并将其合并为主导色
 */
export function mergeColors(
  grid: MappedPixel[][],
  threshold: number
): MappedPixel[][] {
  if (threshold === 0) return grid;

  const M = grid.length;
  const N = grid[0]?.length || 0;

  // 创建访问标记数组
  const visited: boolean[][] = Array(M)
    .fill(null)
    .map(() => Array(N).fill(false));

  // 创建结果网格（深拷贝）
  const result: MappedPixel[][] = grid.map((row) =>
    row.map((pixel) => ({ ...pixel }))
  );

  // BFS 查找连通区域
  for (let row = 0; row < M; row++) {
    for (let col = 0; col < N; col++) {
      if (visited[row][col]) continue;

      const region = findRegion(grid, visited, row, col, threshold);

      if (region.length > 0) {
        // 找出区域内出现最多的颜色
        const dominantColor = findDominantColor(region, grid);

        // 将区域内所有像素设置为主导色
        for (const [r, c] of region) {
          result[r][c] = {
            ...result[r][c],
            paletteColor: dominantColor,
          };
        }
      }
    }
  }

  return result;
}

/**
 * 使用 BFS 查找相似颜色的连通区域
 */
function findRegion(
  grid: MappedPixel[][],
  visited: boolean[][],
  startRow: number,
  startCol: number,
  threshold: number
): [number, number][] {
  const M = grid.length;
  const N = grid[0]?.length || 0;
  const region: [number, number][] = [];
  const queue: [number, number][] = [[startRow, startCol]];
  const startColor = grid[startRow][startCol].paletteColor;

  visited[startRow][startCol] = true;

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    region.push([row, col]);

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

      // 检查颜色相似度
      const neighborColor = grid[nRow][nCol].paletteColor;
      const distance = colorDistance(startColor.rgb, neighborColor.rgb);

      if (distance <= threshold) {
        visited[nRow][nCol] = true;
        queue.push([nRow, nCol]);
      }
    }
  }

  return region;
}

/**
 * 找出区域内出现最多的颜色
 */
function findDominantColor(
  region: [number, number][],
  grid: MappedPixel[][]
): PaletteColor {
  const colorCount = new Map<string, { color: PaletteColor; count: number }>();

  for (const [row, col] of region) {
    const color = grid[row][col].paletteColor;
    const hex = color.hex;

    if (colorCount.has(hex)) {
      colorCount.get(hex)!.count++;
    } else {
      colorCount.set(hex, { color, count: 1 });
    }
  }

  // 找出出现次数最多的颜色
  let maxCount = 0;
  let dominantColor = region.length > 0 ? grid[region[0][0]][region[0][1]].paletteColor : grid[0][0].paletteColor;

  for (const { color, count } of colorCount.values()) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }

  return dominantColor;
}
