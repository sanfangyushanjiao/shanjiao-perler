import type { ColorStat } from '../../types';

interface ColorStatsProps {
  stats: ColorStat[];
  excludedColors?: Set<string>;
  onColorExclude?: (hex: string) => void;
}

export default function ColorStats({
  stats,
  excludedColors = new Set(),
  onColorExclude
}: ColorStatsProps) {
  const totalBeads = stats.reduce((sum, stat) => sum + stat.count, 0);

  if (stats.length === 0) {
    return null;
  }

  const handleColorClick = (hex: string) => {
    if (onColorExclude) {
      onColorExclude(hex);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">颜色统计</h2>

      <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">总珠子数</span>
          <span className="text-2xl font-bold text-blue-600">{totalBeads}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-700 font-medium">颜色种类</span>
          <span className="text-xl font-bold text-indigo-600">{stats.length}</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-3 text-center">
        点击表格行可排除/恢复颜色
      </div>

      {/* 表格形式 */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-b-2 border-gray-400">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-b-2 border-gray-400">
                  颜色
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-b-2 border-gray-400">
                  色号
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 border-b-2 border-gray-400">
                  数量
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-gray-700 border-b-2 border-gray-400">
                  占比
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {stats.map((stat, index) => {
                const isExcluded = excludedColors.has(stat.paletteColor.hex.toUpperCase());
                return (
                  <tr
                    key={stat.paletteColor.hex}
                    onClick={() => handleColorClick(stat.paletteColor.hex.toUpperCase())}
                    className={`cursor-pointer transition-all border-b border-gray-200 last:border-b-0 ${
                      isExcluded
                        ? 'bg-red-50 opacity-50 hover:opacity-70'
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    <td className={`px-3 py-3 text-sm text-gray-600 font-medium ${isExcluded ? 'line-through' : ''}`}>
                      {index + 1}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg border-2 flex-shrink-0 shadow-sm ${
                            isExcluded ? 'border-red-300' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: stat.paletteColor.hex }}
                        />
                        <span className={`text-xs text-gray-500 font-mono ${isExcluded ? 'line-through' : ''}`}>
                          {stat.paletteColor.hex}
                        </span>
                      </div>
                    </td>
                    <td className={`px-3 py-3 text-sm font-bold text-gray-800 ${isExcluded ? 'line-through' : ''}`}>
                      {stat.code}
                    </td>
                    <td className={`px-3 py-3 text-sm font-bold text-gray-800 text-right ${isExcluded ? 'line-through' : ''}`}>
                      {stat.count}
                    </td>
                    <td className={`px-3 py-3 text-sm text-gray-600 text-right font-medium ${isExcluded ? 'line-through' : ''}`}>
                      {((stat.count / totalBeads) * 100).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
