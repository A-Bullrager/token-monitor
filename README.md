<p align="right"><strong>EN</strong> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.es.md">Español</a> | <a href="./README.pt-BR.md">Português</a> | <a href="./README.de.md">Deutsch</a></p>

<div align="center">
    <img src="build/icon.png" alt="Token Monitor" width="96">
    <h1>Token Monitor</h1>
    <p><em>Know your runway — a desktop instrument for DeepSeek balance and usage.</em></p>
    <p>
        <a href="https://github.com/A-Bullrager/token-monitor/releases"><img src="https://img.shields.io/github/v/release/A-Bullrager/token-monitor?style=flat-square&label=release&color=22c55e" alt="Latest release"></a>
        <img src="https://img.shields.io/badge/Windows-x64-0078D4?style=flat-square&logo=windows&logoColor=white" alt="Windows x64">
        <img src="https://img.shields.io/badge/macOS-arm64%20%7C%20x64-0A84FF?style=flat-square&logo=apple&logoColor=white" alt="macOS arm64 and x64">
        <img src="https://img.shields.io/badge/Linux-x64-64748b?style=flat-square&logo=linux&logoColor=white" alt="Linux x64">
        <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-A855F7?style=flat-square" alt="License: MIT"></a>
    </p>
</div>

It rests as a strip, expands into a ledger, and estimates *how long your money lasts* using two spending paces (`30D / 7D`). The interface ships in **Chinese, English, Spanish, Brazilian Portuguese and German**: `Auto` follows the system language, and any of the five can be pinned in Settings. Built on Electron 45 with plain DOM and SVG. No proxy server, no telemetry.

## Showcase

Every image below renders local demo data; they show the interface, and are not evidence about any particular test run.

<table>
<tr>
<td width="50%" align="center"><img src="shots/deck-en.png" width="440" alt="The ledger in English"><br><sub><b>Ledger</b> — runway gauge, balance, 30-day spend curve, model mix and cache hit rate</sub></td>
<td width="50%" align="center"><img src="shots/deck.png" width="440" alt="同一界面的中文版本"><br><sub><b>Ledger (中文)</b> — the same instrument, authored in Chinese</sub></td>
</tr>
<tr>
<td width="50%" align="center"><img src="shots/strip-en.png" width="440" alt="The everyday strip in English"><br><sub><b>Strip</b> — the always-on form in English: runway days, balance, today's spend and a sparkline</sub></td>
<td width="50%" align="center"><img src="shots/strip.png" width="440" alt="中文条带"><br><sub><b>Strip (中文)</b> — the same form, authored in Chinese</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/settings.png" width="290" alt="Settings drawer"><br><sub><b>Settings</b> — credentials, refresh, theme, language and shortcuts</sub></td>
<td width="33%" align="center"><img src="shots/dark.png" width="290" alt="Dark theme"><br><sub><b>Dark</b> — for night or dark desktops</sub></td>
<td width="33%" align="center"><img src="shots/empty.png" width="290" alt="Disconnected state"><br><sub><b>Not connected</b> — demo data until you add credentials</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/deck-es.png" width="290" alt="Ledger en español"><br><sub><b>Español</b> — <i>Autonomía</i>, <i>Recarga / bono</i>, <i>Se agota 5 mar</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-pt-BR.png" width="290" alt="Livro em português do Brasil"><br><sub><b>Português (Brasil)</b> — <i>Autonomia</i>, <i>Recarga / bônus</i>, <i>Acaba 5 de mar.</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-de.png" width="290" alt="Buch auf Deutsch"><br><sub><b>Deutsch</b> — <i>Reichweite</i>, <i>Aufladung / Gutschrift</i>, <i>Am 5. März leer</i></sub></td>
</tr>
</table>

The two images below come from a live window rather than the staged showcase, as a check that the real thing looks like the pictures above:

<table>
<tr>
<td width="50%" align="center"><img src="shots/live-strip.png" width="420" alt="Strip in a live window"><br><sub><b>Live strip</b> — captured from a running window</sub></td>
<td width="50%" align="center"><img src="shots/live-deck.png" width="420" alt="Ledger in a live window"><br><sub><b>Live ledger</b> — captured from a running window</sub></td>
</tr>
</table>

