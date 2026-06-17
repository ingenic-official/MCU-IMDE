# Changelog

## 0.3.5-beta (WIP)

### 待定

---

## 0.3.4 (stable) — 2025.06.08

### Map View — 内存地图可视化（新功能）
- 新增 GCC (GNU ld) `.map` 文件解析器，支持输出段、对象文件贡献提取
- 自动排除 debug 段和链接器预留段（.user_heap / .user_stack / .irq_stack / .got / .rela.dyn 等）
- ROM / RAM 分类统计，按目录层级聚合模块大小
- 支持静态库对象文件（libc.a / libgcc.a）解析与归属

### Treemap 矩形树图
- Squarified Treemap 布局算法，修复 worstRatio 面积计算错误
- 支持点击下钻到子目录，Back / Top 按钮 + Breadcrumb 面包屑导航
- 20 种柔和鲜艳色板，玻璃质感内阴影 + hover 外投影
- 白色加粗文字居中显示，文字阴影增强对比度
- 字体分级：label 13px / size 12px / percentage 11px
- 节点入场动画：淡入 + scale + stagger 延迟
- tooltip 智能边界检测，悬停显示 ROM/RAM/子模块统计
- tooltip 底部显示源文件路径，📄 点击直接跳转到 `.c` 源文件
- 少于 10 个节点时不过滤，10 个以上自动过滤 < 0.3% 极小节点

### 全局搜索
- 顶部搜索框：递归深度搜索当前视图下所有层级的模块名
- 搜索结果显示完整路径（如 `code/drivers/g32s10/uart/hal_uart`）
- 一键定位模块在项目中的位置

### Sections 列表视图
- 按大小排序的 section 条目列表，彩色进度条直观展示
- 每个 section 显示地址范围（如 `0x80000200–0x80013564`）
- 自动检测 `.rodata` 段（通过 `__ro_end - __ro_start` 反推）
- 条目字体 14px

### Artifacts 视图集成
- `.map` 文件分配专属 `contextValue = imdeMapArtifact`
- inline 图标按钮一键打开 Map View
- Artifacts 视图标题栏新增刷新按钮
- Summary 卡片显示全局 Total / ROM / RAM / Modules 统计

### 命令增强
- 新增 `imde.viewMap` 命令
- 支持带参数调用（从 Artifacts 节点触发）
- 支持无参数调用：自动查找 artifacts 中的 `.map` 文件
- 多个 `.map` 文件时弹出 QuickPick 选择框
- 未找到时提示 "No .map artifact found. Build first?"

### 底栏快捷按钮
- 新增 **Build** 按钮（Rebuild 右侧），图标 `$(play)`，一键普通构建
- 新增 **Map** 按钮（Config 右侧），图标 `$(symbol-color)`
- Map 按钮动态显示/隐藏：项目有 .map 文件时才出现
- Build 命令增加进度通知，自动轮询 artifacts 检测构建完成
- IMDE 按钮版本号自动跟随 package.json

### GUI Config — 动画与性能优化
- 新增 PerformanceMonitor 组件：后台实时监控渲染帧率
- 自适应动画分级（high / medium / low）：
  - 帧率 > 58fps 保持高画质动画
  - 帧率 < 50fps 自动降级减少开销
  - 帧率 < 30fps 立即关闭动画
- 列表行交错入场动画（rowStagger），支持延迟分级
- expand/collapse 图标旋转动效，展开时 90° 旋转
- 菜单行过渡动画优化（transform + opacity + max-height）
- 数值变更时高亮闪烁反馈（valueFlashGlow）
- 全局 transition 缓动曲线统一为 cubic-bezier(0.4, 0, 0.2, 1)
- 添加 expandAll / collapseAll 工具栏按钮

### 工程优化与 Bug 修复
- Map View 解析结果缓存：文件 mtime 未变时复用上一次解析结果
- `.map` 解析器支持 `.S` / `.s` 汇编文件对象，支持源文件反向路径解析
- sourceFile 跳转采用 B+A 兜底策略：直接路径 Open → workspace.findFiles 模糊搜索
- Webview JS 防御性重写：IIFE 包裹、JSON 转义、`toPanelData` 空值回退
- WebView 生产优化：`__VUE_OPTIONS_API__` / `__VUE_PROD_DEVTOOLS__` 已关闭
- Python 探测使用 login shell 环境变量，兼容 WSL / 自定义 Python 安装
- activationEvents 补齐（build / doctor / fullCleanBuild / viewMap），确保底栏按钮正常激活
- 清理 runAction 中从未执行的 smoothTimer 进度条死代码
- 删除未使用的 `src/utils/stack.ts`

### 代码拆分与测试
- `defconfig.ts` 独立模块（selectDefconfig / saveDefconfig），extension.ts 从 466 行压至 ~380 行
- `style.ts` CSS 提取并通过 `getMapViewCss()` 引用，panel.ts 瘦身 5KB
- `TableRow.vue` SCSS 独立为 TableRow.scss（-385 行），tristate / choiceWidth 提取为 composable
- 新增 parser + diagnostics 单元测试，`npm test` 一键 38 断言
- 测试基础设施：test/fixture.map + test/tsconfig.json + vscode mock

### 交互增强
- Treemap 节点右键菜单：Copy Name / Copy Path / Reveal Source
- 搜索结果显示完整路径前缀，点击后自动回到根节点
- sourceFile 搜索时显示 "Searching source file…" 进度提示
- `.rodata` 段自动检测（通过 `__ro_end - __ro_start` 符号差值）

---

## 0.3.3 (2025.06.04)

