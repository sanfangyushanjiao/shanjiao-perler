/**
 * 图像预处理工具
 * 用于卡通模式的平滑、去噪和色彩量化
 */

/**
 * 中值滤波
 * 用于去除噪点，同时保留边缘
 * @param imageData 原始图像数据
 * @param radius 滤波半径（默认2）
 * @returns 处理后的图像数据
 */
export function medianFilter(imageData: ImageData, radius: number = 2): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const windowSize = radius * 2 + 1;
  const windowArray: number[] = new Array(windowSize * windowSize);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // 对 R、G、B 三个通道分别进行中值滤波
      for (let channel = 0; channel < 3; channel++) {
        let count = 0;

        // 收集窗口内的像素值
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4;
              windowArray[count++] = data[nidx + channel];
            }
          }
        }

        // 排序并取中值
        windowArray.sort((a, b) => a - b);
        const median = windowArray[Math.floor(count / 2)];
        output.data[idx + channel] = median;
      }

      // Alpha 通道保持不变
      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}

/**
 * 双边滤波（简化版）
 * 平滑图像但保留边缘
 * @param imageData 原始图像数据
 * @param sigmaSpace 空间权重参数
 * @param sigmaColor 颜色相似度参数
 * @returns 处理后的图像数据
 */
export function bilateralFilter(
  imageData: ImageData,
  sigmaSpace: number = 3,
  sigmaColor: number = 50
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const radius = Math.ceil(sigmaSpace * 2);

  // 预计算空间权重
  const spatialKernel: number[][] = [];
  for (let dy = -radius; dy <= radius; dy++) {
    spatialKernel[dy + radius] = [];
    for (let dx = -radius; dx <= radius; dx++) {
      const dist = dx * dx + dy * dy;
      spatialKernel[dy + radius][dx + radius] = Math.exp(-dist / (2 * sigmaSpace * sigmaSpace));
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const centerR = data[idx];
      const centerG = data[idx + 1];
      const centerB = data[idx + 2];

      let sumR = 0, sumG = 0, sumB = 0;
      let weightSum = 0;

      // 遍历邻域
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = (ny * width + nx) * 4;
            const nR = data[nidx];
            const nG = data[nidx + 1];
            const nB = data[nidx + 2];

            // 颜色相似度权重
            const colorDiff = Math.sqrt(
              (centerR - nR) ** 2 +
              (centerG - nG) ** 2 +
              (centerB - nB) ** 2
            );
            const colorWeight = Math.exp(-colorDiff / (2 * sigmaColor * sigmaColor));

            // 总权重 = 空间权重 × 颜色权重
            const weight = spatialKernel[dy + radius][dx + radius] * colorWeight;

            sumR += nR * weight;
            sumG += nG * weight;
            sumB += nB * weight;
            weightSum += weight;
          }
        }
      }

      output.data[idx] = Math.round(sumR / weightSum);
      output.data[idx + 1] = Math.round(sumG / weightSum);
      output.data[idx + 2] = Math.round(sumB / weightSum);
      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}

/**
 * 色彩量化/色调分离
 * 将颜色归并为有限的几个级别
 * @param imageData 原始图像数据
 * @param levels 每个通道的色阶数（默认8）
 * @returns 处理后的图像数据
 */
export function posterize(imageData: ImageData, levels: number = 8): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  const step = 256 / levels;

  for (let i = 0; i < data.length; i += 4) {
    // 量化 RGB 通道
    output.data[i] = Math.floor(data[i] / step) * step;
    output.data[i + 1] = Math.floor(data[i + 1] / step) * step;
    output.data[i + 2] = Math.floor(data[i + 2] / step) * step;
    // Alpha 通道保持不变
    output.data[i + 3] = data[i + 3];
  }

  return output;
}

/**
 * K-means 颜色聚类
 * 将图像中的颜色聚类为 k 个主要颜色
 * @param imageData 原始图像数据
 * @param k 聚类数量
 * @param maxIterations 最大迭代次数
 * @returns 处理后的图像数据
 */
