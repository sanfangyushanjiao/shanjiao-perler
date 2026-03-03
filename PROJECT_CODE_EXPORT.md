# 拼豆图纸生成工具 - 完整代码导出

## 项目概述

这是一个功能完整的拼豆图纸生成工具，使用 React + TypeScript + Vite + Tailwind CSS 构建。

### 核心功能
- 图像上传（拖拽/点击）
- 智能颜色量化和映射到拼豆色板
- 网格大小调整（10-300珠子）
- 颜色合并（减少颜色种类）
- 去除背景功能
- 自动去杂色（移除小面积颜色）
- 手动编辑模式（画笔、橡皮擦、区域擦除、批量替换）
- 撤销/重做功能
- 颜色统计和排除
- 支持9个拼豆品牌
- 导出高清图纸（PNG格式）

---

## 项目结构

```
my-perler-app/
├── src/
│   ├── components/          # React 组件
│   │   ├── Controls/        # 控制面板组件
│   │   ├── EditTools/       # 编辑工具组件
│   │   ├── ImageUpload/     # 图像上传组件
│   │   ├── Preview/         # 预览组件
│   │   └── Stats/           # 统计组件
│   ├── core/                # 核心算法
│   ├── hooks/               # 自定义 Hooks
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   ├── data/                # 色板数据
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 配置文件

### package.json
```json
{
  "name": "my-perler-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.576.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@tailwindcss/postcss": "^4.2.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.27",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.2.1",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.48.0",
    "vite": "^7.3.1"
  }
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B9D',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
      },
    },
  },
  plugins: [],
}
```

---

## 核心文件列表

以下是所有需要的源代码文件。每个文件的完整内容请参考后续章节。

### 类型定义 (src/types/)
1. `index.ts` - 主要类型定义
2. `editTools.ts` - 编辑工具类型

### 核心算法 (src/core/)
1. `colorUtils.ts` - 颜色处理工具
2. `pixelation.ts` - 像素化算法

### 工具函数 (src/utils/)
1. `autoNoiseRemoval.ts` - 自动去杂色
2. `backgroundRemoval.ts` - 背景移除
3. `colorMerge.ts` - 颜色合并
4. `colorStats.ts` - 颜色统计
5. `export.ts` - 导出功能
6. `noiseRemoval.ts` - 手动去杂色
7. `pixelEdit.ts` - 像素编辑

### 自定义 Hooks (src/hooks/)
1. `useDebounce.ts` - 防抖 Hook
2. `useManualEdit.ts` - 手动编辑 Hook

### React 组件 (src/components/)

#### 控制面板
1. `Controls/ControlPanel.tsx` - 主控制面板
2. `Controls/NoiseRemoval.tsx` - 去杂色控制

#### 编辑工具
1. `EditTools/ColorPicker.tsx` - 颜色选择器
2. `EditTools/EditableCanvas.tsx` - 可编辑画布
3. `EditTools/Toolbar.tsx` - 工具栏

#### 其他组件
1. `ImageUpload/UploadArea.tsx` - 图像上传区域
2. `Stats/ColorStats.tsx` - 颜色统计表
3. `Preview/PreviewCanvas.tsx` - 预览画布

### 主应用
1. `App.tsx` - 主应用组件
2. `main.tsx` - 入口文件
3. `index.css` - 全局样式

### 数据文件
1. `data/colorMapping.json` - 拼豆色板数据（292行，包含所有品牌的颜色映射）

---

## 重要说明

### 支持的拼豆品牌
- MARD
- COCO
- 漫漫
- 盼盼
- 咪小窝
- 小舞家
- 黄豆豆
- 优肯197色
- 优肯418色

### 编辑工具类型
- `brush` - 画笔工具
- `eraser` - 橡皮擦工具
- `areaEraser` - 区域擦除工具
- `replace` - 批量替换工具

### 关键算法
1. **颜色量化** - 使用欧氏距离在 RGB 空间中找到最接近的拼豆颜色
2. **颜色合并** - 基于阈值合并相似颜色，减少颜色种类
3. **背景移除** - 使用 Flood Fill 算法标记外部区域
4. **自动去杂色** - 基于占比阈值移除小面积颜色
5. **手动编辑** - 支持撤销/重做的像素级编辑

---

## 接下来的章节

以下章节将包含每个文件的完整源代码。请继续阅读后续部分。

