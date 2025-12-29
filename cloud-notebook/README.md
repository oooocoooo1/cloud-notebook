# Cloud Notebook (云笔记)

[中文](#中文) | [English](#english)

<a name="中文"></a>

一个现代化、极简设计的个人云笔记应用。构建于 Next.js 技术栈，支持云端数据库存储，并专为 Windows 效率工具 **Quicker** 提供了极速上传接口。

![Cloud Notebook UI](public/window.png)

## ✨ 主要功能

*   **☁️ 云端同步**: 所有笔记实时存储在 PostgreSQL 云数据库 (Neon.tech)，数据永不丢失。
*   **🎨 极简设计**: 采用玻璃拟态 (Glassmorphism) 和高级深色主题，支持 **亮色/暗色主题切换**。
*   **📝 笔记管理**:
    *   创建无限量的笔记本和笔记。
    *   **移动笔记**: 轻松在不同笔记本间转移内容。
    *   **一键复制**: 快速复制笔记标题和正文到剪贴板。
*   **🚀 Quicker 集成**: 选中文本后，通过 Quicker 动作一键上传到云笔记，无需打开网页。

---

## 🛠️ 技术栈

*   **框架**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **语言**: TypeScript
*   **数据库**: PostgreSQL (推荐 [Neon](https://neon.tech/))
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **部署**: [Vercel](https://vercel.com/)

---

## 🚀 部署指南 (零成本方案)

本项目设计为完全免费托管。请按照以下步骤部署：

### 1. 准备数据库 (Neon)
1.  注册并登录 [Neon.tech](https://neon.tech/)。
2.  创建一个新项目 (Project)。
3.  复制 Dashboard 上的 **Connection String** (连接字符串)。 
    *   它看起来像这样：`postgresql://neondb_owner:AbCd123@ep-cool-frog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require`。
    *   *注意：请确保勾选 `Pooled connection` (如有) 或使用默认链接。*

### 2. 获取代码
Fork 本仓库或下载代码到本地。

### 3. 配置 Vercel
1.  在 [Vercel](https://vercel.com/) 导入你的 GitHub 仓库。
2.  **关键设置**:
    *   **Framework Preset (框架预设)**: `Next.js`。
    *   **Root Directory (根目录)**: `cloud-notebook` (⚠️ 必须修改此项，否则构建失败)。
    *   **Environment Variables (环境变量)**:
        *   键: `DATABASE_URL`
        *   值: `postgresql://...` (填入第1步获取的 Neon 连接字符串)。
3.  点击 **Deploy**。

### 4. 初始化数据库
部署完成后，如果页面报错或显示空白，通常是因为数据库表结构未同步。
在本地开发环境中（确保 `.env` 已配置），运行以下命令将结构推送到云端：
```bash
npx prisma db push
```

---

## ⚡ Quicker 动作配置

这是本应用的核心亮点，助您实现“闪念胶囊”般的体验。

1.  在 Quicker 中创建一个新动作。
2.  添加步骤 **【HTTP 请求】**。
3.  配置参数如下：
    *   **网址**: `https://你的Vercel域名.vercel.app/api/quicker`
    *   **方法**: `POST`
    *   **请求体类型**: `纯文本` 或 `JSON`
    *   **请求体**: `{选中的文本}` (使用 Quicker 的内置变量)

**进阶 JSON 配置示例：**
如果你想要自定义更多字段，Body 类型选 JSON，内容如下：
```json
{
  "text": "{选中的文本}",
  "title": "可选：手动指定标题", 
  "notebookId": "default" 
}
```
*注：如果不指定 `notebookId`，系统会自动存入您的第一个笔记本。*

---

<br/>
<hr/>
<br/>

<a name="english"></a>

# Cloud Notebook

A modern, minimalist personal cloud notebook application. Built on the Next.js stack, it supports cloud database storage and provides a high-speed upload interface specifically designed for the Windows efficiency tool **Quicker**.

## ✨ Key Features

*   **☁️ Cloud Sync**: All notes are stored in real-time in a PostgreSQL cloud database (Neon.tech), ensuring data is never lost.
*   **🎨 Minimalist Design**: Features Glassmorphism and a premium dark theme, supporting **Light/Dark Theme Switching**.
*   **📝 Note Management**:
    *   Create unlimited notebooks and notes.
    *   **Move Notes**: Easily transfer content between different notebooks.
    *   **One-Click Copy**: Quickly copy note title and body to clipboard.
*   **🚀 Quicker Integration**: Select text and upload it to Cloud Notebook with one click via Quicker Action, without opening a webpage.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **Language**: TypeScript
*   **Database**: PostgreSQL (Recommended [Neon](https://neon.tech/))
*   **ORM**: [Prisma](https://www.prisma.io/)
*   **Deployment**: [Vercel](https://vercel.com/)

---

## � Deployment Guide (Zero Cost)

This project is designed to be hosted completely free of charge. Follow these steps to deploy:

### 1. Prepare Database (Neon)
1.  Register and log in to [Neon.tech](https://neon.tech/).
2.  Create a new Project.
3.  Copy the **Connection String** from the Dashboard.
    *   *Note: Ensure `Pooled connection` is checked (if available) or use the default link.*

### 2. Get the Code
Fork this repository or download the code locally.

### 3. Configure Vercel
1.  Import your GitHub repository in [Vercel](https://vercel.com/).
2.  **Key Settings**:
    *   **Framework Preset**: `Next.js`.
    *   **Root Directory**: `cloud-notebook` (⚠️ Must check this, otherwise build will fail).
    *   **Environment Variables**:
        *   Key: `DATABASE_URL`
        *   Value: `postgresql://...` (Paste the Neon connection string from Step 1).
3.  Click **Deploy**.

### 4. Initialize Database
After deployment, if the page errors or shows blank, it is usually because the database schema is not synced.
In your local development environment (ensure `.env` is configured), run the following command to push schema to the cloud:
```bash
npx prisma db push
```

---

## ⚡ Quicker Action Configuration

This is the core highlight of this application, enabling a "Flash Capsule" experience.

1.  Create a new action in Quicker.
2.  Add step **【HTTP Request】**.
3.  Configure parameters as follows:
    *   **URL**: `https://YOUR_VERCEL_DOMAIN.vercel.app/api/quicker`
    *   **Method**: `POST`
    *   **Body Type**: `Text` or `JSON`
    *   **Body**: `{SelectedText}` (Use Quicker's built-in variable)

**Advanced JSON Configuration Example:**
If you want to customize more fields, select JSON for Body Type, content as follows:
```json
{
  "text": "{SelectedText}",
  "title": "Optional: Manually specify title", 
  "notebookId": "default" 
}
```
*Note: If `notebookId` is not specified, the system will automatically save to your first notebook.*
