<p align="right"><strong>EN</strong> | <a href="./README.zh-CN.md">简体中文</a></p>

# Token Monitor

A small desktop instrument for your **DeepSeek balance and usage**: it rests as a strip, expands into a ledger, and estimates *how long your money lasts* using two spending paces (`30D / 7D`).

The interface ships in **Chinese and English**. `Auto` follows the system language — Chinese stays Chinese, everything else gets the English interface — and you can pin either language in Settings. Built on Electron 45 with plain DOM and SVG. No proxy server, no telemetry. [简体中文文档](README.zh-CN.md)

![The expanded ledger](shots/deck-en.png)

## What it shows

- **Strip / ledger**: balance, today's spend, two runway paces and an estimated depletion date.
- **Usage detail**: 30-day spend curve, tokens, model mix, cache hit rate, request counts and effective unit price.
- **Desktop behavior**: draggable, pin on top, system tray, two window forms; transparent-window effects vary by platform.
- **Display and privacy**: light / dark / system, one click to hide amounts, local demo data by default.
- **Sync**: manual refresh, or every 30 seconds / 1 minute / 5 minutes.

![The strip](shots/strip-en.png)

| Settings drawer | Dark theme |
| --- | --- |
| ![Settings](shots/settings.png) | ![Dark](shots/dark.png) |

![Disconnected state](shots/empty.png)

Screenshots illustrate the interface; they are not a statement about any particular test run:

| Strip in a live window | Ledger in a live window |
| --- | --- |
| ![Live strip](shots/live-strip.png) | ![Live deck](shots/live-deck.png) |

## Download and run

