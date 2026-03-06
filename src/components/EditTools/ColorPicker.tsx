import { useState, useMemo, useCallback, memo } from 'react';
import type { PaletteColor, BrandName } from '../../types';
import type { ColorReplaceState } from '../../types/editTools';

interface ColorPickerProps {
  palette: PaletteColor[]; // 完整调色板
  selectedColor: PaletteColor | null;
  onColorSelect: (color: PaletteColor) => void;
  brand: BrandName;
  colorReplaceState?: ColorReplaceState;
  onColorReplace?: (sourceColor: PaletteColor, targetColor: PaletteColor) => void;
  onSelectSourceColor?: (color: PaletteColor) => void;
  currentColors?: PaletteColor[]; // 当前图像中使用的颜色
}

// 按色相分组聚集的排序算法 - 提取为独立函数，避免重复创建
function sortColorsByHSL(colors: PaletteColor[]): PaletteColor[] {
  const toHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
          break;
        case g:
          h = ((b - r) / d + 2) * 60;
          break;
        case b:
          h = ((r - g) / d + 4) * 60;
          break;
      }
    }
    return { h, s, l };
  };

  return [...colors].sort((a, b) => {
    const hslA = toHsl(a.rgb.r, a.rgb.g, a.rgb.b);
    const hslB = toHsl(b.rgb.r, b.rgb.g, b.rgb.b);
    const isGrayA = hslA.s < 0.1;
    const isGrayB = hslB.s < 0.1;

    // 无彩色（黑白灰）排最前面，按亮度从暗到亮
    if (isGrayA && isGrayB) return hslA.l - hslB.l;
    if (isGrayA) return -1;
    if (isGrayB) return 1;

    // 彩色按色相排序：红->橙->黄->绿->青->蓝->紫->粉
    // 色相差异超过15度才换组
    const hueDiff = Math.abs(hslA.h - hslB.h);
    if (hueDiff > 15) {
      return hslA.h - hslB.h;
    }

    // 同色相组内，先按饱和度从高到低
    const satDiff = Math.abs(hslB.s - hslA.s);
    if (satDiff > 0.1) {
      return hslB.s - hslA.s;
    }

    // 饱和度相近时，按亮度从暗到亮
    return hslA.l - hslB.l;
  });
}

// 获取对比色（用于色号文字）- 提取为独立函数
function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// 单个颜色按钮组件 - 使用 memo 优化
const ColorButton = memo(({
  color,
  brand,
  isSelected,
  isSourceColor,
  onClick,
}: {
  color: PaletteColor;
  brand: BrandName;
  isSelected: boolean;
  isSourceColor: boolean;
  onClick: () => void;
}) => {
  const colorCode = color.codes[brand] || '?';
  const contrastColor = getContrastColor(color.hex);

  return (
    <button
      onClick={onClick}
      className={`
        relative w-full aspect-square rounded-lg transition-all duration-200
        flex items-center justify-center
        border-2 shadow-sm
        ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2 scale-105 border-white' : 'border-gray-300'}
        ${isSourceColor ? 'ring-4 ring-amber-400 ring-offset-2 border-white' : ''}
        ${!isSelected && !isSourceColor ? 'hover:scale-110 hover:shadow-lg hover:z-10' : ''}
      `}
      style={{
        backgroundColor: color.hex,
      }}
      title={`${colorCode} - ${color.hex}`}
    >
      <span
        className="text-xs font-bold font-mono leading-none text-center px-1"
        style={{
          color: contrastColor,
          textShadow: '0 0 3px rgba(0,0,0,0.5), 0 0 6px rgba(0,0,0,0.3)',
          wordBreak: 'break-all',
          lineHeight: '1.1'
        }}
      >
        {colorCode}
      </span>
    </button>
  );
});

ColorButton.displayName = 'ColorButton';

