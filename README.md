# Coway Malaysia 智能订单系统

> 一个集产品展示、在线下单、Agent 分配、后台管理于一体的全功能电商系统。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/deployed%20on-Cloudflare%20Workers-orange)](https://cowayagent.com)

## 🌐 在线访问

| 页面 | 链接 |
|:---|:---|
| 首页 | [cowayagent.com](https://cowayagent.com) |
| 产品下单 | [cowayagent.com/list.html](https://cowayagent.com/list.html) |
| 门店位置 | [cowayagent.com/location.html](https://cowayagent.com/location.html) |
| 客户支持 | [cowayagent.com/support.html](https://cowayagent.com/support.html) |
| 关于我们 | [cowayagent.com/about.html](https://cowayagent.com/about.html) |
| 后台管理 | [cowayagent.com/admin.html](https://cowayagent.com/admin.html) |

## ✨ 功能特性

### 前台功能
- 🎠 **轮播广告** - 动态展示促销活动
- 📦 **产品展示** - 按分类浏览商品，支持中英文切换
- 📝 **在线下单** - 填写订单信息，上传 IC 照片
- 🤖 **Agent 智能分配** - 自动分配接单最少的 Agent
- 📱 **Telegram 通知** - 订单实时推送到指定群组
- 📍 **门店位置** - 展示各分店信息，支持 Waze 导航
- 💬 **客户支持** - 提交反馈，保存到本地
- 📄 **关于我们** - 可编辑的图文展示页
- 🌐 **中英文双语** - 全站支持语言切换

### 后台功能
- 🔐 **三步安全登录** - 账号密码 + 6位安全码验证
- 📦 **商品管理** - 增删改查，多图上传
- 🎠 **轮播管理** - 广告图上传与编辑
- 📰 **公告管理** - 优惠公告发布
- 👥 **Agent 管理** - 管理销售代理信息
- 📍 **门店管理** - 门店信息维护
- 📄 **关于我们管理** - 可视化区块编辑器（文本/统计/团队/时间线/图片）

## 🛠️ 技术栈

| 类别 | 技术 |
|:---|:---|
| 前端 | HTML5, CSS3, JavaScript (ES6+) |
| 样式框架 | 自定义 CSS (Flex/Grid) |
| 轮播组件 | Slick Carousel |
| 部署平台 | Cloudflare Workers |
| 图片存储 | Cloudflare R2 / GitHub |
| 通知服务 | Telegram Bot API |
| 数据存储 | localStorage |

## 📁 项目结构
