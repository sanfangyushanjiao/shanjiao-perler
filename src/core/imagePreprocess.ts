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
