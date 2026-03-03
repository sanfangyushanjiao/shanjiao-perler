# 去除杂色功能说明

## 功能概述

去除杂色功能允许用户在颜色统计面板中点击颜色来排除不需要的颜色。被排除的颜色会自动重新映射到最接近的可用颜色，从而简化拼豆图纸的颜色种类。

## 如何使用

1. 上传图片并应用参数处理
2. 在右侧颜色统计面板中，点击想要排除的颜色
3. 被排除的颜色会立即重新映射到最接近的可用颜色
4. 再次点击可以恢复该颜色

## 效果体现

### 1. 颜色统计面板
- **未排除**：颜色显示为灰色背景，左侧显示序号
- **已排除**：颜色显示为红色背景，左侧显示 ✗ 标记，整体透明度降低
- 面板顶部显示"已排除 X 种杂色"提示

### 2. 预览画布
- 被排除的颜色在画布中会自动替换为最接近的可用颜色
- 实时更新预览效果

### 3. 颜色统计
- 总珠子数保持不变
- 颜色种类减少（被排除的颜色不再统计）
- 被映射到的颜色数量会增加

### 4. 导出图纸
- 导出的图纸不包含被排除的颜色
- 统计表中只显示可用颜色

## 工作原理

1. **点击排除**：用户点击颜色统计中的颜色
2. **颜色映射**：系统使用 RGB 欧氏距离算法查找最接近的可用颜色
3. **网格更新**：将所有被排除颜色的单元格重新映射到最接近的颜色
4. **实时预览**：立即更新画布和统计信息

## 适用场景

- 图片中有少量不想使用的颜色
- 想要简化颜色种类，减少购买成本
- 某些颜色的珠子库存不足
- 想要统一相似的颜色

## 使用技巧

### 1. 排除少量颜色
适合排除 1-3 种不常用的颜色，让图纸更简洁。

### 2. 与颜色合并配合使用
- 先使用"颜色数量控制"合并相似颜色
- 再手动排除不需要的颜色
- 效果更好

### 3. 与去除背景配合使用
- 先去除背景
- 再排除杂色
- 避免背景色干扰

## 示例对比

### 示例 1：排除单一杂色
- **排除前**：总珠子数 1200，颜色种类 45
- **排除 1 种颜色后**：总珠子数 1200，颜色种类 44
- **效果**：被排除颜色的 20 个珠子重新映射到相似颜色

### 示例 2：排除多种杂色
- **排除前**：总珠子数 1200，颜色种类 45
- **排除 5 种颜色后**：总珠子数 1200，颜色种类 40
- **效果**：5 种颜色的 80 个珠子重新映射到相似颜色

## 调试信息

点击颜色后，打开浏览器控制台（F12），可以看到：
```
排除颜色: #FF6B9D
恢复颜色: #FF6B9D
```

这些信息可以帮助你了解哪些颜色被排除或恢复。

## 常见问题

### Q: 为什么点击后效果不明显？
A: 可能是因为：
1. 被排除的颜色数量很少
2. 被映射到的颜色与原颜色非常相似
3. 该颜色在图纸中使用较少

### Q: 可以同时排除多种颜色吗？
A: 可以。依次点击多个颜色即可，每次点击都会立即生效。

### Q: 排除颜色后可以恢复吗？
A: 可以。再次点击被排除的颜色（红色背景的）即可恢复。

### Q: 排除颜色会影响图片质量吗？
A: 会有轻微影响。被排除颜色的区域会使用最接近的可用颜色替代，可能会略微改变视觉效果。建议只排除少量不重要的颜色。

### Q: 排除颜色后重新调整参数会怎样？
A: 排除状态会保持。重新应用参数后，系统会自动重新应用颜色排除。

## 技术实现

### 核心算法
```typescript
// 1. 查找最接近的颜色（RGB 欧氏距离）
function findClosestColor(targetColor, availablePalette) {
  let minDistance = Infinity;
  let closestColor = availablePalette[0];

  for (const color of availablePalette) {
    const distance = colorDistance(targetColor.rgb, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }

  return closestColor;
}

// 2. 重新映射网格
function removeNoiseColors(grid, excludedColors, palette) {
  const availablePalette = palette.filter(
    color => !excludedColors.has(color.hex)
  );

  return grid.map(row =>
    row.map(pixel => {
      if (excludedColors.has(pixel.paletteColor.hex)) {
        return {
          ...pixel,
          paletteColor: findClosestColor(pixel.paletteColor, availablePalette)
        };
      }
      return pixel;
    })
  );
}
```

### 处理流程
1. 用户点击颜色 → 触发 `handleColorExclude`
2. 更新 `excludedColors` 状态（添加或删除）
3. 从原始网格重新处理：
   - 应用颜色合并
   - 应用去除杂色（使用更新后的排除列表）
   - 应用去除背景（如果已启用）
4. 更新预览和统计

## 相关文件

- `src/utils/noiseRemoval.ts` - 核心算法实现
- `src/components/Stats/ColorStats.tsx` - UI 交互
- `src/App.tsx` - 状态管理和流程控制
