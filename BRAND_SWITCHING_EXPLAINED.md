# 品牌切换机制说明

## 问题背景

用户反馈：切换品牌后，色板没有任何变化。

---

## 数据结构分析

### colorMapping.json 的实际结构

```json
{
  "#FAF4C8": {
    "MARD": "A01",
    "COCO": "E02",
    "漫漫": "E2",
    "盼盼": "65",
    "咪小窝": "77"
  },
  "#FFFFD5": {
    "MARD": "A02",
    "COCO": "E01",
    "漫漫": "B1",
    "盼盼": "2",
    "咪小窝": "2"
  },
  ...
}
```

### 关键发现

**每个颜色都包含所有 5 个品牌的色号！**

这意味着：
- MARD 品牌有 291 个颜色
- COCO 品牌有 291 个颜色
- 漫漫品牌有 291 个颜色
- 盼盼品牌有 291 个颜色
- 咪小窝品牌有 291 个颜色

**所有品牌的颜色集合（HEX值）完全相同，只是色号不同！**

---

## 错误的实现方式

### 之前的错误逻辑

```typescript
// ❌ 错误：尝试过滤颜色
const brandPalette = useMemo(() => {
  return palette.filter(color => color.codes[brand] !== undefined);
}, [palette, brand]);
```

**为什么错误？**
- 因为每个颜色都有所有品牌的色号
- `color.codes[brand] !== undefined` 对所有品牌都返回 true
- 所以过滤后，所有品牌都是 291 色
- 切换品牌时，数量不变，视觉上看不到变化

---

## 正确的实现方式

### 参考开源项目

开源项目 `Zippland/perler-beads` 的实现方式：

1. **不过滤颜色** - 所有品牌显示相同的颜色集合
2. **切换显示的色号** - 根据当前品牌显示对应的色号
3. **自动更新** - 品牌改变时，所有显示的色号自动更新

### 实现代码

```typescript
// ✅ 正确：不过滤，直接使用完整色板
const displayColors = useMemo(() => {
  const colors = showFullPalette ? palette : currentColors;
  return sortColorsByHSL(colors);
}, [showFullPalette, palette, currentColors, sortColorsByHSL]);
```

### 色号显示逻辑

```typescript
// 悬停提示
title={`${color.codes[brand] || '未知'} - ${color.hex}`}

// Tooltip
{color.codes[brand] || '未知'}

// 当前选中颜色
当前: {selectedColor.codes[brand] || '未知色号'}
```

**工作原理：**
- `brand` 是 prop，由父组件 App.tsx 传入
- 当用户在 ControlPanel 切换品牌时，`configState.brand` 更新
- ColorPicker 接收到新的 `brand` prop
- 所有 `color.codes[brand]` 表达式自动使用新品牌
- 显示的色号自动更新

---

## 品牌切换流程

### 1. 用户操作
用户在 ControlPanel 的下拉菜单中选择新品牌（如从 MARD 切换到 COCO）

### 2. 状态更新
```typescript
// ControlPanel.tsx
<select
  value={brand}
  onChange={(e) => onBrandChange(e.target.value as BrandName)}
>
```

### 3. 父组件处理
```typescript
// App.tsx
const handleBrandChange = useCallback((brand: BrandName) => {
  setConfigState((prev) => ({ ...prev, brand }));
}, []);
```

### 4. 自动传播
```typescript
// App.tsx
<ColorPicker
  palette={palette}
  selectedColor={editState.selectedColor}
  onColorSelect={editState.setSelectedColor}
  brand={configState.brand}  // ← 新的 brand 值传入
  colorReplaceState={editState.colorReplaceState}
  onColorReplace={handleColorReplace}
  currentColors={currentColors}
/>
```

### 5. UI 更新
ColorPicker 组件重新渲染，所有色号显示自动更新为新品牌的色号。

---

## 实际效果

### 切换前（MARD）
```
当前色板: 43色
完整色板: 291色

颜色 #FAF4C8:
  - 显示色号: A01
  - Tooltip: A01 - #FAF4C8
```

### 切换后（COCO）
```
当前色板: 43色  ← 数量不变
完整色板: 291色  ← 数量不变

颜色 #FAF4C8:
  - 显示色号: E02  ← 色号改变了！
  - Tooltip: E02 - #FAF4C8
```

---

## 为什么颜色数量不变？

这是**正常的、预期的行为**：

1. **颜色集合相同**
   - 所有品牌使用相同的 HEX 颜色集合（291色）
   - 只是每个品牌给这些颜色起了不同的"名字"（色号）

2. **类比**
   - 就像同一本书的不同语言版本
   - 内容（颜色）相同，只是文字（色号）不同
   - MARD 品牌叫 "A01" 的颜色，COCO 品牌叫 "E02"

3. **实际应用**
   - 用户选择品牌主要是为了购买拼豆时对应色号
   - 生成的图纸会显示对应品牌的色号
   - 导出的统计也会使用对应品牌的色号

---

## 如何验证品牌切换生效？

### 测试步骤

1. **启动应用**
   ```bash
   npm run dev
   ```

2. **上传图片并生成图纸**

3. **进入编辑模式**

4. **打开完整色板**
   - 点击"完整色板" Tab

5. **鼠标悬停在任意颜色上**
   - 记录显示的色号（如 A01）

6. **切换品牌**
   - 在控制面板中切换品牌（如从 MARD 切换到 COCO）

7. **再次悬停同一个颜色**
   - 验证色号是否改变（如从 A01 变为 E02）

8. **检查当前选中颜色信息**
   - 底部的"当前: XXX"应该显示新品牌的色号

---

## 技术细节

### 数据来源
- `colorMapping.json` - 291 个颜色，每个颜色有 5 个品牌的色号映射

### 支持的品牌
```typescript
type BrandName = 'MARD' | 'COCO' | '漫漫' | '盼盼' | '咪小窝' |
                 '小舞家' | '黄豆豆' | '优肯197色' | '优肯418色';
```

**注意**：ControlPanel 只显示前 5 个常用品牌。

### PaletteColor 类型
```typescript
interface PaletteColor {
  hex: string;
  rgb: RgbColor;
  codes: Partial<Record<BrandName, string>>;  // 品牌 → 色号映射
}
```

---

## 对比开源项目

| 特性 | 开源项目 | 本项目 |
|------|---------|--------|
| 品牌数量 | 5个 | 5个（UI中），9个（类型定义） |
| 颜色数量 | 260+ | 291 |
| 数据结构 | JSON (HEX → 品牌色号) | 完全相同 |
| 切换机制 | 不过滤颜色，切换色号 | ✅ 已修正 |
| 实时更新 | ✅ | ✅ |

---

## 构建状态

✅ **TypeScript 编译成功**
✅ **Vite 构建成功** (CSS: 6.38 kB, JS: 251.13 kB)
✅ **无错误无警告**

---

## 总结

### 核心概念
**品牌切换不改变颜色数量，只改变显示的色号。**

### 正确的期望
- ✅ 切换品牌后，色号改变
- ✅ 颜色数量保持不变（都是 291 色）
- ✅ 当前色板数量保持不变（由图像决定）

### 错误的期望
- ❌ 切换品牌后，颜色数量应该改变
- ❌ 不同品牌应该有不同的颜色集合

现在品牌切换功能已经正确实现！虽然颜色数量不变，但**色号会随品牌自动更新**。
