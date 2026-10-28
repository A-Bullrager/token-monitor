# Token Monitor

一块把 **DeepSeek 账户余额**变成「跑道」的桌面仪器。界面参考 Apple 的克制美学：中性系统色、单一强调色、Activity 环式表盘。常驻时只有一条横向条带；需要细看时，它展开成一份完整的账本。

![展开后的账本](shots/deck.png)

## 为什么是跑道

多数 token 监控工具回答「今天花了多少」。真正让人心里有数的问题是「还能撑多久」。Token Monitor 把余额除以消费速度，得到一个以**天**为单位的 runway，并把它放在界面的第一视觉层：

- **双节奏**：`30D` 用近 30 天里有消费的活跃日取平均；`7D` 用近 7 个自然日取平均。两种算法并置，最近突然加速或放缓都能立刻看见。
- **会落到日期**：跑道不是抽象数字，旁边直接给出「约 11 月 16 日见底」。
- **形态也是信息**：工作时缩成条带，只看跑道；想深究时从右上角展开成账本，而不是再开一个窗口。
- **材质不是装饰**：系统级中性色、系统蓝强调色、Activity 环式跑道与克制的图标字形，让它看起来更像 macOS 的原生小组件，而不是一块自定义发光面板。

## 两种形态

### 条带 · 日常驻留

面板 464 × 140。只保留 runway、余额、日均、今日消费、14 天迷你曲线和同步状态。整条面板可以拖动，启动时以非激活方式出现，不抢当前窗口的焦点；系统托盘里可以随时展开、收起、刷新或退出。

![条带形态](shots/strip.png)

### 账本 · 展开细看

面板 504 × 806。包含：

- 径向跑道仪表，`30D / 7D` 节奏切换与见底日期
- 账户余额、充值 / 赠金构成
- 今日花费、当前日均、近 30 天窗口与 tokens
- 近 30 天每日花费曲线：峰值、均值、最后 7 天区段、悬停单日明细
- 模型构成与有效单价（每 1M tokens 的实际花费）
- 30D / 7D 双跑道对照与预计月耗

| 设置 | 深色 |
| --- | --- |
| ![设置](shots/settings.png) | ![深色](shots/dark.png) |

![未连接状态](shots/empty.png)

### 实际运行检查

在 Windows 10、逻辑分辨率 1920 × 1200（150% 缩放）上实际启动便携版做了实测：

- 条带窗口 536 × 212（面板 464 × 140），账本窗口 576 × 880（面板 504 × 806）。四周多出来的 36px 是透明外边，专门给外阴影留的衰减空间。
- 卡片右侧那条“内阴影”的真凶不是外阴影，而是**收起状态的设置抽屉**：它平移出卡片 103%，但 `-18px 0 44px` 的投影仍然从右边倒射回来，在卡片内侧留下一条约 56px 的灰带。现在抽屉收起时直接 `visibility: hidden`（关闭动画播完才隐藏），投影也减到 `-14px 0 34px / 10%`。实测卡片左右两侧内部 4–44px 的亮度都是 255，完全对称；外侧 alpha 衰减左右同为 `13, 8, 5, 3, 1, 1`，阴影确实落在卡片之外。
- 面板用不透明白卡 + 均匀 1px 发丝线，不再用渐变描边。设置抽屉 715px 内容对 715px 视口，刚好放满，没有滚动条。
- Inter 与 MiSans 都从本地子集加载；跑道环 19.8 / 30 对应进度弧 166.63 / 490，条带里的进度条同色同值。
- 形态切换：动画期间条带和账本**同时绘制**，各自固定在自己的静止高度（不会被移动的窗口边缘拉伸），主进程用 `cubic-bezier(0.4, 0, 0.2, 1)`、300ms 推动窗口边界，内容层用同一条曲线交叉淡入淡出并带一点缩放落位。逐帧采样显示最暗处两层不透明度之和仍有 0.50，不会再出现空白的白卡。`node scripts/morph-cast.mjs` 可以逐帧复查，`npm run test:ui` 里的 morph 断言守住这条底线。
- 账本内容重排：图表从 145px 提到 176px（保持 1 个 SVG 单位 = 1 CSS px，曲线不会被非等比拉伸），窗口高度相应从 896 收到 880，底部原本约 65px 的空档只剩 18px。
- 图标：`build/icon.ico` 含 16 / 24 / 32 / 48 / 64 / 128 / 256 七层 32bpp；从打包好的 exe 里取出的 32px 图标与 `renderer/assets/img/icon-32.png` 逐像素一致（0 个色差），四角 alpha 为 0。若 Explorer 仍显示旧图标，那是系统图标缓存，`ie4uinit.exe -show` 或重启资源管理器即可。

