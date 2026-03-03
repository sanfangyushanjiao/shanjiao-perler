import { useEffect, useRef, useState } from 'react';
import type { MappedPixel, BrandName } from '../../types';

interface PreviewCanvasProps {
  grid: MappedPixel[][] | null;
  brand: BrandName;
  showCodes?: boolean;
}

export default function PreviewCanvas({ grid, brand, showCodes = true }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!grid || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const M = grid.length; // 行数
    const N = grid[0]?.length || 0; // 列数

    // 计算单元格大小，确保清晰显示
    const cellSize = 40;

    canvas.width = N * cellSize;
    canvas.height = M * cellSize;

    // 计算初始缩放比例，使画布完整显示在容器中
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 48; // 减去 padding
    const containerHeight = container.clientHeight - 48;
    const scaleX = containerWidth / canvas.width;
    const scaleY = containerHeight / canvas.height;
    const initialScale = Math.min(scaleX, scaleY, 1); // 不超过 1

    setScale(initialScale);
    setPosition({ x: 0, y: 0 });

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 设置细网格线
    ctx.lineWidth = 0.5;
    const gridLineColor = '#DDDDDD';
    const externalBackgroundColor = '#F3F4F6'; // 浅灰色表示外部背景

    // 绘制每个单元格
    for (let row = 0; row < M; row++) {
      for (let col = 0; col < N; col++) {
        const pixel = grid[row][col];
        const x = col * cellSize;
        const y = row * cellSize;

        // 绘制颜色方块（外部背景用浅灰色）
        if (pixel.isExternal) {
          ctx.fillStyle = externalBackgroundColor;
        } else {
          ctx.fillStyle = pixel.paletteColor.hex;
        }
        ctx.fillRect(x, y, cellSize, cellSize);

        // 绘制细网格线
        ctx.strokeStyle = gridLineColor;
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);

        // 绘制色号（不在外部背景上显示）
        if (showCodes && cellSize >= 25 && !pixel.isExternal) {
          const code = pixel.paletteColor.codes[brand] || '?';
          ctx.fillStyle = getContrastColor(pixel.paletteColor.hex);
          const fontSize = Math.max(9, Math.min(cellSize * 0.25, 14));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(code, x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  }, [grid, brand, showCodes]);

  // 缩放控制
  const handleZoomIn = () => setScale((s) => Math.min(s * 1.2, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.2, 0.1));
  const handleZoomReset = () => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 48;
    const containerHeight = container.clientHeight - 48;
    const scaleX = containerWidth / canvas.width;
    const scaleY = containerHeight / canvas.height;
    const initialScale = Math.min(scaleX, scaleY, 1);
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  };

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 鼠标滚轮缩放（只在按住 Ctrl/Cmd 时）
  const handleWheel = (e: React.WheelEvent) => {
    // 只在按住 Ctrl 或 Cmd 键时才缩放
    if (!e.ctrlKey && !e.metaKey) {
      return; // 允许正常滚动页面
    }

    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.1, Math.min(s * delta, 3)));
  };

  if (!grid) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
        <div className="text-gray-400 text-lg">上传图片后将显示预览</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* 缩放控制按钮 */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={handleZoomOut}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
        >
          缩小 -
        </button>
        <button
          onClick={handleZoomReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
        >
          重置 {Math.round(scale * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
        >
          放大 +
        </button>
      </div>

      {/* 画布容器 */}
      <div
        ref={containerRef}
        className="overflow-hidden bg-gray-50 rounded-lg border-2 border-gray-200"
        style={{ height: '70vh', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="flex items-center justify-center w-full h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        >
          <canvas
            ref={canvasRef}
            className="shadow-lg"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center mt-2">
        提示：按住 Ctrl/Cmd + 滚轮缩放，拖拽移动
      </div>
    </div>
  );
}

/**
 * 根据背景色计算对比文字颜色
 */
function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? '#000000' : '#FFFFFF';
}