export function kmeansColorQuantization(
  imageData: ImageData,
  k: number = 16,
  maxIterations: number = 10
): ImageData {
  const { width, height, data } = imageData;
  const pixels: { r: number; g: number; b: number; idx: number }[] = [];

  // 收集所有非透明像素
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] >= 128) {
      pixels.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        idx: i,
      });
    }
  }

  if (pixels.length === 0) return imageData;

  // 随机初始化 k 个质心
  const centroids: { r: number; g: number; b: number }[] = [];
  for (let i = 0; i < k; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push({ r: randomPixel.r, g: randomPixel.g, b: randomPixel.b });
  }

  // K-means 迭代
  for (let iter = 0; iter < maxIterations; iter++) {
    // 分配像素到最近的质心
    const clusters: typeof pixels[] = Array.from({ length: k }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let clusterIdx = 0;

      for (let c = 0; c < k; c++) {
        const dist = Math.sqrt(
          (pixel.r - centroids[c].r) ** 2 +
          (pixel.g - centroids[c].g) ** 2 +
          (pixel.b - centroids[c].b) ** 2
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIdx = c;
        }
      }

      clusters[clusterIdx].push(pixel);
    }

    // 更新质心
    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) continue;

      let sumR = 0, sumG = 0, sumB = 0;
      for (const pixel of clusters[c]) {
        sumR += pixel.r;
        sumG += pixel.g;
        sumB += pixel.b;
      }

      centroids[c].r = Math.round(sumR / clusters[c].length);
      centroids[c].g = Math.round(sumG / clusters[c].length);
      centroids[c].b = Math.round(sumB / clusters[c].length);
    }
  }

  // 将像素替换为其质心颜色
  const output = new ImageData(width, height);
  output.data.set(data);

  for (const pixel of pixels) {
    let minDist = Infinity;
    let closestCentroid = centroids[0];

    for (const centroid of centroids) {
      const dist = Math.sqrt(
        (pixel.r - centroid.r) ** 2 +
        (pixel.g - centroid.g) ** 2 +
        (pixel.b - centroid.b) ** 2
      );
      if (dist < minDist) {
        minDist = dist;
        closestCentroid = centroid;
      }
    }

    output.data[pixel.idx] = closestCentroid.r;
    output.data[pixel.idx + 1] = closestCentroid.g;
    output.data[pixel.idx + 2] = closestCentroid.b;
  }

  return output;
}

/**
 * 检测像素是否为极暗像素（黑色边缘/轮廓）
 * @param r 红色值
 * @param g 绿色值
 * @param b 蓝色值
 * @param threshold 亮度阈值（0-255），默认50
 * @returns 是否为极暗像素
 */
function isDarkPixel(r: number, g: number, b: number, threshold: number = 50): boolean {
  // 使用感知亮度公式：0.299R + 0.587G + 0.114B
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < threshold;
}

/**
 * 网格分块降采样 - 卡通模式专用
 * 解决黑色描边断裂和边缘污染问题
 * @param imageData 原始高分辨率图像数据
 * @param targetWidth 目标网格宽度
 * @param targetHeight 目标网格高度
 * @param darkPixelThreshold 极暗像素比例阈值（0-1），默认0.15
 * @param darkLuminanceThreshold 极暗像素的亮度阈值（0-255），默认50
 * @returns 降采样后的图像数据
 */
