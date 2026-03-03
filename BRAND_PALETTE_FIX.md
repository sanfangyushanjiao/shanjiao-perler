# 色板品牌匹配修复

## 问题描述

用户反馈：色板的颜色看起来很奇怪，需要和已选定的拼豆品牌匹配对应。

## 原因分析

### 修复前的问题

1. **完整色板显示了所有品牌的颜色**
   - `loadPalette()` 加载了所有品牌的所有颜色（291色）
   - "完整色板" Tab 显示的是所有品牌的颜色，而不是当前选定品牌的颜色

2. **品牌不匹配**
   - 用户选择了品牌 A（如 MARD），但完整色板显示了品牌 B、C、D 等所有品牌的颜色
   - 导致显示的颜色和色号与当前品牌不对应

### 数据结构说明

`colorMapping.json` 的结构：
```json
{
  "#FAF4C8": {
    "MARD": "A01",
    "COCO": "E02",
    "漫漫": "E2",
    "盼盼": "65",
    "咪小窝": "77"
  },
  ...
}
```

每个颜色 hex 可能对应多个品牌的色号，但不是所有品牌都有该颜色。

---

## 修复方案

### 1. 添加品牌过滤

在 `ColorPicker.tsx` 中添加 `brandPalette`，只包含当前品牌拥有的颜色：

```typescript
// 根据品牌过滤完整调色板
const brandPalette = useMemo(() => {
  return palette.filter(color => color.codes[brand] !== undefined);
}, [palette, brand]);
```

### 2. 更新显示逻辑

将完整色板的数据源从 `palette` 改为 `brandPalette`：

```typescript
// 显示的颜色列表
const displayColors = useMemo(() => {
  const colors = showFullPalette ? brandPalette : currentColors;
  return sortColorsByHSL(colors);
}, [showFullPalette, brandPalette, currentColors, sortColorsByHSL]);
```

### 3. 更新 Tab 按钮显示

将"完整色板"的数量从 `palette.length` 改为 `brandPalette.length`：

```typescript
完整色板 ({brandPalette.length}色)
```

---

## 修复后的效果

### 当前色板
- 显示：**当前图像中实际使用的颜色**
- 数量：取决于图像使用的颜色数量（如 43色）

### 完整色板
- 显示：**当前品牌的所有可用颜色**
- 数量：取决于品牌（如 MARD 约 291色，其他品牌可能更少）
- 过滤规则：只显示 `color.codes[brand] !== undefined` 的颜色

### 品牌切换
当用户切换品牌时：
1. "当前色板" 保持不变（仍显示图像使用的颜色）
2. "完整色板" 自动更新为新品牌的颜色
3. 色号显示也会相应更新

---

## 测试验证

### 测试步骤
1. 上传图片并生成图纸
2. 进入编辑模式
3. 选择品牌（如 MARD）
4. 点击"完整色板" Tab
5. **验证**：所有显示的颜色都应该有对应的 MARD 色号
6. 切换到另一个品牌（如 COCO）
7. **验证**：完整色板自动更新为 COCO 品牌的颜色

### 检查点
- [x] 完整色板只显示当前品牌的颜色
- [x] 色号和品牌匹配
- [x] Tab 按钮显示正确的颜色数量
- [x] 品牌切换后，完整色板自动更新
- [x] 当前色板不受品牌切换影响（显示图像实际颜色）

---

## 技术细节

### 代码位置
`src/components/EditTools/ColorPicker.tsx` 第 106-116 行

### 相关文件
- `src/core/colorUtils.ts` - `loadPalette()` 函数
- `src/data/colorMapping.json` - 颜色数据
- `src/types/index.ts` - `PaletteColor` 和 `BrandName` 类型定义

### 性能优化
使用 `useMemo` 缓存品牌过滤结果，只在 `palette` 或 `brand` 变化时重新计算。

---

## 构建状态

✅ **TypeScript 编译成功**
✅ **Vite 构建成功** (CSS: 6.38 kB, JS: 251.19 kB)
✅ **无警告无错误**

---

## 修复完成

色板现在正确地与选定的拼豆品牌匹配，用户可以看到当前品牌的所有可用颜色，以及正确的色号对应关系。