| 实际运行 · 条带 | 实际运行 · 账本 |
| --- | --- |
| ![实际运行的条带](shots/live-strip.png) | ![实际运行的展开账本](shots/live-deck.png) |

## 功能

- **余额跑道**：30 天活跃日 / 近 7 天自然日两种节奏，一键切换
- **余额构成**：充值余额与赠金余额的分段条和图例
- **每日账本**：近 30 天花费曲线，自动跨月取数
- **模型构成**：按模型汇总 tokens 与费用，并计算有效单价
- **缓存命中与请求数**：解析平台返回的 cache hit / miss 与 request，给出 30 天缓存命中率；悬停模型行可看该模型的命中率
- **到位状态**：消费日不足时明确标注样本偏少，不把估算包装成精确结论
- **系统托盘**：展开账本、收起条带、刷新、设置、显示 / 隐藏、退出；悬停托盘图标可看当前跑道天数
- **隐私模式**：隐藏所有金额，只保留结构和比例
- **桌面体验**：无边框、置顶、右上角锚定展开、单实例
- **主题**：浅色 / 深色 / 跟随系统，设置里可预览，关闭不保存
- **安全存储**：凭证只在主进程解密，落盘前经 Windows DPAPI 加密
- **自动刷新**：30 秒 / 1 分钟 / 5 分钟，也可以随时手动刷新

## 运行

Windows 便携版：

```text
dist\Token Monitor-win32-x64\Token Monitor.exe
```

也可以双击根目录的 `start.cmd`，它会优先启动便携版；没有构建产物时回退到源码模式。

从源码运行：

```bash
npm install
npm start
```

其他命令：

```bash
npm run showcase      # 带渐变场景的展示窗口
npm run shots         # 重新生成 deck / strip / settings / dark / empty 截图
npm run test:parse    # 数据口径与聚合测试
npm run test:ui       # 隔离配置目录的界面回归测试
npm run package:win   # 重新打包 Windows 便携版
npm run test:packaged # 校验 dist 中的便携版能否启动与还原形态
npm run render:live   # 真实启动并截图/记录条带、账本、设置、深色的实测数据
node scripts/morph-cast.mjs   # 逐帧录制形态切换（窗口尺寸 / 两层不透明度 / 卡片几何）
```

慢放录制便于看清单帧：`TM_MORPH_MS=1800 node scripts/morph-cast.mjs`（配合 `TM_MORPH_DEBUG=1` 打印主进程每次窗口变更）。

> 如果当前 shell 设置了 `ELECTRON_RUN_AS_NODE=1`，直接执行 `npx electron .` 会进入纯 Node 模式。项目的启动器会在子进程里移除该变量，使用 `npm start` 即可。

## 接入真实账户

