import type { ToolType, ToolbarProps } from '../../types/editTools';

export default function Toolbar({
  currentTool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isEditMode,
  onToggleEditMode,
  colorReplaceState,
  onToggleColorReplace,
}: ToolbarProps) {
  const tools: { type: ToolType; label: string; icon: string }[] = [
    { type: 'brush', label: '画笔', icon: '🖌️' },
    { type: 'eraser', label: '橡皮擦', icon: '🧹' },
    { type: 'areaEraser', label: '区域擦除', icon: '🗑️' },
    { type: 'replace', label: '批量替换', icon: '🔄' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">编辑工具</h3>
        <button
          onClick={() => onToggleEditMode()}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            isEditMode
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isEditMode ? '退出编辑' : '进入编辑'}
        </button>
      </div>

      {isEditMode && (
        <>
          {/* 颜色替换状态提示 */}
          {colorReplaceState?.isActive && (
            <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm font-semibold text-blue-800 flex-1">
                  {colorReplaceState.step === 'selectSource' && '步骤1: 点击画布选择要替换的颜色'}
                  {colorReplaceState.step === 'selectTarget' && (
                    <>
                      <div>步骤2: 从调色盘选择目标颜色</div>
                      <div className="text-xs mt-1 text-blue-600">
                        源颜色: {colorReplaceState.sourceColor?.hex}
                      </div>
                    </>
                  )}
                </div>
                {onToggleColorReplace && (
                  <button
                    onClick={onToggleColorReplace}
                    className="px-3 py-1 text-xs bg-white hover:bg-gray-100 text-blue-800 border border-blue-300 rounded-md font-medium transition-all"
                  >
                    取消
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 工具选择 - 2x2 网格 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {tools.map((tool) => (
              <button
                key={tool.type}
                onClick={() => onToolChange(tool.type)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  currentTool === tool.type
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl mb-1">{tool.icon}</span>
                <span className="text-xs font-medium text-gray-700">{tool.label}</span>
              </button>
            ))}
          </div>

          {/* 撤销/重做 */}
          <div className="flex gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-all"
            >
              ↶ 撤销
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-all"
            >
              ↷ 重做
            </button>
          </div>
        </>
      )}
    </div>
  );
}