export function blockBasedDownsampling(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number,
  darkPixelThreshold: number = 0.15,
  darkLuminanceThreshold: number = 50
): ImageData {
  const { width: srcWidth, height: srcHeight, data: srcData } = imageData;
  const output = new ImageData(targetWidth, targetHeight);

  // 计算每个目标像素对应的源图像块大小
  const blockWidth = srcWidth / targetWidth;
  const blockHeight = srcHeight / targetHeight;

  for (let ty = 0; ty < targetHeight; ty++) {
    for (let tx = 0; tx < targetWidth; tx++) {
      // 计算源图像块的边界
      const startX = Math.floor(tx * blockWidth);
      const startY = Math.floor(ty * blockHeight);
      const endX = Math.floor((tx + 1) * blockWidth);
      const endY = Math.floor((ty + 1) * blockHeight);

      // 收集该块内的所有像素
      const pixels: { r: number; g: number; b: number; a: number }[] = [];
      let darkPixelCount = 0;
      let totalPixelCount = 0;

      for (let sy = startY; sy < endY && sy < srcHeight; sy++) {
        for (let sx = startX; sx < endX && sx < srcWidth; sx++) {
          const idx = (sy * srcWidth + sx) * 4;
          const r = srcData[idx];
          const g = srcData[idx + 1];
          const b = srcData[idx + 2];
          const a = srcData[idx + 3];

          // 跳过完全透明的像素
          if (a < 128) continue;

          pixels.push({ r, g, b, a });
          totalPixelCount++;

          // 统计极暗像素（黑色边缘/轮廓）
          if (isDarkPixel(r, g, b, darkLuminanceThreshold)) {
            darkPixelCount++;
          }
        }
      }

      // 如果块内没有有效像素，使用白色
      if (pixels.length === 0) {
        const outIdx = (ty * targetWidth + tx) * 4;
        output.data[outIdx] = 255;
        output.data[outIdx + 1] = 255;
        output.data[outIdx + 2] = 255;
        output.data[outIdx + 3] = 255;
        continue;
      }

      let finalR: number, finalG: number, finalB: number;

      // ========== 策略1: 黑色边缘优先级 ==========
      // 如果极暗像素占比超过阈值，强制使用黑色
      const darkRatio = darkPixelCount / totalPixelCount;
      if (darkRatio >= darkPixelThreshold) {
        finalR = 0;
        finalG = 0;
        finalB = 0;
      } else {
        // ========== 策略2: 主导色提取（众数） ==========
        // 对 RGB 进行量化后统计频率，避免抗锯齿污染
        const colorBuckets = new Map<string, number>();
        const quantizationLevel = 32; // 将256级量化为8级（256/32=8）

        for (const pixel of pixels) {
          // 跳过极暗像素，避免黑色污染主色调
          if (isDarkPixel(pixel.r, pixel.g, pixel.b, darkLuminanceThreshold)) {
            continue;
          }

          // 颜色量化：减少颜色空间，便于聚类
          const qr = Math.floor(pixel.r / quantizationLevel) * quantizationLevel;
          const qg = Math.floor(pixel.g / quantizationLevel) * quantizationLevel;
          const qb = Math.floor(pixel.b / quantizationLevel) * quantizationLevel;
          const colorKey = `${qr},${qg},${qb}`;

          colorBuckets.set(colorKey, (colorBuckets.get(colorKey) || 0) + 1);
        }

        // 如果所有像素都被过滤掉了（全是暗像素但未达到阈值），使用平均色
        if (colorBuckets.size === 0) {
          let sumR = 0, sumG = 0, sumB = 0;
          for (const pixel of pixels) {
            sumR += pixel.r;
            sumG += pixel.g;
            sumB += pixel.b;
          }
          finalR = Math.round(sumR / pixels.length);
          finalG = Math.round(sumG / pixels.length);
          finalB = Math.round(sumB / pixels.length);
        } else {
          // 找出出现频率最高的颜色（众数/主导色）
          let maxCount = 0;
          let dominantColor = '0,0,0';

          for (const [color, count] of colorBuckets.entries()) {
            if (count > maxCount) {
              maxCount = count;
              dominantColor = color;
            }
          }

          const [dr, dg, db] = dominantColor.split(',').map(Number);
          finalR = dr;
          finalG = dg;
          finalB = db;
        }
      }

      // 写入输出图像
      const outIdx = (ty * targetWidth + tx) * 4;
      output.data[outIdx] = finalR;
      output.data[outIdx + 1] = finalG;
      output.data[outIdx + 2] = finalB;
      output.data[outIdx + 3] = 255;
    }
  }

  return output;
}

/**
 * 卡通模式预处理管线
 * 组合多种滤波和量化技术
 * @param imageData 原始图像数据
 * @returns 处理后的图像数据
 */
export function cartoonPreprocess(imageData: ImageData): ImageData {
  // 步骤1: 双边滤波 - 平滑图像但保留边缘
  let processed = bilateralFilter(imageData, 5, 60);

  // 步骤2: 中值滤波 - 去除小噪点
  processed = medianFilter(processed, 1);

  // 步骤3: K-means 颜色量化 - 减少颜色数量
  processed = kmeansColorQuantization(processed, 16, 5);

  return processed;
}
