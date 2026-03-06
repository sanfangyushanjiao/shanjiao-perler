# 🦄 独角数卡（Dujiaoka）部署配置指南

## 📋 项目信息

- **项目名称**: 独角数卡 (Dujiaoka)
- **GitHub**: https://github.com/assimon/dujiaoka
- **官方文档**: https://github.com/assimon/dujiaoka/wiki
- **特点**: 开源免费、功能完整、支持多种支付方式

---

## 🎯 系统优势

✅ **完全开源免费** - 无需支付平台手续费
✅ **独立部署** - 数据完全掌控
✅ **支付方式丰富** - 支持支付宝、微信、PayPal等
✅ **自动发货** - 购买后立即发送激活码
✅ **管理后台完善** - 商品管理、订单管理、数据统计
✅ **API接口** - 可与你的激活系统无缝对接

---

## 🚀 部署方式选择

### 方案 A: 使用宝塔面板部署（推荐新手）

**优点**:
- 可视化界面，操作简单
- 一键安装PHP、MySQL、Nginx
- 适合有云服务器的用户

**要求**:
- 云服务器（1核2G即可）
- 域名（可选，建议有）

**成本**: ¥50-100/月（服务器费用）

---

### 方案 B: Docker 部署（推荐懂技术的）

**优点**:
- 部署快速，环境隔离
- 易于维护和升级
- 跨平台支持

**要求**:
- Docker 和 Docker Compose
- 云服务器或本地机器

---

### 方案 C: 使用免费托管平台

**Render / Railway / Fly.io**

**优点**:
- 免费额度
- 自动部署
- 无需维护服务器

**缺点**:
- 免费版有限制
- 可能需要信用卡验证

---

## 📦 方案 A: 宝塔面板部署（详细步骤）

### 第 1 步: 购买云服务器

推荐服务商：
- **阿里云**: https://www.aliyun.com/
- **腾讯云**: https://cloud.tencent.com/
- **华为云**: https://www.huaweicloud.com/

**配置建议**:
```
CPU: 1核
内存: 2GB
硬盘: 40GB
带宽: 1Mbps
系统: CentOS 7.9 / Ubuntu 20.04
```

**价格**: 新用户约 ¥50-80/年

---

### 第 2 步: 安装宝塔面板

#### 2.1 连接服务器

