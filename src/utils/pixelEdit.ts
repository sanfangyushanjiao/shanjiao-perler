import type { MappedPixel, PaletteColor } from '../types';

/**
 * 深拷贝网格数据
 */
export function deepCloneGrid(grid: MappedPixel[][]): MappedPixel[][] {
  return grid.map(row =>
    row.map(cell => ({
      ...cell,
      paletteColor: { ...cell.paletteColor, rgb: { ...cell.paletteColor.rgb } },
      position: { ...cell.position }
    }))
  );
}

/**
 * 画笔工具 - 单像素涂色
 */
export function paintPixel(
  grid: MappedPixel[][],
  row: number,
  col: number,
  color: PaletteColor
): MappedPixel[][] {
  const newGrid = deepCloneGrid(grid);

  if (row >= 0 && row < newGrid.length && col >= 0 && col < newGrid[0].length) {
    newGrid[row][col] = {
      ...newGrid[row][col],
      paletteColor: color,
      isExternal: false
    };
  }

  return newGrid;
}

/**
 * 橡皮擦工具 - 标记为外部背景
 */
export function erasePixel(
  grid: MappedPixel[][],
  row: number,
  col: number
): MappedPixel[][] {
  const newGrid = deepCloneGrid(grid);

  if (row >= 0 && row < newGrid.length && col >= 0 && col < newGrid[0].length) {
    newGrid[row][col] = {
      ...newGrid[row][col],
      isExternal: true
    };
  }

  return newGrid;
}

/**
 * 吸管工具 - 获取像素颜色
 */
export function pickColor(
  grid: MappedPixel[][],
  row: number,
  col: number
): PaletteColor | null {
  if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
    const cell = grid[row][col];
    if (!cell.isExternal) {
      return cell.paletteColor;
    }
  }
  return null;
}

/**
 * 填充工具 - 非递归栈实现洪水填充
 */
export function floodFill(
  grid: MappedPixel[][],
  row: number,
  col: number,
  targetColor: PaletteColor
): MappedPixel[][] {
  const M = grid.length;
  const N = grid[0].length;

  // 边界检查
  if (row < 0 || row >= M || col < 0 || col >= N) {
    return grid;
  }

  const startCell = grid[row][col];

  // 如果是外部区域，不进行填充
  if (startCell.isExternal) {
    return grid;
  }

  const targetHex = startCell.paletteColor.hex;

  // 如果目标颜色和当前颜色相同，不需要填充
  if (targetHex === targetColor.hex) {
    return grid;
  }

  const newGrid = deepCloneGrid(grid);
  const visited = Array(M).fill(null).map(() => Array(N).fill(false));
  const stack = [{ row, col }];

  while (stack.length > 0) {
    const { row: r, col: c } = stack.pop()!;

    // 边界检查
    if (r < 0 || r >= M || c < 0 || c >= N || visited[r][c]) {
      continue;
    }

    const cell = newGrid[r][c];

    // 颜色匹配检查：只填充相同颜色且非外部区域的单元格
    if (cell.isExternal || cell.paletteColor.hex !== targetHex) {
      continue;
    }

    // 标记为已访问
    visited[r][c] = true;

    // 更新颜色
    newGrid[r][c] = {
      ...cell,
      paletteColor: targetColor,
      isExternal: false
    };

    // 四方向扩展
    stack.push(
      { row: r - 1, col: c }, // 上
      { row: r + 1, col: c }, // 下
      { row: r, col: c - 1 }, // 左
      { row: r, col: c + 1 }  // 右
    );
  }

  return newGrid;
}

/**
 * 区域擦除工具 - 洪水填充擦除（擦除相同颜色的连通区域）
 */
export function floodFillErase(
  grid: MappedPixel[][],
  row: number,
  col: number
): MappedPixel[][] {
  const M = grid.length;
  const N = grid[0].length;

  // 边界检查
  if (row < 0 || row >= M || col < 0 || col >= N) {
    return grid;
  }

  const startCell = grid[row][col];

  // 如果已经是外部区域，不需要擦除
  if (startCell.isExternal) {
    return grid;
  }

  const targetHex = startCell.paletteColor.hex;

  const newGrid = deepCloneGrid(grid);
  const visited = Array(M).fill(null).map(() => Array(N).fill(false));
  const stack = [{ row, col }];

  while (stack.length > 0) {
    const { row: r, col: c } = stack.pop()!;

    // 边界检查
    if (r < 0 || r >= M || c < 0 || c >= N || visited[r][c]) {
      continue;
    }

    const cell = newGrid[r][c];

    // 颜色匹配检查：只擦除相同颜色且非外部区域的单元格
    if (cell.isExternal || cell.paletteColor.hex !== targetHex) {
      continue;
    }

    // 标记为已访问
    visited[r][c] = true;

    // 标记为外部区域（擦除）
    newGrid[r][c] = {
      ...cell,
      isExternal: true
    };

    // 四方向扩展
    stack.push(
      { row: r - 1, col: c }, // 上
      { row: r + 1, col: c }, // 下
      { row: r, col: c - 1 }, // 左
      { row: r, col: c + 1 }  // 右
    );
  }

  return newGrid;
}

/**
 * 批量替换颜色 - 全局替换指定颜色为另一种颜色
 */
export function replaceColor(
  grid: MappedPixel[][],
  sourceColor: PaletteColor,
  targetColor: PaletteColor
): { newGrid: MappedPixel[][]; replaceCount: number } {
  const M = grid.length;
  const N = grid[0].length;

  const newGrid = deepCloneGrid(grid);
  let replaceCount = 0;

  for (let row = 0; row < M; row++) {
    for (let col = 0; col < N; col++) {
      const cell = newGrid[row][col];

      // 只替换非外部区域且颜色匹配的单元格
      if (!cell.isExternal && cell.paletteColor.hex === sourceColor.hex) {
        newGrid[row][col] = {
          ...cell,
          paletteColor: targetColor,
        };
        replaceCount++;
      }
    }
  }

  return { newGrid, replaceCount };
}

/**
 * 坐标转换 - Canvas坐标 -> 网格坐标
 */
export function canvasToGrid(
  canvasX: number,
  canvasY: number,
  cellSize: number,
  canvasWidth: number,
  canvasHeight: number,
  gridWidth: number,
  gridHeight: number
): { row: number; col: number } | null {
  // 计算网格在画布中的偏移（居中显示）
  const gridPixelWidth = gridWidth * cellSize;
  const gridPixelHeight = gridHeight * cellSize;
  const offsetX = (canvasWidth - gridPixelWidth) / 2;
  const offsetY = (canvasHeight - gridPixelHeight) / 2;

  // 转换为网格坐标
  const gridX = canvasX - offsetX;
  const gridY = canvasY - offsetY;

  const col = Math.floor(gridX / cellSize);
  const row = Math.floor(gridY / cellSize);

  // 边界检查
  if (row < 0 || row >= gridHeight || col < 0 || col >= gridWidth) {
    return null;
  }

  return { row, col };
}
