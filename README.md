# Token Monitor

把 **DeepSeek 余额与用量**放在桌面上的小仪表：日常缩成条带，需要时展开账本，用 `30D / 7D` 两种消费节奏估算「还能用多久」。

**界面仅有中文，含部分英文标签，没有翻译版。** 基于 Electron 45、原生 DOM 与 SVG；无需中转服务器，不做遥测。

![展开后的账本](shots/deck.png)

## 界面与功能

- **条带 / 账本**：余额、今日消费、双节奏跑道与预计见底日期。
- **用量明细**：近 30 天花费曲线、tokens、模型构成、缓存命中率、请求数与有效单价。
- **桌面交互**：拖动、置顶、系统托盘、形态切换；透明窗口效果依平台而异。
- **显示与隐私**：浅色 / 深色 / 跟随系统，一键隐藏金额；默认提供本地演示数据。
- **同步**：手动刷新，或每 30 秒 / 1 分钟 / 5 分钟刷新。

![条带形态](shots/strip.png)

| 设置抽屉 | 深色主题 |
| --- | --- |
| ![设置](shots/settings.png) | ![深色](shots/dark.png) |

![未连接状态](shots/empty.png)

运行截图仅作界面参考，不代表本轮或跨平台回归结果：

| 运行中的条带 | 运行中的账本 |
| --- | --- |
| ![运行条带](shots/live-strip.png) | ![运行账本](shots/live-deck.png) |

## 下载与运行