**Windows 用户**: 下载 [Xshell](https://www.xshell.com/) 或使用云服务商网页终端

**连接命令**:
```bash
ssh root@你的服务器IP
# 输入密码
```

#### 2.2 安装宝塔

**CentOS 系统**:
```bash
yum install -y wget && wget -O install.sh https://download.bt.cn/install/install_6.0.sh && sh install.sh ed8484bec
```

**Ubuntu 系统**:
```bash
wget -O install.sh https://download.bt.cn/install/install-ubuntu_6.0.sh && sudo bash install.sh ed8484bec
```

安装完成后会显示：
```
==================================================================
Bt-Panel: http://你的IP:8888/xxxxxxxx
username: xxxxxxxx
password: xxxxxxxx
==================================================================
```

**重要**: 保存这些信息！

---

### 第 3 步: 配置宝塔环境

#### 3.1 登录宝塔面板

1. 浏览器访问: `http://你的IP:8888/xxxxxxxx`
2. 输入用户名和密码
3. 首次登录会推荐安装套件

#### 3.2 安装运行环境

选择 **LNMP** 套件（一键安装）：
```
✅ Nginx 1.22
✅ MySQL 5.7 或 8.0
✅ PHP 7.4 或 8.0
✅ phpMyAdmin
```

安装时间: 约 10-30 分钟

---

### 第 4 步: 创建网站

#### 4.1 添加站点

在宝塔面板：
```
网站 → 添加站点

域名: 你的域名.com（或直接用IP）
PHP版本: 7.4 或 8.0
数据库: MySQL（自动创建）
```

#### 4.2 配置 SSL（推荐）

如果有域名：
```
网站 → 设置 → SSL → Let's Encrypt（免费）
申请证书 → 强制HTTPS
```

---

### 第 5 步: 部署独角数卡

#### 5.1 下载源码

在宝塔面板：
```
文件 → 进入网站根目录（/www/wwwroot/你的域名）
→ 删除默认文件
```

或使用命令行：
```bash
cd /www/wwwroot/你的域名
rm -rf *
```

#### 5.2 安装独角数卡

**方法 1: 使用 Git（推荐）**
```bash
cd /www/wwwroot/你的域名
git clone https://github.com/assimon/dujiaoka.git .
```

**方法 2: 手动下载**
1. 访问: https://github.com/assimon/dujiaoka/releases
2. 下载最新版 zip
3. 上传到宝塔并解压

#### 5.3 安装依赖

```bash
cd /www/wwwroot/你的域名
composer install
```

如果没有 composer，先安装：
```bash
# 在宝塔面板：软件商店 → 搜索"Composer" → 安装
```

#### 5.4 配置环境变量

复制配置文件：
```bash
cp .env.example .env
```

编辑 `.env` 文件（在宝塔文件管理器中）：
```env
APP_NAME=山椒爱拼豆
APP_ENV=production
APP_DEBUG=false
APP_URL=https://你的域名.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=你的数据库名
DB_USERNAME=你的数据库用户名
DB_PASSWORD=你的数据库密码
```

#### 5.5 生成应用密钥

```bash
php artisan key:generate
```

#### 5.6 数据库迁移

```bash
php artisan migrate
php artisan db:seed
```

#### 5.7 设置权限

```bash
chmod -R 755 /www/wwwroot/你的域名
chown -R www:www /www/wwwroot/你的域名
```

---

### 第 6 步: 初始化系统

访问网站: `https://你的域名.com`

#### 6.1 安装向导

1. 检查环境（应该全部通过）
2. 配置数据库（已在 .env 中配置）
3. 设置管理员账号
   - 用户名: admin
   - 密码: [设置强密码]
   - 邮箱: 你的邮箱

#### 6.2 登录后台

访问: `https://你的域名.com/admin`

---

## 🛒 配置商品和激活码

### 第 1 步: 创建商品分类

```
后台 → 商品管理 → 商品分类 → 添加分类

分类名称: 激活码
分类图标: [上传图标]
排序: 1
```

### 第 2 步: 创建商品

#### 商品 1: 24小时版

```
商品名称: 山椒爱拼豆 24小时使用权
商品分类: 激活码
商品价格: 1.80
商品库存: 自动（从卡密导入）
商品描述: [复制下方模板]
```

**商品描述模板**:
```html
<h2>🎨 山椒爱拼豆 - 24小时畅用版</h2>

<h3>✨ 功能特点</h3>
<ul>
  <li>支持任意图片转拼豆图纸</li>
  <li>多种颜色方案（Hama/Perler/Artkal）</li>
  <li>高清图纸导出</li>
  <li>激活后24小时内无限使用</li>
</ul>

<h3>📱 使用方法</h3>
<ol>
  <li>购买后立即获得激活码</li>
  <li>访问：https://shanjiao-perler.vercel.app</li>
  <li>输入激活码即可使用</li>
</ol>

<h3>⚡ 购买须知</h3>
<ul>
  <li>自动发货：付款后立即发送激活码</li>
  <li>跨设备使用：同一激活码可在多台设备使用</li>
  <li>有效期：从激活时刻开始计时24小时</li>
  <li>售后保障：激活码无效全额退款</li>
</ul>
```

#### 商品 2 & 3: 七天版 / 永久版

重复上述步骤，修改对应的价格、名称、描述。

---

### 第 3 步: 批量导入激活码

#### 3.1 准备激活码文件

你已经有了 3 个 CSV 文件：
- `activation-codes-24h-batch-*.csv`
- `activation-codes-7d-batch-*.csv`
- `activation-codes-lifetime-batch-*.csv`

#### 3.2 转换格式

独角数卡需要的格式（每行一个激活码）：
```
SJ-XXXX-XXXX-XXXX
SJ-YYYY-YYYY-YYYY
SJ-ZZZZ-ZZZZ-ZZZZ
```

让我为你创建转换脚本：
```bash
# 提取激活码（去掉价格信息）
cut -d',' -f1 activation-codes-24h-batch-*.csv > codes-24h.txt
cut -d',' -f1 activation-codes-7d-batch-*.csv > codes-7d.txt
cut -d',' -f1 activation-codes-lifetime-batch-*.csv > codes-lifetime.txt

# 删除第一行表头
tail -n +2 codes-24h.txt > codes-24h-clean.txt
tail -n +2 codes-7d.txt > codes-7d-clean.txt
tail -n +2 codes-lifetime.txt > codes-lifetime-clean.txt
```

#### 3.3 在独角数卡导入

```
后台 → 商品管理 → 商品列表 → 选择商品 → 卡密管理 → 批量导入

选择文件: codes-24h-clean.txt
点击导入
```

重复此步骤导入其他两个商品的激活码。

---

## 💳 配置支付方式

### 支付宝当面付（推荐个人）

```
后台 → 支付设置 → 添加支付方式

支付方式: 支付宝当面付
应用ID: [从支付宝开放平台获取]
应用私钥: [从支付宝开放平台获取]
支付宝公钥: [从支付宝开放平台获取]
```

**申请步骤**:
1. 访问: https://open.alipay.com/
2. 登录 → 开发者中心 → 创建应用
3. 应用类型: 网页/移动应用
4. 添加功能: 当面付
5. 获取密钥信息

**注意**: 个人账号可能需要营业执照，或使用第三方聚合支付。

---

### 易支付（推荐新手）

如果没有支付宝商户号，可以使用第三方聚合支付：

```
后台 → 支付设置 → 添加支付方式

支付方式: 易支付
API地址: [第三方易支付平台提供]
商户ID: [从平台获取]
商户密钥: [从平台获取]
```

推荐平台：
- **码支付**: https://codepay.fateqq.com/
- **虎皮椒**: https://www.xunhupay.com/

---

## 🎨 自定义外观

### 修改Logo和标题

```
后台 → 系统设置 → 网站设置

网站名称: 山椒爱拼豆旗舰店
网站Logo: [上传你的Logo]
网站关键词: 拼豆,图纸,激活码
网站描述: 专业的拼豆图纸生成工具
```

### 自定义主题

```
后台 → 外观设置 → 主题管理

选择主题 → 自定义颜色
主题色: #667eea（紫色）
```

---

## 📊 测试购买流程

### 完整测试清单

1. **前台测试**
   - [ ] 访问网站首页
   - [ ] 浏览商品列表
   - [ ] 点击商品查看详情
   - [ ] 添加到购物车
   - [ ] 提交订单
   - [ ] 选择支付方式
   - [ ] 完成支付（可用 ¥0.01 测试）

2. **自动发货测试**
   - [ ] 支付成功后自动跳转
   - [ ] 显示激活码
   - [ ] 激活码格式正确
   - [ ] 可以复制激活码

3. **激活测试**
   - [ ] 访问 https://shanjiao-perler.vercel.app
   - [ ] 输入购买的激活码
   - [ ] 成功激活
   - [ ] 功能正常使用

4. **后台测试**
   - [ ] 查看订单记录
   - [ ] 查看销售统计
   - [ ] 激活码库存正确
   - [ ] 可以手动补货

---

## 🔐 安全加固

### 1. 修改后台路径

```php
# 编辑 .env
ADMIN_ROUTE=你的自定义路径

# 例如
ADMIN_ROUTE=myadmin888
```

访问地址变为: `https://你的域名.com/myadmin888`

### 2. 禁用 DEBUG 模式

```env
APP_DEBUG=false
```

### 3. 定期备份

在宝塔面板：
```
计划任务 → 添加任务
任务类型: 备份网站 + 备份数据库
执行周期: 每天 3:00
```

### 4. 开启防火墙

```
安全 → 防火墙 → 开启
```

---

## 📈 SEO优化（可选）

### 1. 设置友好URL

```
后台 → 系统设置 → 伪静态

选择: Nginx
保存
```

### 2. 提交搜索引擎

- 百度站长平台: https://ziyuan.baidu.com/
- Google Search Console: https://search.google.com/

---

## 🆘 常见问题

### Q1: 500 错误
**解决**:
```bash
php artisan cache:clear
php artisan config:clear
chmod -R 755 storage
```

### Q2: 支付回调失败
**解决**:
- 检查支付回调地址是否正确
- 检查服务器防火墙是否开放端口
- 查看日志: `storage/logs/laravel.log`

### Q3: 激活码导入失败
**解决**:
- 确保文件编码为 UTF-8
- 每行只有一个激活码
- 没有多余空格或空行

### Q4: 邮件通知不工作
**解决**:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USERNAME=你的QQ邮箱
MAIL_PASSWORD=授权码
MAIL_ENCRYPTION=ssl
```

---

## 📞 需要帮助？

**选择你的部署方式**：
- **A** - 我有云服务器，想用宝塔部署
- **B** - 我想用 Docker 部署
- **C** - 我想用免费托管平台
- **D** - 我需要更详细的某个步骤说明

告诉我你的选择，我继续详细指导你！🚀
