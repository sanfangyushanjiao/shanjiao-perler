import type { MappedPixel, PaletteColor } from '../types';

/**
 * 计算每种颜色的数量
 */
export function calculateColorCounts(grid: MappedPixel[][]): Map<string, number> {
  const colorCounts = new Map<string, number>();

  for (const row of grid) {
    for (const cell of row) {
      if (!cell.isExternal) {
        const hex = cell.paletteColor.hex;
        colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
      }
    }
  }

  return colorCounts;
}

/**
 * 根据占比阈值获取需要移除的颜色
 * @param grid 网格数据
 * @param thresholdPercent 占比阈值（0-1，例如 0.01 表示 1%）
 * @returns 需要移除的颜色 hex 集合
 */
export function getNoiseColorsByThreshold(
  grid: MappedPixel[][],
  thresholdPercent: number
): Set<string> {
  const colorCounts = calculateColorCounts(grid);
  const totalBeads = Array.from(colorCounts.values()).reduce((sum, count) => sum + count, 0);

  // 使用浮点数计算，不向上取整，这样可以更精确地移除极少数量的颜色
  const threshold = totalBeads * thresholdPercent;

  const noiseColors = new Set<string>();

  for (const [hex, count] of colorCounts.entries()) {
    // 使用小于而不是小于等于，避免移除刚好等于阈值的颜色
    if (count < threshold) {
      noiseColors.add(hex);
    }
  }

  return noiseColors;
}

/**
 * 一键去杂色：移除占比低于阈值的颜色
 * @param grid 网格数据
 * @param thresholdPercent 占比阈值（0-1）
 * @param palette 调色板
 * @returns 处理后的网格和被移除的颜色集合
 */
export function autoRemoveNoiseColors(
  grid: MappedPixel[][],
  thresholdPercent: number,
  palette: PaletteColor[]
): { newGrid: MappedPixel[][]; removedColors: Set<string> } {
  const noiseColors = getNoiseColorsByThreshold(grid, thresholdPercent);

  if (noiseColors.size === 0) {
    return { newGrid: grid, removedColors: new Set() };
  }

  // 深拷贝网格
  const newGrid = grid.map(row =>
    row.map(cell => ({
      ...cell,
      paletteColor: { ...cell.paletteColor, rgb: { ...cell.paletteColor.rgb } },
      position: { ...cell.position }
    }))
  );

  const M = newGrid.length;
  const N = newGrid[0].length;

  // 获取所有非杂色的颜色（用于重映射）
  const validColors = palette.filter(color => !noiseColors.has(color.hex));

  // 如果所有颜色都是杂色，保留数量最多的颜色
  if (validColors.length === 0) {
    const colorCounts = calculateColorCounts(grid);
    let maxCount = 0;
    let maxColor = '';
    for (const [hex, count] of colorCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        maxColor = hex;
      }
    }
    if (maxColor) {
      noiseColors.delete(maxColor);
      validColors.push(palette.find(c => c.hex === maxColor)!);
    }
  }

  // 遍历网格，替换杂色
  for (let row = 0; row < M; row++) {
    for (let col = 0; col < N; col++) {
      const cell = newGrid[row][col];

      if (!cell.isExternal && noiseColors.has(cell.paletteColor.hex)) {
        // 优先查找相邻单元格的颜色（更自然的替换）
        const neighborColor = findNeighborColor(newGrid, row, col, noiseColors);

        if (neighborColor) {
          newGrid[row][col] = {
            ...cell,
            paletteColor: neighborColor
          };
        } else {
          // 如果没有相邻颜色，使用最近的非杂色颜色
          const nearestColor = findNearestColor(cell.paletteColor, validColors);
          if (nearestColor) {
            newGrid[row][col] = {
              ...cell,
              paletteColor: nearestColor
            };
          }
        }
      }
    }
  }

  return { newGrid, removedColors: noiseColors };
}

/**
 * 查找相邻单元格的非杂色颜色（优先使用相邻颜色，使替换更自然）
 */
function findNeighborColor(
  grid: MappedPixel[][],
  row: number,
  col: number,
  noiseColors: Set<string>
): PaletteColor | null {
  const M = grid.length;
  const N = grid[0].length;

  // 检查四个方向的相邻单元格
  const directions = [
    [-1, 0], // 上
    [1, 0],  // 下
    [0, -1], // 左
    [0, 1]   // 右
  ];

  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    if (newRow >= 0 && newRow < M && newCol >= 0 && newCol < N) {
      const neighbor = grid[newRow][newCol];
      if (!neighbor.isExternal && !noiseColors.has(neighbor.paletteColor.hex)) {
        return neighbor.paletteColor;
      }
    }
  }

  return null;
}

/**
 * 找到最近的颜色（欧氏距离）
 */
function findNearestColor(
  targetColor: PaletteColor,
  palette: PaletteColor[]
): PaletteColor | null {
  if (palette.length === 0) return null;

  let minDistance = Infinity;
  let nearestColor = palette[0];

  for (const color of palette) {
    const distance = Math.sqrt(
      Math.pow(targetColor.rgb.r - color.rgb.r, 2) +
      Math.pow(targetColor.rgb.g - color.rgb.g, 2) +
      Math.pow(targetColor.rgb.b - color.rgb.b, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = color;
    }
  }

  return nearestColor;
}