function ColorPicker({
  palette,
  selectedColor,
  onColorSelect,
  brand,
  colorReplaceState,
  onColorReplace,
  onSelectSourceColor,
  currentColors = [],
}: ColorPickerProps) {
  const [showFullPalette, setShowFullPalette] = useState(false);

  // 处理颜色选择
  const handleColorClick = useCallback((color: PaletteColor) => {
    // 如果处于颜色替换模式
    if (colorReplaceState?.isActive) {
      if (colorReplaceState.step === 'selectSource') {
        // 步骤1: 从色板直接选择源颜色
        if (onSelectSourceColor) {
          onSelectSourceColor(color);
        }
      } else if (colorReplaceState.step === 'selectTarget' && colorReplaceState.sourceColor && onColorReplace) {
        // 步骤2: 选择目标颜色并执行替换
        onColorReplace(colorReplaceState.sourceColor, color);
      }
    } else {
      // 正常颜色选择（用于画笔工具）
      onColorSelect(color);
    }
  }, [colorReplaceState, onColorReplace, onSelectSourceColor, onColorSelect]);

  // 排序后的调色板 - 仅在调色板改变时重新计算
  const sortedPalette = useMemo(() => sortColorsByHSL(palette), [palette]);
  const sortedCurrentColors = useMemo(() => sortColorsByHSL(currentColors), [currentColors]);

  // 显示的颜色列表 - 移除 sortColorsByHSL 依赖
  const displayColors = useMemo(() => {
    return showFullPalette ? sortedPalette : sortedCurrentColors;
  }, [showFullPalette, sortedPalette, sortedCurrentColors]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      {/* Tab 切换按钮 - 双按钮并列 */}
      {currentColors.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setShowFullPalette(false)}
            className={`py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
              !showFullPalette
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            当前色板 ({currentColors.length}色)
          </button>
          <button
            onClick={() => setShowFullPalette(true)}
            className={`py-2.5 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
              showFullPalette
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            完整色板 ({palette.length}色)
          </button>
        </div>
      )}

      {/* 颜色替换模式提示 */}
      {colorReplaceState?.isActive && (
        <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
          {colorReplaceState.step === 'selectSource' ? (
            <div>
              <div className="text-sm font-bold text-blue-800 mb-2">
                步骤1: 选择要替换的源颜色
              </div>
              <div className="text-xs text-blue-600">
                请在画布上点击要替换的颜色，或从下方色板直接选择
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm font-bold text-blue-800 mb-2">
                步骤2: 选择目标颜色
              </div>
              <div className="text-xs text-blue-600 mb-2">
                源颜色: <span className="font-mono font-bold">{colorReplaceState.sourceColor?.hex}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: colorReplaceState.sourceColor?.hex }}
                />
                <span className="text-xl">→</span>
                <div className="text-xs text-blue-600">从下方色板选择目标颜色</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 颜色网格 - 改进滚动性能 */}
      <div
        className="overflow-y-auto overflow-x-hidden"
        style={{
          maxHeight: '400px',
          // 启用 GPU 加速，减少重绘
          willChange: 'scroll-position',
          // 使用硬件加速
          transform: 'translateZ(0)',
        }}
      >
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))' }}>
          {displayColors.map((color) => {
            const isSelected = selectedColor?.hex === color.hex;
            const isSourceColor = colorReplaceState?.sourceColor?.hex === color.hex;

            return (
              <ColorButton
                key={color.hex}
                color={color}
                brand={brand}
                isSelected={isSelected}
                isSourceColor={isSourceColor}
                onClick={() => handleColorClick(color)}
              />
            );
          })}
        </div>
      </div>

      {/* 当前选中颜色信息 */}
      {selectedColor && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg border-2 border-gray-300 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: selectedColor.hex }}
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-800">
                {selectedColor.codes[brand] || '未知色号'}
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {selectedColor.hex}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 空状态提示 */}
      {displayColors.length === 0 && (
        <div className="text-sm text-gray-500 text-center py-8">
          {showFullPalette ? '没有可用颜色' : '图像中未使用任何颜色'}
        </div>
      )}
    </div>
  );
}

export default memo(ColorPicker);
