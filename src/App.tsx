import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ImageState, ConfigState, BrandName, MappedPixel, PixelationMode } from './types';
import { loadPalette } from './core/colorUtils';
import { calculateGridSize } from './core/pixelation';
import { calculateColorStats } from './utils/colorStats';
import { exportPatternImage, exportToCSV } from './utils/export';
import { mergeColors } from './utils/colorMerge';
import { markExternalCells } from './utils/backgroundRemoval';
import { removeNoiseColors } from './utils/noiseRemoval';
import { autoRemoveNoiseColors } from './utils/autoNoiseRemoval';
import { replaceColor } from './utils/pixelEdit';
import { parseCSV, csvToPixelGrid } from './utils/csvParser';
import { useManualEdit } from './hooks/useManualEdit';
import { useImageProcessing } from './hooks/useImageProcessing';
import UploadArea from './components/ImageUpload/UploadArea';
import EditableCanvas from './components/EditTools/EditableCanvas';
import ControlPanel from './components/Controls/ControlPanel';
import ColorStats from './components/Stats/ColorStats';
import Toolbar from './components/EditTools/Toolbar';
import ColorPicker from './components/EditTools/ColorPicker';
import NoiseRemoval from './components/Controls/NoiseRemoval';
import ProgressBar from './components/Controls/ProgressBar';
import type { PaletteColor } from './types';

