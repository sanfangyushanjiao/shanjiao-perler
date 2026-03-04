import type { MappedPixel, BrandName, ColorStat } from '../types';

/**
 * 导出完整的拼豆图纸（图像 + 统计）为 PNG
 */
export function exportPatternImage(
  grid: MappedPixel[][],
  brand: BrandName,
  colorStats: ColorStat[],
  filename: string = 'perler-pattern.png'
): void {
  const M = grid.length;
  const N = grid[0]?.length || 0;

  // 设置单元格大小
  const cellSize = 40;
  const padding = 40;
  const titleHeight = 100;
  const statsHeight = calculateStatsHeight(colorStats);

  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(N * cellSize + padding * 2, 800);
  canvas.height = M * cellSize + padding * 2 + titleHeight + statsHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 绘制白色背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制标题区域
  drawTitle(ctx, canvas.width, titleHeight, brand);

  // 绘制网格
  const offsetY = titleHeight + padding;
  const offsetX = (canvas.width - N * cellSize) / 2;
  drawGrid(ctx, grid, brand, offsetX, offsetY, cellSize);

  // 绘制统计信息
  const statsY = offsetY + M * cellSize + padding;
  drawStats(ctx, colorStats, statsY, canvas.width, padding);

  // 下载图片
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * 绘制标题区域
 */
function drawTitle(ctx: CanvasRenderingContext2D, width: number, height: number, brand: BrandName) {
  // 绘制渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#FF6B9D');
  gradient.addColorStop(0.5, '#4ECDC4');
  gradient.addColorStop(1, '#FFE66D');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 绘制标题
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('山椒爱拼豆', width / 2, 45);

  // 绘制品牌信息
  ctx.font = '24px sans-serif';
  ctx.fillText(`品牌: ${brand}`, width / 2, 80);
}

/**
 * 绘制网格
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: MappedPixel[][],
  brand: BrandName,
  offsetX: number,
  offsetY: number,
  cellSize: number
) {
  const M = grid.length;
  const N = grid[0]?.length || 0;

  for (let row = 0; row < M; row++) {
    for (let col = 0; col < N; col++) {
      const pixel = grid[row][col];
      const x = offsetX + col * cellSize;
      const y = offsetY + row * cellSize;

      // 绘制颜色方块
      ctx.fillStyle = pixel.paletteColor.hex;
      ctx.fillRect(x, y, cellSize, cellSize);

      // 绘制边框
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cellSize, cellSize);

      // 绘制色号
      const code = pixel.paletteColor.codes[brand] || '?';
      ctx.fillStyle = getContrastColor(pixel.paletteColor.hex);
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(code, x + cellSize / 2, y + cellSize / 2);
    }
  }
}

/**
 * 计算统计区域高度
 */
function calculateStatsHeight(colorStats: ColorStat[]): number {
  const headerHeight = 80;
  const rowHeight = 40;
  const columns = 3;
  const rows = Math.ceil(colorStats.length / columns);
  const watermarkHeight = 50; // 添加水印区域高度
  return headerHeight + rows * rowHeight + 40 + watermarkHeight;
}

/**
 * 绘制统计信息
 */
function drawStats(
  ctx: CanvasRenderingContext2D,
  colorStats: ColorStat[],
  startY: number,
  width: number,
  padding: number
) {
  // 绘制分隔线
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, startY);
  ctx.lineTo(width - padding, startY);
  ctx.stroke();

  // 绘制统计标题
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('颜色统计', width / 2, startY + 40);

  // 计算总珠子数
  const totalBeads = colorStats.reduce((sum, stat) => sum + stat.count, 0);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(`总计: ${totalBeads} 颗`, width / 2, startY + 70);

  // 绘制颜色列表（3列布局）
  const columns = 3;
  const columnWidth = (width - padding * 2) / columns;
  const rowHeight = 40;
  const colorBlockSize = 30;
  let currentY = startY + 100;

  colorStats.forEach((stat, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + col * columnWidth;
    const y = currentY + row * rowHeight;

    // 绘制颜色方块
    ctx.fillStyle = stat.paletteColor.hex;
    ctx.fillRect(x, y, colorBlockSize, colorBlockSize);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, colorBlockSize, colorBlockSize);

    // 绘制色号
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(stat.code, x + colorBlockSize + 10, y + 12);

    // 绘制数量
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(`${stat.count} 颗`, x + colorBlockSize + 10, y + 28);
  });

  // 绘制底部水印
  const rows = Math.ceil(colorStats.length / columns);
  const watermarkY = currentY + rows * rowHeight + 30;
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('@山椒爱拼豆', width / 2, watermarkY);
}

/**
 * 根据背景色计算对比文字颜色
 */
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

/**
 * 导出像素网格为 CSV 文件
 *
 * CSV 格式：x,y,color,code
 * - x: 横坐标
 * - y: 纵坐标
 * - color: 十六进制颜色值
 * - code: 品牌色号
 *
 * @param grid 像素网格
 * @param brand 品牌名称
 * @param filename 文件名（默认：perler-beads-{timestamp}.csv）
 */
export function exportToCSV(
  grid: MappedPixel[][],
  brand: BrandName,
  filename?: string
): void {
  const rows: string[] = ['x,y,color,code'];

  grid.forEach((row, y) => {
    row.forEach((pixel, x) => {
      if (!pixel.isExternal) {
        const color = pixel.paletteColor.hex;
        const code = pixel.paletteColor.codes[brand] || '?';
        rows.push(`${x},${y},${color},${code}`);
      }
    });
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || `perler-beads-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
