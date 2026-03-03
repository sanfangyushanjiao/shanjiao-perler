import type { BrandName } from '../../types';

interface ControlPanelProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  mergeThreshold: number;
  onMergeThresholdChange: (threshold: number) => void;
  removeBackground: boolean;
  onRemoveBackgroundChange: (remove: boolean) => void;
  brand: BrandName;
  onBrandChange: (brand: BrandName) => void;
  onApplyParameters: () => void;
  disabled?: boolean;
}

const BRANDS: BrandName[] = ['MARD', 'COCO', '漫漫', '盼盼', '咪小窝'];

export default function ControlPanel({
  gridSize,
  onGridSizeChange,
  mergeThreshold,
  onMergeThresholdChange,
  removeBackground,
  onRemoveBackgroundChange,
  brand,
  onBrandChange,
  onApplyParameters,
  disabled = false,
}: ControlPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">控制面板</h2>

      {/* 网格尺寸 */}
      <div>
        <label htmlFor="gridSizeInput" className="block text-sm font-semibold text-gray-700 mb-2">
          网格尺寸 (10-300):
        </label>
        <input
          type="number"
          id="gridSizeInput"
          value={gridSize}
          onChange={(e) => onGridSizeChange(Number(e.target.value))}
          disabled={disabled}
          min="10"
          max="300"
          className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* 颜色数量控制 */}
      <div>
        <label htmlFor="mergeThresholdInput" className="block text-sm font-semibold text-gray-700 mb-2">
          颜色数量控制 (0-100):
        </label>
        <input
          type="number"
          id="mergeThresholdInput"
          value={mergeThreshold}
          onChange={(e) => onMergeThresholdChange(Number(e.target.value))}
          disabled={disabled}
          min="0"
          max="100"
          className="w-full p-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-secondary focus:border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-gray-500 mt-2">
          0 = 关闭，值越大合并越多
        </div>
      </div>

      {/* 应用按钮 */}
      <button
        onClick={onApplyParameters}
        disabled={disabled}
        className="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        应用参数
      </button>

      {/* 去除背景按钮 */}
      <button
        onClick={() => onRemoveBackgroundChange(!removeBackground)}
        disabled={disabled}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg
          ${removeBackground
            ? 'bg-secondary text-white hover:bg-secondary/90'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {removeBackground ? '✓ 已去除背景' : '去除背景'}
      </button>

      {/* 品牌选择 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          拼豆品牌
        </label>
        <select
          value={brand}
          onChange={(e) => onBrandChange(e.target.value as BrandName)}
          disabled={disabled}
          className="w-full py-2 px-4 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {BRANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
