# 山椒爱拼豆 🎨

> 上传图片，一键生成拼豆图纸

[![部署状态](https://img.shields.io/badge/部署-成功-brightgreen)](https://shanjiao-perler.netlify.app)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🔐 激活系统

**本项目现已支持激活码付费系统！**

### 套餐价格
- 💫 **24小时体验版**: ¥1.8
- ⭐ **七天标准版**: ¥6.6
- 🔥 **永久专业版**: ¥9.9

### 快速开始
1. 访问网站并输入激活码
2. 同一激活码可在多设备使用
3. 无需注册，即开即用

### 开发者指南
- 📖 [完整部署指南](ACTIVATION_SYSTEM.md)
- 🚀 [快速开始](QUICK_START_ACTIVATION.md)
- ✅ [部署检查清单](DEPLOYMENT_CHECKLIST.md)

---

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

访问：[https://shanjiao-perler.netlify.app](https://shanjiao-perler.netlify.app)

**注意**: 需要激活码才能使用，请联系购买。

---

## 💻 本地开发

```bash
# 克隆项目
git clone https://github.com/sanfangyushanjiao/shanjiao-perler.git
cd shanjiao-perler

# 安装依赖
npm install

# 配置环境变量（仅开发激活码系统时需要）
cp .env.example .env
# 编辑 .env 填入 Supabase 配置

# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

### 生成激活码（仅管理员）

```bash
# 生成 100 个 24小时激活码
npm run gen:codes:24h

# 生成 50 个 七天激活码
npm run gen:codes:7d

# 生成 20 个 永久激活码
npm run gen:codes:lifetime

# 自定义生成
tsx scripts/generate-codes.ts --type 24h --count 200 --batch promo-2024
```

## 🧪 测试

```bash
# 运行所有测试
npm run test:run

# 测试覆盖率
npm run test:coverage
```

## 📦 技术栈

### 前端
- **框架**：React 19 + TypeScript
- **构建工具**：Vite 7
- **样式**：Tailwind CSS 4
- **测试**：Vitest + Testing Library
- **性能**：Web Worker
- **图标**：Lucide React

### 后端（激活系统）
- **数据库**：Supabase PostgreSQL
- **API**：Vercel Serverless Functions
- **认证**：自定义激活码系统
- **支付**：发卡平台集成

## 📸 截图

![主界面](https://via.placeholder.com/800x400?text=主界面截图)

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请提交 Issue
