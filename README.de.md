<p align="right"><a href="./README.md">EN</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.es.md">Español</a> | <a href="./README.pt-BR.md">Português</a> | <strong>Deutsch</strong></p>

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

Ruhezustand als Streifen, aufgeklappt als Buch, und schätzt *wie lange dein Geld reicht* — mit zwei Verbrauchs-Tempos (`30D / 7D`). Die Oberfläche gibt es in **Chinesisch, Englisch, Spanisch, Brasilianisch-Portugiesisch und Deutsch**: `Auto` folgt der Systemsprache, und alle fünf lassen sich in den Einstellungen festlegen. Gebaut auf Electron 45 mit reinem DOM und SVG. Kein Proxy-Server, keine Telemetrie.

## Vitrine

Alle Bilder unten zeigen lokale Demodaten; sie zeigen die Oberfläche und sind kein Beweis für einen bestimmten Testlauf.

<table>
<tr>
<td width="50%" align="center"><img src="shots/deck-en.png" width="440" alt="Das Buch auf Englisch"><br><sub><b>Buch</b> — Reichweiten-Messring, Guthaben, 30-Tage-Kurve, Modellmix und Cache-Treffer</sub></td>
<td width="50%" align="center"><img src="shots/deck.png" width="440" alt="Dieselbe Oberfläche auf Chinesisch"><br><sub><b>Buch (中文)</b> — dasselbe Instrument, ursprünglich auf Chinesisch geschrieben</sub></td>
</tr>
<tr>
<td width="50%" align="center"><img src="shots/strip-en.png" width="440" alt="Der Alltagsstreifen auf Englisch"><br><sub><b>Streifen</b> — die Dauerform auf Englisch: Reichweite in Tagen, Guthaben, heutiger Verbrauch und ein Sparkline</sub></td>
<td width="50%" align="center"><img src="shots/strip.png" width="440" alt="Streifen auf Chinesisch"><br><sub><b>Streifen (中文)</b> — dieselbe Form, ursprünglich auf Chinesisch geschrieben</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/settings.png" width="290" alt="Einstellungen-Schublade"><br><sub><b>Einstellungen</b> — Zugangsdaten, Aktualisierung, Design, Sprache und Tastenkürzel</sub></td>
<td width="33%" align="center"><img src="shots/dark.png" width="290" alt="Dunkles Design"><br><sub><b>Dunkel</b> — für Nacht oder dunkle Desktops</sub></td>
<td width="33%" align="center"><img src="shots/empty.png" width="290" alt="Zustand ohne Verbindung"><br><sub><b>Nicht verbunden</b> — Demodaten, bis du Zugangsdaten einträgst</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/deck-es.png" width="290" alt="Ledger en español"><br><sub><b>Español</b> — <i>Autonomía</i>, <i>Recarga / bono</i>, <i>Se agota 5 mar</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-pt-BR.png" width="290" alt="Livro em português do Brasil"><br><sub><b>Português (Brasil)</b> — <i>Autonomia</i>, <i>Recarga / bônus</i>, <i>Acaba 5 de mar.</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-de.png" width="290" alt="Buch auf Deutsch"><br><sub><b>Deutsch</b> — <i>Reichweite</i>, <i>Aufladung / Gutschrift</i>, <i>Am 5. März leer</i></sub></td>
</tr>
</table>

Die beiden Bilder unten kommen aus einem echten Fenster statt aus der gestellten Vitrine — als Check, dass die echte App so aussieht wie die Bilder darüber:

<table>
<tr>
<td width="50%" align="center"><img src="shots/live-strip.png" width="420" alt="Streifen im echten Fenster"><br><sub><b>Streifen live</b> — aus einem laufenden Fenster aufgenommen</sub></td>
<td width="50%" align="center"><img src="shots/live-deck.png" width="420" alt="Buch im echten Fenster"><br><sub><b>Buch live</b> — aus einem laufenden Fenster aufgenommen</sub></td>
</tr>
</table>

## Was es zeigt

- **Streifen / Buch**: Guthaben, heutiger Verbrauch, zwei Reichweiten-Tempos und ein geschätztes Datum, an dem es leer ist.
- **Verbrauchsdetails**: 30-Tage-Verbrauchskurve, Tokens, Modellmix, Cache-Trefferquote, Anfragezahlen und effektiver Stückpreis.
- **Desktop-Verhalten**: verschiebbar, im Vordergrund halten, Systemablage, zwei Fensterformen; Effekte transparenter Fenster unterscheiden sich je Plattform.
- **Anzeige und Privatsphäre**: Hell / Dunkel / System, ein Klick zum Verbergen der Beträge, lokal Demodaten als Standard.
- **Synchronisation**: manuell aktualisieren, oder alle 30 Sekunden / 1 Minute / 5 Minuten.

## Herunterladen und ausführen

