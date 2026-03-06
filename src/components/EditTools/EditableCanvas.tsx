import { useEffect, useRef, useState } from 'react';
import type { MappedPixel, BrandName, PaletteColor } from '../../types';
import type { ToolType, ColorReplaceState } from '../../types/editTools';
import { paintPixel, erasePixel, floodFillErase, canvasToGrid } from '../../utils/pixelEdit';

interface EditableCanvasProps {
  grid: MappedPixel[][] | null;
  brand: BrandName;
  isEditMode: boolean;
  currentTool: ToolType;
  selectedColor: PaletteColor | null;
  onEdit: (newGrid: MappedPixel[][]) => void;
  showCodes?: boolean;
  colorReplaceState?: ColorReplaceState;
  onSelectSourceColor?: (color: PaletteColor) => void;
}

export default function EditableCanvas({
  grid,
  brand,
  isEditMode,
  currentTool,
  selectedColor,
  onEdit,
  showCodes = true,
  colorReplaceState,
  onSelectSourceColor,
}: EditableCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const cellSizeRef = useRef(40);

  // 触摸交互状态
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);
  const [pinchCenter, setPinchCenter] = useState<{ x: number; y: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);
  const isScalingRef = useRef(false);

  // 绘制画布
  useEffect(() => {
    if (!grid || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const M = grid.length;
    const N = grid[0]?.length || 0;

    const cellSize = 40;
    cellSizeRef.current = cellSize;

    canvas.width = N * cellSize;
    canvas.height = M * cellSize;

    // 计算初始缩放，确保画布完整显示
    const container = containerRef.current;
    const containerWidth = container.clientWidth - 48;
    const containerHeight = container.clientHeight - 48;
    const scaleX = containerWidth / canvas.width;
    const scaleY = containerHeight / canvas.height;
    const initialScale = Math.min(scaleX, scaleY); // 移除 1 的限制，允许缩小

    // 每次网格变化时重置缩放和位置
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 0.5;
    const gridLineColor = '#DDDDDD';
    const externalBackgroundColor = '#F3F4F6';

    // 绘制每个单元格
    for (let row = 0; row < M; row++) {
      for (let col = 0; col < N; col++) {
        const pixel = grid[row][col];
        const x = col * cellSize;
        const y = row * cellSize;

        // 绘制颜色方块
        if (pixel.isExternal) {
          ctx.fillStyle = externalBackgroundColor;
        } else {
          ctx.fillStyle = pixel.paletteColor.hex;
        }
        ctx.fillRect(x, y, cellSize, cellSize);

        // 悬停高亮
        if (isEditMode && hoveredCell && hoveredCell.row === row && hoveredCell.col === col) {
          // 橡皮擦工具显示红色半透明高亮
          if (currentTool === 'eraser' || currentTool === 'areaEraser') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // 红色高亮
          } else {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // 蓝色高亮
          }
          ctx.fillRect(x, y, cellSize, cellSize);
        }

        // 绘制网格线
        ctx.strokeStyle = gridLineColor;
        ctx.strokeRect(x + 0.5, y + 0.5, cellSize, cellSize);

        // 绘制色号
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
  }, [grid, brand, showCodes, isEditMode, hoveredCell, scale, currentTool]);

  // 获取画布坐标（鼠标）
  const getCanvasCoordinates = (e: React.MouseEvent): { row: number; col: number } | null => {
    if (!canvasRef.current || !grid) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) / scale;
    const canvasY = (e.clientY - rect.top) / scale;

    return canvasToGrid(
      canvasX,
      canvasY,
      cellSizeRef.current,
      canvas.width,
      canvas.height,
      grid[0].length,
      grid.length
    );
  };

  // 获取画布坐标（触摸）
  const getCanvasCoordinatesFromTouch = (touch: React.Touch): { row: number; col: number } | null => {
    if (!canvasRef.current || !grid) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = (touch.clientX - rect.left) / scale;
    const canvasY = (touch.clientY - rect.top) / scale;

    return canvasToGrid(
      canvasX,
      canvasY,
      cellSizeRef.current,
      canvas.width,
      canvas.height,
      grid[0].length,
      grid.length
    );
  };

  // 计算两个触摸点之间的距离
  const getTouchDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 执行工具操作
  const executeTool = (row: number, col: number) => {
    if (!grid) return;

    let newGrid: MappedPixel[][] | null = null;

    switch (currentTool) {
      case 'brush':
        if (selectedColor) {
          newGrid = paintPixel(grid, row, col, selectedColor);
        }
        break;

      case 'eraser':
        newGrid = erasePixel(grid, row, col);
        break;

      case 'areaEraser':
        newGrid = floodFillErase(grid, row, col);
        break;
    }

    if (newGrid) {
      onEdit(newGrid);
    }
  };

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditMode) {
      const coords = getCanvasCoordinates(e);
      if (coords) {
        // 颜色替换模式：第1步选择源颜色
        if (colorReplaceState?.isActive && colorReplaceState.step === 'selectSource') {
          const cell = grid![coords.row][coords.col];
          if (!cell.isExternal && onSelectSourceColor) {
            onSelectSourceColor(cell.paletteColor);
          }
          return;
        }

        // 正常工具操作
        setIsDrawing(true);
        executeTool(coords.row, coords.col);
      }
    } else {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isEditMode) {
      const coords = getCanvasCoordinates(e);
      setHoveredCell(coords);

      // 画笔和橡皮擦支持拖拽连续绘制
      if (isDrawing && coords && (currentTool === 'brush' || currentTool === 'eraser')) {
        executeTool(coords.row, coords.col);
      }
    } else if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    setIsDragging(false);
    setIsDrawing(false);
  };

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
    const initialScale = Math.min(scaleX, scaleY); // 移除 1 的限制
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.1, Math.min(s * delta, 3)));
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2) {
      // 双指缩放
      const distance = getTouchDistance(e.touches);
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      setInitialPinchDistance(distance);
      setInitialScale(scale);
      setPinchCenter({ x: centerX, y: centerY });
      setIsDragging(false);
      setIsDrawing(false);
      isScalingRef.current = true;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];

      if (isEditMode) {
        // 编辑模式：绘制
        const coords = getCanvasCoordinatesFromTouch(touch);
        if (coords) {
          // 颜色替换模式：第1步选择源颜色
          if (colorReplaceState?.isActive && colorReplaceState.step === 'selectSource') {
            const cell = grid![coords.row][coords.col];
            if (!cell.isExternal && onSelectSourceColor) {
              onSelectSourceColor(cell.paletteColor);
            }
            return;
          }

          setIsDrawing(true);
          executeTool(coords.row, coords.col);
        }
      } else {
        // 浏览模式：拖拽
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      }

      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2 && initialPinchDistance !== null && isScalingRef.current) {
      // 双指缩放 - 使用节流避免频繁更新
      const distance = getTouchDistance(e.touches);
      const scaleChange = distance / initialPinchDistance;
      const newScale = Math.max(0.1, Math.min(initialScale * scaleChange, 3));

      // 只在缩放变化超过阈值时更新（减少闪烁）
      if (Math.abs(newScale - scale) > 0.01) {
        setScale(newScale);
      }
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];

      if (isEditMode && isDrawing) {
        // 编辑模式：连续绘制
        const coords = getCanvasCoordinatesFromTouch(touch);
        if (coords && (currentTool === 'brush' || currentTool === 'eraser')) {
          executeTool(coords.row, coords.col);
        }
      } else if (isDragging && lastTouchRef.current && !isScalingRef.current) {
        // 拖拽移动
        const dx = touch.clientX - lastTouchRef.current.x;
        const dy = touch.clientY - lastTouchRef.current.y;
        setPosition(prev => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
        lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      setIsDrawing(false);
      setInitialPinchDistance(null);
      setPinchCenter(null);
      lastTouchRef.current = null;
      isScalingRef.current = false;
    } else if (e.touches.length === 1) {
      // 从双指变为单指，重置拖拽起点
      setInitialPinchDistance(null);
      setPinchCenter(null);
      isScalingRef.current = false;
      const touch = e.touches[0];
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  if (!grid) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-2xl">
        <div className="text-gray-400 text-lg">上传图片后将显示预览</div>
      </div>
    );
  }

  const cursorStyle = isEditMode
    ? currentTool === 'brush'
      ? 'crosshair'
      : currentTool === 'eraser'
      ? 'cell' // 改用 cell 光标，看起来像小方块更适合橡皮擦
      : currentTool === 'areaEraser'
      ? 'pointer'
      : 'default'
    : isDragging
    ? 'grabbing'
    : 'grab';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* 缩放控制按钮 */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={handleZoomOut}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-all"
        >
          缩小
        </button>
        <button
          onClick={handleZoomReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-all"
        >
          重置
        </button>
        <button
          onClick={handleZoomIn}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-all"
        >
          放大
        </button>
      </div>

      {/* 画布容器 */}
      <div
        ref={containerRef}
        className="overflow-hidden bg-gray-50 rounded-xl border-2 border-gray-200"
        style={{
          height: '70vh',
          cursor: cursorStyle,
          touchAction: 'none', // 禁用浏览器默认的触摸手势
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex items-center justify-center w-full h-full"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging || isDrawing ? 'none' : 'transform 0.1s ease-out',
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
        {isEditMode
          ? `当前工具：${getToolName(currentTool)} | 点击或拖拽进行编辑`
          : '提示：按住 Ctrl/Cmd + 滚轮缩放，拖拽移动'}
      </div>
    </div>
  );
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

function getToolName(tool: ToolType): string {
  const names: Record<ToolType, string> = {
    brush: '画笔',
    eraser: '橡皮擦',
    areaEraser: '区域擦除',
    replace: '批量替换',
  };
  return names[tool];
}