### GUI Config — 完整重写
- 移植开源项目 `vscode-kconfig-visual-editor` 的核心解析和渲染引擎
- 完整 Kconfig 语法支持：bool / tristate / string / int / hex / choice / menu / comment
- 依赖关系：depends on / select / imply / default / range / if / source
- Modern 表格局（默认）+ Classic 树形两种 UI 主题可切换
- 搜索/过滤配置项，实时高亮匹配结果
- 依赖联动可见性（值变更后自动显示/隐藏关联项）

### GUI Config — 操作按钮
- **Apply**：保存到 .config 并自动 re-configure
- **Save**：导出完整 .config 到指定路径
- **Discard**：丢弃修改，重新加载 .config 文件
- **Reset**：恢复 Kconfig 默认值（含 choice 类型）
- **Refresh**：从磁盘重新解析 Kconfig，保留展开状态
- 深浅主题切换按钮（☀/☾），默认跟随 VS Code 主题
- 深浅主题偏好持久化记忆

### GUI Config — 视觉效果
- 君正品牌色：浅色主题 #000080 海军蓝，深色主题荧光粉
- 君正 Logo + IMDE / GUI CONFIG 双行品牌标题
- 过场动画：呼吸 Logo + 骨架屏加载
- 子条目展开动画加速
- ? 详情面板支持深浅主题自适应文字颜色

### CLI 集成改进
- Build / Configure / Clean / FullClean / Doctor 改用前台 IMDE 共享终端
- 终端窗口支持窗口 reload 后复用，不新建
- Menuconfig 自动检测并补跑 configure
- GUI Config 打开时自动检测 .config 缺失并提示选择 defconfig
- GUI Config 打开时自动检测 build 被清理并 re-configure
- FullClean & Build 一键干净编译底栏按钮
- Linux/macOS：login shell 探测 PATH，解决 cmake 找不到的问题
- macOS：自动 chmod +x wrapper 脚本
- Windows：支持 .cmd/.bat wrapper 脚本

### 底栏快捷按钮
- IMDE（Run Doctor）
- FullClean & Build（一键干净编译）
- Select Defconfig（选择配置）
- GUI Config（打开可视化配置）

### 构建体验
- 编译错误自动解析到 VS Code Problems 面板，支持点击跳转
- 输出通道错误精简（不刷完整 Python traceback）
- Environment 视图 10 秒节流防重复请求

### Bug 修复
- 修复 Discard 后展开状态丢失、错误触发过场动画
- 修复 Choice 类型默认值不显示
- 修复 Choice 子项误显示为独立行
- 修复 Reset 后 choice 类型不恢复默认值
- 修复确认弹窗按钮颜色不随主题变化
- 修复详情面板文字在浅色主题下不可读

---

## 过测 Checklist

### 基础功能
- [x] 插件安装后 IMDE 侧边栏正常显示
- [x] Environment 视图显示 Python / CMake / Ninja / Toolchain 状态
- [x] Build & Config 视图显示状态和操作按钮
- [x] Artifacts 视图显示构建产物

### GUI Config — 打开与加载
- [x] 点击 "GUI Config" 按钮或底栏 Config 打开面板
- [x] 过场动画：Logo 呼吸闪烁 + 骨架屏
- [x] 加载完成后显示完整配置树（表格局）
- [x] 没有 .config 时提示 "Select Defconfig"
- [x] build 被清理时自动 re-configure 再打开

### GUI Config — 操作
- [x] Apply：修改值 → 点 Apply → 弹确认 → 保存并自动 configure
- [x] Save：点击 → 输入路径 → 导出完整 .config
- [x] Discard：修改值 → 点 Discard → 恢复到 .config 文件值
- [x] Reset：点 Reset → 确认 → 恢复 Kconfig 默认值
- [x] Refresh：点刷新 → 从磁盘重新加载，保留展开状态
- [x] 搜索：输入关键字 → 过滤配置项

### GUI Config — 交互
- [x] 展开/折叠菜单正常
- [x] 修改 bool / tristate / string / int / hex / choice 各类型
- [x] ? 详情面板显示配置信息和 help 文本
- [ ] *深浅主题切换（☀/☾）→ 关闭再开记住偏好* ------失败
- [x] 弹窗按钮颜色随主题变化（浅色 navy / 深色 pink）

### GUI Config — 高级
- [x] Choice 类型默认值正确显示
- [x] Choice 子项不出现在表格行中
- [x] Reset 后 choice 恢复默认值
- [x] Discard 后展开状态保留
- [x] 无过场动画（刷新/Discard/Reset 不触发 splash）

### 终端命令
- [x] Build → 前台 IMDE 终端执行
- [x] Configure → 前台 IMDE 终端执行
- [x] Clean / FullClean → 前台 IMDE 终端执行
- [x] Doctor → 前台 IMDE 终端执行
- [x] Menuconfig → 前台终端执行，自动检测 configure
- [x] 终端窗口 reload 后复用不新建

### 底栏
- [x] IMDE 按钮 → Run Doctor
- [x] Rebuild 按钮 → FullClean → Build 连续执行
- [x] Select 按钮 → 打开 defconfig 选择器
- [x] Config 按钮 → 打开 GUI Config

### 构建错误
- [x] 构建失败时输出通道不刷完整 Python traceback
- [x] Problems 面板显示结构化错误列表，可点击跳转

### 平台兼容
- [x] Windows：wrapper 脚本 (.cmd/.bat) 正常工作
- [x] macOS：wrapper 脚本自动 chmod +x
- [x] Linux：login shell PATH 探测正常

## 0.2.2

- Added initial IMDE tree views, commands, artifacts view, and GUI Config panel.