Releases: [GitHub Releases](https://github.com/A-Bullrager/token-monitor/releases). Development builds are in the Artifacts of each Actions run.
**The current published release is [v2.4.1](https://github.com/A-Bullrager/token-monitor/releases/tag/v2.4.1)**: all four native runners green, six packages plus `SHA256SUMS.txt`. The Windows package was re-downloaded from that page, checked against the checksum list, extracted and launched on a real Windows 10 machine. The Linux and macOS packages are covered by their own runners only.
**The bilingual 2.5.0 has been built and tested green on all four runners (`d62fc57`) but is not tagged or published yet**, so the release page currently offers 2.4.1.

| Platform | Package | How to run it |
| --- | --- | --- |
| Windows x64 | portable ZIP | Extract the whole directory and run `Token Monitor.exe` from it; do not move the exe out on its own |
| Linux x64 | AppImage | Mark it executable and run it in a graphical desktop session |
| macOS Apple Silicon | arm64 DMG + ZIP | Copy the app from the DMG into Applications, or use the ZIP |
| macOS Intel | x64 DMG + ZIP | Take the x64 package; do not mix it with arm64 |

### Platform notes

- **macOS**: builds are ad-hoc signed (`identity: '-'`) with `notarize: false`. That is not Developer ID signing and the app is not notarized, so a browser-downloaded copy may be blocked by Gatekeeper.
- Verify `SHA256SUMS.txt` from the release page first. Only if you trust the source, follow the system prompt and allow the app under **System Settings → Privacy & Security**; if the system refuses, do not force your way around it. A matching checksum is not an identity attestation.
- **Linux**: needs a graphical desktop plus Electron's dependencies (GTK, NSS, ATK, GBM, ALSA and friends); credential protection additionally needs a working desktop keyring. Follow your distribution's documentation for package names and for AppImage / FUSE setup.
- GNOME may need an AppIndicator / KStatusNotifierItem extension. Transparency, always-on-top and tray behavior differ across desktops, compositors and Wayland sessions; nothing is guaranteed identical.

## Running from source

Requires **Node.js ≥ 22.12.0, Node.js 24 recommended**, plus npm. In the repository root:

```bash
npm ci
npm start
```

`npm start` strips a leftover `ELECTRON_RUN_AS_NODE` from the child environment so Electron cannot degrade into a windowless Node mode.

### Building locally

Build on the platform you are targeting; run `npm run icons` before the first build to generate packaging icons.

| Command | Target and output |
| --- | --- |
| `npm run package:dir` | Directory build for the host platform and architecture, in `dist/Token Monitor-<platform>-<arch>/` |
| `npm run package:win` | Windows x64 directory build only (`dist/`), no archive |
| `npm run package:win:zip` | **Windows x64 hosts only**; packages the directory into `release/token-monitor-<version>-win-x64.zip`, the same script CI uses |
| `npm run package:linux` | Linux x64 AppImage into `release/` |
| `npm run package:mac` | macOS DMG + ZIP for the host architecture by default, into `release/` |

On macOS you can be explicit with `npm run package:mac -- --arm64` or `-- --x64`; building for an architecture is not the same as having run the result on one.
`test:distributable` requires the real archive in `release/` — the directory build does not count. It also compares the archive against the sources and **fails when the package is older than the code**, because a local "verified ZIP" once turned out to be a leftover from the previous build.

## Connecting a DeepSeek account

1. Open Settings and read the credential storage note at the bottom first.
2. Create an **API key** at [DeepSeek API Keys](https://platform.deepseek.com/api_keys); it feeds the official balance endpoint.
3. For usage and runway, sign in to the [platform usage page](https://platform.deepseek.com/usage), open the developer tools' Network tab and reload.
4. Copy the **Session Token** after `Bearer` in the `Authorization` header of an `api/v0` request; pasting the whole header works too, the app strips the prefix.
5. Turn off *Use demo data*, then save and sync. When the session expires you have to refresh the token yourself.

**An API key alone can only read the balance. The runway needs usage from the Session Token, so the runway stays empty with just an API key.**
A Session Token is a secret: keep it out of screenshots, logs, issues and public repositories.

## How each number is derived

| Metric | Formula / source |
| --- | --- |
| Total balance | Official `GET https://api.deepseek.com/user/balance`, CNY account preferred |
| Today's spend / tokens | Per-day platform data, taken at the local calendar day |
| 30-day spend / tokens | 30 calendar days including today, merging the previous month when needed |
| 30D daily average | 30-day total ÷ number of days that actually had spend |
| 30D runway | Total balance ÷ 30D daily average |
| 7D daily average | Last 7 calendar days total ÷ 7, zero-spend days included |
| 7D runway | Total balance ÷ 7D daily average |
| Depletion date | Today plus the rounded runway in days — an estimate, not a promise |
| Monthly forecast | Daily average of the selected pace × 30 |
| Effective price | 30-day cost ÷ tokens × 1,000,000 |
| Cache hit rate | `hit ÷ (hit + miss + plain prompt/input) × 100%`, over input tokens |
| Requests / model mix | Aggregated over the same 30-day window; model rows carry their own cache hint |

When the average is zero or required data is missing, no runway estimate is shown; a thin spending sample is labelled as indicative.
Platform usage comes from the undocumented internal endpoints `/api/v0/usage/amount` and `/api/v0/usage/cost` (on `platform.deepseek.com`, requested per month).
Fields, authentication and data lag can change; if the previous-month request fails, the current implementation keeps working with what it could fetch, so a 30-day figure may be incomplete.

## Security and local configuration

Credentials reach the main process through the preload bridge, and only masked values go back to the UI. Whether `safeStorage` is available depends on the platform and desktop services:

| Platform | Protection when available |
| --- | --- |
| Windows | DPAPI |
| macOS | Keychain |
| Linux | A real `gnome_libsecret` or KWallet backend (`kwallet` / `kwallet5` / `kwallet6`) |

On Linux, `basic_text`, `unknown` and any other unrecognised or unavailable backend is treated as `none`.
**When system encryption is unavailable, credentials fall back to `plain:` + base64 on disk. That is not encryption: anyone who can read the config file can recover them.** The UI then shows "Not encrypted · no system keyring available"; if you do not accept that, do not store real credentials.

**The probe is lazy and asynchronous.** The availability check (`isAsyncEncryptionAvailable`, falling back to the synchronous API only when that is missing) runs when the settings drawer opens, never on the startup path — on macOS a locked keychain or a pending authorization prompt blocks a synchronous call and freezes the whole main process, which is exactly what happened in the first cloud run. Therefore:

- Until the system answers, the storage label stays neutral ("Stored on this device only"): it neither promises encryption nor claims plaintext.
- Saving a **new credential** while the backend is unknown is refused with "System encryption status unknown — credentials were not saved" rather than silently downgraded. Changing theme, pace, pinning or form still saves normally.
- An untouched credential keeps the ciphertext already on disk; an unrelated save never re-encrypts or downgrades it. A legacy `plain:` value is upgraded to `enc:` only once a trustworthy backend is confirmed.
- End-to-end storage behaviour has only been verified against Windows DPAPI. The macOS and Linux keyring paths have not been verified on real machines.

Where the everyday config lives (test runs use isolated profiles instead):

| Platform | `config.json` path |
| --- | --- |
| Windows | `%APPDATA%\Token Monitor\config.json` |
| macOS | `~/Library/Application Support/Token Monitor/config.json` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/Token Monitor/config.json` |

Leaving a credential field empty keeps the stored value; **Clear credentials** empties both and returns to demo mode.
Account requests go straight to `api.deepseek.com` / `platform.deepseek.com`; there is no relay and no analytics. Icons, fonts and demo data are all local.

## Language support

The UI is authored in Chinese; English is derived from a single dictionary shared by the main process and the renderer (`renderer/i18n.js`), so a label cannot be updated in one language only.

| English interface | Chinese interface |
| --- | --- |
| ![Ledger (English)](shots/deck-en.png) | ![中文界面](shots/deck.png) |

- **What is translated**: both window forms, the settings drawer, shortcut list, notices, error messages, tray menu, tray tooltip and the macOS application menu.
- **What is not translated**: the product name, `DeepSeek`, and the language picker's own option names, which stay in Latin script on purpose (see the font note below).
- **Number and date formats follow the language**: Chinese groups token counts with 万 / 亿 and writes depletion as `约 3 月 5 日见底`; English uses compact notation (`12.5K`, `1.3M`) and `Runs out Mar 5`. The underlying quantities are identical, and the checks compare them numerically.
- **Deliberately unchanged**: currency symbols follow the account, the clock stays 24-hour, and the thousands separator stays grouped as `en-US`.
- Switching the language saves the setting and **reloads the window**; that is the only setting that does, because text already written into the page cannot be retranslated in place.

**A real constraint on Chinese wording**: the shipped MiSans subset was built from a fixed character corpus, and it does not contain 语 / 言 / 英 / 文. Rebuilding the subset would mean fetching the original MiSans and Inter sources and adding a subsetting build step, which also touches the open MiSans licensing question noted below. Until that is done, new Chinese copy must stay inside `scripts/font-corpus.txt` — which is why the language row is labelled `LANGUAGE` with Latin option names instead of `语言 / 中文`. The corpus check in `npm run test:i18n` fails if any visible character leaves that set, and it already caught a real bug once: monospace labels rendered as tofu on Linux runners because the font stack had no bundled CJK fallback.

## Tests and what they prove

**Local (Windows 10 x64)**: data tests, 21 mocked storage-backend assertions, source UI, directory build and a real ZIP extraction and launch all pass; 11 language scenarios × 4 interface states pass, and every collected character is inside the corpus. fontTools was used to check the actual subset cmaps against that corpus with no gaps found.

**Cloud round 1 (`9faa78e`, four native runners)**: Windows x64 green; Linux x64 misread "the debugger socket closed before the reply" during shutdown as a failure; both macOS builds signed and verified, but the packaged-app launch check timed out on its first CDP round trip.

**Cloud round 2 (`4fb1d4d`)**: Windows still green; the Linux language suite went green and the failure moved to the package name — electron-builder emits `linux-x86_64.AppImage` while the checks and release contract expect `linux-x64`. Both macOS jobs still timed out, but this time with process stacks: 80 of 80 samples sat in `SecItemCopyMatching → SecurityServer → mach_msg`, i.e. a **synchronous keychain read on the startup path** had frozen the main process (the source tests use unsigned Electron, whose keychain entry is already authorized on the runner, so only the packaged app hit it).

**Fixes made from that evidence**: the shutdown race is tolerated only in that one case and the process must still exit 0; monospace labels gained the bundled MiSans fallback and the checks now read the actual platform font over CDP; the Linux artifact name is pinned to `linux-x64`; the keychain probe moved off startup entirely (see *Security and local configuration*).

**Cloud round 3 (`de0c757`)**: Windows x64, Linux x64 (AppImage extracted and launched) and macOS Apple Silicon (DMG + ZIP built, strictly verified, extracted and installed-from-DMG launch checks) all green. macOS Intel failed only while creating the DMG: `dmgbuild`'s final `hdiutil detach` hit "Resource busy" although the ZIP in the same step succeeded and the identical arm64 job passed — a runner race, not a packaging error, so that step gained a bounded retry of at most three attempts that only unmounts its own volume.

**Cloud round 4 (`036e326`, all four green)**: the Intel race reproduced, the retry recovered it on the second attempt, and both the ZIP-extraction and DMG-install paths passed; all four runners uploaded their packages.

**Cloud round 5 (`v2.4.1` tag, run 40642992704)**: pushing the tag on its own triggered the tag pipeline as expected, all four runners passed, and the release job verified the six packages, generated `SHA256SUMS.txt` and published. The Windows package re-downloaded from the release page matched the checksum list and passed every assertion locally (`isPackaged`, version, no keychain probe at startup, DPAPI label in settings). Linux and macOS packages were only covered by their own runners.

**The first bilingual commit (`1cedcc6`) failed on all four runners at once**: the assertions were written for the Chinese interface while the runner hosts answer in English, so `auto` resolved English. The product behaved correctly and the test assumption did not. The fix makes the regression state the language it asserts (see `test:ui` above) and deliberately leaves only the "switch to English, then restart" step unpinned.

**Second bilingual attempt (`d62fc57`, all four green)**: on English-hosted Linux and macOS runners the 11 language / timezone scenarios, the UI regression and the extracted AppImage plus DMG-install launch checks all passed, producing 2.5.0 packages for every platform.

**What the macOS keychain really means in CI**: running from source probes `keychain` (the unsigned Electron entry is pre-authorized on the runner), while the **packaged app stays at `pending`** — the system never answers. The checks now accept and report that instead of hanging, but it means **real Keychain encryption in the packaged macOS app has never been verified anywhere**, and this README does not claim it has.

| Command | What it covers |
| --- | --- |
| `npm test` | Data, storage, UI and language-environment suites in order |
| `npm run check:release` | Version gate: `package.json`, lockfile and the two renderer literals must agree, and a tag must equal `v` + version |
| `npm run test:parse` | Parsing, aggregation, both paces and edge cases; no GUI needed |
| `npm run test:store` | 21 assertions over mocked system backends: lazy probe, refusal while pending, ciphertext retention and `plain:` upgrade; not a real keyring |
| `npm run test:ui` | Forms, themes, privacy, settings, credential branches and clearing, restart restore, morph sampling, and the language switch followed by a restart that must still be English. Every phase except the last pins Chinese, because the assertions are written for one language and the host language is not ours to assume (the first version of this failed on all four runners, whose hosts answer in English) |
| `npm run test:i18n` | The Chromium language / timezone and font checks described below |
| `npm run test:packaged` | Directory build: launch, fonts, version and form restore |
| `npm run test:distributable` | Extracts the real ZIP / DMG / AppImage from `release/` and launches the executable inside it; never falls back to `dist/` |
| `npm run render:live` | Live forensics and screenshots; `npm run shots` refreshes the showcase images |

Regression runs use isolated config directories and demo data. The credential failure path does send a deliberately invalid test key to DeepSeek and accepts either an auth or a network error: it is not an offline mock, and it is not a positive test against a real account.
The morph brightness proxy is `min(per frame max(strip opacity, deck opacity))`, not a sum of the two layers, and that sampling does not prove the absence of ghosting everywhere.

### Language environment and font checks

`test:i18n` launches **11 scenarios**:

- Seven Chromium languages — `zh-CN`, `en-US`, `ja-JP`, `de-DE`, `fr-FR`, `ko-KR`, `ar-SA`. The last five canonicalise to `ja / de / fr / ko / ar` locally; the report keeps both requested and actual values. Each scenario also asserts **which UI language the app resolved** (Chinese stays Chinese, everything else becomes English) and, in English mode, that no Chinese text and no untranslated strings remain on screen.
- Two timezone scenarios emulate Chromium zones over CDP: `Pacific/Kiritimati` (UTC+14) and `Pacific/Niue` (UTC−11). Neither changes the host OS nor the main process timezone.
- Two override scenarios pin the language against the browser language (`--locale=en` on `zh-CN`, `--locale=zh` on `en-US`), which is what the Settings picker does.
- Every scenario gets its own profile whose path contains CJK characters and spaces, checks what was written to disk, and walks light strip, light ledger, settings and dark ledger.
- Balance, runway and today's spend are compared as exact strings against the `zh-CN` baseline; token counts are compared numerically because the two languages group them differently. Clocks and date-dependent labels are not compared.
- Inter / MiSans FontFace status is checked, collected DOM characters must belong to `scripts/font-corpus.txt`, and in Chinese mode CDP `CSS.getPlatformFontsForNode` reads the platform font actually used by a Chinese label to confirm it comes from the bundled MiSans subset.

These checks do **not** prove complete cmap coverage, every fallback glyph, native menu rendering, a host-OS language edition of the app, or real credential encryption; the language suite never enters credentials and performs no encrypt/decrypt round trip.

## GitHub Actions and releases

The workflow is [`.github/workflows/build.yml`](.github/workflows/build.yml); all four runners have completed real runs, and the release path has published once.
A local `git commit` triggers nothing in the cloud; a push, a pull request or a manual run does. GitHub Packages is for npm / container registries and the like — this project distributes desktop binaries through Artifacts and Release assets.

| Trigger | Behaviour |
| --- | --- |
| Push to `main` / pull request against `main` | Test, package, verify the artifacts, upload Artifacts; no Release |
| Manual `workflow_dispatch` | Same tests and packaging; no Release |
| Push a `v*` tag | The tag must equal `v` + `package.json` version; a Release is published only after all four runners succeed |

The runners are `windows-2022` x64, `ubuntu-22.04` x64, `macos-15` arm64 and `macos-15-intel` x64, on Node.js 24.
Every job starts with `npm run check:release`: the host must match the matrix, the version must agree in four places, and on a tag the name must equal `v` + version.
The Linux UI runs on a virtual X11 desktop (Xvfb + Openbox), which does not mean GNOME or Wayland sessions are verified.
The macOS build step retries the `dmgbuild` detach race at most three times and only unmounts volumes named `Token Monitor*`; when the retries run out the job fails rather than hiding a real packaging error.
The packaged-app check accepts `pending` (the system never answered about the keychain) as a reported state and continues with the remaining assertions, but records it explicitly instead of counting it as verified encryption.
Package Artifacts are kept **14 days**, test diagnostics 7 days; a downloaded Artifact may need one more archive extraction.

A Release must contain six packages plus `SHA256SUMS.txt`, prefixed `token-monitor-<version>-`:

- `win-x64.zip`, `linux-x64.AppImage`
- `mac-arm64.dmg`, `mac-arm64.zip`
- `mac-x64.dmg`, `mac-x64.zip`

A tag containing `-` (for example `v2.5.0-beta.1`) is published as a pre-release; a plain version tag is published as the latest stable release. An existing public Release is never overwritten — publish a new version instead.

### Publishing

1. Actions is enabled in this repository; the four hosted runners and the publish permissions have all been exercised.
2. The workflow must exist on the **default branch** before it can be run manually from the Actions page: **Build desktop apps → Run workflow**.
3. No personal access token is needed: the release job declares `contents: write` and uses the built-in `GITHUB_TOKEN`; organisation policies can still restrict this.
4. Commits and pushes happen only after the user confirms. Cloud results come from actual runs; local changes are never reported as shipped.

**Push the tag by itself.** This repository has evidence both ways: `git push --atomic origin main refs/tags/v2.4.0` produced only the `main` run, no tag run, and therefore no Release (that empty tag has since been deleted); pushing `v2.4.1` on its own triggered the tag pipeline immediately. The official docs only state that "events will not be created for tags when more than three tags are pushed at once" and say nothing about pushing a branch and a tag together, so treat the combined push as unreliable.

```bash
git push origin main          # first: let all four runners go green on the new commit
git push origin v2.5.0        # then: push the tag alone, which is what triggers a Release
```

GitHub documentation: [hosted runners](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) · [Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts) · [events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Layout and limits

- `main.js` / `preload.js`: windows, tray, IPC and the minimal bridge.
- `lib/deepseek.js` / `lib/store.js`: account endpoints, metric aggregation and configuration storage.
- `renderer/`: interface, styles, charts, bundled fonts and the shared `i18n.js` dictionary; `scripts/`: launch, packaging and regression.
- `shots/`: showcase and live screenshots; `dist/` holds directory builds, `release/` holds distributable packages.

DeepSeek only: no multi-provider aggregation, no sync between devices, no automated login, no start-on-boot, no auto update.
Demo data is not a real account; costs and usage depend on what the platform returns and on your local date, and a forecast is never a spending guarantee.

## Credits and licence

Reference projects: [token-monitor](https://github.com/Javis603/token-monitor), [agent-sessions](https://github.com/jazzyalex/agent-sessions), [CodexBar](https://github.com/steipete/CodexBar).

The code in this repository is [MIT](LICENSE)-licensed. Fonts stay under their own licences and are not covered by the project's MIT licence:

- **Inter**: provided by rsms under the SIL Open Font License 1.1; use, subsetting and redistribution must keep the licence and copyright notice — see [OFL-Inter.txt](renderer/assets/font/licenses/OFL-Inter.txt).
- **MiSans**: provided by Xiaomi, with glyphs produced by Hanyi; this project uses a subset and keeps attribution in the README, in **Settings → About** and in [MiSans-Notice.txt](renderer/assets/font/licenses/MiSans-Notice.txt).
- Whether subsetting and publicly redistributing MiSans conforms to its licence still needs checking against the [official terms and download page](https://hyperos.mi.com/font/download) for your specific use. Adding an attribution, leaving the outlines untouched or shipping it only inside an app **does not by itself resolve the permission question**; the official agreement text governs.