## What it shows

- **Strip / ledger**: balance, today's spend, two runway paces and an estimated depletion date.
- **Usage detail**: 30-day spend curve, tokens, model mix, cache hit rate, request counts and effective unit price.
- **Desktop behavior**: draggable, pin on top, system tray, two window forms; transparent-window effects vary by platform.
- **Display and privacy**: light / dark / system, one click to hide amounts, local demo data by default.
- **Sync**: manual refresh, or every 30 seconds / 1 minute / 5 minutes.

## Download and run

Releases: [GitHub Releases](https://github.com/A-Bullrager/token-monitor/releases). Development builds are in the Artifacts of each Actions run.
**[v2.6.2](https://github.com/A-Bullrager/token-monitor/releases/tag/v2.6.2) is the current release** — the build that finished teaching the card to fit its own numbers: five languages, both window forms, and every digit measured against what the reader can actually lose, re-checked after the platform finishes handing over its font metrics. All four native runners passed, and the page carries six packages plus `SHA256SUMS.txt`. The Windows package was re-downloaded from that page, matched its checksum and GitHub's own asset digest, and was extracted and launched on a real Windows 10 machine reporting version 2.6.2 with `isPackaged`; the Linux and macOS packages are covered by their own runners only, not by the developer's own desktop. It supersedes v2.6.1 (published earlier the same day), which measured numbers against element boxes rather than the text inside them — so on the platforms whose boxes were tighter, it shrank figures that actually had room.

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

The interface is authored in Chinese, and every other language is a dictionary keyed by that exact Chinese string (`renderer/i18n.js` plus `renderer/locales/<locale>.js`), loaded by the main process *and* the renderer. A label cannot be updated in one language only: `npm run check:i18n` fails if a dictionary is missing a key, answers in Chinese, drops an interpolated shape, or forgets a plural.

| English interface | Chinese interface |
| --- | --- |
| ![Ledger (English)](shots/deck-en.png) | ![中文界面](shots/deck.png) |

- **Shipped languages**: Chinese (the authored language), English, Spanish, Brazilian Portuguese and German. `Auto` matches the system language by prefix — `zh*`, `es*`, `pt*`, `de*`, `en*` — and everything else lands on English, the one fallback every bundled font can render. `pt-PT` therefore gets the Brazilian dictionary; `es-MX` and `es-ES` share one Spanish.
- **What is translated**: both window forms, the settings drawer, shortcut list, notices, error messages, tray menu, tray tooltip and the macOS application menu — plus the ASCII instrument chrome (`DAYS`, `TOTAL`, `SAMPLE`, `AVG`, `PEAK ¥29.10 · 10-03`, `SYNCED 18:02:18`), which Chinese mode shows in English too.
- **What is not translated**: the product name, the `Know your runway.` tagline, `DeepSeek`, `API KEY` / `SESSION TOKEN` as field names, and the instrument codes `DEMO`, `SYNC`, `30D / 7D` and the `M` / `K` magnitude units.
- **Number and date formats follow the language**: Chinese groups token counts with 万 / 亿 and writes depletion as `约 3 月 5 日见底`; English uses `12.5K` and `Runs out Mar 5`; Spanish `12,5 mil` and `Se agota 5 mar`; Portuguese `12,5 mil` and `Acaba 5 de mar.`; German `12.500` and `Am 5. März leer`. The quantities behind them are identical, and the checks compare them numerically. A value too long for its slot — ¥99,999,999.99 in a column laid out for ¥1.49, or a German micro caption four pixels wider than the English one — shrinks its own type until every digit is visible. What is measured is the text itself against the wall it could hit — the nearest ancestor allowed to clip it, or the next element beginning to its right on the same line — so a number that spills into empty space is left at its designed size, and only one that would really be lost or would run into a neighbour is shrunk. Because that decision is only as good as the font metrics on screen when it was taken, and a runner measured about five per cent wider than the machine that wrote the check, the card re-checks its own numbers once a second while it is on screen: a read, not a repaint, and a style is written only when a figure has actually escaped its box. The one place shrinking is not the answer is the ledger's balance breakdown — two exact figures with two currency symbols do not fit any readable size — so from ten thousand up that line reads in the units each language already uses for counts (`90 Mio.` / `90M` / `90 mi` / `9000 万`), and every digit stays in the headline above it, which has the room.
- **Plurals belong to the language**: Chinese marks no grammatical number, so each dictionary inflects its own counted noun (`1 día activo` / `15 días activos`, `1 Tag` / `15 Tage`). The parity check refuses a locale whose one-form and many-form come out the same, and treats a measured `1.0` as plural.
- **Known limit**: money keeps one dot-decimal style in every language (`¥145.09`), and so does the clock. Only token counts follow the language's own grouping. Switching the language saves the setting and **reloads the window** — the only setting that does, because text already written into the page cannot be retranslated in place.

**A real constraint on wording**: the shipped fonts are subsets. The MiSans subset was cut from a fixed corpus and does not contain 语 / 言 / 英 / 文, so new Chinese copy must stay inside `scripts/font-corpus.txt` — which is why the language row is labelled `LANGUAGE` and the Chinese option reads `Chinese`. The accents the new languages need (`Á Ã Ç É Í Ó Ø Ú Ü ß á ã ä ç é ê í ñ ó ô õ ö ú ü`) were checked against the actual Inter subset cmap with fontTools, and `scripts/glyph-demand.mjs` fails before any window opens if a dictionary asks for a character outside the corpus. The corpus check in `npm run test:i18n` then re-checks the characters really on screen, and it has already caught a real bug once: monospace labels rendered as tofu on Linux runners because the font stack had no bundled CJK fallback.

## Tests and what they prove

16 language scenarios × 4 interface states pass, every collected character is inside the corpus, no label is clipped in any shipped language, and 10 number-fit runs × 10 magnitudes leave no number outside its box.

**Thirty-four cloud rounds so far; the current release is green on all four native runners.** The round-by-round narrative is collapsed below — everything it proved *negative* is stated outside the collapse, so folding it cannot hide a caveat. One of those negatives is about the tests themselves: the morph check was blind on macOS, where the window edge moves after the CSS class it sampled had already gone (round 12), so it now grades the observed motion instead.

<details>
<summary>Cloud build history (rounds 1–13)</summary>

**Cloud round 1 (`9faa78e`, four native runners)**: Windows x64 green; Linux x64 misread "the debugger socket closed before the reply" during shutdown as a failure; both macOS builds signed and verified, but the packaged-app launch check timed out on its first CDP round trip.

**Cloud round 2 (`4fb1d4d`)**: Windows still green; the Linux language suite went green and the failure moved to the package name — electron-builder emits `linux-x86_64.AppImage` while the checks and release contract expect `linux-x64`. Both macOS jobs still timed out, but this time with process stacks: 80 of 80 samples sat in `SecItemCopyMatching → SecurityServer → mach_msg`, i.e. a **synchronous keychain read on the startup path** had frozen the main process (the source tests use unsigned Electron, whose keychain entry is already authorized on the runner, so only the packaged app hit it).

**Fixes made from that evidence**: the shutdown race is tolerated only in that one case and the process must still exit 0; monospace labels gained the bundled MiSans fallback and the checks now read the actual platform font over CDP; the Linux artifact name is pinned to `linux-x64`; the keychain probe moved off startup entirely (see *Security and local configuration*).

**Cloud round 3 (`de0c757`)**: Windows x64, Linux x64 (AppImage extracted and launched) and macOS Apple Silicon (DMG + ZIP built, strictly verified, extracted and installed-from-DMG launch checks) all green. macOS Intel failed only while creating the DMG: `dmgbuild`'s final `hdiutil detach` hit "Resource busy" although the ZIP in the same step succeeded and the identical arm64 job passed — a runner race, not a packaging error, so that step gained a bounded retry of at most three attempts that only unmounts its own volume.

**Cloud round 4 (`036e326`, all four green)**: the Intel race reproduced, the retry recovered it on the second attempt, and both the ZIP-extraction and DMG-install paths passed; all four runners uploaded their packages.

**Cloud round 5 (`v2.4.1` tag, run 40642992704)**: pushing the tag on its own triggered the tag pipeline as expected, all four runners passed, and the release job verified the six packages, generated `SHA256SUMS.txt` and published. The Windows package re-downloaded from the release page matched the checksum list and passed every assertion locally (`isPackaged`, version, no keychain probe at startup, DPAPI label in settings). Linux and macOS packages were only covered by their own runners.

**The first bilingual commit (`1cedcc6`) failed on all four runners at once**: the assertions were written for the Chinese interface while the runner hosts answer in English, so `auto` resolved English. The product behaved correctly and the test assumption did not. The fix makes the regression state the language it asserts (see `test:ui` above) and deliberately leaves only the "switch to English, then restart" step unpinned.

**Second bilingual attempt (`d62fc57`, all four green)**: on English-hosted Linux and macOS runners the 11 language / timezone scenarios, the UI regression and the extracted AppImage plus DMG-install launch checks all passed, producing 2.5.0 packages for every platform.

**Cloud round 8 (`v2.5.0` tag, run 40660748693)**: pushing the tag on its own triggered the tag pipeline, all four runners passed, and the release job checked the six packages, generated `SHA256SUMS.txt` and published. The Windows package was re-downloaded from the release page, its SHA256 matched the list, and it was extracted and launched here through the same assertions as any other build. The Linux and macOS packages are covered by their own runners only.

**Round 9 (`5a21201`, the first five-language commit) failed on macOS only**: the new label-fitting assertion reported the *English* pace line 12px past its box on macOS Apple Silicon, while the identical build was clean on Windows and Linux — the line had been sized against the fonts of the machine that wrote it. The check also stopped at the first failing scenario, so a single round could only ever reveal one platform's first problem.

**Round 10 (`819601e`, all four green)**: the fitting sweep now collects every scenario and state and fails once with the whole list, and the English wording became `15 active days of 30` — same statement, fewer characters, which is the difference between a label and a clipped one.

**Round 11 (`v2.6.0` tag, run 40801968504)**: pushing the tag alone triggered the tag pipeline, all four runners passed, and the release job verified the six packages, generated `SHA256SUMS.txt` and published. The Windows package was re-downloaded from the release page, its SHA256 matched the list, and it was extracted and launched here through the same assertions as any other build (`isPackaged`, version 2.6.0). The Linux and macOS packages are covered by their own runners only.

**Round 12 (`a244fa4`, a docs-only commit) failed on macOS again — in the test, not the product**: the morph check reported `596 -> 593` on Apple Silicon although the same code had been green on that runner one CI round earlier. The sampler stopped with the CSS class it watched, and macOS applies `setSize` on its own schedule, so on a loaded runner the window edge moved after the class had gone. The measurement was blind; the animation was happening.

**Round 13 (`c52a77e`, all four green)**: the morph is now graded from the frames where the edge actually moved, with up to three sampling attempts recorded per run. Proved against a real jump — forcing the morph duration to 1ms makes the check fail with "biggest single step 668px of 668px".
**Rounds 14–16 (`1f78fb2`, `ef16b04`, `f7f336f` — all four runners red)**: a new check for numbers at magnitudes the demo account never shows found real overflows everywhere — the strip's today figure 21px past its slot at ¥123,456.78, the English pace caption, the ledger's breakdown line. The first fix (fit a number against the box that actually clips it, rather than against itself) then failed differently: the element reported no inline size at all, which meant the fitter had run and concluded the text fitted.

**Rounds 17–19 (`b7a3e58`, `796f101`, `6ee238f` — Linux green, three red)**: six rounds of the checker and the product disagreeing about when a measurement is valid. The card gained re-measures after its own settle window, an announcement of that window, a standing re-check once a second, and a fix for a pass taken while a view was hidden — which had been erasing a fit that was already correct. Round 19 was the first to name the failure per language rather than per platform (`zh` on Windows, `es` on Apple Silicon), which is how it became clear the check was still reading at the wrong moment.

**Round 20 (`a5240d5` — three red)**: the clip list, the shrink witness and the shipped-look witness now come from one snapshot in one task, and an overflowing reading is not a verdict until the card's own re-check has passed over it. The contradiction — a clean page, yet the number was never shrunk — disappeared, and what was left were three genuine overflows the runners could see and this machine could not: the German ledger's breakdown line 63px past a 160px slot, the headline balance 6px past, the English thin-sample caption 4px past.

**Round 21 (`c63d872` — three red)**: the breakdown line goes compact above a million (`90 Mio.` / `90M` / `9000 万`) while the headline keeps every digit, the headline gained one more step of shrink headroom, and the English caption says the same thing in three fewer characters. All three overflows went away. What remained was this check's own overreach: it demanded that a particular slot *must* be the one to give out at ¥99,999,999,999.99 a day, which is a fact about a platform's metrics rather than about the instrument.

**Round 22 (`d7e4253` — Windows, Linux and macOS Intel green; Apple Silicon red)**: the extreme fixture now documents the set of slots that may give out and fails only on one nobody listed, and still prints which one broke here and by how much. Apple Silicon failed a second consecutive time on one word — "timed out waiting for expanded again" — so view waits now report the body class, the window width and the renderer's own view state at the deadline, and the expand step gained one recorded retry in the shape the morph grading already used.
**Round 23 (`7bb4591` — Windows, Linux and macOS Intel green; Apple Silicon red on one number)**: the view waits carried their new evidence and the expand did not fail again — no runner needed the recorded retry, and the report says so. What was left was a residual: the German breakdown line, compact by then, still measured 208px against a 202px box on Apple Silicon, six pixels past where its type floor allows. The currency sign left the compact form — the headline above it already carries one, and those two signs *were* the six pixels — and that micro line gained one more step of headroom.
**Round 24 (`98a7693`, all four green)**: the six pixels turned out to be exactly the two currency signs they were, and the magnitude ladder — with the late metric injected every run — passed on Windows x64, Linux x64, macOS Apple Silicon and macOS Intel.

**Round 25 (`v2.6.1` tag, run 40846036293)**: pushing the tag alone triggered the tag pipeline, all four runners passed, and the release job verified the six packages, generated `SHA256SUMS.txt` and published. The Windows package was re-downloaded from the release page, its SHA256 matched both the published list and GitHub's own asset digest, and it was extracted and launched here through the same assertions as any other build (`isPackaged`, version 2.6.1). The Linux and macOS packages are covered by their own runners only.
**Round 26 (`389bbb7`, documentation only)**: the same six pixels returned, this time naming the Spanish deck on Apple Silicon, and the artifact was finally specific enough to stop guessing — the figure *had* been fitted, an inline size was present, and something still measured over.

**Round 27 (`1d61df6`)**: `fittedNodes` became a Map that remembers each slot's own floor, so a re-fit repeats the decision instead of applying a default. Apple Silicon went green for the first time in this thread; macOS Intel failed with the identical six pixels.

**Round 28 (`14a08be`)**: the headline's floor widened from 0.6 to 0.5. Intel went green, Apple Silicon stayed six pixels over — now at 16.5px, inside a 226px box holding about 113px of digits, which is what said the box was not the reader's problem.

**Round 29 (`4084742`, version 2.6.2)**: the first ink-based measurement landed and all four test jobs went green; the run still failed one step later, on macOS Intel, with `hdiutil` exit 16 — "Resource busy" — while mounting the built DMG for package verification.

**Round 30 (`2595944`)**: that DMG race gained the bounded, logged retry round 3 had established for the build step. Intel then failed in the source suite on the German ledger line, reported 16px over with its ink ending two pixels *inside* the clipping edge: the last false positive, and the one the new `ink` and `wall` witness fields named exactly.

**Round 31 (`9b24c8a`, all four green)**: fitting and the check now ask the same question — is every digit visible inside the wall the text could hit (the nearest clipping ancestor, or the next element on its line)? Spill into empty space is no longer a defect, an element that clips its own text still is, and the card stopped shrinking figures that had room. The giveout at the extreme fixture is now reported as 19px of ink rather than 32px of box, and `--wide-fonts="Courier New"` still catches the same slot at 28px, so the looser rule is not a blind one.

**Round 32 (`v2.6.2` tag, run 40862991393)**: pushing the tag alone triggered the tag pipeline, all four runners passed, and the release job verified the six packages, generated `SHA256SUMS.txt` and published. The Windows package was re-downloaded from the release page, its SHA256 matched both the published list and GitHub's own asset digest, and it was extracted and launched here through the same assertions as any other build (`isPackaged`, version 2.6.2). The Linux and macOS packages are covered by their own runners only.
**Round 33 (`640bf33`, documentation only)**: three runners green, and macOS Intel named a gap the published v2.6.2 still has. The German breakdown line at ¥999,999.99 + ¥234,567.90 measured eight pixels past its wall under the new ink rule — a real loss this time, not the box artifact — because the compact boundary sat at a million and that magnitude came through as exact text. The boundary is now ten thousand, the one `formatTokens` already uses, so a summary line stops pretending to be a statement before it runs out of room. Until that lands in a release, v2.6.2 can show a clipped breakdown line on a machine whose metrics are that tight; the headline figure above it is unaffected.
**Round 34 (`a113118`, all four green)**: the compact boundary moved from a million down to ten thousand — the same one `formatTokens` uses — because the German breakdown line at ¥999,999.99 + ¥234,567.90 measured eight pixels past its wall on macOS Intel, and that one was real: ink outside the edge, not a box artifact. The suite is green on windows-2022, ubuntu-22.04, macos-15 and macos-15-intel, and the published v2.6.2 keeps the gap until the next release carries the fix — said outside the collapse, not left inside the history.
</details>

**What v2.6.2 still ships with**: on `main`, the ledger's balance breakdown switches to compact units from ten thousand up; the published v2.6.2 draws that line at a million. So with one of those two fields between ¥10,000 and ¥999,999.99, a machine whose metrics are tight — macOS Intel, in CI's own measurements — renders the German version of the line with its last eight pixels past the edge. The headline balance and every other figure are unaffected, and no demo or ordinary-sized account reaches the case. The fix is on `main` (round 34, green on all four runners) and rides with the next release rather than taking its own tag.

**What the macOS keychain really means in CI**: running from source probes `keychain` (the unsigned Electron entry is pre-authorized on the runner), while the **packaged app stays at `pending`** — the system never answers. The checks now accept and report that instead of hanging, but it means **real Keychain encryption in the packaged macOS app has never been verified anywhere**, and this README does not claim it has.

| Command | What it covers |
| --- | --- |
| `npm test` | Data, storage, UI and language-environment suites in order |
| `npm run check:release` | Version gate: `package.json`, lockfile and the two renderer literals must agree, and a tag must equal `v` + version |
| `npm run check:i18n` | Dictionary parity across every shipped language — same keys, same interpolated shapes, no Chinese answers, one-form different from many-form — plus the glyph-demand check against `scripts/font-corpus.txt` |
| `npm run check:docs` | Parity gate across the five READMEs: each one links every other language and marks itself current, and all share the same section structure, screenshots, `<details>` balance and working markdown / HTML / cross-language links |
| `npm run test:parse` | Parsing, aggregation, both paces and edge cases; no GUI needed |
| `npm run test:store` | 22 assertion groups over mocked system backends: lazy probe, refusal while pending, ciphertext retention, `plain:` upgrade and the accepted language list; not a real keyring |
| `npm run test:ui` | Forms, themes, privacy, settings, credential branches and clearing, restart restore, morph sampling, the switch to English followed by a restart, and a picker round trip through Spanish, Portuguese and German that must reload the window and re-highlight the saved language. The morph is graded from the frames where the window edge actually moved and may take up to three sampling attempts, all of which are recorded — a pass that needed a retry is evidence about the runner, not a hidden second chance. Every phase except the unpinned ones pins Chinese, because the assertions are written for one language and the host language is not ours to assume (the first version of this failed on all four runners, whose hosts answer in English) |
| `npm run test:i18n` | The Chromium language / timezone, font and label-fitting checks described below |
| `npm run test:numbers` | Drives ten magnitude ladders — from ¥0.01 and 7 tokens to a ¥99,999,999.99 balance, 109.6 million tokens, a `999+` runway and long model ids — through the real render path in all five languages and both window forms, and fails if the reader would lose a digit — measured as the text inside the wall it could hit (the nearest clipping ancestor, or the next element on its line), not as the element’s box. It runs in a live window on purpose: showcase mode lays the card out on a wider marketing canvas, and the first version of this check measured there and missed a real 5px overflow. Grading waits for the product rather than for a delay: the clip list, the shrink witness and the shipped-look witness come from one snapshot in one task, and a reading that still overflows is not a verdict until the card's own once-a-second re-check has passed over it (three passes at the latest, so a genuine giveout is still reported, with the pass count next to it). After the card has fitted a figure, the width of the same text is changed with no render and no resize to announce it — the state the runners reached on their own — so the repair path is exercised on every platform every round; `--freeze-watch` stops the card re-checking and must make the check refuse to grade, and `--wide-fonts=<family>` measures margin against a face wider than any shipped platform uses. Findings from every language, form and magnitude fail together, and `shots/numbers-report.json` is written before the assertions so a red run arrives with its evidence. It also records where the instrument stops: at ¥99,999,999,999.99 spent in a day some money slots cannot be fitted at a readable size, and *which* one breaks is a fact about the platform's metrics — five slots are listed as allowed to give out, and the check fails the day a different row does. |
| `npm run test:packaged` | Directory build: launch, fonts, version and form restore |
| `npm run test:distributable` | Extracts the real ZIP / DMG / AppImage from `release/` and launches the executable inside it; never falls back to `dist/` |
`npm run shots` refreshes the five demo-state showcase images; the per-language variants (`deck-en`, `deck-es`, `deck-pt-BR`, `deck-de`, `strip-en`) come from `node scripts/launch.mjs --shot=<name> --locale=<locale>`

Regression runs use isolated config directories and demo data. The credential failure path does send a deliberately invalid test key to DeepSeek and accepts either an auth or a network error: it is not an offline mock, and it is not a positive test against a real account.
The morph brightness proxy is `min(per frame max(strip opacity, deck opacity))`, not a sum of the two layers, and that sampling does not prove the absence of ghosting everywhere.

### Language environment and font checks

`test:i18n` launches **16 scenarios**:

- Eleven Chromium languages — `zh-CN`, `en-US`, `es-ES`, `es-MX`, `pt-BR`, `pt-PT`, `de-DE`, `ja-JP`, `fr-FR`, `ko-KR`, `ar-SA`. Chromium canonicalises some of them (`ja-JP` → `ja`, `es-MX` → the neutral `es-419`), and the report keeps both requested and actual values. Each scenario asserts **which UI language the app resolved**: `zh*` stays Chinese, `es*` / `pt*` / `de*` / `en*` get their own dictionary, and a language with no dictionary (ja, fr, ko, ar) gets English. In every translated mode the check requires no Chinese text and no untranslated strings on screen.
- Two timezone scenarios emulate Chromium zones over CDP: `Pacific/Kiritimati` (UTC+14) and `Pacific/Niue` (UTC−11). Neither changes the host OS nor the main process timezone.
- Three override scenarios pin the language against the browser language (`--locale=en` on `zh-CN`, `--locale=zh` on `en-US`, `--locale=es` on `de-DE`), which is what the Settings picker does.
- Every scenario gets its own profile whose path contains CJK characters and spaces, checks what was written to disk, and walks light strip, light ledger, settings and dark ledger.
- Balance, runway and today's spend are compared as exact strings against the `zh-CN` baseline; token counts are compared numerically, parsing each language's own grouping (`1096 万`, `11M`, `11 M`, `11 Mio.`). Clocks and date-dependent labels are not compared.
- Inter / MiSans FontFace status is checked, collected DOM characters must belong to `scripts/font-corpus.txt`, and in Chinese mode CDP `CSS.getPlatformFontsForNode` reads the platform font actually used by a Chinese label to confirm it comes from the bundled MiSans subset.
- **Every visible label is measured by one shared rule** — `renderer/text-fit.js`, loaded by the page and called by the card itself: the text's own ink must stay inside the wall it could hit (the nearest ancestor allowed to clip, or the next element beginning on its line), and an element that clips its own text is measured against that box. A longer language otherwise passes every text check while showing `Fenster über 30 T…` cut off. Both checks call this one module instead of keeping private copies, because three measurements written separately drifted apart and the card spent six CI rounds shrinking digits no reader was losing. It reports every scenario at once rather than stopping at the first, because font metrics differ per OS: the same line that fit Windows and Linux overflowed by 12 pixels on macOS, and that is how the English wording was shortened too.

These checks do **not** prove complete cmap coverage, every fallback glyph, native menu rendering, a host-OS language edition of the app, or real credential encryption; the language suite never enters credentials and performs no encrypt/decrypt round trip.

## GitHub Actions and releases

The workflow is [`.github/workflows/build.yml`](.github/workflows/build.yml); all four runners have completed real runs, and the release path has published five times — v2.4.1, v2.5.0, v2.6.0, v2.6.1 and v2.6.2. A weekly scheduled run against `main` catches runner-image drift while no release is waiting on the answer; the Electron and electron-builder downloads are cached per platform and lockfile, because a cold runner was re-fetching ~100MB before it ran anything; and after publishing, the release job re-checks the asset set, the published digests and `SHA256SUMS.txt` against the files the runners built.
A local `git commit` triggers nothing in the cloud; a push, a pull request or a manual run does. GitHub Packages is for npm / container registries and the like — this project distributes desktop binaries through Artifacts and Release assets.

| Trigger | Behaviour |
| --- | --- |
| Push to `main` / pull request against `main` | Test, package, verify the artifacts, upload Artifacts; no Release |
| Manual `workflow_dispatch` | Same tests and packaging; no Release |
| Push a `v*` tag | The tag must equal `v` + `package.json` version; a Release is published only after all four runners succeed |

The runners are `windows-2022` x64, `ubuntu-22.04` x64, `macos-15` arm64 and `macos-15-intel` x64, on Node.js 24.
Every build job starts with `npm run check:release` and `npm run check:docs`: the host must match the matrix, the version must agree in four places, on a tag the name must equal `v` + version, and the five documents must still mirror each other. The release job runs neither, because the four build jobs already checked the same thing before uploading.
The Linux UI runs on a virtual X11 desktop (Xvfb + Openbox), which does not mean GNOME or Wayland sessions are verified.
The macOS build step allows the `dmgbuild` step three attempts in total and only unmounts volumes named `Token Monitor*`; when the attempts run out the job fails rather than hiding a real packaging error.
The packaged-app check accepts `pending` (the system never answered about the keychain) as a reported state and continues with the remaining assertions, but records it explicitly instead of counting it as verified encryption.
Package Artifacts are kept **14 days**, test diagnostics 7 days; a downloaded Artifact may need one more archive extraction.

A Release must contain six packages plus `SHA256SUMS.txt`, prefixed `token-monitor-<version>-`:

- `win-x64.zip`, `linux-x64.AppImage`
- `mac-arm64.dmg`, `mac-arm64.zip`
- `mac-x64.dmg`, `mac-x64.zip`

A tag containing `-` (for example `v2.7.0-beta.1`) is published as a pre-release; a plain version tag is published as the latest stable release. An existing public Release is never overwritten — publish a new version instead.

### Publishing

1. Actions is enabled in this repository; the four hosted runners and the publish permissions have all been exercised.
2. The workflow must exist on the **default branch** before it can be run manually from the Actions page: **Build desktop apps → Run workflow**.
3. No personal access token is needed: the release job declares `contents: write` and uses the built-in `GITHUB_TOKEN`; organisation policies can still restrict this.
4. Commits and pushes happen only after the user confirms. Cloud results come from actual runs; local changes are never reported as shipped.

**Push the tag by itself.** This repository has evidence both ways: `git push --atomic origin main refs/tags/v2.4.0` produced only the `main` run, no tag run, and therefore no Release (that empty tag has since been deleted); pushing `v2.4.1` on its own triggered the tag pipeline immediately. The official docs only state that "events will not be created for tags when more than three tags are pushed at once" and say nothing about pushing a branch and a tag together, so treat the combined push as unreliable.

```bash
git push origin main          # first: let all four runners go green on the new commit
git push origin v2.6.2        # then: push the tag alone, which is what triggers a Release
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
