import React, { useState } from 'react';
import { 
  UploadCloud, Image as ImageIcon, Settings2, Palette, Eraser, 
  Play, Wand2, Sparkles, PenTool, BoxSelect, Undo2, Redo2,
  Table2, Replace, Download, MousePointer2, Info
} from 'lucide-react';

export default function PerlerMakerUI() {
  const [gridSize, setGridSize] = useState(50);
  const [colorCount, setColorCount] = useState(0);
  const [brand, setBrand] = useState('MARD');
  const [hasImage, setHasImage] = useState(false);
  const [noiseThreshold, setNoiseThreshold] = useState(0.5);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTool, setActiveTool] = useState('brush');
  const [showStats, setShowStats] = useState(false);

  const handleUploadClick = () => setHasImage(true);

  // 渲染单颗"拼豆"的UI小组件，增加手作质感
  const renderBead = (hex, size = "w-4 h-4", holeSize = "w-1.5 h-1.5") => (
    <div 
      className={`${size} rounded-full flex items-center justify-center shadow-sm relative group cursor-pointer hover:scale-110 transition-transform flex-shrink-0`} 
      style={{ backgroundColor: hex, border: '1px solid rgba(0,0,0,0.08)' }}
    >
      {/* 拼豆中间的孔 */}
      <div className={`${holeSize} rounded-full bg-black/20 mix-blend-multiply`}></div>
      {/* 模拟立体高光 */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-800 font-sans selection:bg-violet-200 flex flex-col overflow-hidden relative bg-[#FAFAFA]">
      
      {/* 全局波点背景 (暗示像素网格) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]" 
           style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* 顶部导航栏 - 毛玻璃效果 */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-200/60 px-6 py-3 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2 rounded-xl text-white shadow-lg shadow-violet-500/20">
            <Palette size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">山椒爱拼豆</h1>
            <p className="text-[11px] font-medium text-gray-500 tracking-wide uppercase">智能拼豆图纸生成器</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors hover:bg-gray-100/80">
              重新开始
            </button>
            <button className="text-sm bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95">
              <Download size={16} />
              导出高清图纸
            </button>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden z-10 relative">
        
        {/* ================= 左侧：画布预览区 ================= */}
        <section className="flex-1 flex flex-col relative m-4 md:mr-2 rounded-3xl overflow-hidden shadow-[inset_0_2px_20px_rgba(0,0,0,0.03)] bg-white/40 border border-gray-200/50 backdrop-blur-sm">
            {/* 画布工具栏 */}
            <div className="h-12 border-b border-gray-200/50 flex items-center justify-between px-5 bg-white/50">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${isEditMode ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Wand2 size={16} />
                    </div>
                    <span className="text-sm font-bold text-gray-700">{isEditMode ? '精细编辑模式' : '实时预览画布'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="hidden md:flex items-center gap-1.5"><MousePointer2 size={14}/> 拖拽平移 / 滚轮缩放</span>
                    <div className="flex items-center gap-1 bg-white border border-gray-200/80 rounded-lg p-1 shadow-sm">
                        <button className="px-2.5 py-1 hover:bg-gray-100 rounded-md transition-colors">-</button>
                        <span className="px-2 text-gray-400">100%</span>
                        <button className="px-2.5 py-1 hover:bg-gray-100 rounded-md transition-colors">+</button>
                    </div>
                </div>
            </div>

            {/* 画布核心区域 */}
            <div 
                className="flex-1 overflow-auto flex items-center justify-center p-4 relative"
                style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #f1f5f9 25%, transparent 25%, transparent 75%, #f1f5f9 75%, #f1f5f9), repeating-linear-gradient(45deg, #f1f5f9 25%, #ffffff 25%, #ffffff 75%, #f1f5f9 75%, #f1f5f9)',
                    backgroundPosition: '0 0, 12px 12px',
                    backgroundSize: '24px 24px'
                }}
            >
                {!hasImage ? (
                    <div className="flex flex-col items-center text-center p-10 max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/60 transform hover:scale-[1.02] transition-transform duration-500">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-violet-200 rounded-full blur-xl opacity-60 animate-pulse"></div>
                            <div className="w-20 h-20 bg-gradient-to-tr from-violet-100 to-fuchsia-50 rounded-full flex items-center justify-center relative border border-white shadow-inner">
                                <UploadCloud size={36} className="text-violet-500 drop-shadow-sm" />
                            </div>
                        </div>
                        <h3 className="text-xl font-extrabold text-gray-800 mb-2">开启你的拼豆创作</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            在右侧面板上传一张图片，我们将利用魔法为您生成完美的拼豆图纸。支持复杂的色彩还原与降噪。
                        </p>
                    </div>
                ) : (
                    <div className={`relative transition-all duration-300 ${isEditMode ? 'ring-4 ring-violet-400 ring-offset-4 ring-offset-white rounded-sm' : 'shadow-2xl'}`}>
                        {/* 模拟图像占位 */}
                        <div 
                            className="w-[450px] h-[450px] bg-gradient-to-tr from-emerald-800 via-teal-500 to-yellow-200"
                            style={{
                                backgroundImage: `
                                  linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)
                                `,
                                backgroundSize: '15px 15px'
                            }}
                        ></div>
                        {isEditMode && (
                            <div className="absolute top-3 left-3 bg-violet-600/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                编辑模式开启
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* 底部状态栏 */}
            {hasImage && isEditMode && (
                <div className="h-10 bg-violet-50 border-t border-violet-100 flex items-center px-5 text-sm font-medium text-violet-700 justify-center gap-2">
                    <Info size={16} />
                    正在使用：{activeTool === 'brush' ? '画笔' : activeTool === 'eraser' ? '橡皮擦' : '其他工具'} 
                    <span className="text-violet-400 font-normal ml-2">| 点击或拖拽画布进行编辑</span>
                </div>
            )}
        </section>

        {/* ================= 右侧：控制面板 ================= */}
        <aside className="w-full md:w-[340px] flex-shrink-0 flex flex-col h-full z-20 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:pl-2 space-y-4 hide-scrollbar">
            
            {/* 1. 上传区域卡片 (保持纵向完整宽度) */}
            <div 
                onClick={handleUploadClick}
                className={`relative group cursor-pointer rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 border-2 overflow-hidden
                ${hasImage ? 'border-violet-200 bg-white shadow-sm' : 'border-dashed border-gray-300 bg-white/50 hover:bg-white hover:border-violet-400 hover:shadow-lg hover:-translate-y-0.5'}`}
            >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-violet-100 to-fuchsia-50 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                {hasImage ? (
                    <div className="relative z-10 flex flex-col items-center w-full">
                        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 rounded-xl mb-2 shadow-md shadow-violet-200">
                            <ImageIcon size={20} className="text-white" />
                        </div>
                        <p className="text-sm font-bold text-gray-800 truncate w-full px-2">girl_portrait_v2.png</p>
                        <span className="mt-1 text-[11px] font-medium text-violet-500">点击更换图片</span>
                    </div>
                ) : (
                    <div className="relative z-10">
                        <div className="bg-gray-100 text-gray-500 group-hover:text-violet-600 group-hover:bg-violet-100 p-3 rounded-2xl mb-2 transition-colors mx-auto w-fit">
                            <UploadCloud size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-1">点击/拖拽上传图片</p>
                        <p className="text-[11px] font-medium text-gray-400">支持 JPG, PNG, GIF</p>
                    </div>
                )}
            </div>

            {/* 2. 基础参数设置 (严格恢复应用与去除背景的双按钮) */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100/80">
                    <div className="text-violet-500"><Settings2 size={16} /></div>
                    <h2 className="text-sm font-bold text-gray-800">控制面板</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-600">网格尺寸 (10-300)</label>
                            <span className="text-[11px] font-mono font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100">{gridSize}</span>
                        </div>
                        <input 
                            type="range" min="10" max="300" value={gridSize} onChange={(e) => setGridSize(e.target.value)}
                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-violet-500 hover:bg-gray-200 transition-colors"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-600">颜色数量控制 (0-100)</label>
                            <span className="text-[11px] font-mono font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100">{colorCount}</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" value={colorCount} onChange={(e) => setColorCount(e.target.value)}
                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-violet-500 hover:bg-gray-200 transition-colors"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">0 = 关闭，值越大合并越多</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">拼豆品牌</label>
                        <select 
                            value={brand} onChange={(e) => setBrand(e.target.value)}
                            className="block w-full text-xs bg-gray-50 border border-gray-200 rounded-lg py-2 px-2.5 text-gray-700 font-medium focus:bg-white focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                        >
                            <option value="MARD">MARD</option>
                            <option value="ARTKAL">Artkal (阿特卡)</option>
                            <option value="PERLER">Perler (帕勒)</option>
                        </select>
                    </div>

                    {/* 恢复左右两个独立操作按钮 */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white py-2 px-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]">
                            <Play size={14} /> 应用参数
                        </button>
                        <button className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-slate-400 to-gray-500 text-white py-2 px-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]">
                            <Eraser size={14} /> 去除背景
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. 一键去杂色 (严格恢复单列占据整行) */}
            <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100/80">
                    <Sparkles size={16} className="text-amber-500" />
                    <h2 className="text-sm font-bold text-gray-800">一键去杂色</h2>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-gray-600">占比阈值 (%)</label>
                            <span className="text-[11px] font-mono font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">{noiseThreshold.toFixed(1)}</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.1" value={noiseThreshold} onChange={(e) => setNoiseThreshold(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-amber-500 hover:bg-gray-200 transition-colors"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>最小: 0.0%</span>
                            <span>最大: 1.0%</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-amber-800/80 leading-relaxed bg-amber-50/50 p-2 rounded-lg border border-amber-100/50">
                        将移除数量占比低于 <strong className="text-amber-600 font-bold">{noiseThreshold.toFixed(1)}%</strong> 的颜色，并自动替换为最接近的其他颜色。
                    </p>
                    <button className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-[0.98]">
                        <Sparkles size={14} /> 应用去杂色
                    </button>
                </div>
            </div>

            {/* 4. 编辑工具 (严格恢复原结构，带有进入/退出按钮及内部功能网格) */}
            <div className={`rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border transition-colors duration-300 ${isEditMode ? 'bg-violet-50/50 border-violet-200' : 'bg-white border-gray-100/80'}`}>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100/80">
                    <div className="flex items-center gap-2">
                        <PenTool size={16} className="text-violet-500" />
                        <h2 className="text-sm font-bold text-gray-800">编辑工具</h2>
                    </div>
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] text-white ${isEditMode ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500' : 'bg-gradient-to-r from-violet-400 to-purple-500'}`}
                    >
                        {isEditMode ? '退出编辑' : '进入编辑'}
                    </button>
                </div>

                {isEditMode ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* 绘图工具栏 - 原汁原味的2x2网格 */}
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setActiveTool('brush')} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border ${activeTool === 'brush' ? 'bg-violet-100 border-violet-300 text-violet-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
                                <PenTool size={14}/> 画笔
                            </button>
                            <button onClick={() => setActiveTool('eraser')} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border ${activeTool === 'eraser' ? 'bg-violet-100 border-violet-300 text-violet-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
                                <Eraser size={14}/> 橡皮擦
                            </button>
                            <button onClick={() => setActiveTool('area')} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border ${activeTool === 'area' ? 'bg-violet-100 border-violet-300 text-violet-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
                                <BoxSelect size={14}/> 区域擦除
                            </button>
                            <button onClick={() => setActiveTool('replace')} className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border ${activeTool === 'replace' ? 'bg-violet-100 border-violet-300 text-violet-700 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'}`}>
                                <Replace size={14}/> 批量替换
                            </button>
                        </div>
                        
                        {/* 撤销/重做栏 */}
                        <div className="flex gap-2">
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm"><Undo2 size={12}/> 撤销</button>
                            <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shadow-sm"><Redo2 size={12}/> 重做</button>
                        </div>

                        {/* 色板栏 */}
                        <div className="pt-1">
                            {/* 恢复原版的色板标题栏设计 */}
                            <div className="flex border border-gray-200/80 rounded-lg overflow-hidden text-[11px] font-bold text-center shadow-sm">
                                <div className="flex-1 bg-violet-500 text-white py-1.5">当前色板 (43色)</div>
                                <div className="flex-1 bg-gray-50 text-gray-500 py-1.5 cursor-pointer hover:bg-gray-100 transition-colors">完整色板 (291色)</div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {/* 融入果冻感拼豆 UI */}
                                {['#1D1414', '#6C372F', '#8A4526', '#5A2121', '#78524B', '#303A21', '#D19066', '#B88558', '#55514C'].map((hex, i) => (
                                    <React.Fragment key={i}>
                                        {renderBead(hex, "w-5 h-5", "w-1.5 h-1.5")}
                                    </React.Fragment>
                                ))}
                                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 cursor-pointer shadow-sm hover:bg-gray-50">...</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-[11px] text-gray-400 bg-gray-50 p-2 rounded-lg border border-gray-100">点击右上角按钮进入编辑模式，可对画布进行像素级的手动修改、替换和擦除。</p>
                )}
            </div>

            {/* 5. 颜色统计 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/80">
                <button 
                    onClick={() => setShowStats(!showStats)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex items-center gap-2">
                        <Table2 size={16} className="text-emerald-500" />
                        <h2 className="text-sm font-bold text-gray-800">颜色统计</h2>
                    </div>
                    <span className="text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50 text-emerald-700 font-bold shadow-sm">2500 珠 / 43 色</span>
                </button>
                
                {showStats && (
                    <div className="p-0 border-t border-gray-100/80">
                        {/* 简易表格表头 */}
                        <div className="grid grid-cols-12 gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-2 border-b border-gray-100 text-center tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-4 text-left">颜色</div>
                            <div className="col-span-3">色号</div>
                            <div className="col-span-2">数量</div>
                            <div className="col-span-2">占比</div>
                        </div>
                        {/* 表格内容 */}
                        <div className="max-h-56 overflow-y-auto hide-scrollbar text-xs">
                            {[
                                { id: 1, hex: '#1D1414', code: 'H16', count: 827, percent: '33.1%' },
                                { id: 2, hex: '#6C372F', code: 'R22', count: 178, percent: '7.1%' },
                                { id: 3, hex: '#8A4526', code: 'F10', count: 150, percent: '6.0%' },
                                { id: 4, hex: '#5A2121', code: 'F11', count: 137, percent: '5.5%' },
                                { id: 5, hex: '#2F2B2F', code: 'H06', count: 128, percent: '5.1%' },
                            ].map((row) => (
                                <div key={row.id} className="grid grid-cols-12 gap-1 items-center px-3 py-2 border-b border-gray-50 hover:bg-emerald-50/40 cursor-pointer transition-colors text-center">
                                    <div className="col-span-1 text-gray-300 text-[10px] font-medium">{row.id}</div>
                                    <div className="col-span-4 flex items-center gap-2 text-left">
                                        {/* 调用带质感的拼豆 */}
                                        {renderBead(row.hex, "w-4 h-4", "w-1 h-1")}
                                    </div>
                                    <div className="col-span-3 text-gray-700 font-bold">{row.code}</div>
                                    <div className="col-span-2 text-gray-800 font-medium">{row.count}</div>
                                    <div className="col-span-2 text-gray-400 text-[10px]">{row.percent}</div>
                                </div>
                            ))}
                            <div className="py-2.5 text-center text-[11px] font-bold text-emerald-600 cursor-pointer hover:bg-gray-50 bg-emerald-50/20">查看完整列表...</div>
                        </div>
                    </div>
                )}
            </div>

          </div>
        </aside>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}