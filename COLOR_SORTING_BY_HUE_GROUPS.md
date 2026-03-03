# 色板颜色排序优化 - 按色相分组聚集

## 修改概述

将色板的颜色排序方式从"亮度-饱和度-色相三级排序"改为"按色相分组聚集"，使相似颜色聚集在一起，更符合人类视觉习惯。

---

## 新的排序规则

### 1. 无彩色优先（黑白灰）
- **判断标准**：饱和度 < 0.08
- **排序方式**：按亮度从暗到亮
- **效果**：黑色 → 深灰 → 中灰 → 浅灰 → 白色

### 2. 彩色按色相分组
- **分组方式**：每 30° 为一组，共 12 组
- **色相范围**：0°-360°
- **分组效果**：
  ```
  组 0:  0°-29°   红色
  组 1:  30°-59°  橙色
  组 2:  60°-89°  黄色
  组 3:  90°-119° 黄绿色
  组 4:  120°-149° 绿色
  组 5:  150°-179° 青绿色
  组 6:  180°-209° 青色
  组 7:  210°-239° 蓝色
  组 8:  240°-269° 深蓝色
  组 9:  270°-299° 紫色
  组 10: 300°-329° 品红色
  组 11: 330°-359° 粉红色
  ```

### 3. 同组内按亮度排序
- **排序方式**：亮到暗（亮色在前，暗色在后）
- **目的**：同一色系内渐变效果

---

## 视觉效果

### 排序前（旧算法）
```
按亮度分组：
[黑色] [深色] [中等] [浅色] [白色]
每组内按饱和度和色相排序
→ 颜色看起来杂乱无章
```

### 排序后（新算法）
```
[黑白灰区域]
黑 → 深灰 → 中灰 → 浅灰 → 白

[彩色区域 - 按色相环排列]
红色系（浅红→深红）
橙色系（浅橙→深橙）
黄色系（浅黄→深黄）
绿色系（浅绿→深绿）
青色系（浅青→深青）
蓝色系（浅蓝→深蓝）
紫色系（浅紫→深紫）
粉色系（浅粉→深粉）

→ 颜色按色环顺序聚集，同色系渐变
```

---

## 技术实现

### 核心算法

```typescript
const sortColorsByHSL = useCallback((colors: PaletteColor[]) => {
  // 1. RGB 转 HSL
  const toHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
        case g: h = ((b - r) / d + 2) * 60; break;
        case b: h = ((r - g) / d + 4) * 60; break;
      }
    }
    return { h, s, l };
  };

  // 2. 排序逻辑
  return [...colors].sort((a, b) => {
    const hslA = toHsl(a.rgb.r, a.rgb.g, a.rgb.b);
    const hslB = toHsl(b.rgb.r, b.rgb.g, b.rgb.b);
    const isGrayA = hslA.s < 0.08;
    const isGrayB = hslB.s < 0.08;

    // 无彩色（黑白灰）排最前面，按亮度从暗到亮
    if (isGrayA && isGrayB) return hslA.l - hslB.l;
    if (isGrayA) return -1;
    if (isGrayB) return 1;

    // 彩色按色相每30°分一组（共12组）
    const bucketA = Math.floor(hslA.h / 30);
    const bucketB = Math.floor(hslB.h / 30);
    if (bucketA !== bucketB) return bucketA - bucketB;

    // 同组内按亮度从亮到暗排列
    return hslB.l - hslA.l;
  });
}, []);
```

### HSL 转换说明

**HSL 颜色空间**：
- **H (Hue)**: 色相，0°-360°，表示颜色在色环上的位置
- **S (Saturation)**: 饱和度，0-1，表示颜色的纯度
- **L (Lightness)**: 亮度，0-1，表示颜色的明暗

**转换公式**：
```
1. 归一化 RGB 值到 [0,1]
2. 计算 max = max(r,g,b), min = min(r,g,b)
3. 亮度 l = (max + min) / 2
4. 饱和度 s = (max - min) / (2 - max - min)  // 当 l > 0.5 时
5. 色相 h 根据 max 所在通道计算：
   - max = r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60
   - max = g: h = ((b - r) / d + 2) * 60
   - max = b: h = ((r - g) / d + 4) * 60
```

---

## 排序流程

### 第一级：无彩色 vs 彩色
```
if (isGrayA && isGrayB):
  按亮度升序 (hslA.l - hslB.l)
if (isGrayA):
  A 排在前面 (return -1)
if (isGrayB):
  B 排在前面 (return 1)
```

### 第二级：色相分组
```
bucketA = floor(hslA.h / 30)
bucketB = floor(hslB.h / 30)

if (bucketA !== bucketB):
  按分组序号升序 (bucketA - bucketB)
```

### 第三级：组内亮度
```
同组内：
  按亮度降序 (hslB.l - hslA.l)
  亮色在前，暗色在后
```

