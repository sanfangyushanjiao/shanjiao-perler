# 山椒爱拼豆 🎨

> 上传图片，一键生成拼豆图纸

[![部署状态](https://img.shields.io/badge/部署-成功-brightgreen)](https://perler-beads-generator.vercel.app)
[![测试](https://img.shields.io/badge/测试-50%20通过-brightgreen)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ 功能特点

- 🖼️ **图片上传**：支持 JPG、PNG 等常见格式
- 🎨 **智能配色**：自动匹配 292 种拼豆颜色
- 🎭 **三种像素化模式**：真实模式（平均色/主色调）、卡通模式 ⭐新增
- 🔧 **手动编辑**：画笔、橡皮擦、批量替换
- 📊 **颜色统计**：自动生成用珠统计表
- 📥 **多格式导出**：PNG 图纸、CSV 数据
- 📱 **响应式设计**：完美适配 PC 和移动端
- ⚡ **性能优化**：Web Worker 异步处理

## 🎯 支持品牌

- MARD（马德）
- COCO（可可豆豆）
- 漫漫
- 盼盼
- 咪小窝

## 🎨 像素化模式

### 真实模式（平均色）
计算单元格内所有像素的平均颜色，适合需要保留照片真实色彩和渐变效果的场景。

### 真实模式（主色调）
选择单元格内出现次数最多的颜色，适合强调主要色彩，减少中间色的场景。

### 卡通模式 ⭐ 新功能
通过颜色量化、饱和度增强和对比度增强技术，创造色彩鲜艳、对比强烈的卡通风格效果。适合动漫角色、插画和色块分明的图片。

**技术特点**：
- 颜色量化（16级）：大幅减少颜色种类
- 饱和度增强（+40%）：使颜色更鲜艳生动
- 对比度增强（S曲线）：亮色更亮，暗色更暗
- RGB/HSL色彩空间转换

详细说明请查看：[卡通模式功能文档](CARTOON_MODE_FEATURE.md)

## 🚀 在线使用

访问：[https://perler-beads-generator.vercel.app](https://perler-beads-generator.vercel.app)

## 💻 本地开发

```bash
# 克隆项目
git clone https://github.com/你的用户名/perler-beads-generator.git
cd perler-beads-generator

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

## 🧪 测试

```bash
# 运行所有测试
npm run test:run

# 测试覆盖率
npm run test:coverage
```

## 📦 技术栈

- **框架**：React 19 + TypeScript
- **构建工具**：Vite 7
- **样式**：Tailwind CSS 4
- **测试**：Vitest + Testing Library
- **性能**：Web Worker

## 📸 截图

![主界面](https://via.placeholder.com/800x400?text=主界面截图)

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请提交 Issue