发布后可从 [GitHub Releases](https://github.com/A-Bullrager/token-monitor/releases) 下载；开发构建在 Actions 运行页的 Artifacts 中。
**云端两轮（`9faa78e`、`4fb1d4d`）：Windows x64 始终全绿；Linux 与两个 macOS 架构仍有失败，Release 未创建，因此上表暂无可下载产物。** 已定位的原因与修复见「测试与验证范围」。

| 平台 | 程序包 | 使用方式 |
| --- | --- | --- |
| Windows x64 | portable ZIP | 解压整个目录，运行其中的 `Token Monitor.exe`；不要把 exe 单独搬出目录 |
| Linux x64 | AppImage | 赋予可执行权限后，在有图形桌面的环境运行 |
| macOS Apple Silicon | arm64 DMG + ZIP | DMG 内的应用复制到「应用程序」，或解压 ZIP 后使用 |
| macOS Intel | x64 DMG + ZIP | 选择 x64 包，不与 arm64 混用 |

### 平台注意事项

- **macOS**：当前为 ad-hoc 签名（`identity: '-'`），且 `notarize: false`；不是 Developer ID 签名，也未公证。浏览器下载后可能被 Gatekeeper 拦截。
- 下载后先校验发布页的 `SHA256SUMS.txt`。仅在信任来源时，按系统提示到「系统设置 → 隐私与安全」允许打开；若系统不允许，不要强行绕过。校验和不等于开发者身份认证。
- **Linux**：需要图形桌面及 Electron 依赖，如 GTK、NSS、ATK、GBM、ALSA；凭证保护还需要可用的桌面密钥环服务。依赖名称和 FUSE 安装方式请遵循发行版文档。
- GNOME 可能需要 AppIndicator / KStatusNotifierItem 托盘扩展。透明窗口、置顶和托盘行为依桌面、合成器及 Wayland 环境而异，不保证一致。
- 本轮已在 Windows 10 x64 通过源码、便携目录和实际 ZIP 解包启动检查；Linux / macOS 尚未原生运行，不能标为已验证支持。

## 从源码运行

需要 **Node.js ≥ 22.12.0，推荐 Node.js 24**，以及 npm。在仓库根目录执行：

```bash
npm ci
npm start
```

`npm start` 会为子进程移除残留的 `ELECTRON_RUN_AS_NODE`，避免 Electron 退化为无窗口的 Node 模式。

### 本地打包

请在对应平台构建；首次构建前可运行 `npm run icons` 生成打包图标。

| 命令 | 目标与输出 |
| --- | --- |
| `npm run package:dir` | 本机平台与架构的目录版，输出到 `dist/Token Monitor-<platform>-<arch>/` |
| `npm run package:win` | 仅生成 Windows x64 目录版（`dist/`），不压缩 |
| `npm run package:win:zip` | **仅 Windows x64 宿主**；打包目录后压成 `release/token-monitor-<version>-win-x64.zip`，与 CI 使用同一脚本 |
| `npm run package:linux` | Linux x64 AppImage，输出到 `release/` |
| `npm run package:mac` | macOS DMG + ZIP，默认使用宿主架构，输出到 `release/` |

macOS 可显式选择 `npm run package:mac -- --arm64` 或 `npm run package:mac -- --x64`；构建不等于已在目标架构运行验证。
`test:distributable` 需要 `release/` 中实际存在对应程序包，不能用目录版代替；它会先比较归档与源码的修改时间，**比源码旧的程序包直接判失败**——曾经有一次本地「验证通过」其实跑的是上一版代码留下的 ZIP。

## 接入 DeepSeek 账户

1. 打开设置，先确认底部的凭证存储提示。
2. 在 [DeepSeek API Keys](https://platform.deepseek.com/api_keys) 创建 **API Key**，用于官方余额接口。
3. 要获取用量与跑道，登录 [平台用量页](https://platform.deepseek.com/usage)，打开开发者工具的 Network，刷新页面。
4. 在 `api/v0` 请求的 `Authorization` 中复制 `Bearer` 后的 **Session Token**；也可整段粘贴，应用会清理前缀。
5. 关闭「使用演示数据」，保存并同步。Session 过期后需手动更新。

**API Key 只能读取余额。跑道需要余额和 Session Token 提供的用量数据；仅填 API Key 无法计算跑道。**
Session Token 是敏感凭证，不要放进截图、日志、Issue 或公开仓库。

## 指标口径

| 指标 | 算法 / 来源 |
| --- | --- |
| 账户总余额 | 官方 `GET https://api.deepseek.com/user/balance`，优先 CNY 账户 |
| 今日花费 / tokens | 平台按日数据，取本地日历的今天 |
| 近 30 天花费 / tokens | 含今天的 30 个自然日，必要时合并上月数据 |
| 30D 日均 | 近 30 天总消费 ÷ 有消费的活跃日数 |
| 30D 跑道 | 总余额 ÷ 30D 日均 |
| 7D 日均 | 近 7 个自然日总消费 ÷ 7，零消费日也计入 |
| 7D 跑道 | 总余额 ÷ 7D 日均 |
| 见底日期 | 本地今天加上四舍五入后的跑道天数，属于估算 |
| 预计月耗 | 当前所选节奏的日均 × 30 |
| 有效单价 | 近 30 天总费用 ÷ tokens × 1,000,000 |
| 缓存命中率 | `hit ÷ (hit + miss + 普通 prompt/input) × 100%`，按输入 tokens 统计 |
| 请求数 / 模型构成 | 在相同 30 天窗口聚合；模型行提供各模型缓存命中率提示 |

日均为零或缺少必要数据时，不给出有效跑道估计；消费样本偏少会提示「仅供参考」。
平台用量来自未公开的内部接口 `/api/v0/usage/amount` 与 `/api/v0/usage/cost`（域名 `platform.deepseek.com`，按月请求）。
字段、鉴权及数据延迟可能变化；上月请求失败时当前实现继续使用可取得的数据，30 天统计可能不完整。

## 安全与本地配置

凭证经 preload 桥交给主进程，保存后只向界面返回掩码。`safeStorage` 是否可用取决于当前平台和桌面服务：

| 平台 | 可用时采用的保护 |
| --- | --- |
| Windows | DPAPI |
| macOS | Keychain |
| Linux | 真实的 `gnome_libsecret` 或 KWallet（`kwallet` / `kwallet5` / `kwallet6`）后端 |

Linux 的 `basic_text`、`unknown` 及其他不受认可或不可用的后端均按 `none` 处理。
**系统加密不可用时，仍沿用 `plain:` + base64 的落盘回退；这不是加密，能读取配置文件的人可以还原凭证。** UI 会显示「未加密 · 系统加密服务不可用」警告；不接受此方式时请勿保存真实凭证。

**探测是懒加载且异步的。** 可用性检查（`isAsyncEncryptionAvailable`，缺失时才退回同步 API）只在打开设置抽屉时发起，启动路径一律不碰钥匙串——macOS 上钥匙串锁住或等待授权时，同步调用会把主进程整条挂死（首次云端运行正是这样卡住的）。因此：

- 还没得到答案时，存储标签保持中性的「只保存在本机」，既不承诺加密，也不谎报未加密。
- 后端状态未知时提交**新凭证**会被拒绝并提示「系统加密状态未确认，凭证未保存」，不会静默降级成明文；只改主题、节奏、置顶或形态则照常保存。
- 未改动的凭证沿用磁盘上原有的密文，不会因为一次无关的保存被重新加密或降级；`plain:` 旧值只有在确认后端可靠后才会升级为 `enc:`。
- 真实钥匙串仍只在 Windows DPAPI 上做过端到端验证；macOS / Linux 的钥匙串路径未在真机验证过。

日常配置文件位置（不含测试使用的隔离 profile）：

| 平台 | `config.json` 路径 |
| --- | --- |
| Windows | `%APPDATA%\Token Monitor\config.json` |
| macOS | `~/Library/Application Support/Token Monitor/config.json` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/Token Monitor/config.json` |

设置中凭证留空表示保留旧值；「清除凭证」会清空两项并切回演示模式。
账户请求直接发往 `api.deepseek.com` / `platform.deepseek.com`；没有中转服务器或统计上报。图标、字体与演示数据均为本地资源。

## 测试与验证范围

**本地验证（Windows 10 x64）：** 数据测试、21 组模拟存储后端断言、源码 UI、便携目录和实际 ZIP 解包启动均通过；9 个语言 / 时区场景、共 36 个界面状态通过，采集的字符均在语料内。另用 fontTools 检查现有语料的实际字体 cmap，未发现覆盖缺口。

**云端第一轮（`9faa78e`，四个原生 runner）：** Windows x64 全绿；Linux x64 在 `ar-SA` 场景把「退出时调试连接先于回复关闭」误判为失败；两个 macOS 架构打包与严格验签成功，但发布物启动校验在首个 CDP 往返超时。

**云端第二轮（`4fb1d4d`）：** Windows x64 仍全绿；Linux 语言测试转绿，失败点变成打包文件名——electron-builder 实际产出 `linux-x86_64.AppImage`，与验包脚本和 Release 契约要求的 `linux-x64` 不一致；两个 macOS 架构仍在同一处超时，但这次带回了进程栈证据：主线程 80/80 次采样停在 `SecItemCopyMatching → SecurityServer → mach_msg`，即启动路径上的**同步钥匙串读取**把主进程整条挂死（源码测试用未签名 Electron，其钥匙串条目在 runner 上已授权，所以只有打包应用会撞上）。

**据此已做的修复：** 退出竞态只放行该一种情况且仍要求进程以 0 退出；等宽标签补上打包的 MiSans 回退并用 CDP 校验真实生效字体；Linux 产物名固定为 `linux-x64`；钥匙串探测改为「打开设置时异步发起」，启动路径不再触碰（见「安全与本地配置」）。这些修复在本地 Windows 全绿，**macOS 的修复效果尚待下一轮云端运行确认**。

| 命令 | 检查范围 |
| --- | --- |
| `npm test` | 依次运行数据、存储、UI、语言环境测试 |
| `npm run test:parse` | 数据解析、聚合、双节奏与边界情况，无需图形界面 |
| `npm run test:store` | 21 组模拟系统后端断言：懒探测、pending 拒写、密文沿用与 `plain:` 升级；不代替真实密钥环验证 |
| `npm run test:ui` | 形态、主题、隐私、设置、凭证存储分支与清除、重启还原、形变采样 |
| `npm run test:i18n` | 下述 Chromium 语言 / 时区与字体加载检查，不是翻译测试 |
| `npm run test:packaged` | `dist/` 目录版启动、字体、版本和形态还原 |
| `npm run test:distributable` | 从 `release/` 的实际 ZIP / DMG / AppImage 解包并启动其中的可执行文件，不回退到 `dist/` |
| `npm run render:live` | 运行取证与截图；`npm run shots` 更新展示截图 |

回归使用隔离配置目录和演示数据；凭证错误路径会尝试用无效测试 Key 请求 DeepSeek，可接受鉴权或网络失败，不是完全离线测试，也不是有效真实账户的正样本验证。
形变（morph）的亮度代理指标是 `min(每帧 max(条带 opacity, 账本 opacity))`，不是两层 opacity 之和；该采样也不证明所有环境都无重影。

### 语言环境与字体检查

`test:i18n` 共启动 **9 次**：

- 请求七种 Chromium 语言：`zh-CN`、`en-US`、`ja-JP`、`de-DE`、`fr-FR`、`ko-KR`、`ar-SA`。后五种在本机实际规范化为 `ja / de / fr / ko / ar`，报告同时保留请求值和实际值。
- 另两次通过 CDP 模拟 Chromium 时区：`Pacific/Kiritimati`（UTC+14）与 `Pacific/Niue`（UTC−11），不改变宿主或主进程时区。
- 每次使用独立、含中文与空格的 profile，检查配置落盘；遍历浅色条带、浅色账本、设置、深色账本四个状态。
- 余额、跑道、今日花费、tokens 的固定演示数值文本与 `zh-CN` 基准比较；不要求时钟、日期与日期相关标签相同。
- 检查 Inter / MiSans 的 FontFace 加载状态，采集的 DOM 字符是否属于 `scripts/font-corpus.txt` 语料；并通过 CDP `CSS.getPlatformFontsForNode` 读取「会话」标签实际命中的平台字体，确认它使用打包的 MiSans 子集（Windows 实测：修复前落到系统 NSimSun，Linux runner 上直接显示方框）。

这些检查**不证明字体 cmap 完整覆盖、所有 fallback 字形、原生菜单、其他宿主 OS 语言版本或真实密钥加密**；语言测试本身不填写凭证，也不做加解密往返。
界面数字分组固定 `en-US`、时钟为 `zh-CN` 24 小时制，保留中文大数单位；这不代表提供英文或其他语言 UI。

## GitHub Actions 与发布

工作流见 [`.github/workflows/build.yml`](.github/workflows/build.yml)。四个 runner 的行为已有首次真实运行记录（见「测试与验证范围」），Release 分支逻辑尚未跑到。
本地 `git commit` 不会触发云端任务；需要 push、PR 或手动触发。GitHub Packages 面向 npm / 容器等包仓库，本项目的桌面程序使用 Artifacts 和 Release 附件分发。

| 触发方式 | 行为 |
| --- | --- |
| 向 `main` push / 面向 `main` 的 PR | 测试、打包、验证发布物，上传 Artifacts，不创建 Release |
| 手动 `workflow_dispatch` | 同样测试与打包，不创建 Release |
| push `v*` tag | tag 必须严格等于 `v` + `package.json` 的版本，四个 runner 全部成功后才发布 Release |

四个 runner 为 `windows-2022` x64、`ubuntu-22.04` x64、`macos-15` arm64、`macos-15-intel` x64，使用 Node.js 24。
Linux UI 在 Xvfb + Openbox 虚拟 X11 桌面运行，不代表 GNOME / Wayland 等实际桌面均已验证。
程序包 Artifacts 保留 **14 天**，测试诊断保留 7 天；下载 Artifacts 后可能还需解开外层归档。

Release 需包含六件程序包及 `SHA256SUMS.txt`，文件前缀为 `token-monitor-<version>-`：

- `win-x64.zip`、`linux-x64.AppImage`
- `mac-arm64.dmg`、`mac-arm64.zip`
- `mac-x64.dmg`、`mac-x64.zip`

tag 带 `-`（如 `v2.4.0-beta.1`）会标为预发布；普通版本 tag 发布正式版。已有公开 Release 不应覆盖，请使用新版本。

### 启用与日后发布

1. 在仓库设置中启用 Actions，并确认组织策略允许所用 runner、第三方 Actions 与发布权限。
2. 工作流必须先存在于**默认分支**，Actions 页才可手动运行它；选择 **Build desktop apps → Run workflow**。
3. 无需配置 PAT：Release job 已声明 `contents: write`，使用自带的 `GITHUB_TOKEN`；组织策略仍可能限制执行或授权。
4. 用户明确确认后才提交 / 推送。云端结果以实际运行为准，不把本地修改当作已上线。

**tag 建议单独推送。** 本仓库实测：`git push --atomic origin main refs/tags/v2.4.0` 只产生了 `main` 的一次运行，`v2.4.0` 没有对应的 tag 运行，Release 也没创建。官方文档只写明「一次推送超过三个 tag 不会创建事件」，并未定义分支与 tag 同推时的行为，所以这里把同推视为不可靠路径：先推代码，确认工作流已在默认分支，再单独推 tag。

```bash
git push origin main          # 第一步：让四个 runner 先在新提交上跑绿
git push origin v2.4.1        # 第二步：单独推 tag，才会触发 Release 流程
```

tag 必须等于 `v` + `package.json` 的 `version`，且四个 runner 全部成功；已有公开 Release 不会被覆盖。
GitHub 官方文档：[托管 runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) · [Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts) · [触发事件](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)。

## 项目结构与限制

- `main.js` / `preload.js`：窗口、托盘、IPC 与最小化桥接。
- `lib/deepseek.js` / `lib/store.js`：账户接口、指标聚合与配置存储。
- `renderer/`：界面、样式、图表、本地字体；`scripts/`：启动、打包与回归。
- `shots/`：展示与运行截图；`dist/` 为目录版，`release/` 为可分发程序包。

仅支持 DeepSeek，不做多平台聚合、多设备同步、自动登录、开机自启或自动更新。
演示数据不代表真实账户；费用与用量依赖平台返回值及本地日期，预测不能当作消费承诺。

## 参考与许可

参考项目：[token-monitor](https://github.com/Javis603/token-monitor)、[agent-sessions](https://github.com/jazzyalex/agent-sessions)、[CodexBar](https://github.com/steipete/CodexBar)。

项目代码采用 [MIT](LICENSE)。字体遵循各自许可，不由项目 MIT 许可覆盖：

- **Inter**：rsms 提供，采用 SIL OFL 1.1；使用、子集化与再分发须保留许可及版权声明，见 [OFL-Inter.txt](renderer/assets/font/licenses/OFL-Inter.txt)。
- **MiSans**：由小米提供，字形由汉仪制作；本项目使用子集并保留 README、应用「设置 → 关于」及 [MiSans-Notice.txt](renderer/assets/font/licenses/MiSans-Notice.txt) 中的署名。
- MiSans 的子集化与公开再分发是否符合许可，仍需核对[官方协议与下载页](https://hyperos.mi.com/font/download)及具体用途。保留署名、未改字形或仅随应用分发，都**不能保证已完全解决授权问题**；以官方协议原文为准。
