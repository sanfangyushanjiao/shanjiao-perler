# 拼豆图纸生成工具 - 代码交付文档

## 📦 项目文件位置

**路径**: `C:\Users\ASUS\perler-beads-project\my-perler-app\`

**压缩包**: `project-code-export.tar.gz` (44KB)

包含所有源代码、配置文件和数据文件。

## 🚀 快速使用

```bash
# 进入项目目录
cd C:\Users\ASUS\perler-beads-project\my-perler-app

# 解压（如果需要）
tar -xzf project-code-export.tar.gz

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
my-perler-app/
├── src/
│   ├── types/              # TypeScript 类型定义
│   ├── core/               # 核心算法（颜色处理、像素化）
│   ├── utils/              # 工具函数（去杂色、背景移除、导出等）
│   ├── hooks/              # 自定义 Hooks（编辑管理、防抖）
│   ├── components/         # React 组件
│   │   ├── Controls/       # 控制面板
│   │   ├── EditTools/      # 编辑工具
│   │   ├── ImageUpload/    # 图像上传
│   │   ├── Stats/          # 颜色统计
│   │   └── Preview/        # 预览
│   ├── data/               # 色板数据（292行，9个品牌）
│   ├── App.tsx             # 主应用（所有业务逻辑在这里）
│   └── main.tsx            # 入口文件
├── NewUI_Template.jsx      # 新 UI 设计模板
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 核心功能清单

### ✅ 已实现的功能

1. **图像处理**
   - 图像上传（拖拽/点击）
   - 智能像素化（转换为网格）
   - 颜色量化（映射到拼豆色板）

2. **参数调整**
   - 网格大小：10-300 珠子
   - 颜色合并阈值：0-100
   - 支持 9 个拼豆品牌

3. **颜色处理**
   - 去除背景（Flood Fill 算法）
   - 自动去杂色（基于占比阈值）
   - 手动排除/包含颜色

4. **编辑工具**
   - 画笔工具（绘制像素）
   - 橡皮擦工具（擦除像素）
   - 区域擦除（Flood Fill 擦除）
   - 批量替换（替换所有相同颜色）
   - 撤销/重做（完整历史栈）

5. **颜色选择**
   - 当前色板/完整色板切换
   - 按 HSL 智能排序
   - 悬停显示色号

6. **统计和导出**
   - 实时颜色统计（数量、占比）
   - 导出高清 PNG 图纸
   - 包含网格、色号、统计信息

## 🔑 关键文件说明

### App.tsx - 主应用组件
**这是最重要的文件，包含所有业务逻辑**

**状态管理**：
- `imageState` - 图像状态（原图、处理后网格、尺寸）
- `configState` - 配置（网格大小、合并阈值、品牌）
- `editState` - 编辑状态（来自 useManualEdit hook）
- `excludedColors` - 排除的颜色集合
- `autoNoiseRemovalApplied` - 去杂色状态

**核心事件处理器**：
```typescript
handleImageLoad          // 图像上传
handleApplyParameters    // 应用参数
handleRemoveBackgroundChange  // 背景移除
handleAutoNoiseRemoval   // 自动去杂色
handleColorExclude       // 排除/包含颜色
handleExport            // 导出图纸
handleReset             // 重置应用
```

### useManualEdit.ts - 编辑管理 Hook
**管理所有编辑相关的状态和逻辑**

返回值：
- `isEditMode` - 是否编辑模式
- `currentTool` - 当前工具
- `selectedColor` - 选中颜色
- `editGrid` - 编辑后的网格
- `undo/redo` - 撤销/重做
- `canUndo/canRedo` - 是否可以撤销/重做

### colorUtils.ts - 颜色处理核心
**所有颜色相关的算法**

关键函数：
- `findClosestPaletteColor()` - 使用欧氏距离找最近颜色
- `loadPalette()` - 加载色板数据
- `colorDistance()` - 计算颜色距离

### pixelation.ts - 像素化算法
**将图像转换为拼豆网格**

关键函数：
- `calculatePixelGrid()` - 主算法
- `calculateGridSize()` - 计算网格尺寸

## 🎨 与新 UI 集成指南

### 方法 1：保留业务逻辑，替换 JSX

1. **保持 App.tsx 中的所有状态和函数不变**
2. **只修改 return 语句中的 JSX 结构**
3. **使用新 UI 的 Tailwind 类名**
4. **保持所有事件绑定**

### 方法 2：组件级别集成

1. **复用核心组件**：
   - EditableCanvas（画布逻辑完整）
   - ColorPicker（颜色选择逻辑）
   - UploadArea（上传逻辑）

2. **适配样式**：
   - 更新 className
   - 使用新 UI 的颜色和间距
   - 保持功能不变

3. **重构控制面板**：
   - 将 ControlPanel 拆分为独立控件
   - 使用新 UI 的卡片设计
   - 保持事件处理器不变