function App() {
  const [imageState, setImageState] = useState<ImageState>({
    originalImage: null,
    processedGrid: null,
    dimensions: { N: 0, M: 0 },
  });

  const [configState, setConfigState] = useState<ConfigState>({
    gridSize: 50,
    mode: 'realistic',
    brand: 'MARD',
    mergeThreshold: 0,
  });

  const [tempGridSize, setTempGridSize] = useState(50);
  const [tempMergeThreshold, setTempMergeThreshold] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [excludedColors, setExcludedColors] = useState<Set<string>>(new Set());

  const [isProcessing, setIsProcessing] = useState(false);
  const [rawGrid, setRawGrid] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [autoNoiseRemovalApplied, setAutoNoiseRemovalApplied] = useState(false);
  const [removedColorsCount, setRemovedColorsCount] = useState(0);
  const [gridBeforeAutoNoise, setGridBeforeAutoNoise] = useState<any>(null);

  const editState = useManualEdit(imageState.processedGrid);
  const palette = useMemo(() => loadPalette(), []);

  // 使用 Web Worker 进行图像处理
  const imageProcessor = useImageProcessing({
    useWorker: true,
    onProgress: (progress) => {
      console.log(`Processing: ${progress}%`);
    },
  });

  const handleImageLoad = useCallback(async (img: HTMLImageElement) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const { N, M } = calculateGridSize(img.width, img.height, configState.gridSize);

    setImageState({
      originalImage: img,
      processedGrid: null,
      dimensions: { N, M },
    });

    canvasRef.current = canvas;

    // Process image after state is updated
    setIsProcessing(true);
    try {
      let grid = await imageProcessor.pixelate(canvas, N, M, palette, configState.mode);
      setRawGrid(grid);

      if (configState.mergeThreshold > 0) {
        grid = await imageProcessor.processMergeColors(grid, configState.mergeThreshold);
      }

      if (excludedColors.size > 0) {
        grid = removeNoiseColors(grid, excludedColors, palette);
      }

      setImageState((prev) => ({
        ...prev,
        processedGrid: grid,
        dimensions: { N, M },
      }));
    } catch (error) {
      console.error('处理图像失败:', error);
      alert('处理图像失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  }, [configState.gridSize, configState.mode, configState.mergeThreshold, excludedColors, palette, imageProcessor]);

  const handleCSVLoad = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);

      // 读取 CSV 文件
      const text = await file.text();

      // 解析 CSV
      const pixels = parseCSV(text);

      // 转换为像素网格
      const grid = csvToPixelGrid(pixels, palette);

      // 更新状态
      setImageState({
        originalImage: null, // CSV 模式下没有原始图片
        processedGrid: grid,
        dimensions: { N: grid[0]?.length || 0, M: grid.length },
      });

      setRawGrid(grid);
      setIsProcessing(false);
    } catch (error) {
      console.error('CSV 解析失败:', error);
      alert(`CSV 文件解析失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsProcessing(false);
    }
  }, [palette]);

  const handleGridSizeChange = useCallback((size: number) => {
    setTempGridSize(size);
  }, []);

  const handleMergeThresholdChange = useCallback((threshold: number) => {
    setTempMergeThreshold(threshold);
  }, []);

  const handleApplyParameters = useCallback(() => {
    const clampedGridSize = Math.max(10, Math.min(300, tempGridSize || 50));
    const clampedMergeThreshold = Math.max(0, Math.min(100, tempMergeThreshold || 0));

    setTempGridSize(clampedGridSize);
    setTempMergeThreshold(clampedMergeThreshold);

    const gridSizeChanged = clampedGridSize !== configState.gridSize;
    const thresholdChanged = clampedMergeThreshold !== configState.mergeThreshold;

    if (!gridSizeChanged && !thresholdChanged) {
      return;
    }

    setConfigState((prev) => ({
      ...prev,
      gridSize: clampedGridSize,
      mergeThreshold: clampedMergeThreshold,
    }));

    if (gridSizeChanged && imageState.originalImage && canvasRef.current) {
      const { N, M } = calculateGridSize(
        imageState.originalImage.width,
        imageState.originalImage.height,
        clampedGridSize
      );

      setIsProcessing(true);
      (async () => {
        try {
          let grid = await imageProcessor.pixelate(canvasRef.current!, N, M, palette, configState.mode);
          setRawGrid(grid);

          if (clampedMergeThreshold > 0) {
            grid = await imageProcessor.processMergeColors(grid, clampedMergeThreshold);
          }

          if (excludedColors.size > 0) {
            grid = removeNoiseColors(grid, excludedColors, palette);
          }

          setImageState((prev) => ({
            ...prev,
            processedGrid: grid,
            dimensions: { N, M },
          }));
        } catch (error) {
          console.error('处理图像失败:', error);
          alert('处理图像失败，请重试');
        } finally {
          setIsProcessing(false);
        }
      })();

      setRemoveBackground(false);
    } else if (thresholdChanged && rawGrid) {
      setIsProcessing(true);
      (async () => {
        try {
          let grid = await imageProcessor.processMergeColors(rawGrid, clampedMergeThreshold);

          if (excludedColors.size > 0) {
            grid = removeNoiseColors(grid, excludedColors, palette);
          }

          if (removeBackground) {
            grid = await imageProcessor.processRemoveBackground(grid);
          }

          setImageState((prev) => ({
            ...prev,
            processedGrid: grid,
          }));
        } catch (error) {
          console.error('处理失败:', error);
        } finally {
          setIsProcessing(false);
        }
      })();
    }
  }, [tempGridSize, tempMergeThreshold, configState.gridSize, configState.mergeThreshold, imageState.originalImage, rawGrid, removeBackground, excludedColors, palette]);

  const handleBrandChange = useCallback((brand: BrandName) => {
    setConfigState((prev) => ({ ...prev, brand }));
  }, []);

  const handleModeChange = useCallback((mode: PixelationMode) => {
    // 先更新状态
    setConfigState((prev) => ({ ...prev, mode }));
    // 不在这里直接调用 processImage，让 useEffect 监听 mode 变化后自动处理
  }, []);

  // 监听 mode 变化，重新处理图像
  useEffect(() => {
    if (imageState.originalImage && canvasRef.current) {
      const { N, M } = imageState.dimensions;

      setIsProcessing(true);
      (async () => {
        try {
          let grid = await imageProcessor.pixelate(canvasRef.current!, N, M, palette, configState.mode);
          setRawGrid(grid);

          if (configState.mergeThreshold > 0) {
            grid = await imageProcessor.processMergeColors(grid, configState.mergeThreshold);
          }

          if (excludedColors.size > 0) {
            grid = removeNoiseColors(grid, excludedColors, palette);
          }

          setImageState((prev) => ({
            ...prev,
            processedGrid: grid,
            dimensions: { N, M },
          }));
        } catch (error) {
          console.error('处理图像失败:', error);
          alert('处理图像失败，请重试');
        } finally {
          setIsProcessing(false);
        }
      })();
    }
  }, [configState.mode]);

  const handleRemoveBackgroundChange = useCallback((remove: boolean) => {
    if (!imageState.processedGrid) return;

    setRemoveBackground(remove);
    setIsProcessing(true);

    (async () => {
      try {
        let grid = imageState.processedGrid!;

        if (remove) {
          grid = await imageProcessor.processRemoveBackground(grid);
          const externalCount = grid.flat().filter(p => p.isExternal).length;
          const totalCount = grid.flat().length;
          console.log(`背景移除：${externalCount}/${totalCount} 个单元格被标记为外部背景`);
        } else {
          if (rawGrid) {
            grid = await imageProcessor.processMergeColors(rawGrid, configState.mergeThreshold);

            if (excludedColors.size > 0) {
              grid = removeNoiseColors(grid, excludedColors, palette);
            }
          }
        }

        setImageState((prev) => ({
          ...prev,
          processedGrid: grid,
        }));
      } catch (error) {
        console.error('处理失败:', error);
      } finally {
        setIsProcessing(false);
      }
    })();
  }, [imageState.processedGrid, rawGrid, configState.mergeThreshold, excludedColors, palette, imageProcessor]);

  const colorStats = useMemo(() => {
    if (!imageState.processedGrid) return [];
    return calculateColorStats(imageState.processedGrid, configState.brand);
  }, [imageState.processedGrid, configState.brand]);

  const currentColors = useMemo(() => {
    if (!imageState.processedGrid) return [];

    const colorMap = new Map<string, PaletteColor>();

    for (const row of imageState.processedGrid) {
      for (const pixel of row) {
        if (!pixel.isExternal && !colorMap.has(pixel.paletteColor.hex)) {
          colorMap.set(pixel.paletteColor.hex, pixel.paletteColor);
        }
      }
    }

    return Array.from(colorMap.values());
  }, [imageState.processedGrid]);

  const handleColorExclude = useCallback((hex: string) => {
    setExcludedColors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hex)) {
        newSet.delete(hex);
        console.log(`恢复颜色: ${hex}`);
      } else {
        newSet.add(hex);
        console.log(`排除颜色: ${hex}`);
      }
      return newSet;
    });

    if (rawGrid) {
      setIsProcessing(true);
      setTimeout(() => {
        let grid = mergeColors(rawGrid, configState.mergeThreshold);

        const updatedExcludedColors = new Set(excludedColors);
        if (updatedExcludedColors.has(hex)) {
          updatedExcludedColors.delete(hex);
        } else {
          updatedExcludedColors.add(hex);
        }

        if (updatedExcludedColors.size > 0) {
          grid = removeNoiseColors(grid, updatedExcludedColors, palette);
        }

        if (removeBackground) {
          grid = markExternalCells(grid);
        }

        setImageState((prev) => ({
          ...prev,
          processedGrid: grid,
        }));
        setIsProcessing(false);
      }, 50);
    }
  }, [rawGrid, configState.mergeThreshold, excludedColors, removeBackground, palette]);

  const handleAutoNoiseRemoval = useCallback((thresholdPercent: number) => {
    if (!imageState.processedGrid) return;

    setIsProcessing(true);

    setTimeout(() => {
      setGridBeforeAutoNoise(imageState.processedGrid);

      const { newGrid, removedColors } = autoRemoveNoiseColors(
        imageState.processedGrid!,
        thresholdPercent,
        palette
      );

      setImageState((prev) => ({
        ...prev,
        processedGrid: newGrid,
      }));

      setAutoNoiseRemovalApplied(true);
      setRemovedColorsCount(removedColors.size);
      setIsProcessing(false);
    }, 50);
  }, [imageState.processedGrid, palette]);

  const handleRestoreAutoNoise = useCallback(() => {
    if (!gridBeforeAutoNoise) return;

    setImageState((prev) => ({
      ...prev,
      processedGrid: gridBeforeAutoNoise,
    }));

    setAutoNoiseRemovalApplied(false);
    setRemovedColorsCount(0);
    setGridBeforeAutoNoise(null);
  }, [gridBeforeAutoNoise]);

  const handleColorReplace = useCallback((sourceColor: PaletteColor, targetColor: PaletteColor) => {
    if (!editState.editGrid) return;

    const { newGrid, replaceCount } = replaceColor(
      editState.editGrid,
      sourceColor,
      targetColor
    );

    if (replaceCount > 0) {
      editState.applyEdit(newGrid);
      editState.completeColorReplace();
      console.log(`批量替换完成：替换了 ${replaceCount} 个像素`);
    } else {
      console.log('没有找到需要替换的颜色');
    }
  }, [editState]);

  const handleToggleEditMode = useCallback(() => {
    if (editState.isEditMode && editState.editGrid) {
      editState.setIsEditMode((finalGrid: MappedPixel[][]) => {
        setImageState(prev => ({
          ...prev,
          processedGrid: finalGrid
        }));
      });
    } else {
      editState.setIsEditMode();
    }
  }, [editState]);

  const handleExport = useCallback(() => {
    const gridToExport = editState.isEditMode && editState.editGrid
      ? editState.editGrid
      : imageState.processedGrid;

    if (!gridToExport) return;

    const statsToExport = calculateColorStats(gridToExport, configState.brand);
    exportPatternImage(gridToExport, configState.brand, statsToExport);
  }, [editState.isEditMode, editState.editGrid, imageState.processedGrid, configState.brand]);

  const handleExportCSV = useCallback(() => {
    const gridToExport = editState.isEditMode && editState.editGrid
      ? editState.editGrid
      : imageState.processedGrid;

    if (!gridToExport) return;

    exportToCSV(gridToExport, configState.brand);
  }, [editState.isEditMode, editState.editGrid, imageState.processedGrid, configState.brand]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50">
      {/* 进度条 */}
      <ProgressBar progress={imageProcessor.progress} isProcessing={imageProcessor.isProcessing} />

      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            山椒爱拼豆
          </h1>
          <p className="text-gray-600">上传图片，一键生成拼豆图纸</p>
        </header>

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* 左侧：预览区域 */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-4 md:space-y-6">
            {!imageState.originalImage && !imageState.processedGrid ? (
              <UploadArea onImageLoad={handleImageLoad} onCSVLoad={handleCSVLoad} />
            ) : (
              <>
                {isProcessing && (
                  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl p-4 text-center">
                    <div className="text-yellow-800 font-semibold">
                      正在处理图片，请稍候...
                    </div>
                  </div>
                )}
                <EditableCanvas
                  grid={editState.isEditMode ? editState.editGrid : imageState.processedGrid}
                  brand={configState.brand}
                  isEditMode={editState.isEditMode}
                  currentTool={editState.currentTool}
                  selectedColor={editState.selectedColor}
                  onEdit={editState.applyEdit}
                  colorReplaceState={editState.colorReplaceState}
                  onSelectSourceColor={editState.selectSourceColor}
                />
                {imageState.processedGrid && (
                  <div className="flex gap-4">
                    <button
                      onClick={handleExport}
                      className="flex-1 bg-primary text-white py-3 px-6 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                      导出图纸
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="flex-1 bg-secondary text-white py-3 px-6 rounded-xl font-semibold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl"
                    >
                      导出 CSV
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      重新开始
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 右侧：控制面板和统计 */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4 md:space-y-6">
            {imageState.processedGrid && (
              <Toolbar
                currentTool={editState.currentTool}
                onToolChange={editState.setCurrentTool}
                canUndo={editState.canUndo}
                canRedo={editState.canRedo}
                onUndo={editState.undo}
                onRedo={editState.redo}
                isEditMode={editState.isEditMode}
                onToggleEditMode={handleToggleEditMode}
                colorReplaceState={editState.colorReplaceState}
                onToggleColorReplace={editState.toggleColorReplace}
              />
            )}

            {editState.isEditMode && imageState.processedGrid && (
              <ColorPicker
                palette={palette}
                selectedColor={editState.selectedColor}
                onColorSelect={editState.setSelectedColor}
                brand={configState.brand}
                colorReplaceState={editState.colorReplaceState}
                onColorReplace={handleColorReplace}
                currentColors={currentColors}
              />
            )}

            <ControlPanel
              gridSize={tempGridSize}
              onGridSizeChange={handleGridSizeChange}
              mergeThreshold={tempMergeThreshold}
              onMergeThresholdChange={handleMergeThresholdChange}
              removeBackground={removeBackground}
              onRemoveBackgroundChange={handleRemoveBackgroundChange}
              brand={configState.brand}
              onBrandChange={handleBrandChange}
              mode={configState.mode}
              onModeChange={handleModeChange}
              onApplyParameters={handleApplyParameters}
              disabled={!imageState.originalImage || isProcessing}
            />

            {imageState.processedGrid && (
              <NoiseRemoval
                onApply={handleAutoNoiseRemoval}
                onRestore={handleRestoreAutoNoise}
                disabled={isProcessing}
                hasApplied={autoNoiseRemovalApplied}
                removedColorsCount={removedColorsCount}
              />
            )}

            {colorStats.length > 0 && (
              <ColorStats
                stats={colorStats}
                excludedColors={excludedColors}
                onColorExclude={handleColorExclude}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