Veröffentlichungen: [GitHub Releases](https://github.com/A-Bullrager/token-monitor/releases). Entwicklungsbauten liegen in den Artifacts jedes Actions-Laufs.
**[v2.6.2](https://github.com/A-Bullrager/token-monitor/releases/tag/v2.6.2) ist die aktuelle Veröffentlichung** — der Bau, der der Karte das Anpassen ihrer eigenen Zahlen endgültig beibringt: fünf Sprachen, beide Fensterformen, und jede Ziffer daran gemessen, was die lesende Person tatsächlich verliert, nachgeprüft, sobald die Plattform ihre Font-Metriken geliefert hat. Alle vier nativen Runner waren grün, und die Seite trägt sechs Pakete plus `SHA256SUMS.txt`. Das Windows-Paket wurde von dieser Seite neu heruntergeladen, passte zur Prüfsumme und zum Asset-Digest von GitHub selbst, und wurde auf einem echten Windows-10-Rechner entpackt und gestartet, wo es Version 2.6.2 mit `isPackaged` meldete; die Pakete für Linux und macOS decken nur ihre eigenen Runner ab, nicht den Rechner des Entwicklers. Er ersetzt v2.6.1 (am selben Tag früher veröffentlicht), das Zahlen an den Element-Boxen maß statt am Text darin — auf den Plattformen mit engeren Boxen verkleinerte es daher Zahlen, die Platz hatten.

| Plattform | Paket | So startest du es |
| --- | --- | --- |
| Windows x64 | portables ZIP | Ganzes Verzeichnis entpacken und `Token Monitor.exe` daraus starten; die exe nicht allein herausziehen |
| Linux x64 | AppImage | Ausführbar machen und in einer grafischen Desktop-Sitzung starten |
| macOS Apple Silicon | arm64 DMG + ZIP | Die App aus dem DMG nach Programme ziehen, oder das ZIP nehmen |
| macOS Intel | x64 DMG + ZIP | Das x64-Paket nehmen; nicht mit arm64 vermischen |

### Hinweise je Plattform

- **macOS**: Bauten sind ad-hoc signiert (`identity: '-'`) mit `notarize: false`. Das ist keine Developer-ID-Signatur und die App ist nicht notarisiert, eine aus dem Browser geladene Kopie kann Gatekeeper also blockieren.
- Prüfe zuerst die `SHA256SUMS.txt` von der Release-Seite. Nur wenn du der Quelle vertraust, folge der Systemmeldung und erlaube die App unter **Systemeinstellungen → Datenschutz & Sicherheit**; wenn das System sich weigert, erzwing es nicht. Eine passende Prüfsumme ist kein Identitätsnachweis.
- **Linux**: braucht einen grafischen Desktop plus Electrons Abhängigkeiten (GTK, NSS, ATK, GBM, ALSA und Verwandte); für den Schutz der Zugangsdaten braucht es zusätzlich ein funktionierendes Desktop-Keyring. Paketnamen und AppImage- / FUSE-Einrichtung stehen in der Dokumentation deiner Distribution.
- GNOME braucht möglicherweise eine AppIndicator- / KStatusNotifierItem-Erweiterung. Transparenz, Vordergrundverhalten und Ablageverhalten unterscheiden sich zwischen Desktops, Compositors und Wayland-Sitzungen; nichts ist garantiert identisch.

## Aus dem Quellcode starten

Braucht **Node.js ≥ 22.12.0, Node.js 24 empfohlen**, plus npm. Im Repository-Stamm:

```bash
npm ci
npm start
```

`npm start` entfernt ein übrig gebliebenes `ELECTRON_RUN_AS_NODE` aus der Umgebung des Kindprozesses, damit Electron nicht in einen Node-Modus ohne Fenster verfallen kann.

### Lokal bauen

Baue auf der Plattform, die du ansprechen willst; lauf `npm run icons` vor dem ersten Build, um die Packaging-Icons zu erzeugen.

| Befehl | Ziel und Ausgabe |
| --- | --- |
| `npm run package:dir` | Verzeichnis-Bau für Plattform und Architektur des Hosts, in `dist/Token Monitor-<platform>-<arch>/` |
| `npm run package:win` | Nur Windows-x64-Verzeichnisbau (`dist/`), kein Archiv |
| `npm run package:win:zip` | **Nur Windows-x64-Hosts**; verpackt das Verzeichnis in `release/token-monitor-<version>-win-x64.zip`, dasselbe Skript wie in CI |
| `npm run package:linux` | Linux-x64-AppImage nach `release/` |
| `npm run package:mac` | macOS DMG + ZIP für die Host-Architektur als Standard, nach `release/` |

Auf macOS kannst du mit `npm run package:mac -- --arm64` oder `-- --x64` explizit sein; für eine Architektur zu bauen ist nicht dasselbe, das Ergebnis darauf gestartet zu haben.
`test:distributable` verlangt das echte Archiv in `release/` — der Verzeichnisbau zählt nicht. Es vergleicht das Archiv außerdem mit den Quellen und **scheitert, wenn das Paket älter als der Code ist**, weil ein lokal "verifiziertes ZIP" einmal ein Rest des vorherigen Baus war.

## Ein DeepSeek-Konto verbinden

1. Öffne die Einstellungen und lies zuerst den Hinweis unten, wo die Zugangsdaten liegen.
2. Erstelle einen **API-Key** unter [DeepSeek API Keys](https://platform.deepseek.com/api_keys); er füttert den offiziellen Guthaben-Endpunkt.
3. Für Verbrauch und Reichweite melde dich auf der [Verbrauchsseite der Plattform](https://platform.deepseek.com/usage) an, öffne den Network-Reiter der Entwicklerwerkzeuge und lade neu.
4. Kopiere den **Session Token** hinter `Bearer` im `Authorization`-Header einer `api/v0`-Anfrage; den ganzen Header einzufügen geht auch, die App schneidet das Präfix ab.
5. Schalte *Demodaten verwenden* aus, dann speichern und synchronisieren. Wenn die Sitzung abläuft, musst du den Token selbst erneuern.

**Mit nur einem API-Key lässt sich nur das Guthaben lesen. Die Reichweite braucht den Verbrauch aus dem Session Token, deshalb bleibt die Startbahn mit nur einem API-Key leer.**
Ein Session Token ist ein Geheimnis: halte es aus Screenshots, Logs, Issues und öffentlichen Repositories heraus.

## Woher jede Zahl kommt

| Kennzahl | Formel / Quelle |
| --- | --- |
| Guthaben gesamt | Offizielles `GET https://api.deepseek.com/user/balance`, CNY-Konto bevorzugt |
| Heutiger Verbrauch / Tokens | Tagesdaten der Plattform, genommen am lokalen Kalendertag |
| 30-Tage-Verbrauch / Tokens | 30 Kalendertage inklusive heute, bei Bedarf mit dem Vormonat zusammengelegt |
| Tagesdurchschnitt 30D | 30-Tage-Gesamt ÷ Anzahl der Tage, die tatsächlich Verbrauch hatten |
| Reichweite 30D | Guthaben gesamt ÷ Tagesdurchschnitt 30D |
| Tagesdurchschnitt 7D | Letzte 7 Kalendertage gesamt ÷ 7, Tage ohne Verbrauch mitgezählt |
| Reichweite 7D | Guthaben gesamt ÷ Tagesdurchschnitt 7D |
| Datum der Leere | Heute plus die gerundete Reichweite in Tagen — eine Schätzung, kein Versprechen |
| Monatsprognose | Tagesdurchschnitt des gewählten Tempos × 30 |
| Effektiver Preis | 30-Tage-Kosten ÷ Tokens × 1.000.000 |
| Cache-Trefferquote | `hit ÷ (hit + miss + Prompt/Eingabe) × 100%`, über den Eingabe-Tokens |
| Anfragen / Modellmix | Aggregiert über dieselbe 30-Tage-Fenster; Modellzeilen tragen ihren eigenen Cache-Hinweis |

Wenn der Durchschnitt null ist oder nötige Daten fehlen, wird keine Reichweiten-Schätzung gezeigt; eine dünne Verbrauchsstichprobe wird als Richtwert gekennzeichnet.
Der Plattformverbrauch kommt aus undokumentierten internen Endpunkten `/api/v0/usage/amount` und `/api/v0/usage/cost` (auf `platform.deepseek.com`, pro Monat angefragt).
Felder, Authentifizierung und Datenverzug können sich ändern; schlägt die Anfrage des Vormonats fehl, arbeitet die aktuelle Implementierung mit dem weiter, was sie holen konnte — eine 30-Tage-Zahl kann also unvollständig sein.

## Sicherheit und lokale Konfiguration

Zugangsdaten erreichen den Hauptprozess über die Preload-Brücke, und nur maskierte Werte gehen zurück an die Oberfläche. Ob `safeStorage` verfügbar ist, hängt von Plattform und Desktop-Diensten ab:

| Plattform | Schutz, wenn verfügbar |
| --- | --- |
| Windows | DPAPI |
| macOS | Schlüsselbund (Keychain) |
| Linux | Ein echtes `gnome_libsecret`- oder KWallet-Backend (`kwallet` / `kwallet5` / `kwallet6`) |

Auf Linux werden `basic_text`, `unknown` und jedes andere nicht erkannte oder nicht verfügbare Backend als `none` behandelt.
**Wenn die Systemverschlüsselung nicht verfügbar ist, landen Zugangsdaten als `plain:` + Base64 auf der Platte. Das ist keine Verschlüsselung: wer die Konfigurationsdatei lesen kann, holt sie zurück.** Die Oberfläche zeigt dann "Unverschlüsselt · kein System-Schlüsselbund"; wenn du das nicht akzeptierst, speichere keine echten Zugangsdaten.

**Die Prüfung ist träge und asynchron.** Die Verfügbarkeitsprüfung (`isAsyncEncryptionAvailable`, nur wenn sie fehlt zurück auf die synchrone API) läuft beim Öffnen der Einstellungs-Schublade, nie im Startpfad — auf macOS blockiert ein gesperrter Schlüsselbund oder eine offene Autorisierungsabfrage einen synchronen Aufruf und friert den ganzen Hauptprozess ein, genau das ist im ersten Cloud-Lauf passiert. Deshalb:

- Bis das System antwortet, bleibt der Speicher-Neutral ("Nur auf diesem Gerät gespeichert"): er verspricht keine Verschlüsselung und behauptet keinen Klartext.
- **Neue Zugangsdaten** zu speichern, während das Backend unbekannt ist, wird abgelehnt mit "Systemverschlüsselung unbestätigt · Zugangsdaten nicht gespeichert" statt still herunterzustufen. Design, Tempo, Fixierung oder Form zu ändern speichert weiterhin normal.
- Eine unangetastete Zugangsdaten behält den Chiffretext, der schon auf der Platte liegt; ein Speichern ohne Bezug dazu verschlüsselt sie nie neu und stuft sie nie herunter. Ein geerbter `plain:`-Wert wird erst zu `enc:`, wenn ein vertrauenswürdiges Backend bestätigt ist.
- Das Speicher-Verhalten über alle Schichten wurde nur gegen Windows-DPAPI verifiziert. Die macOS- und Linux-Keyring-Pfade sind auf echten Geräten nicht verifiziert.

Wo die Alltagskonfiguration liegt (Testläufe nutzen stattdessen isolierte Profile):

| Plattform | Pfad von `config.json` |
| --- | --- |
| Windows | `%APPDATA%\Token Monitor\config.json` |
| macOS | `~/Library/Application Support/Token Monitor/config.json` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/Token Monitor/config.json` |

Ein leeres Feld bei den Zugangsdaten lässt den gespeicherten Wert stehen; **Zugangsdaten löschen** leert beide und kehrt zu den Demodaten zurück.
Konto-Anfragen gehen direkt an `api.deepseek.com` / `platform.deepseek.com`; es gibt keinen Relais und keine Analytik. Icons, Schriften und Demodaten sind alle lokal.

## Sprachen

Die Oberfläche ist auf Chinesisch geschrieben, und jede andere Sprache ist ein Wörterbuch, dessen Schlüssel genau diese chinesischen Zeichenketten sind (`renderer/i18n.js` plus `renderer/locales/<sprache>.js`), geladen vom Hauptprozess *und* vom Renderer. Ein Label kann nicht in nur einer Sprache geändert werden: `npm run check:i18n` scheitert, wenn einem Wörterbuch ein Schlüssel fehlt, wenn es auf Chinesisch antwortet, wenn eine interpolierte Form fehlt oder wenn es den Plural vergisst.

| Oberfläche auf Englisch | Oberfläche auf Chinesisch |
| --- | --- |
| ![Ledger (English)](shots/deck-en.png) | ![中文界面](shots/deck.png) |

- **Enthaltene Sprachen**: Chinesisch (die Schreibsprache), Englisch, Spanisch, Brasilianisch-Portugiesisch und Deutsch. `Auto` vergleicht die Systemsprache über das Präfix — `zh*`, `es*`, `pt*`, `de*`, `en*` — und alles andere landet bei Englisch, dem einzigen Ausweichpfad, den jede mitgelieferte Schrift darstellen kann. `pt-PT` bekommt damit das brasilianische Wörterbuch; `es-MX` und `es-ES` teilen sich ein Spanisch.
- **Übersetzt wird**: beide Fensterformen, die Einstellungs-Schublade, die Kürzelliste, Hinweise, Fehlermeldungen, Ablagemenü, Ablage-Kurzhilfe und das macOS-Anwendungsmenü — dazu die ASCII-Instrumentenbeschriftung (`DAYS`, `TOTAL`, `SAMPLE`, `AVG`, `PEAK ¥29.10 · 10-03`, `SYNCED 18:02:18`), die auch im Chinesischen englisch steht.
- **Nicht übersetzt**: der Produktname, der Slogan `Know your runway.`, `DeepSeek`, die Feldnamen `API KEY` / `SESSION TOKEN` und die Instrumentencodes `DEMO`, `SYNC`, `30D / 7D` sowie die Größenordnungen `M` / `K`.
- **Zahlen und Daten folgen der Sprache**: Chinesisch gruppiert Tokens mit 万 / 亿 und schreibt die Leere als `约 3 月 5 日见底`; Englisch nutzt `12.5K` und `Runs out Mar 5`; Spanisch `12,5 mil` und `Se agota 5 mar`; Portugiesisch `12,5 mil` und `Acaba 5 de mar.`; Deutsch `12.500` und `Am 5. März leer`. Dahinter stehen identische Mengen, und die Prüfungen vergleichen sie numerisch. Ein Wert, der zu lang für sein Feld ist — ¥99.999.999,99 in einer für ¥1,49 gerechneten Spalte, oder ein deutsches Mikrolabel vier Pixel breiter als das englische — verkleinert seine Schrift selbst, bis jede Ziffer zu sehen ist. Gemessen wird der Text gegen die Wand, die er treffen könnte — der nächste schneidende Vorfahre oder das nächste Element, das in seiner Zeile rechts von ihm beginnt —, deshalb bleibt eine Zahl, die in Leerraum läuft, in ihrer entworfenen Größe, und nur eine, die wirklich verlöre oder einem Nachbarn ins Feld griffe, wird verkleinert. Diese Entscheidung gilt nur für die Fonts, die in dem Moment auf dem Bildschirm standen; Runner messen rund fünf Prozent breiter als die Maschine, die die Prüfung schrieb, also prüft die Karte ihre eigenen Zahlen im sichtbaren Zustand jede Sekunde erneut. Das ist ein Lesen, kein Neurechnen, und ein Stil wird nur geschrieben, wenn eine Zahl tatsächlich aus ihrer Box gelaufen ist. Das eine Feld, das Schrumpfen nicht retten kann, ist die Aufstellungsszeile des Guthabens im Buch — zwei exakte Beträge mit zwei Währungszeichen passen in keine lesbare Schriftgröße —, deshalb steht sie ab zehntausend in den Einheiten, mit denen jede Sprache ohnehin zählt (`90 Mio.` / `90M` / `90 mi` / `9000 万`), und jede Ziffer bleibt in der Kopfzeile darüber, die dafür Platz hat.
- **Plural gehört der Sprache**: Chinesisch markiert keine grammatische Anzahl, also beugt jedes Wörterbuch sein eigenes Zählwort (`1 día activo` / `15 días activos`, `1 Tag` / `15 Tage`). Die Paritätsprüfung lehnt eine Sprache ab, deren Einzahl und Mehrzahl gleich aussehen, und behandelt ein gemessenes `1.0` als Plural.
- **Bekannte Grenze**: Beträge behalten in jeder Sprache dasselbe Dezimalformat (`¥145.09`), die Uhr auch. Nur Token-Zahlen folgen der Gruppierung der Sprache. Die Sprache zu wechseln speichert die Einstellung und **lädt das Fenster neu** — als einzige Einstellung, weil Text, der schon in der Seite steht, nicht an Ort und Stelle zurückübersetzt werden kann.

**Eine echte Grenze beim Text**: die mitgelieferten Schriften sind Subsets. Das chinesische Subset wird aus `scripts/font-corpus.txt` geschnitten, neuer chinesischer Text muss also innerhalb dieses Korpus bleiben — `scripts/glyph-demand.mjs` scheitert, bevor ein Fenster aufgeht, wenn ein Wörterbuch ein Zeichen außerhalb des Korpus verlangt. Die Akzente, die die neuen Sprachen brauchen (`Á Ã Ç É Í Ó Ø Ú Ü ß á ã ä ç é ê í ñ ó ô õ ö ú ü`), wurden mit fontTools gegen das echte cmap des Inter-Subsets geprüft. Die Korpusprüfung in `npm run test:i18n` kontrolliert danach die Zeichen, die wirklich auf dem Schirm sind, und sie hat schon einen echten Fehler gefunden: Monospace-Labels erschienen auf Linux-Runnern als Kästchen, weil der Font-Stack keine mitgelieferte CJK-Ausweichschrift hatte. Bis 2.7.0 war die Grenze in der Oberfläche zu sehen: dem MiSans-Subset fehlte `文`, also hieß die Option `Chinese`. Jetzt heißt sie `中文` — in jeder Sprache, denn das Subset deckt das Zeichen ab, und `scripts/subset-font.py` ist der Schritt, der es schneidet.

## Tests und was sie beweisen

**Lokal (Windows 10 x64)**: Datentests, 22 Gruppen von Storage-Backend-Assertions mit simulierten Backends, Wörterbuch-Parität, Glyph-Bedarf, Oberfläche aus dem Quellcode, Verzeichnisbau und ein echtes ZIP-Entpacken und Starten sind grün; 16 Sprach-Szenarien × 4 Oberflächenzustände sind grün, jedes gesammelte Zeichen liegt im Korpus, und in keiner mitgelieferten Sprache wird ein Label abgeschnitten; in den 10 Zahlen-Passungen × 10 Größenordnungen läuft ebenfalls keine Zahl aus ihrer Box. fontTools wurde gegen die echten Subset-cmaps eingesetzt — jedes lateinische Zeichen, das die Wörterbücher auf den Schirm bringen können, sitzt im Inter-Subset, und jedes chinesische Zeichen im Bedarfsatz sitzt in einem der beiden Pakete.

**Achtunddreißig Cloud-Runden bisher; die aktuelle Veröffentlichung ist auf allen vier nativen Runnern grün.** Die Erzählung Runde für Runde ist unten eingeklappt — alles, was sie *negativ* belegt hat, steht außerhalb der Klappung, damit Einklappen keine Einschränkung verstecken kann. Eine dieser negativen Aussagen betrifft die Tests selbst: die Morph-Prüfung war auf macOS blind, weil dort die Fensterkante erst nach dem Verschwinden der CSS-Klasse wandert, die sie bemaß (Runde 12) — sie bewertet jetzt die tatsächlich beobachtete Bewegung.

<details>
<summary>Cloud-Baugeschichte (Runden 1–13)</summary>

**Cloud-Runde 1 (`9faa78e`, vier native Runner)**: Windows x64 grün; Linux x64 las "der Debugger-Socket schloss vor der Antwort" beim Beenden falsch als Fehler; beide macOS-Bauten signiert und verifiziert, aber die Startprüfung der gepackten App lief beim ersten CDP-Hin-und-Zurück in den Timeout.

**Cloud-Runde 2 (`4fb1d4d`)**: Windows weiter grün; die Sprach-Suite auf Linux wurde grün und der Fehler wanderte zum Paketnamen — electron-builder wirft `linux-x86_64.AppImage` aus, während Prüfungen und Release-Vertrag `linux-x64` erwarten. Beide macOS-Jobs liefen weiter in den Timeout, diesmal aber mit Prozess-Stacks: 80 von 80 Samples saßen in `SecItemCopyMatching → SecurityServer → mach_msg`, also hatte ein **synchroner Schlüsselbund-Leser im Startpfad** den Hauptprozess eingefroren (die Quellcode-Tests nutzen unsigniertes Electron, dessen Schlüsselbund-Eintrag auf dem Runner schon autorisiert ist, deshalb traf es nur die gepackte App).

**Aus dieser Evidenz folgende Fixes**: der Race beim Beenden wird nur in genau diesem Fall toleriert und der Prozess muss weiter mit 0 enden; Monospace-Labels bekamen eine mitgelieferte chinesische Ausweichschrift (bis 2.7.0 MiSans, danach Noto Sans SC) und die Prüfungen lesen jetzt über CDP die tatsächlich genutzte Plattform-Schrift; der Linux-Artefaktname ist auf `linux-x64` festgelegt; die Schlüsselbund-Prüfung ist komplett aus dem Startpfad draußen (siehe *Sicherheit und lokale Konfiguration*).

**Cloud-Runde 3 (`de0c757`)**: Windows x64, Linux x64 (AppImage entpackt und gestartet) und macOS Apple Silicon (DMG + ZIP gebaut, streng verifiziert, entpackt und Startprüfung aus dem DMG) alle grün. macOS Intel scheiterte nur beim DMG-Erzeugen: das abschließende `hdiutil detach` von `dmgbuild` meldete "Resource busy", obwohl das ZIP im selben Schritt gelang und der identische arm64-Job durchging — ein Runner-Race, kein Packaging-Fehler, also bekam dieser Schritt ein begrenztes Wiederholen mit höchstens drei Versuchen, das nur sein eigenes Volume aushängt.

**Cloud-Runde 4 (`036e326`, alle vier grün)**: das Intel-Race trat wieder auf, das Wiederholen fing es im zweiten Versuch, und sowohl ZIP-Entpacken als auch DMG-Installation bestanden; alle vier Runner luden ihre Pakete hoch.

**Cloud-Runde 5 (`v2.4.1`-Tag, Lauf 40642992704)**: den Tag allein zu pushen löste wie erwartet das Tag-Pipeline aus, alle vier Runner bestanden, und der Release-Job verifizierte die sechs Pakete, erzeugte `SHA256SUMS.txt` und veröffentlichte. Das von der Release-Seite neu geladene Windows-Paket passte zur Prüfsummenliste und bestand lokal alle Assertions (`isPackaged`, Version, keine Schlüsselbund-Prüfung beim Start, DPAPI-Label in den Einstellungen). Linux- und macOS-Pakete deckten nur ihre eigenen Runner ab.

**Der erste zweisprachige Commit (`1cedcc6`) scheiterte auf allen vier Runnern gleichzeitig**: die Assertions waren für die chinesische Oberfläche geschrieben, während die Runner-Hosts auf Englisch antworten, also löste `auto` auf Englisch. Das Produkt verhielt sich richtig, die Testannahme nicht. Der Fix lässt die Regression die Sprache benennen, die sie prüft (siehe `test:ui` oben), und lässt bewusst nur den Schritt "auf Englisch wechseln, dann neu starten" unpinned.

**Zweiter zweisprachiger Versuch (`d62fc57`, alle vier grün)**: auf englischsprachigen Linux- und macOS-Runnern bestanden die 11 Sprach- / Zeitzonen-Szenarien, die UI-Regression und die Startprüfungen aus entpacktem AppImage plus DMG-Installation — und erzeugten 2.5.0-Pakete für jede Plattform.

**Cloud-Runde 8 (`v2.5.0`-Tag, Lauf 40660748693)**: den Tag allein zu pushen löste das Tag-Pipeline aus, alle vier Runner bestanden, und der Release-Job prüfte die sechs Pakete, erzeugte `SHA256SUMS.txt` und veröffentlichte. Das Windows-Paket wurde von der Release-Seite neu geladen, seine SHA256 passte zur Liste, und es wurde hier über dieselben Assertions wie jeder andere Build entpackt und gestartet. Linux- und macOS-Pakete decken nur ihre eigenen Runner ab.


**Runde 9 (`5a21201`, der erste Fünf-Sprachen-Commit) scheiterte nur auf macOS**: die neue Label-Passungs-Assertion meldete die Tempenzeile *auf Englisch* 12px außerhalb ihrer Box auf macOS Apple Silicon, während der identische Build auf Windows und Linux sauber war — die Zeile war gegen die Schriften des Rechners gerechnet worden, der sie geschrieben hatte. Die Prüfung stoppte außerdem beim ersten fehlgeschlagenen Szenario, eine Runde konnte also nur das erste Problem einer Plattform zeigen.
**Runde 10 (`819601e`, alle vier grün)**: der Passungs-Durchlauf sammelt jetzt jedes Szenario und jeden Zustand und scheitert einmal mit der ganzen Liste, und der englische Text wurde `15 active days of 30` — dieselbe Aussage in weniger Zeichen, und weniger Zeichen sind der Unterschied zwischen einem Label und einem abgeschnittenen.
**Runde 11 (`v2.6.0`-Tag, Lauf 40801968504)**: den Tag allein zu pushen löste das Tag-Pipeline aus, alle vier Runner bestanden, und der Release-Job verifizierte die sechs Pakete, erzeugte `SHA256SUMS.txt` und veröffentlichte. Das Windows-Paket wurde von der Release-Seite neu geladen, seine SHA256 passte zur Liste, und es wurde hier über dieselben Assertions wie jeder andere Build entpackt und gestartet (`isPackaged`, Version 2.6.0). Linux- und macOS-Pakete decken nur ihre eigenen Runner ab.

**Runde 12 (`a244fa4`, ein reiner Dokumentations-Commit) scheiterte wieder auf macOS — am Test, nicht am Produkt**: die Morph-Prüfung meldete `596 -> 593` auf Apple Silicon, obwohl derselbe Code eine Runde zuvor auf demselben Runner grün gewesen war. Die Beprobung endete mit der beobachteten CSS-Klasse, und macOS wendet `setSize` in einer eigenen Reihenfolge an: auf einem ausgelasteten Runner wanderte die Fensterkante, nachdem die Klasse weg war. Die Messung war blind; die Animation lief.

**Runde 13 (`c52a77e`, alle vier grün)**: der Morph wird jetzt aus den Frames bewertet, in denen die Kante tatsächlich wandert, mit bis zu drei protokollierten Messläufen pro Durchgang. Gegen einen echten Sprung geprüft: die Dauer auf 1ms gezwungen, scheitert die Prüfung mit "biggest single step 668px of 668px".

**Runden 14–16 (`1f78fb2`, `ef16b04`, `f7f336f` — alle vier Runner rot)**: eine Prüfung, die Größenordnungen durch die echte Renderstrecke schickt, die das Demo-Konto nie zeigt, fand überall echte Überläufe — die Heute-Zahl des Streifens 21px außerhalb ihres Felds bei ¥123.456,78, das englische Tempo-Mikrolabel, die Aufstellungsszeile des Buchs. Die erste Korrektur (eine Zahl an der Box auszurichten, die sie tatsächlich schneidet, statt an sich selbst) scheiterte anders: das Element meldete gar keine Inline-Schriftgröße, was hieß, dass der Ausrichter gelaufen war und entschieden hatte, der Text passe.

**Runden 17–19 (`b7a3e58`, `796f101`, `6ee238f` — Linux grün, drei rot)**: sechs Runden, in denen Prüfung und Produkt nicht darin übereinkamen, wann eine Messung gilt. Die Karte bekam: ein erneutes Messen nach dem eigenen Einpendelfenster, eine Meldung dieses Fensters, eine Nachprüfung ihrer bereits entschiedenen Zahlen pro Sekunde, und die Korrektur eines Laufs mit ausgeblendeter Ansicht — der hatte längst richtige Anpassungen gelöscht. Runde 19 benannte den Fehler erstmals pro Sprache statt pro Plattform (`zh` auf Windows, `es` auf Apple Silicon), und damit war klar, dass die Prüfung weiterhin im falschen Moment las.

**Runde 20 (`a5240d5` — drei rot)**: Überlauf liste, Nachweis der Verkleinerung und Nachweis des ausgelieferten Aussehens kommen jetzt aus einer einzigen Momentaufnahme in einer einzigen Aufgabe, und ein noch überlaufender Messwert ist kein Urteil, bevor die eigene Nachprüfung der Karte diesen Zustand erfasst hat (spätestens nach drei Läufen, ein echtes Limit wird also weiterhin gemeldet, samt Laufzähler). Der Widerspruch — saubere Seite, aber die Zahl nie verkleinert — verschwand, und übrig blieben drei echte Überläufe, die die Runner sahen und diese Maschine nicht: die deutsche Aufstellungsszeile 63px über einem 160px-Feld, die Guthaben-Kopfzeile 6px, das englische Dünne-Probe-Mikrolabel 4px.

**Runde 21 (`c63d872` — drei rot)**: die Aufstellungsszeile geht oberhalb einer Million in kompakte Schreibweise (`90 Mio.` / `90M` / `9000 万`), während die Kopfzeile jede Ziffer behält; die Kopfzeile bekam eine weitere Stufe Spiel, und das englische Label sagt dasselbe in drei Zeichen weniger. Alle drei Überläufe verschwanden. Was blieb, war die Übergriffigkeit der Prüfung selbst: sie verlangte, dass ein bestimmtes Feld *das*jenige ist, das bei ¥99.999.999.999,99 Tagesverbrauch nachgibt — das ist eine Tatsache über die Metriken einer Plattform, nicht über das Instrument.

**Runde 22 (`d7e4253` — Windows, Linux und macOS Intel grün; Apple Silicon rot)**: die Extremgröße dokumentiert jetzt die Menge der Felder, die nachgeben dürfen, und scheitert nur an einem, den niemand aufgelistet hat; ausgedruckt wird weiterhin, welches hier nachgab und um wie viele Pixel. Apple Silicon scheiterte zum zweiten Mal in Folge an einem einzigen Wort — "timed out waiting for expanded again" —, also melden die Ansichts-Waits beim Ablauf die body-Klasse, die Fensterbreite und den eigenen Ansichtszustand des Renderers, und der Expandierschritt bekam einen protokollierten Wiederholungsversuch in genau der Form, die die Morph-Bewertung schon nutzte.
**Runde 23 (`7bb4591` — Windows, Linux und macOS Intel grün; Apple Silicon an einer Zahl rot)**: die Ansichts-Waits trugen ihre neue Evidenz, und das Expandieren scheiterte kein drittes Mal — keiner der Runner brauchte den protokollierten Wiederholungsversuch, und der Report sagt das. Übrig blieb ein Rest: die deutsche Aufstellungsszeile maß, trotz kompakter Schreibweise, auf Apple Silicon 208px in einem 202px-Feld, sechs Pixel über ihrem Schrift-Floor. Das Währungszeichen verließ die kompakte Form — die Kopfzeile darüber trägt es schon, und genau diese zwei Zeichen *waren* die sechs Pixel —, und die Mikrozelle bekam eine weitere Stufe Reserve.
**Runde 24 (`98a7693`, alle vier grün)**: die sechs Pixel waren genau die zwei Währungszeichen, die sie waren, und die Größenordnungs-Leiter — mit dem verspäteten Metrik-Einschub in jedem Lauf — bestand auf Windows x64, Linux x64, macOS Apple Silicon und macOS Intel.

**Runde 25 (`v2.6.1`-Tag, Lauf 40846036293)**: den Tag allein zu pushen löste die Tag-Pipeline aus, alle vier Runner bestanden, und der Release-Job verifizierte die sechs Pakete, erzeugte `SHA256SUMS.txt` und veröffentlichte. Das Windows-Paket wurde von der Release-Seite neu geladen, seine SHA256 passte zur Liste und zum Asset-Digest von GitHub selbst, und es wurde hier über dieselben Assertions wie jeder andere Build entpackt und gestartet (`isPackaged`, Version 2.6.1). Linux und macOS decken nur ihre eigenen Runner ab.
**Runde 26 (`389bbb7`, nur Dokumentation)**: dieselben sechs Pixel zurück, diesmal mit dem spanischen Buch auf Apple Silicon im Namen, und das Artefakt war endlich konkret genug zum Aufhören zu raten: die Zahl *war* ausgerichtet, die Inline-Größe saß, und irgendetwas maß trotzdem daneben.

**Runde 27 (`1d61df6`)**: `fittedNodes` wurde eine Map, die den Floor jedes Feldes merkt, sodass eine Nachprüfung die damalige Entscheidung wiederholt statt einen Standard anzuwenden. Apple Silicon wurde zum ersten Mal grün; macOS Intel scheiterte an denselben sechs Pixeln.

**Runde 28 (`14a08be`)**: der Floor der Kopfzeile wanderte von 0.6 auf 0.5. Intel wurde grün, Apple Silicon blieb sechs Pixel drüber — nun bei 16.5px, in einer 226px-Box mit etwa 113px Ziffern, was sagte, dass die Box nicht das Problem der lesenden Person ist.

**Runde 29 (`4084742`, Version 2.6.2)**: die erste Messung am Ink-Lauf kam, alle vier Test-Jobs waren grün; der Lauf scheiterte trotzdem einen Schritt später auf macOS Intel mit `hdiutil` Exit 16 — "Resource busy" — beim Mounten der gebauten DMG für die Paketprüfung.

**Runde 30 (`2595944`)**: dieses DMG-Rennen bekam den begrenzten, protokollierten Wiederholungsversuch, den Runde 3 für den Bauschritt gesetzt hatte. Intel fiel daraufhin in der Quellcode-Suite an der deutschen Buchungszeile auf: 16px über gemeldet, während ihr Ink zwei Pixel *innerhalb* der Schneide endete — der letzte False Positive, und der, den die neuen `ink`- und `wall`-Felder präzise benannten.

**Runde 31 (`9b24c8a`, alle vier grün)**: Ausrichter und Prüfung stellen jetzt dieselbe Frage — liegt jede Ziffer sichtbar innerhalb der Wand, die der Text treffen könnte (der nächste schneidende Vorfahre oder das nächste Element seiner Zeile)? In Leerraum zu laufen ist kein Fehler mehr, dass ein Element seinen eigenen Text anschneidet bleibt einer, und die Karte verkleinerte Zahlen nicht mehr, die Platz hatten. Das Nachgeben am Extrem wird als 19px Ink gemeldet statt 32px Box, und `--wide-fonts="Courier New"` erwischt dasselbe Feld weiterhin bei 28px — die lockerere Regel ist nicht blind.

**Runde 32 (`v2.6.2`-Tag, Lauf 40862991393)**: den Tag allein zu pushen löste die Tag-Pipeline aus, alle vier Runner bestanden, und der Release-Job verifizierte die sechs Pakete, erzeugte `SHA256SUMS.txt` und veröffentlichte. Das Windows-Paket wurde von der Release-Seite neu geladen, seine SHA256 passte zur Liste und zum Asset-Digest von GitHub selbst, und es wurde hier über dieselben Assertions wie jeder andere Build entpackt und gestartet (`isPackaged`, Version 2.6.2). Linux und macOS decken nur ihre eigenen Runner ab.
**Runde 33 (`640bf33`, nur Dokumentation)**: drei Runner grün, und macOS Intel nannte eine Lücke, die die veröffentlichte v2.6.2 noch hat. Die deutsche Aufstellungsszeile mit ¥999.999,99 + ¥234.567,90 maß nach der neuen Ink-Regel acht Pixel außerhalb ihrer Wand — diesmal ein echter Verlust, kein Box-Artefakt —, weil die Grenze für kompakte Schreibweise bei einer Million lag und diese Größe als exakter Text durchkam. Die Grenze ist jetzt zehntausend, dieselbe wie bei `formatTokens`, damit eine Zusammenfassungszeile aufhört, eine Rechnung zu spielen, bevor der Platz ausgeht. Bis das in einer Veröffentlichung landet, kann v2.6.2 auf einer Maschine so knapper Metriken eine abgeschnittene Aufstellungsszeile zeigen; die Kopfzeile darüber bleibt unberührt.
**Runde 34 (`a113118`, alle vier grün)**: die Grenze für kompakte Schreibweise sank von einer Million auf zehntausend — dieselbe wie bei `formatTokens` —, weil die deutsche Aufstellungsszeile mit ¥999.999,99 + ¥234.567,90 auf macOS Intel acht Pixel außerhalb ihrer Wand maß, und das war real: Ink über der Kante, kein Box-Artefakt. Die Suite ist auf windows-2022, ubuntu-22.04, macos-15 und macos-15-intel grün, und die veröffentlichte v2.6.2 behält die Lücke, bis der nächste Release sie mitnimmt — außerhalb der Klappung gesagt, nicht im Verlaufsbericht begraben.
**Runde 35 (`1ce43a3`, alle vier grün)**: nur Dokumentation — die veröffentlichte Lücke verließ die Klappung und bekam einen eigenen Absatz; die Runner hatten nichts zu diskutieren.

**Runde 36 (`272be9d`, alle vier grün)**: die Regel zum Anpassen zog in `renderer/text-fit.js` um, aufgerufen von der Karte und von beiden Prüfungen, mit `check:i18n` als Wächter darüber, dass die Seite sie vor `app.js` lädt und keine Partei auf eine private Kopie zurückdriftet. Die Workflow-Review landete im selben Commit: ein wöchentlicher Lauf gegen `main`; Paket-Artefakte außerhalb von Tag-Läufen drei statt vierzehn Tage Aufbewahrung, weil ein Tag normaler Runden 278 Artefakte und 8,9GB hinterlassen hatte; ein Timeout am Release-Job und eine nachträgliche Prüfung, dass die veröffentlichten Assets und ihre Digests genau die von den Runners gebauten Dateien sind; und die Zustandsdatei des Veröffentlichungsschritts zog aus dem Verzeichnis, das zu Release-Assets wird.

**Runde 37 (`7fef1e5`, ein Lauf ohne Jobs)**: `runner.temp` ist in einem job-level-`env` nicht verfügbar, also schlug schon das Parsen der Workflow-Datei fehl, und GitHubs gesamte Meldung war ein nach der Datei benannter Lauf mit "This run likely failed because of a workflow file issue". Der Eintrag bleibt in der Geschichte, weil der Versuch davor die unangenehmere Lehre bringt: dieser Cache-Schritt wurde auf vier Plattformen grün, ohne irgendetwas zu speichern — die Caches-API antwortete mit null. "Hat es gecacht?" wird jetzt der API gefragt, nicht einem grünen Haken.

**Runde 38 (`2d2bd9d`, alle vier grün)**: die Cache-Verzeichnisse zogen in den Workspace, wo ein Job sie benennen darf und wo `build.files` — eine explizite Liste — sie nicht in ein Paket ziehen kann. Die Caches-API listet je Plattform und Architektur einen Eintrag: 133MB auf Linux, 158MB auf Windows, 197MB und 202MB auf den beiden macOS. Das sind die Electron- und electron-builder-Daten, die der nächste Lauf wiederherstellt statt neu zu laden; die Schlüssel tragen den Lockfile-Hash, eine Änderung einer Abhängigkeit beginnt also eine neue Serie, und läuft das Kontingent voll, fällt der älteste Cache.

</details>

**Was v2.6.2 noch mitbringt**: auf `main` wechselt die Aufstellungsszeile des Guthabens ab zehntausend in die kompakte Schreibweise; die veröffentlichte v2.6.2 zieht diese Grenze bei einer Million. Fällt eine dieser beiden Felder zwischen ¥10.000 und ¥999.999,99, rendert eine Maschine knapperer Metriken — macOS Intel, nach den eigenen CI-Messungen — die deutsche Fassung der Zeile mit ihren letzten acht Pixeln außerhalb der Kante. Die Kopfzeile und alle anderen Zahlen bleiben unberührt, und kein Demo- oder kontogroßenmäßiger Normalfall erreicht das. Die Korrektur liegt auf `main` (Runde 34, auf allen vier Runnern grün) und kommt mit der nächsten Veröffentlichung heraus, statt einen eigenen Tag zu bekommen.

**Was der macOS-Schlüsselbund in CI wirklich bedeutet**: aus dem Quellcode zu laufen prüft `keychain` (der Eintrag des unsignierten Electron ist auf dem Runner vorautorisiert), während die **gepackte App bei `pending` bleibt** — das System antwortet nie. Die Prüfungen akzeptieren und melden das inzwischen, statt zu hängen, aber das heißt: **die echte Schlüsselbund-Verschlüsselung der gepackten macOS-App wurde nirgends verifiziert**, und dieses README behauptet nicht, dass sie es wurde.

| Befehl | Was er abdeckt |
| --- | --- |
| `npm test` | Daten-, Storage-, UI- und Sprachumgebungs-Suiten der Reihe nach |
| `npm run check:release` | Versions-Tor: `package.json`, Lockfile und die beiden Renderer-Literale müssen übereinstimmen, und ein Tag muss `v` + Version sein |
| `npm run check:i18n` | Wörterbuch-Parität über alle mitgelieferten Sprachen — gleiche Schlüssel, gleichen interpolierten Formen, keine chinesischen Antworten, Einzahl anders als Mehrzahl — plus die Glyph-Bedarfsprüfung gegen `scripts/font-corpus.txt` |
| `npm run check:docs` | Paritäts-Tor über die fünf READMEs: jedes verlinkt jede andere Sprache und markiert sich selbst als aktuelle, und alle teilen dieselbe Abschnittsstruktur, dieselben Screenshots, ausgewogene `<details>` und funktionierende Markdown- / HTML- / Sprachübergreifende-Links |
| `npm run test:parse` | Parsen, Aggregieren, beide Tempos und Randfälle; keine GUI nötig |
| `npm run test:store` | 22 Assertions-Gruppen über simulierte System-Backends: träge Prüfung, Ablehnung solange ausstehend, Beibehalten des Chiffretexts, `plain:`-Hochstufung und die Liste akzeptierter Sprachen; kein echtes Keyring |
| `npm run test:ui` | Formen, Designs, Privatsphäre, Einstellungen, Zugangsdaten-Zweige und Löschen, Wiederherstellung nach Neustart, Morph-Beprobung, der Wechsel auf Englisch samt Neustart, und ein Rundlauf durchs Sprachmenü auf Spanisch, Portugiesisch und Deutsch, der das Fenster neu laden und die gespeicherte Sprache wieder hervorheben muss. Alle Phasen außer den bewusst offenen pinnen Chinesisch, weil die Assertions für eine Sprache geschrieben sind und die Host-Sprache nicht uns überlassen ist (die erste Version scheiterte genau daran auf allen vier Runnern, deren Hosts auf Englisch antworten) Der Morph wird aus den Frames bewertet, in denen die Fensterkante wirklich wandert, und braucht bis zu drei Messläufe, die alle protokolliert werden – ein Bestehen im zweiten Versuch ist eine Aussage über den Runner, keine versteckte zweite Chance. |
| `npm run test:i18n` | Die unten beschriebenen Prüfungen zu Chromium-Sprache / -Zeitzone, Schriften und Label-Passung |
| `npm run test:numbers` | Fährt zehn Größenordnungen — von ¥0,01 und 7 Tokens bis zu einem Guthaben von ¥99.999.999,99, 109,6 Millionen Tokens, einer Reichweite `999+` und langen Modell-ids — durch den echten Renderpfad in allen fünf Sprachen und beiden Fensterformen, und scheitert, wenn die lesende Person eine Ziffer verlöre — gemessen als Text innerhalb der Wand, die er treffen könnte (der nächste schneidende Vorfahre oder das nächste Element seiner Zeile), nicht als Element-Box. Läuft bewusst in einem echten Fenster: Der Vitrinen-Modus legt die Karte auf eine breitere Werbefläche, und die erste Fassung dieser Prüfung hat dort gemessen und ein echtes Überlaufen um 5px übersehen. Bewertet wird nicht nach einer Wartezeit, sondern nach dem Produkt: Überlauf liste, Nachweis der Verkleinerung und Nachweis des ausgelieferten Aussehens kommen aus einer einzigen Momentaufnahme in einer einzigen Aufgabe, und ein noch überlaufender Messwert ist kein Urteil, bevor die Nachprüfung der Karte im Sekundentakt diesen Zustand erfasst hat (spätestens nach drei Läufen, damit ein echtes Limit weiterhin gemeldet wird, samt Laufzähler). Nachdem die Karte eine Zahl ausgerichtet hat, wird die Breite desselben Textes ohne Neurechnen und ohne Fenstergrößenänderung verschoben — der Zustand, den die Runner von allein erreichten —, also wird der Reparaturpfad in jeder Runde auf jeder Plattform befahren; `--freeze-watch` stoppt die Nachprüfung, und die Prüfung muss sich dann weigern zu bewerten, und `--wide-fonts=<Schrift>` misst die Reserve an einer Schrift, die breiter ist als die jeder ausgelieferten Plattform. Alle Befunde aus allen Sprachen, Formen und Größen scheitern gemeinsam, und `shots/numbers-report.json` wird vor den Assertions geschrieben, damit ein roter Lauf seine Evidenz mitbringt. Sie hält auch fest, wo das Instrument aufhört: bei ¥99.999.999.999,99 Tagesverbrauch passen etliche Geldfelder in keine lesbare Größe mehr, und *welches* nachgibt, ist eine Tatsache der Plattform-Metriken — fünf Felder sind als nachgiebig zugelistet, und die Prüfung scheitert an dem Tag, an dem eine andere Zeile bricht. |
| `npm run test:packaged` | Verzeichnisbau: Start, Schriften, Version und Wiederherstellung der Form |
| `npm run test:distributable` | Entpackt das echte ZIP / DMG / AppImage aus `release/` und startet die enthaltene ausführbare Datei; fällt nie auf `dist/` zurück |
`npm run shots` erneuert die fünf Demo-Vitrinenbilder; die Varianten je Sprache (`deck-en`, `deck-es`, `deck-pt-BR`, `deck-de`, `strip-en`) entstehen mit `node scripts/launch.mjs --shot=<name> --locale=<sprache>`

Regressionen nutzen isolierte Konfigurationsverzeichnisse und Demodaten. Der Fehlerpfad der Zugangsdaten schickt bewusst einen ungültigen Test-Key an DeepSeek und akzeptiert Auth- oder Netzwerkfehler: das ist kein Offline-Mock und kein positiver Test gegen ein echtes Konto.
Der Helligkeits-Proxy für den Morph ist `min(pro Frame max(Streifen-Deckkraft, Buch-Deckkraft))`, nicht die Summe beider Schichten, und diese Beprobung beweist nicht, dass überall kein Ghosting auftritt.

### Prüfungen zu Sprachumgebung und Schriften

`test:i18n` startet **16 Szenarien**:

- Elf Chromium-Sprachen — `zh-CN`, `en-US`, `es-ES`, `es-MX`, `pt-BR`, `pt-PT`, `de-DE`, `ja-JP`, `fr-FR`, `ko-KR`, `ar-SA`. Chromium kanonisiert einige davon (`ja-JP` → `ja`, `es-MX` → das neutrale `es-419`), und der Bericht behält angeforderten und tatsächlichen Wert. Jedes Szenario prüft **welche Oberfläche die App aufgelöst hat**: `zh*` bleibt Chinesisch, `es*` / `pt*` / `de*` / `en*` bekommen ihr eigenes Wörterbuch, und eine Sprache ohne Wörterbuch (ja, fr, ko, ar) bekommt Englisch. In jedem übersetzten Modus verlangt die Prüfung keinen chinesischen Text und keine unübersetzten Strings auf dem Schirm.
- Zwei Zeitzonen-Szenarien emulieren Chromium-Zonen über CDP: `Pacific/Kiritimati` (UTC+14) und `Pacific/Niue` (UTC−11). Beide ändern weder das Host-OS noch die Zeitzone des Hauptprozesses.
- Drei Override-Szenarien pinnen die Sprache gegen die Browser-Sprache (`--locale=en` auf `zh-CN`, `--locale=zh` auf `en-US`, `--locale=es` auf `de-DE`) — genau das tut das Sprachmenü in den Einstellungen.
- Jedes Szenario bekommt ein eigenes Profil, dessen Pfad CJK-Zeichen und Leerzeichen enthält, prüft was auf die Platte geschrieben wurde und geht hellen Streifen, helles Buch, Einstellungen und dunkles Buch durch.
- Guthaben, Reichweite und heutiger Verbrauch werden als exakte Strings gegen die `zh-CN`-Referenz verglichen; Token-Zahlen numerisch, wobei die Gruppierung jeder Sprache gelesen wird (`1096 万`, `11M`, `11 M`, `11 Mio.`). Uhren und datumsabhängige Labels werden nicht verglichen.
- Der FontFace-Status von Inter / Noto Sans SC wird geprüft, die gesammelten DOM-Zeichen müssen zu `scripts/font-corpus.txt` gehören, und im chinesischen Modus liest CDP `CSS.getPlatformFontsForNode` die tatsächlich genutzte Plattform-Schrift eines chinesischen Labels, um zu bestätigen, dass sie aus dem mitgelieferten Noto-Sans-SC-Subset kommt.
- **Jedes sichtbare Label wird nach einer einzigen, gemeinsamen Regel gemessen** — `renderer/text-fit.js`, das die Seite lädt und die Karte selbst aufruft: Der Ink-Lauf des Textes muss innerhalb der Wand bleiben, die er treffen könnte (der nächste schneidende Vorfahre oder das nächste Element, das in seiner Zeile beginnt); schneidet ein Element seinen eigenen Text, wird gegen diese Box gemessen, denn eine längere Sprache würde sonst alle Textprüfungen bestehen und dabei `Fenster über 30 T…` abgeschnitten zeigen. Sie meldet alle Szenarien auf einmal, statt beim ersten zu stoppen, weil die Font-Metriken sich je Betriebssystem unterscheiden: dieselbe Zeile, die unter Windows und Linux passte, lief auf macOS 12 Pixel über – so wurde auch der englische Text kürzer gemacht.

Diese Prüfungen beweisen **nicht** die vollständige cmap-Abdeckung, jeden Ausweichglyphen, die native Menüdarstellung, eine Ausgabe in der Host-OS-Sprache oder echte Verschlüsselung der Zugangsdaten; die Sprach-Suite gibt niemals Zugangsdaten ein und macht keinen Ver-/Entschlüsselungsdurchlauf.

## GitHub Actions und Veröffentlichungen

Der Workflow ist [`.github/workflows/build.yml`](.github/workflows/build.yml); alle vier Runner haben echte Läufe abgeschlossen, und der Release-Pfad hat fünfmal veröffentlicht — v2.4.1, v2.5.0, v2.6.0, v2.6.1 und v2.6.2. Ein wöchentlicher Lauf gegen main fängt die Drift der Runner-Images ab, wenn gerade keine Veröffentlichung wartet; der Electron- und electron-builder-Download ist je Plattform und Lockfile gecacht; und nach dem Veröffentlichen prüft der Release-Job die Asset-Menge, ihre Digests und `SHA256SUMS.txt` gegen die von den Runners gebauten Dateien nach.
Ein lokales `git commit` löst in der Cloud nichts aus; ein Push, ein Pull Request oder ein manueller Lauf tun das. GitHub Packages ist für npm / Container-Registries und dergleichen — dieses Projekt verteilt Desktop-Binaries über Artifacts und Release-Assets.

| Auslöser | Verhalten |
| --- | --- |
| Push auf `main` / Pull Request gegen `main` | Testen, verpacken, Artefakte prüfen, Artifacts hochladen; keine Release |
| Manueller `workflow_dispatch` | Dieselben Tests und dasselbe Packaging; keine Release |
| Ein `v*`-Tag pushen | Der Tag muss `v` + Version aus `package.json` sein; eine Release wird erst veröffentlicht, wenn alle vier Runner erfolgreich waren |

Die Runner sind `windows-2022` x64, `ubuntu-22.04` x64, `macos-15` arm64 und `macos-15-intel` x64, auf Node.js 24.
Jeder Build-Job beginnt mit `npm run check:release` und `npm run check:docs`: der Host muss zur Matrix passen, die Version muss an vier Stellen übereinstimmen, bei einem Tag muss der Name `v` + Version sein, und die fünf Dokumente müssen einander weiter spiegeln. Der Release-Job führt keinen von beiden aus, weil die vier Build-Jobs dasselbe vor dem Hochladen schon geprüft haben.
Die UI auf Linux läuft auf einem virtuellen X11-Desktop (Xvfb + Openbox), was nicht heißt, dass GNOME- oder Wayland-Sitzungen verifiziert wären.
Der macOS-Bauschritt erlaubt dem `dmgbuild`-Schritt insgesamt drei Versuche und hängt nur Volumes namens `Token Monitor*` aus; wenn die Versuche ausgehen, scheitert der Job, statt einen echten Verpackungsfehler zu verstecken.
Die Prüfung der gepackten App akzeptiert `pending` (das System hat zum Schlüsselbund nie geantwortet) als gemeldeten Zustand und macht mit den übrigen Assertions weiter, protokolliert es aber ausdrücklich, statt es als verifizierte Verschlüsselung zu zählen.
Paket-Artefakte bleiben **14 Tage**, Testdiagnosen 7; ein heruntergeladenes Artifact braucht möglicherweise noch einmal Archiv-Entpacken.

Eine Release muss sechs Pakete plus `SHA256SUMS.txt` enthalten, mit Präfix `token-monitor-<version>-`:

- `win-x64.zip`, `linux-x64.AppImage`
- `mac-arm64.dmg`, `mac-arm64.zip`
- `mac-x64.dmg`, `mac-x64.zip`

Ein Tag mit `-` (zum Beispiel `v2.7.0-beta.1`) wird als Pre-Release veröffentlicht; ein schlichter Versions-Tag wird als aktuelle Stable-Version veröffentlicht. Eine bestehende öffentliche Release wird nie überschrieben — veröffentliche stattdessen eine neue Version.

### Veröffentlichen

1. Actions ist in diesem Repository aktiviert; die vier gehosteten Runner und die Veröffentlichungsrechte sind alle durchgespielt.
2. Der Workflow muss auf dem **Standard-Branch** existieren, bevor er über die Actions-Seite manuell gestartet werden kann: **Build desktop apps → Run workflow**.
3. Es wird kein persönliches Access-Token gebraucht: der Release-Job erklärt `contents: write` und nutzt das eingebaute `GITHUB_TOKEN`; Organisationsrichtlinien können das weiter einschränken.
4. Commits und Pushes passieren erst nach Bestätigung durch die Person. Cloud-Ergebnisse kommen aus echten Läufen; lokale Änderungen werden nie als ausgeliefert gemeldet.

**Den Tag allein pushen.** Dieses Repository hat Belege für beides: `git push --atomic origin main refs/tags/v2.4.0` erzeugte nur den `main`-Lauf, keinen Tag-Lauf und damit keine Release (der leere Tag ist inzwischen gelöscht); `v2.4.1` allein zu pushen löste das Tag-Pipeline sofort aus. Die offizielle Doku sagt nur, dass "events will not be created for tags when more than three tags are pushed at once" und sagt nichts über das gemeinsame Pushen von Branch und Tag — behandle den Kombi-Push also als unzuverlässig.

```bash
git push origin main          # zuerst: alle vier Runner auf dem neuen Commit grün werden lassen
git push origin v2.6.2        # danach: den Tag allein pushen, das ist der Release-Auslöser
```

GitHub-Dokumentation: [gehostete Runner](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) · [Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts) · [Events, die Workflows auslösen](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Aufbau und Grenzen

- `main.js` / `preload.js`: Fenster, Ablage, IPC und die minimale Brücke.
- `lib/deepseek.js` / `lib/store.js`: Konto-Endpunkte, Kennzahlen-Aggregation und Konfigurationsspeicher.
- `renderer/`: Oberfläche, Styles, Diagramme, mitgelieferte Schriften und das gemeinsame Wörterbuch `i18n.js`; `scripts/`: Start, Packaging und Regression.
- `shots/`: Vitrinen- und Live-Screenshots; `dist/` enthält Verzeichnisse-Bauten, `release/` die verteilbaren Pakete.

Nur DeepSeek: keine Anbieter-übergreifende Aggregation, keine Geräte-Synchronisation, kein automatisierter Login, kein Start beim Hochfahren, kein Auto-Update.
Demodaten sind kein echtes Konto; Kosten und Verbrauch hängen davon ab, was die Plattform zurückgibt, und von deinem lokalen Datum — eine Prognose ist nie eine Ausgabe-Garantie.

## Danksagung und Lizenz

Referenzprojekte: [token-monitor](https://github.com/Javis603/token-monitor), [agent-sessions](https://github.com/jazzyalex/agent-sessions), [CodexBar](https://github.com/steipete/CodexBar).

Der Code in diesem Repository steht unter der [MIT](LICENSE)-Lizenz. Schriften behalten ihre eigenen Lizenzen und sind von der Projekt-MIT nicht abgedeckt:

- **Inter**: von rsms unter der SIL OFL 1.1 — Nutzung, Subset-Bildung und Weitergabe verlangen, Lizenz und Copyright-Hinweis zu behalten; das geschieht: siehe [OFL-Inter.txt](renderer/assets/font/licenses/OFL-Inter.txt). Das mitgelieferte Subset erklärt keinen Reserved Font Name, sein `OS/2.fsType` ist 0 (Installable); hier hängt also nichts an einer Auslegung.
- **Noto Sans SC** — seit 2.7.0 die chinesische Oberfläche der App, bereitgestellt vom [Google-Fonts-Projekt](https://github.com/google/fonts/tree/main/ofl/notosanssc) unter der SIL Open Font License 1.1. Kürzen und weitergeben ist genau das, was diese Lizenz erlaubt, sofern Urheberrechtshinweis und Lizenztext in jeder Kopie mitreisen — das tun sie: [OFL-NotoSansSC.txt](renderer/assets/font/licenses/OFL-NotoSansSC.txt) hält außerdem fest, woher die Datei kommt und was die einzigen zwei Änderungen sind (der Zeichenschnitt mit `scripts/subset-font.py` und die Namensdatensätze, weil der Default-Master Thin ist, die Fläche hier aber als Regular läuft). Der einzige Reserved Font Name ist `Source`, den dieses Projekt nicht benutzt; `OS/2.fsType` ist 0 (Installable).
- **Warum die chinesische Schrift gewechselt hat.** MiSans — von Xiaomi, Glyphen von Hanyi, bis 2.6.2 mitgeliefert — stand unter einem royaltyfreien, aber **widerruflichen** Vertrag und ließ zwei Fragen offen: Ist ein Subset nach 2(2) ein „Bearbeiten oder Weiterentwickeln“, das dort weder definiert noch erwähnt wird? Und wie nah kommt ein in einem öffentlichen Repository herunterladbares `.woff2` dem Verbot aus 2(3), die Schrift oder Kopien davon *einzeln* weiterzugeben? Der Wechsel auf eine OFL-Schrift beantwortet beides, ohne jemanden um Erlaubnis zu bitten. Was der Wechsel **nicht** kann: die Geschichte dieses Repository enthält weiter das MiSans-Subset und seinen Vertrag, und ein nur vorwärts gerichteter change löscht das nicht. `npm run check:release` hält die Papiere für alles Mitgelieferte zusammen — jede Schriftdatei mit einer Lizenz gepaart, die OFL-Text und Urheberrechtshinweis trägt, und jede `.woff2`-Datei tatsächlich als woff2-Container geprüft.