## 📊 状态映射表

| 新 UI 模板状态 | 现有状态 | 说明 |
|---------------|---------|------|
| `gridSize` | `tempGridSize` | 网格大小 |
| `colorCount` | `tempMergeThreshold` | 合并阈值 |
| `brand` | `configState.brand` | 品牌选择 |
| `hasImage` | `imageState.originalImage !== null` | 是否有图像 |
| `noiseThreshold` | 新增状态 | 杂色阈值 |
| `isEditMode` | `editState.isEditMode` | 编辑模式 |
| `activeTool` | `editState.currentTool` | 当前工具 |

## 🔧 事件绑定清单

```typescript
// 上传区域
onClick/onDrop → handleImageLoad

// 参数控制
网格大小滑块 → handleGridSizeChange
合并阈值滑块 → handleMergeThresholdChange
品牌下拉框 → handleBrandChange
应用按钮 → handleApplyParameters
去除背景按钮 → handleRemoveBackgroundChange

// 去杂色
应用按钮 → handleAutoNoiseRemoval
恢复按钮 → handleRestoreAutoNoise

// 编辑工具
编辑模式切换 → editState.setIsEditMode()
工具选择 → editState.setCurrentTool(tool)
撤销 → editState.undo()
重做 → editState.redo()
颜色选择 → editState.setSelectedColor(color)

// 画布
画布交互 → EditableCanvas 组件内部处理

// 统计
颜色行点击 → handleColorExclude(colorCode)

// 导出
导出按钮 → handleExport
重置按钮 → handleReset
```

## 🐛 常见问题解决

### 问题 1：颜色不显示
**原因**：色板数据未正确加载或 Canvas 渲染问题

**解决**：
```typescript
// 检查色板是否加载
const palette = useMemo(() => loadPalette(), []);
console.log('Palette loaded:', palette.length); // 应该 > 0

// 检查 Canvas 渲染
ctx.fillStyle = pixel.paletteColor.hex; // 确保使用 hex 值
```

### 问题 2：编辑功能不工作
**原因**：编辑模式未激活或颜色未选择

**解决**：
```typescript
// 确保编辑模式已开启
console.log('Edit mode:', editState.isEditMode); // 应该是 true

// 确保选择了颜色（画笔工具需要）
console.log('Selected color:', editState.selectedColor); // 不应该是 null
```

### 问题 3：参数调整无效
**原因**：未点击"应用参数"按钮

**解决**：
- 调整滑块只更新临时值（tempGridSize, tempMergeThreshold）
- 必须点击"应用参数"才会触发 handleApplyParameters
- handleApplyParameters 会重新处理图像

## 📝 开发建议

### 1. 渐进式集成
```
第1步：测试现有功能 → 确保一切正常
第2步：复制 App.tsx → 创建 App-new.tsx
第3步：逐步替换 JSX → 保持功能测试
第4步：调整样式 → 使用新 UI 类名
第5步：完整测试 → 验证所有功能
```

### 2. 保持类型安全
- 不要删除任何类型定义
- 不要使用 `any` 类型
- 确保所有 Props 都有类型

### 3. 测试流程
```
✓ 上传图像
✓ 调整网格大小 → 应用
✓ 调整合并阈值 → 应用
✓ 切换品牌
✓ 去除背景
✓ 自动去杂色 → 恢复
✓ 进入编辑模式
✓ 切换工具（画笔、橡皮擦、区域擦除、替换）
✓ 选择颜色
✓ 绘制/擦除
✓ 撤销/重做
✓ 排除颜色
✓ 导出图纸
✓ 重置应用
```

## 📞 技术栈

- **React 19.2.0** - UI 框架
- **TypeScript 5.9.3** - 类型系统
- **Vite 7.3.1** - 构建工具
- **Tailwind CSS 4.2.1** - 样式框架
- **lucide-react 0.576.0** - 图标库

## 🎯 交付清单

✅ 完整源代码（31个文件）
✅ 压缩包 project-code-export.tar.gz (44KB)
✅ 配置文件（package.json, vite.config.ts, tailwind.config.js）
✅ 色板数据（colorMapping.json，292行）
✅ 新 UI 模板（NewUI_Template.jsx）
✅ 原始备份（App.tsx.backup）
✅ 完整文档（本文件）

## 🚀 下一步

1. **验证现有功能**
   ```bash
   cd C:\Users\ASUS\perler-beads-project\my-perler-app
   npm run dev
   # 访问 http://localhost:5176
   ```

2. **开始 UI 集成**
   - 参考 NewUI_Template.jsx 的设计
   - 使用本文档的状态映射和事件绑定表
   - 保持所有业务逻辑不变

3. **与 Gemini 协作**
   - 提供本文档和压缩包
   - 说明需要保留所有功能
   - 重点是样式和布局的适配

祝集成顺利！如有问题随时联系。🎉
