import type { MappedPixel } from './index';

export type ToolType = 'brush' | 'eraser' | 'areaEraser' | 'replace';

export interface ColorReplaceState {
  isActive: boolean;
  step: 'selectSource' | 'selectTarget' | null;
  sourceColor: import('./index').PaletteColor | null;
}

export interface EditHistory {
  grid: MappedPixel[][];
  timestamp: number;
}

export interface ToolbarProps {
  currentTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isEditMode: boolean;
  onToggleEditMode: (onExit?: (finalGrid: MappedPixel[][]) => void) => void;
  colorReplaceState?: ColorReplaceState;
  onToggleColorReplace?: () => void;
}
