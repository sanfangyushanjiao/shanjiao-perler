import type { MappedPixel, BrandName, ColorStat } from '../types';

/**
 * 导出完整的拼豆图纸（图像 + 统计）为 PNG
 * 移动端优化：支持直接保存到相册
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
  const coordinateMargin = 30; // 坐标区域边距
  const padding = 40;
  const titleHeight = 100;
  const statsHeight = calculateStatsHeight(colorStats);

  // 创建 canvas（增加坐标区域空间）
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(N * cellSize + padding * 2 + coordinateMargin * 2, 800);
  canvas.height = M * cellSize + padding * 2 + titleHeight + statsHeight + coordinateMargin * 2;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 绘制白色背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制标题区域
  drawTitle(ctx, canvas.width, titleHeight, brand);

  // 绘制网格（增加坐标边距）
  const offsetY = titleHeight + padding + coordinateMargin;
  const offsetX = (canvas.width - N * cellSize) / 2;
  drawGrid(ctx, grid, brand, offsetX, offsetY, cellSize);

  // 绘制坐标
  drawCoordinates(ctx, N, M, offsetX, offsetY, cellSize, coordinateMargin);

  // 绘制统计信息
  const statsY = offsetY + M * cellSize + padding + coordinateMargin;
  drawStats(ctx, colorStats, statsY, canvas.width, padding);

  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 下载图片
  canvas.toBlob((blob) => {
    if (!blob) return;

    if (isMobile) {
      // 移动端：尝试使用 Share API 或直接下载
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })) {
        // 支持 Web Share API Level 2 (文件分享)
        const file = new File([blob], filename, { type: 'image/png' });
        navigator.share({
          files: [file],
          title: '拼豆图纸',
          text: '山椒爱拼豆图纸'
        }).catch(err => {
          console.log('分享失败，使用下载方式:', err);
          downloadBlob(blob, filename);
        });
      } else {
        // 不支持分享，直接下载（某些移动浏览器会提示保存到相册）
        downloadBlob(blob, filename);

        // 显示提示信息
        showMobileSaveTip();
      }
    } else {
      // PC端：直接下载
      downloadBlob(blob, filename);
    }
  });
}

/**
 * 下载 Blob 对象
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 显示移动端保存提示
 */
function showMobileSaveTip() {
  const tip = document.createElement('div');
  tip.textContent = '💡 提示：图片已下载，长按图片可保存到相册';
  tip.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 16px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    max-width: 80%;
    text-align: center;
  `;
  document.body.appendChild(tip);

  setTimeout(() => {
    tip.style.opacity = '0';
    tip.style.transition = 'opacity 0.3s ease';
    setTimeout(() => document.body.removeChild(tip), 300);
  }, 3000);
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

      // 跳过外部背景区域，绘制为透明/空白
      if (pixel.isExternal) {
        // 绘制浅灰色背景表示这是被移除的背景区域
        ctx.fillStyle = '#F3F4F6';
        ctx.fillRect(x, y, cellSize, cellSize);

        // 绘制虚线边框表示这是背景
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]); // 虚线
        ctx.strokeRect(x, y, cellSize, cellSize);
        ctx.setLineDash([]); // 恢复实线
        continue; // 跳过色号绘制
      }

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
 * 绘制参考坐标（四周）
 */
function drawCoordinates(
  ctx: CanvasRenderingContext2D,
  N: number,
  M: number,
  offsetX: number,
  offsetY: number,
  cellSize: number,
  coordinateMargin: number
) {
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 顶部列号（1, 2, 3...）
  for (let col = 0; col < N; col++) {
    const x = offsetX + col * cellSize + cellSize / 2;
    const y = offsetY - coordinateMargin / 2;
    ctx.fillText((col + 1).toString(), x, y);
  }

  // 底部列号（1, 2, 3...）
  for (let col = 0; col < N; col++) {
    const x = offsetX + col * cellSize + cellSize / 2;
    const y = offsetY + M * cellSize + coordinateMargin / 2;
    ctx.fillText((col + 1).toString(), x, y);
  }

  // 左侧行号（1, 2, 3...）
  ctx.textAlign = 'right';
  for (let row = 0; row < M; row++) {
    const x = offsetX - coordinateMargin / 3;
    const y = offsetY + row * cellSize + cellSize / 2;
    ctx.fillText((row + 1).toString(), x, y);
  }

  // 右侧行号（1, 2, 3...）
  ctx.textAlign = 'left';
  for (let row = 0; row < M; row++) {
    const x = offsetX + N * cellSize + coordinateMargin / 3;
    const y = offsetY + row * cellSize + cellSize / 2;
    ctx.fillText((row + 1).toString(), x, y);
  }
}


/**
 * 计算统计区域高度
 */
function calculateStatsHeight(colorStats: ColorStat[]): number {
  const headerHeight = 120;
  const rowHeight = 80; // 增加行高以适配更大的文字
  const columns = 2; // 改为2列以增加可读性
  const rows = Math.ceil(colorStats.length / columns);
  const watermarkHeight = 80; // 添加水印区域高度
  return headerHeight + rows * rowHeight + 60 + watermarkHeight;
}

/**
 * 绘制统计信息（移动端优化）
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
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(padding, startY);
  ctx.lineTo(width - padding, startY);
  ctx.stroke();

  // 绘制统计标题 - 更大字体
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('颜色统计', width / 2, startY + 60);

  // 计算总珠子数 - 更大字体
  const totalBeads = colorStats.reduce((sum, stat) => sum + stat.count, 0);
  ctx.font = '32px sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(`总计: ${totalBeads} 颗 | 共 ${colorStats.length} 种颜色`, width / 2, startY + 105);

  // 绘制颜色列表（2列布局以增加可读性）
  const columns = 2;
  const columnWidth = (width - padding * 2) / columns;
  const rowHeight = 80; // 增加行高
  const colorBlockSize = 60; // 增大色块
  let currentY = startY + 140;

  colorStats.forEach((stat, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = padding + col * columnWidth + 20; // 增加左边距
    const y = currentY + row * rowHeight;

    // 绘制颜色方块 - 更大
    ctx.fillStyle = stat.paletteColor.hex;
    ctx.fillRect(x, y, colorBlockSize, colorBlockSize);
    ctx.strokeStyle = '#D1D5DB';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, colorBlockSize, colorBlockSize);

    // 绘制色号 - 更大字体
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(stat.code, x + colorBlockSize + 15, y + 22);

    // 绘制数量 - 更大字体
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#6B7280';
    ctx.fillText(`${stat.count} 颗`, x + colorBlockSize + 15, y + 50);
  });

  // 绘制底部水印 - 更大字体
  const rows = Math.ceil(colorStats.length / columns);
  const watermarkY = currentY + rows * rowHeight + 50;
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '28px sans-serif';
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