---

## 应用位置

### ColorPicker.tsx 第 42-75 行

```typescript
// 显示的颜色列表
const displayColors = useMemo(() => {
  const colors = showFullPalette ? palette : currentColors;
  return sortColorsByHSL(colors);  // ← 应用新的排序算法
}, [showFullPalette, palette, currentColors, sortColorsByHSL]);
```

**应用范围**：
- ✅ 完整色板（291 色）
- ✅ 当前色板（图像使用的颜色）

---

## 优势

### 1. 符合人类视觉习惯
- 相似颜色聚集在一起
- 按色环顺序排列，符合直觉
- 黑白灰单独分组，易于查找

### 2. 便于颜色选择
- 想要红色系，直接找红色区域
- 想要浅色调，看每组前面
- 想要深色调，看每组后面

### 3. 美观的视觉效果
- 色带效果明显
- 渐变过渡自然
- 整体呈现彩虹般的排列

---

## 示例

### 示例颜色排序

假设有以下颜色：

| 颜色 | RGB | H | S | L | 分组 | 排序结果 |
|------|-----|---|---|---|------|---------|
| 黑色 | (0,0,0) | 0 | 0 | 0 | 无彩色 | 1 (最暗) |
| 深灰 | (64,64,64) | 0 | 0 | 0.25 | 无彩色 | 2 |
| 浅灰 | (192,192,192) | 0 | 0 | 0.75 | 无彩色 | 3 |
| 白色 | (255,255,255) | 0 | 0 | 1 | 无彩色 | 4 (最亮) |
| 浅红 | (255,200,200) | 0 | 1 | 0.89 | 组0 (红) | 5 (红组最亮) |
| 深红 | (180,0,0) | 0 | 1 | 0.35 | 组0 (红) | 6 (红组最暗) |
| 浅橙 | (255,220,180) | 32 | 1 | 0.85 | 组1 (橙) | 7 (橙组最亮) |
| 深橙 | (200,100,0) | 30 | 1 | 0.39 | 组1 (橙) | 8 (橙组最暗) |

**最终顺序**：
```
黑色 → 深灰 → 浅灰 → 白色 → 浅红 → 深红 → 浅橙 → 深橙 → ...
```

---

## 性能优化

### useMemo 缓存
```typescript
const displayColors = useMemo(() => {
  const colors = showFullPalette ? palette : currentColors;
  return sortColorsByHSL(colors);
}, [showFullPalette, palette, currentColors, sortColorsByHSL]);
```

**缓存依赖**：
- `showFullPalette`: Tab 切换时重新排序
- `palette`: 调色板数据变化时重新排序
- `currentColors`: 当前色板变化时重新排序
- `sortColorsByHSL`: 排序函数（useCallback 包裹）

### 时间复杂度
- **排序算法**：O(n log n)，使用原生 Array.sort()
- **HSL 转换**：O(1)，每次比较时计算
- **总体复杂度**：O(n log n)

对于 291 色的完整色板，排序性能良好。

---

## 对比表

| 特性 | 旧算法（三级排序） | 新算法（色相分组） |
|------|------------------|------------------|
| 第一级 | 亮度分组（5组） | 无彩色/彩色（2类） |
| 第二级 | 饱和度 | 色相分组（12组） |
| 第三级 | 色相 | 亮度（组内） |
| 视觉效果 | 按明暗层次 | 按色环顺序 |
| 查找颜色 | 需要在5个亮度层找 | 直接找色系 |
| 美观度 | 一般 | 彩虹渐变效果 |

---

## 未修改部分

以下功能**完全不受影响**：
- ✅ 颜色选择逻辑
- ✅ 批量替换功能
- ✅ hover 显示色号
- ✅ 选中状态指示
- ✅ Tab 切换功能
- ✅ 品牌切换功能
- ✅ 网格布局和尺寸
- ✅ 滚动性能优化

**只改变**：颜色在色板中的显示顺序。

---

## 构建状态

✅ **TypeScript 编译成功**
✅ **Vite 构建成功** (CSS: 6.38 kB, JS: 251.20 kB)
✅ **无错误无警告**

---

## 测试要点

### 视觉检查
- [ ] 黑白灰颜色排在最前面
- [ ] 黑白灰按从暗到亮排列
- [ ] 彩色按色环顺序排列（红→橙→黄→绿→青→蓝→紫）
- [ ] 同色系内有明显的亮到暗渐变
- [ ] 整体呈现彩虹般的排列效果

### 功能检查
- [ ] 完整色板排序正确
- [ ] 当前色板排序正确
- [ ] Tab 切换后排序保持
- [ ] 品牌切换后排序保持
- [ ] 所有交互功能正常

---

## 修改完成

色板颜色排序已优化为按色相分组聚集的方式，相似颜色聚集在一起，查找和选择更加直观！
