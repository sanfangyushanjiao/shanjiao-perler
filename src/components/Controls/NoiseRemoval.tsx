import { useState } from 'react';

interface NoiseRemovalProps {
  onApply: (thresholdPercent: number) => void;
  onRestore: () => void;
  disabled: boolean;
  hasApplied: boolean;
  removedColorsCount?: number;
}

export default function NoiseRemoval({
  onApply,
  onRestore,
  disabled,
  hasApplied,
  removedColorsCount = 0
}: NoiseRemovalProps) {
  const [threshold, setThreshold] = useState(0.5); // 默认 0.5%

  const handleApply = () => {
    onApply(threshold / 100); // 转换为小数
  };

  const handleThresholdChange = (value: number) => {
    // 限制范围 0.0 - 1.0
    const clampedValue = Math.max(0, Math.min(1, value));
    setThreshold(clampedValue);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">一键去杂色</h3>

      {/* 阈值设置 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          占比阈值（%）
        </label>
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={threshold}
          onChange={(e) => handleThresholdChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="0.0 - 1.0"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>最小: 0.0%</span>
          <span>最大: 1.0%</span>
        </div>
      </div>

      {/* 说明文字 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-600 leading-relaxed">
          将移除数量占比低于 <span className="font-semibold text-primary">{threshold.toFixed(1)}%</span> 的颜色，
          并自动替换为最接近的其他颜色。
        </p>
        <p className="text-xs text-gray-500 mt-1">
          提示：设置为 0.0% 可移除数量极少的杂色
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={disabled}
          className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
        >
          应用去杂色
        </button>
        {hasApplied && (
          <button
            onClick={onRestore}
            disabled={disabled}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            恢复
          </button>
        )}
      </div>

      {/* 结果提示 */}
      {hasApplied && removedColorsCount > 0 && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 text-center">
            已移除 <span className="font-semibold">{removedColorsCount}</span> 种杂色
          </p>
        </div>
      )}
    </div>
  );
}
