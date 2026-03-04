import { useState, useEffect, useCallback, useRef } from 'react';
import type { MappedPixel, PaletteColor } from '../types';
import type { ToolType, ColorReplaceState } from '../types/editTools';
import { deepCloneGrid } from '../utils/pixelEdit';

export function useManualEdit(initialGrid: MappedPixel[][] | null) {
  // 编辑模式状态
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTool, setCurrentTool] = useState<ToolType>('brush');
  const [selectedColor, setSelectedColor] = useState<PaletteColor | null>(null);
  const [editGrid, setEditGrid] = useState<MappedPixel[][] | null>(initialGrid);

  // 颜色替换状态
  const [colorReplaceState, setColorReplaceState] = useState<ColorReplaceState>({
    isActive: false,
    step: null,
    sourceColor: null,
  });

  // 历史记录（撤销/重做）
  const [history, setHistory] = useState<MappedPixel[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 使用 ref 保持最新的值
  const historyRef = useRef<MappedPixel[][][]>([]);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    historyRef.current = history;
    historyIndexRef.current = historyIndex;
  }, [history, historyIndex]);

  // 当初始网格变化时，重置编辑状态
  useEffect(() => {
    if (initialGrid) {
      const clonedGrid = deepCloneGrid(initialGrid);
      setEditGrid(clonedGrid);
      setHistory([clonedGrid]);
      setHistoryIndex(0);
    }
  }, [initialGrid]);

  // 应用编辑（保存到历史）
  const applyEdit = useCallback((newGrid: MappedPixel[][]) => {
    setEditGrid(newGrid);

    setHistory(prevHistory => {
      const currentIndex = historyIndexRef.current;
      // 截断当前索引之后的历史
      const newHistory = prevHistory.slice(0, currentIndex + 1);

      // 添加新状态
      newHistory.push(deepCloneGrid(newGrid));

      // 限制历史记录最多50步
      if (newHistory.length > 50) {
        const trimmedHistory = newHistory.slice(1); // 删除最早的记录
        // 由于删除了第一个，索引需要调整
        setHistoryIndex(trimmedHistory.length - 1);
        return trimmedHistory;
      } else {
        // 正常情况，索引+1
        setHistoryIndex(currentIndex + 1);
        return newHistory;
      }
    });
  }, []);

  // 撤销
  const undo = useCallback(() => {
    setHistoryIndex(prevIndex => {
      if (prevIndex > 0) {
        const newIndex = prevIndex - 1;
        const currentHistory = historyRef.current;
        // 历史记录中已经是深拷贝，直接使用即可，无需再次深拷贝
        setEditGrid(currentHistory[newIndex]);
        return newIndex;
      }
      return prevIndex;
    });
  }, []);

  // 重做
  const redo = useCallback(() => {
    setHistoryIndex(prevIndex => {
      const currentHistory = historyRef.current;
      if (prevIndex < currentHistory.length - 1) {
        const newIndex = prevIndex + 1;
        // 历史记录中已经是深拷贝，直接使用即可，无需再次深拷贝
        setEditGrid(currentHistory[newIndex]);
        return newIndex;
      }
      return prevIndex;
    });
  }, []);

  // 退出编辑模式时重置
  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      // 退出编辑模式
      setIsEditMode(false);
    } else {
      // 进入编辑模式
      setIsEditMode(true);
      if (editGrid && historyRef.current.length === 0) {
        const clonedGrid = deepCloneGrid(editGrid);
        setHistory([clonedGrid]);
        setHistoryIndex(0);
      }
    }
  }, [isEditMode, editGrid]);

  // 切换颜色替换模式
  const toggleColorReplace = useCallback(() => {
    setColorReplaceState(prev => {
      if (prev.isActive) {
        // 退出颜色替换模式
        return {
          isActive: false,
          step: null,
          sourceColor: null,
        };
      } else {
        // 进入颜色替换模式 - 第1步：选择源颜色
        return {
          isActive: true,
          step: 'selectSource',
          sourceColor: null,
        };
      }
    });
  }, []);

  // 选择源颜色（从画布）
  const selectSourceColor = useCallback((color: PaletteColor) => {
    setColorReplaceState(prev => {
      if (prev.step === 'selectSource') {
        // 进入第2步：选择目标颜色
        return {
          isActive: true,
          step: 'selectTarget',
          sourceColor: color,
        };
      }
      return prev;
    });
  }, []);

  // 完成颜色替换
  const completeColorReplace = useCallback(() => {
    setColorReplaceState({
      isActive: false,
      step: null,
      sourceColor: null,
    });
  }, []);

  return {
    isEditMode,
    setIsEditMode: toggleEditMode,
    currentTool,
    setCurrentTool,
    selectedColor,
    setSelectedColor,
    editGrid,
    applyEdit,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    undo,
    redo,
    colorReplaceState,
    toggleColorReplace,
    selectSourceColor,
    completeColorReplace,
  };
}
