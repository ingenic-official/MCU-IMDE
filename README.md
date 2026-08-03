# IMDE

简体中文 | [English](README.en.md)

[![CI](https://github.com/trevisy/IMDE/actions/workflows/ci.yml/badge.svg)](https://github.com/trevisy/IMDE/actions/workflows/ci.yml)

IMDE 是一个面向 Ingenic MCU SDK 工程的 VS Code 扩展。它将 SDK 中的
`tools/imde/imde.py` 命令行工具集成到 VS Code，让常用开发流程可以在同一
个工作区内完成。

## 功能

- 环境诊断与 SDK 工具链检查。
- Configure、Build、Clean、Full Clean 和 defconfig 工作流。
- Kconfig 图形化配置工具。
- Pinmux 与 BSP 配置工具。
- 构建产物浏览和交互式 Memory Map 查看。
- 根据编译数据库自动配置 IntelliSense。

## 使用要求

- VS Code 1.85 或更高版本。
- 包含 `imde.json` 的 Ingenic MCU SDK 工程。
- `IMDE: Run Doctor` 检查通过的 SDK 依赖，包括 Python、CMake、Ninja 和
  已配置的工具链。

## 安装

1. 打开 [最新 Release](https://github.com/trevisy/IMDE/releases/latest)。
2. 下载其中的 `imde-<version>.vsix` 文件。
3. 在 VS Code 中执行 `Extensions: Install from VSIX...`，选择下载的文件。
4. 打开 SDK 工程，在命令面板运行 `IMDE: Run Doctor`。

## 日常流程

1. 在 VS Code 中打开 SDK 工程目录。
2. 使用 `IMDE: Run Doctor` 检查开发环境。
3. 选择 defconfig，然后运行 `IMDE: Configure`。
4. 运行 `IMDE: Build`，在 IMDE 侧边栏查看构建产物。

扩展只会在工作区包含 `imde.json` 时激活。如果 SDK 工程不是工作区根目录，
可以使用 `imde.projectDir` 设置指定工程路径。

## 仓库结构

```text
.
|- src/                 扩展 TypeScript 与 Webview 源码
|- test/                自动化测试与可复用 fixture
|- media/               扩展图标与品牌资源
|- docs/                开发、架构和发布文档
|- .github/             CI 与 GitHub 协作配置
|- CHANGELOG.md         版本历史
|- package.json         扩展清单与 npm 脚本
`- webpack.config.js    扩展与 Webview 打包配置
```

## 开发

```powershell
npm ci
npm run compile
npm test
```

请参阅[开发文档](docs/development.md)了解调试、打包和完整验证流程，架构
说明见[架构文档](docs/architecture.md)。

## 参与贡献

欢迎通过 GitHub Issues 报告问题或提出功能建议。提交 Pull Request 前请阅读
[CONTRIBUTING.md](CONTRIBUTING.md)，安全问题请遵循 [SECURITY.md](SECURITY.md)。

## 许可证

本项目使用 [ISC License](LICENSE) 发布。