1. 打开设置（顶部状态、齿轮，或快捷键 `Ctrl + ,`）。
2. **API Key（必填）**：在 [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 创建，用于官方余额接口。
3. **Session Token（可选，但用量明细必填）**：
   - 登录 [platform.deepseek.com/usage](https://platform.deepseek.com/usage)；
   - `F12` → Network，刷新页面，打开任意一个 `api/v0` 请求；
   - 复制 `Authorization` 中 `Bearer` 后面的部分（可整段粘贴，应用会自动清理前缀）。
4. 关闭「使用演示数据」，保存并同步。

DeepSeek 的 API Key 只能读取余额，不能读取平台用量；所以只看跑道数字时填 API Key 即可，要看今日、30 天和模型构成还需要 Session Token。Token 过期后重新复制即可。

## 数据口径

| 指标 | 来源与算法 |
| --- | --- |
| 账户总余额 | 官方 `GET https://api.deepseek.com/user/balance`，优先 CNY 账户 |
| 今日花费 / tokens | 平台按日用量与费用的本地日期当天 |
| 近 30 天花费 / tokens | 最近 30 个自然日，自动合并上一个月 |
| 30D 日均 | 近 30 天总消费 ÷ **有消费的天数** |
| 30D runway | 总余额 ÷ 30D 日均 |
| 7D 日均 | 近 7 个自然日总消费 ÷ 7（零消费日也计入） |
| 7D runway | 总余额 ÷ 7D 日均 |
| 见底日期 | 今天 + 当前跑道天数，按本地时区取整 |
| 预计月耗 | 当前所选节奏的日均 × 30 |
| 有效单价 | 近 30 天总费用 ÷ 近 30 天 tokens × 1,000,000 |
| 缓存命中率 | 近 30 天输入 tokens 中命中缓存的占比：hit ÷（hit + miss + 未命中 prompt） |
| 请求数 | 平台返回的 `REQUEST` 计数，按同一个 30 天窗口求和 |
| 模型缓存命中 | 每个模型在同一窗口内的命中率，显示在模型行的悬停提示里 |
| 每日曲线 | 近 30 天每日费用；最后 7 天单独着色；悬停显示费用与 tokens |

用量来自平台网页控制台使用的内部接口：

- `GET https://platform.deepseek.com/api/v0/usage/amount?month=M&year=Y`
- `GET https://platform.deepseek.com/api/v0/usage/cost?month=M&year=Y`

这些接口**未在官方文档中公开**，字段或鉴权方式可能变化。余额接口则是官方公开接口。

## 安全与隐私

- 凭证经最小化的 preload 桥进入主进程；保存后不再回传渲染层，设置页只显示 `sk-••••1234` 形式的掩码。
- 写入磁盘前使用 Electron `safeStorage`（Windows 上为 DPAPI）加密，配置文件位于 `%APPDATA%\Token Monitor\config.json`。
- 应用只会在刷新或测试连接时请求 `api.deepseek.com` 与 `platform.deepseek.com`；没有中转服务器、统计上报或第三方请求。
- 设置里留空会保留旧凭证；「清除凭证」会同时清空两项并切回演示模式。
- 展示背景、图标和演示数据全部在本地。

## 快捷键

| 快捷键 | 功能 |
| --- | --- |
| `Ctrl/Cmd + R` | 刷新账户 |
| `Ctrl/Cmd + ,` | 打开设置 |
| `E` | 展开 / 收起账本 |
| `Esc` | 关闭设置；再按一次收起账本 |

## 已知限制

- 只适配 DeepSeek；多平台聚合尚未实现。
- 平台用量接口未公开，若失效需要更新 `lib/deepseek.js`；余额与错误状态仍可正常显示。
- Session Token 需要手动更新，没有自动登录或 Cookie 抓取。
- 演示数据是固定样本，只用于展示界面，不代表任何真实账户。
- 缓存命中与请求数依赖平台返回对应字段；若某个窗口缺少这些字段，界面会退回只显示时间范围。
- 暂无开机自启和自动更新。
- 已在 Windows 10（19045）验证；窗口使用 CSS 合成材质，不依赖系统 Acrylic / Mica。Windows 11 预期可用但未实测。
- 本次构建的自动化回归使用演示数据和一枚无效测试 Key，未使用真实账户做正样本验证；真实余额与用量展示取决于本地凭证和平台接口。
- 费用与 token 的统计完全依赖平台返回值与本地时区；平台数据延迟时界面会随之延迟。

## 项目结构

```text
token-monitor/
├── main.js                  # 窗口双形态、IPC、加密配置、展示/截图模式
├── preload.js               # 最小化 contextBridge API
├── lib/
│   ├── deepseek.js          # 余额 / 平台用量接口、30 天聚合、双节奏指标
│   ├── demo.js              # 可复现的演示数据
│   └── store.js             # DPAPI 加密配置存储
├── renderer/
│   ├── index.html
│   ├── styles.css           # Apple 风格材质、条带 / 账本、图表与设置抽屉
│   ├── app.js               # 渲染、图表、交互、设置、自动刷新
│   └── assets/
│       ├── font/            # 三套字体子集与 OFL 许可证
│       └── img/             # 窗口 / 托盘图标
├── scripts/
│   ├── launch.mjs           # 规避 ELECTRON_RUN_AS_NODE 的启动器
│   ├── shots.mjs            # 五种展示截图
│   ├── test-parse.mjs       # 数据层测试
│   ├── ui-smoke.mjs         # 隔离配置的界面回归（双形态、主题、凭证）
│   ├── packaged-check.mjs   # 便携版启动与形态还原校验
│   ├── live-render.mjs      # 实际运行截图与渲染数据
│   └── morph-cast.mjs       # 逐帧录制形态切换，验证卡片不会变空、视图不被拉伸
├── shots/                   # 演示截图
└── dist/                    # Windows 便携版
```

## 设计与开源参考

界面、信息架构和实现均为本项目重新设计。这一轮重新调研了 AI 用量监控类开源项目，重点看它们的产品形态、指标取舍和状态表达：

- [Javis603/token-monitor](https://github.com/Javis603/token-monitor)（3.4k★）— 47 种工具、多设备同步，以及一整套“在你视线所及之处”的形态：刘海面板、屏幕边缘 Dock、菜单栏 / 托盘、悬浮气泡、系统小组件；还提供缓存命中拆分与实时 tok/s。
- [xiufengsun/TokenTracker](https://github.com/xiufengsun/TokenTracker)（2.1k★）— 本地日志解析、4 个桌面小组件、桌面宠物与成就；仪表盘里有 input / output / cached / reasoning 的逐日表格和活动热力图。
- [Maciek-roboblog/Claude-Code-Usage-Monitor](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) — 以 burn rate 为核心，P90 自动推断限额、带重置感知的节奏预测，以及 `indeterminate / near limit / limit hit` 这类机器可读状态。
- [jazzyalex/agent-sessions](https://github.com/jazzyalex/agent-sessions) — 明确提出 “Session Runway”：按 5 小时 / 周窗口显示每个会话的 burn 和剩余时间，并在数据不足时给出 `measuring / unavailable / exhausted`，而不是编造数值。
- DeepSeek 专项：[Yi-Lings/deepseek-api-usage-checker](https://github.com/Yi-Lings/deepseek-api-usage-checker)、dsh-meter、DeepSeek Usage Panorama 等，普遍把 **cache hit / miss、请求数、分模型用量**当作核心读数。
- [Leiuo/deepseek-monitor](https://github.com/Leiuo/deepseek-monitor)、[Joyi-code/DeepSeekMonitorWindows](https://github.com/Joyi-code/DeepSeekMonitorWindows)、[steipete/CodexBar · docs/deepseek.md](https://github.com/steipete/CodexBar/blob/main/docs/deepseek.md) — 余额 / 用量接口与 Windows 监控形态的参考。

这一轮真正影响产品的四个判断：

1. **“剩余多久”比“花了多少”更有用。** 多家项目都在做 burn rate / runway / reset forecast，说明我们以跑道为第一指标是对的；我们把它做成常驻读数，并给出见底日期。
2. **数据不足时要明说。** 受 agent-sessions 启发，当消费日太少时标注“仅 N 个消费日”，不把小样本外推伪装成精确结论。
3. **DeepSeek 的缓存命中率值得上桌。** 缓存命中与请求数是 DeepSeek 生态里被反复追踪的专属指标，我们把它做进模型构成区，并在模型行悬停时给出各自的命中率。
4. **常驻工具需要一个托盘。** 参考项目的菜单栏 / 托盘 / 边缘形态说明：桌面仪器不该只有一扇窗。我们加入系统托盘，但不扩散成一整套多形态矩阵。

明确不做的部分：多工具聚合、会话级记录、多设备同步、桌面宠物与成就、KPI 卡片阵列和热力图。它们属于另一个产品（广度型监控台）；Token Monitor 只想把**一个 DeepSeek 账户的余额跑道**做到足够准、足够安静。

视觉上多数同类项目选择深色玻璃、配额进度条和柱状 / 热力图；本项目改用 Apple 风格的系统中性色与 Activity 环式跑道，并保留单一跑道指标和条带 / 账本双形态。

字体：

- Inter 子集 — SIL Open Font License，见 `renderer/assets/font/licenses/OFL-Inter.txt`
- MiSans 子集 — 小米 MiSans 字体许可，取自本地授权字体文件

应用图标由本项目绘制：48px 以上使用完整表盘，16 / 24 / 32px 使用加粗的小尺寸字形；窗口、托盘和 exe 共用同一轮廓。尺寸对照见 `shots/icon-sizes.png`，旧版四角发黑的对照见 `shots/icon-before-after.png`，从便携版 exe 里直接取出的 32px 图标与源图并排见 `shots/icon-check.png`。展示背景是 CSS 渐变，不依赖位图素材。

## License

MIT
