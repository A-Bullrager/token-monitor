<p align="right"><a href="./README.md">EN</a> | <a href="./README.zh-CN.md">简体中文</a> | <strong>Español</strong> | <a href="./README.pt-BR.md">Português</a> | <a href="./README.de.md">Deutsch</a></p>

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

Descansa como una franja, se expande a un libro y estima *cuánto tiempo dura tu dinero* con dos ritmos de gasto (`30D / 7D`). La interfaz está disponible en **chino, inglés, español, portugués de Brasil y alemán**: `Auto` sigue el idioma del sistema y cualquiera de los cinco puede fijarse en Ajustes. Hecho sobre Electron 45 con DOM y SVG sin frameworks. Sin servidor intermediario, sin telemetría.

## Showcase

Todas las imágenes siguientes muestran datos locales de demostración; sirven para ver la interfaz, no como prueba de ninguna ejecución de test concreta.

<table>
<tr>
<td width="50%" align="center"><img src="shots/deck-en.png" width="440" alt="El libro en inglés"><br><sub><b>Libro</b> — medidor de autonomía, saldo, curva de 30 días, mezcla de modelos y aciertos de caché</sub></td>
<td width="50%" align="center"><img src="shots/deck.png" width="440" alt="La misma interfaz en chino"><br><sub><b>Libro (中文)</b> — el mismo instrumento, escrito originalmente en chino</sub></td>
</tr>
<tr>
<td width="50%" align="center"><img src="shots/strip-en.png" width="440" alt="La franja diaria en inglés"><br><sub><b>Franja</b> — la forma siempre visible: días de autonomía, saldo, gasto de hoy y una sparkline</sub></td>
<td width="50%" align="center"><img src="shots/strip.png" width="440" alt="Franja en chino"><br><sub><b>Franja (中文)</b> — la misma forma, escrita originalmente en chino</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/settings.png" width="290" alt="Cajón de ajustes"><br><sub><b>Ajustes</b> — credenciales, refresco, tema, idioma y atajos</sub></td>
<td width="33%" align="center"><img src="shots/dark.png" width="290" alt="Tema oscuro"><br><sub><b>Oscuro</b> — para la noche o escritorios oscuros</sub></td>
<td width="33%" align="center"><img src="shots/empty.png" width="290" alt="Estado sin conexión"><br><sub><b>Sin conexión</b> — datos de demostración hasta que añadas credenciales</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/deck-es.png" width="290" alt="Ledger en español"><br><sub><b>Español</b> — <i>Autonomía</i>, <i>Recarga / bono</i>, <i>Se agota 5 mar</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-pt-BR.png" width="290" alt="Livro em português do Brasil"><br><sub><b>Português (Brasil)</b> — <i>Autonomia</i>, <i>Recarga / bônus</i>, <i>Acaba 5 de mar.</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-de.png" width="290" alt="Buch auf Deutsch"><br><sub><b>Deutsch</b> — <i>Reichweite</i>, <i>Aufladung / Gutschrift</i>, <i>Am 5. März leer</i></sub></td>
</tr>
</table>

Las dos imágenes de abajo vienen de una ventana en ejecución real y no del escaparate preparado, como comprobación de que la cosa real se ve como las fotos de arriba:

<table>
<tr>
<td width="50%" align="center"><img src="shots/live-strip.png" width="420" alt="Franja en una ventana real"><br><sub><b>Franja real</b> — capturada de una ventana en ejecución</sub></td>
<td width="50%" align="center"><img src="shots/live-deck.png" width="420" alt="Libro en una ventana real"><br><sub><b>Libro real</b> — capturado de una ventana en ejecución</sub></td>
</tr>
</table>

## Qué muestra

- **Franja / libro**: saldo, gasto de hoy, dos ritmos de autonomía y una fecha estimada de agotamiento.
- **Detalle de uso**: curva de gasto de 30 días, tokens, mezcla de modelos, tasa de aciertos de caché, número de solicitudes y precio efectivo unitario.
- **Comportamiento de escritorio**: arrastrable, siempre visible, bandeja del sistema, dos formas de ventana; los efectos de ventana transparente varían por plataforma.
- **Pantalla y privacidad**: claro / oscuro / sistema, un clic para ocultar importes, datos locales de demostración por defecto.
- **Sincronización**: refresco manual, o cada 30 segundos / 1 minuto / 5 minutos.

## Descarga y uso

Lanzamientos: [GitHub Releases](https://github.com/A-Bullrager/token-monitor/releases). Las compilaciones de desarrollo están en los Artifacts de cada ejecución de Actions.
**[v2.6.2](https://github.com/A-Bullrager/token-monitor/releases/tag/v2.6.2) es la versión actual** — la compilación que terminó de enseñar a la tarjeta a ajustar sus propios números: cinco idiomas, las dos formas de ventana, y cada dígito medido contra lo que el lector puede perder de verdad, revalidado cuando la plataforma ya entregó sus métricas de fuente. Los cuatro runners nativos pasaron y la página lleva seis paquetes más `SHA256SUMS.txt`. El paquete de Windows se volvió a descargar de esa página, coincidió con su suma de verificación y con el digest del propio recurso de GitHub, y se descomprimió y arrancó en un Windows 10 real reportando la versión 2.6.2 con `isPackaged`; los paquetes de Linux y macOS solo los cubre su propio runner, no el escritorio del desarrollador. Reemplaza a v2.6.1 (publicada el mismo día antes), que medía los números contra las cajas de los elementos y no contra el texto que contienen: en las plataformas con cajas más ajustadas encogía cifras que en realidad tenían sitio.

| Plataforma | Paquete | Cómo ejecutarlo |
| --- | --- | --- |
| Windows x64 | ZIP portable | Descomprime el directorio completo y ejecuta `Token Monitor.exe` desde él; no saques el exe suelto |
| Linux x64 | AppImage | Márcalo como ejecutable y ábrelo en una sesión de escritorio gráfica |
| macOS Apple Silicon | DMG + ZIP arm64 | Copia la app del DMG a Aplicaciones, o usa el ZIP |
| macOS Intel | DMG + ZIP x64 | Coge el paquete x64; no lo mezcles con arm64 |

### Notas por plataforma

- **macOS**: las compilaciones están firmadas de forma ad-hoc (`identity: '-'`) con `notarize: false`. Eso no es firma Developer ID y la app no está notarizada, así que una copia descargada del navegador puede quedar bloqueada por Gatekeeper.
- Verifica primero `SHA256SUMS.txt` desde la página del lanzamiento. Solo si confías en el origen, sigue el aviso del sistema y permite la app en **Ajustes del Sistema → Privacidad y seguridad**; si el sistema se niega, no lo fuerces. Una suma que coincide no es una acreditación de identidad.
- **Linux**: necesita un escritorio gráfico más las dependencias de Electron (GTK, NSS, ATK, GBM, ALSA y compañía); la protección de credenciales pide además un llavero de escritorio funcionando. Sigue la documentación de tu distribución para los nombres de paquete y para configurar AppImage / FUSE.
- GNOME puede requerir la extensión AppIndicator / KStatusNotifierItem. La transparencia, el siempre-visible y el comportamiento de la bandeja cambian entre escritorios, compositores y sesiones Wayland; nada se garantiza idéntico.

## Ejecutar desde el código

Requiere **Node.js ≥ 22.12.0, se recomienda Node.js 24**, más npm. En la raíz del repositorio:

```bash
npm ci
npm start
```

`npm start` quita un `ELECTRON_RUN_AS_NODE` rezagado del entorno del hijo para que Electron no pueda degradarse a un modo Node sin ventana.

### Compilar localmente

Compila en la plataforma a la que apuntes; ejecuta `npm run icons` antes de la primera compilación para generar los iconos de empaquetado.

| Comando | Objetivo y salida |
| --- | --- |
| `npm run package:dir` | Compilación en directorio para la plataforma y arquitectura del host, en `dist/Token Monitor-<platform>-<arch>/` |
| `npm run package:win` | Solo directorio de Windows x64 (`dist/`), sin archivo |
| `npm run package:win:zip` | **Solo hosts Windows x64**; empaqueta el directorio en `release/token-monitor-<version>-win-x64.zip`, el mismo script que usa CI |
| `npm run package:linux` | AppImage de Linux x64 en `release/` |
| `npm run package:mac` | DMG + ZIP de macOS para la arquitectura del host por defecto, en `release/` |

En macOS puedes ser explícito con `npm run package:mac -- --arm64` o `-- --x64`; compilar para una arquitectura no es lo mismo que haber ejecutado el resultado en una.
`test:distributable` exige el archivo real en `release/` — la compilación en directorio no cuenta. Además compara el archivo con las fuentes y **falla cuando el paquete es más viejo que el código**, porque un "ZIP verificado" local resultó ser un resto de la compilación anterior.

## Conectar una cuenta de DeepSeek

1. Abre Ajustes y lee primero la nota sobre el almacenamiento de credenciales, al final.
2. Crea una **API key** en [DeepSeek API Keys](https://platform.deepseek.com/api_keys); alimenta el endpoint oficial de saldo.
3. Para el uso y la autonomía, inicia sesión en la [página de uso de la plataforma](https://platform.deepseek.com/usage), abre la pestaña Network de las herramientas de desarrollo y recarga.
4. Copia el **Session Token** que va después de `Bearer` en la cabecera `Authorization` de una petición `api/v0`; pegar la cabecera completa también funciona, la app quita el prefijo.
5. Desactiva *Usar datos de demostración* y guarda y sincroniza. Cuando la sesión caduque, tendrás que renovar el token tú mismo.

**Con solo una API key se puede leer el balance. La autonomía necesita el uso que da el Session Token, así que con solo una API key la pista queda vacía.**
Un Session Token es un secreto: mantenlo fuera de capturas, registros, issues y repositorios públicos.

## De dónde sale cada número

| Métrica | Fórmula / origen |
| --- | --- |
| Saldo total | `GET https://api.deepseek.com/user/balance` oficial, con preferencia por la cuenta en CNY |
| Gasto / tokens de hoy | Datos diarios de la plataforma, tomados en el día calendario local |
| Gasto / tokens de 30 días | 30 días calendario incluyendo hoy, uniendo el mes anterior cuando hace falta |
| Media diaria 30D | Total de 30 días ÷ número de días que realmente tuvieron gasto |
| Autonomía 30D | Saldo total ÷ media diaria de 30D |
| Media diaria 7D | Total de los últimos 7 días calendario ÷ 7, incluyendo días sin gasto |
| Autonomía 7D | Saldo total ÷ media diaria de 7D |
| Fecha de agotamiento | Hoy más la autonomía redondeada en días — una estimación, no una promesa |
| Previsión mensual | Media diaria del ritmo seleccionado × 30 |
| Precio efectivo | Coste de 30 días ÷ tokens × 1.000.000 |
| Aciertos de caché | `hit ÷ (hit + miss + prompt/entrada) × 100%`, sobre tokens de entrada |
| Solicitudes / mezcla de modelos | Agregados en la misma ventana de 30 días; cada modelo lleva su propia pista de caché |

Cuando la media es cero o falta datos necesarios, no se muestra ninguna estimación de autonomía; una muestra de gasto escasa se etiqueta como orientativa.
El uso de la plataforma viene de los endpoints internos no documentados `/api/v0/usage/amount` y `/api/v0/usage/cost` (en `platform.deepseek.com`, solicitados por mes).
Los campos, la autenticación y el retardo de datos pueden cambiar; si la petición del mes anterior falla, la implementación actual sigue funcionando con lo que pudo obtener, así que una cifra de 30 días puede estar incompleta.

## Seguridad y configuración local

Las credenciales llegan al proceso principal a través del puente preload, y a la interfaz solo vuelven valores enmascarados. Que `safeStorage` esté disponible depende de la plataforma y de los servicios de escritorio:

| Plataforma | Protección cuando está disponible |
| --- | --- |
| Windows | DPAPI |
| macOS | Llavero (Keychain) |
| Linux | Un backend real `gnome_libsecret` o KWallet (`kwallet` / `kwallet5` / `kwallet6`) |

En Linux, `basic_text`, `unknown` y cualquier otro backend no reconocido o no disponible se trata como `none`.
**Cuando el cifrado del sistema no está disponible, las credenciales se guardan como `plain:` + base64 en disco. Eso no es cifrado: quien pueda leer el archivo de configuración puede recuperarlas.** La interfaz muestra entonces "Sin cifrar · no hay llavero del sistema"; si no aceptas eso, no guardes credenciales reales.

**La comprobación es perezosa y asíncrona.** La prueba de disponibilidad (`isAsyncEncryptionAvailable`, con repliegue a la API síncrona solo si falta) se ejecuta al abrir el cajón de ajustes, nunca en el arranque — en macOS un llavero bloqueado o un aviso de autorización pendiente bloquean una llamada síncrona y congelan todo el proceso principal, que es exactamente lo que pasó en la primera ejecución en la nube. Por tanto:

- Hasta que el sistema responda, la etiqueta de almacenamiento se mantiene neutral ("Guardado solo en este equipo"): no promete cifrado ni afirma texto plano.
- Guardar una **credencial nueva** mientras el backend es desconocido se rechaza con "El cifrado del sistema no se confirmó · credenciales no guardadas" en lugar de degradarla en silencio. Cambiar tema, ritmo, fijado o forma se sigue guardando con normalidad.
- Una credencial intacta conserva el texto cifrado que ya está en disco; un guardado no relacionado nunca la vuelve a cifrar ni la degrada. Un valor `plain:` heredado se actualiza a `enc:` solo cuando hay un backend de confianza confirmado.
- El comportamiento de almacenamiento de extremo a extremo solo se ha verificado contra DPAPI de Windows. Las rutas de llavero en macOS y Linux no se han verificado en máquinas reales.

Dónde vive la configuración diaria (las ejecuciones de test usan perfiles aislados):

| Plataforma | Ruta de `config.json` |
| --- | --- |
| Windows | `%APPDATA%\Token Monitor\config.json` |
| macOS | `~/Library/Application Support/Token Monitor/config.json` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/Token Monitor/config.json` |

Dejar un campo de credenciales vacío conserva el valor guardado; **Borrar credenciales** vacía los dos y vuelve al modo de demostración.
Las peticiones a la cuenta van directas a `api.deepseek.com` / `platform.deepseek.com`; no hay reenvío ni analítica. Iconos, fuentes y datos de demostración son todos locales.

## Idiomas

La interfaz está escrita en chino y cada otro idioma es un diccionario cuyas claves son exactamente esas cadenas chinas (`renderer/i18n.js` más `renderer/locales/<idioma>.js`), cargado por el proceso principal *y* por el renderizador. Una etiqueta no puede actualizarse en un solo idioma: `npm run check:i18n` falla si a un diccionario le falta una clave, si responde en chino, si olvida una forma interpolada o si olvida el plural.

| Interfaz en inglés | Interfaz en chino |
| --- | --- |
| ![Ledger (English)](shots/deck-en.png) | ![中文界面](shots/deck.png) |

- **Idiomas incluidos**: chino (el idioma de escritura), inglés, español, portugués de Brasil y alemán. `Auto` empareja el idioma del sistema por prefijo — `zh*`, `es*`, `pt*`, `de*`, `en*` — y todo lo demás cae en inglés, el único reemplazo que cualquier fuente incluida puede renderizar. `pt-PT` recibe por tanto el diccionario brasileño; `es-MX` y `es-ES` comparten un solo español.
- **Qué se traduce**: las dos formas de ventana, el cajón de ajustes, la lista de atajos, los avisos, los mensajes de error, el menú de la bandeja, su información emergente y el menú de aplicación de macOS — además de la cartelería ASCII del instrumento (`DAYS`, `TOTAL`, `SAMPLE`, `AVG`, `PEAK ¥29.10 · 10-03`, `SYNCED 18:02:18`), que en chino también se ve en inglés.
- **Qué no se traduce**: el nombre del producto, el lema `Know your runway.`, `DeepSeek`, los nombres de campo `API KEY` / `SESSION TOKEN` y los códigos de instrumento `DEMO`, `SYNC`, `30D / 7D` y las unidades de orden `M` / `K`.
- **Números y fechas siguen al idioma**: el chino agrupa los tokens en 万 / 亿 y escribe el agotamiento como `约 3 月 5 日见底`; el inglés usa `12.5K` y `Runs out Mar 5`; el español `12,5 mil` y `Se agota 5 mar`; el portugués `12,5 mil` y `Acaba 5 de mar.`; el alemán `12.500` y `Am 5. März leer`. Las cantidades detrás son idénticas y las comprobaciones las comparan numéricamente. Un valor demasiado largo para su hueco —¥99.999.999,99 en una columna calculada para ¥1,49, o un microepígrafe en alemán cuatro píxeles más ancho que el inglés— reduce su propio tipo hasta que cada dígito es visible. Lo que se mide es el texto contra el muro al que podría chocar — el ancestro que recorta más cercano, o el siguiente elemento que empieza a su derecha en la misma línea —, así que un número que rebosa hacia espacio vacío conserva su tamaño diseñado, y solo se encoge uno que de verdad se perdería o que invadiría a un vecino. Como esa decisión solo vale para las métricas de la fuente que había en pantalla al tomarla, y los runners miden unos cinco por ciento más anchos que la máquina que escribió la comprobación, la tarjeta vuelve a comprobar sus propios números una vez por segundo mientras está en pantalla: es una lectura, no un repintado, y solo escribe un estilo cuando una cifra se ha salido de verdad de su caja. Lo único que no se arregla encogiendo es la línea de desglose del saldo del libro —dos cifras exactas con dos símbolos de moneda no caben en ningún tamaño legible—, así que a partir de diez mil esa línea se lee en las unidades con las que cada idioma ya cuenta cantidades (`90 Mio.` / `90M` / `90 mi` / `9000 万`), y cada dígito se queda en la cabecera de arriba, que sí tiene sitio.
- **El plural es de cada idioma**: el chino no marca número gramatical, así que cada diccionario conjuga su propio sustantivo contado (`1 día activo` / `15 días activos`, `1 Tag` / `15 Tage`). La comprobación de paridad rechaza un idioma cuya forma de uno y de varios salga igual, y trata `1.0` medido como plural.
- **Límite conocido**: el importe mantiene un único estilo decimal en todos los idiomas (`¥145.09`), igual que el reloj. Solo los recuentos de tokens siguen la agrupación del idioma. Cambiar el idioma guarda el ajuste y **recarga la ventana** — el único ajuste que lo hace, porque el texto ya escrito en la página no puede retraducirse en el sitio.

**Una restricción real sobre el texto**: las fuentes incluidas son subconjuntos. El subconjunto de MiSans se cortó sobre un corpus fijo y no contiene 语 / 言 / 英 / 文, de modo que el texto chino nuevo debe quedarse dentro de `scripts/font-corpus.txt` — por eso la fila del idioma se llama `LANGUAGE` y la opción china dice `Chinese`. Los acentos que piden los idiomas nuevos (`Á Ã Ç É Í Ó Ø Ú Ü ß á ã ä ç é ê í ñ ó ô õ ö ú ü`) se comprobaron con fontTools contra el cmap real del subconjunto de Inter, y `scripts/glyph-demand.mjs` falla antes de abrir cualquier ventana si un diccionario pide un carácter fuera del corpus. La comprobación de corpus en `npm run test:i18n` revisa después los caracteres que realmente están en pantalla, y ya cazó un error real: las etiquetas monoespaciadas salían como tofu en los runners de Linux porque la pila de fuentes no tenía un reemplazo CJK incluido.

## Pruebas y qué demuestran

**Local (Windows 10 x64)**: pasan las pruebas de datos, 22 grupos de aserciones sobre backends de almacenamiento simulados, la paridad de diccionarios, la demanda de glifos, la interfaz desde el código, la compilación en directorio y una extracción y arranque reales del ZIP; pasan 16 escenarios de idioma × 4 estados de interfaz, cada carácter recogido está dentro del corpus y ninguna etiqueta queda recortada en ningún idioma incluido; en las 10 pasadas de ajuste numérico × 10 magnitudes tampoco se sale ningún número de su caja. fontTools se usó contra los cmap reales de los subconjuntos: todo carácter latino que los diccionarios pueden poner en pantalla está en el subconjunto de Inter, y todo carácter chino del conjunto de demanda está en uno de los dos paquetes.

**Treinta y ocho rondas en la nube hasta ahora; la versión publicada está verde en los cuatro runners nativos.** El relato ronda a ronda está plegado abajo — todo lo que demostró algo *negativo* se dice fuera del pliegue, para que plegar no pueda ocultar una advertencia. Uno de esos negativos trata de las pruebas mismas: la comprobación de la deformación estaba ciega en macOS, donde el borde de la ventana se mueve después de que la clase CSS que medía ya había desaparecido (ronda 12), así que ahora califica el movimiento observado.

<details>
<summary>Historial de compilaciones en la nube (rondas 1–13)</summary>

**Ronda 1 en la nube (`9faa78e`, cuatro runners nativos)**: Windows x64 verde; Linux x64 leyó mal "el socket del depurador se cerró antes de la respuesta" durante el cierre y lo tomó por fallo; las dos compilaciones de macOS se firmaron y verificaron, pero la comprobación de arranque de la app empaquetada expiró en su primer viaje CDP.

**Ronda 2 (`4fb1d4d`)**: Windows sigue verde; la suite de idiomas de Linux se puso verde y el fallo se movió al nombre del paquete — electron-builder emite `linux-x86_64.AppImage` mientras las comprobaciones y el contrato del lanzamiento esperan `linux-x64`. Los dos trabajos de macOS seguían expirando, pero esta vez con pilas de procesos: 80 de 80 muestras estaban en `SecItemCopyMatching → SecurityServer → mach_msg`, es decir, una **lectura síncrona del llavero en la ruta de arranque** había congelado el proceso principal (las pruebas desde el código usan Electron sin firmar, cuya entrada del llavero ya está autorizada en el runner, así que solo la app empaquetada lo sufría).

**Arreglos hechos a partir de esa evidencia**: la carrera del cierre solo se tolera en ese caso concreto y el proceso debe seguir saliendo con 0; las etiquetas monoespaciadas ganaron el reemplazo MiSans incluido y las comprobaciones ahora leen la fuente real de la plataforma por CDP; el nombre del artefacto de Linux queda fijado a `linux-x64`; la comprobación del llavero se sacó por completo del arranque (ver *Seguridad y configuración local*).

**Ronda 3 (`de0c757`)**: Windows x64, Linux x64 (AppImage extraído y lanzado) y macOS Apple Silicon (DMG + ZIP construidos, verificados de forma estricta, extraídos y con comprobaciones de arranque desde el DMG) todos verdes. macOS Intel falló solo al crear el DMG: el `hdiutil detach` final de `dmgbuild` encontró "Resource busy" aunque el ZIP del mismo paso tuvo éxito y el trabajo idéntico de arm64 pasó — una carrera del runner, no un error de empaquetado, así que ese paso ganó un reintento limitado de como mucho tres intentos que solo desmonta su propio volumen.

**Ronda 4 (`036e326`, los cuatro verdes)**: la carrera de Intel se reprodujo, el reintento la recuperó en el segundo intento y pasaron tanto la extracción del ZIP como la instalación desde DMG; los cuatro runners subieron sus paquetes.

**Ronda 5 (etiqueta `v2.4.1`, ejecución 40642992704)**: empujar la etiqueta sola activó el pipeline de etiqueta como se esperaba, los cuatro runners pasaron y el trabajo de lanzamiento verificó los seis paquetes, generó `SHA256SUMS.txt` y publicó. El paquete de Windows vuelto a descargar de la página del lanzamiento coincidió con la lista de sumas y pasó todas las aserciones localmente (`isPackaged`, versión, sin comprobación del llavero al arrancar, etiqueta DPAPI en ajustes). Los paquetes de Linux y macOS solo los cubrieron sus propios runners.

**El primer commit bilingüe (`1cedcc6`) falló en los cuatro runners a la vez**: las aserciones estaban escritas para la interfaz china mientras los hosts del runner responden en inglés, así que `auto` resolvió inglés. El producto se comportó bien y el supuesto del test no. El arreglo hace que la regresión declare el idioma que afirma (ver `test:ui` arriba) y deja sin fijar, a propósito, solo el paso "cambiar a inglés y reiniciar".

**Segundo intento bilingüe (`d62fc57`, los cuatro verdes)**: en runners Linux y macOS con host en inglés pasaron los 11 escenarios de idioma / zona horaria, la regresión de interfaz y las comprobaciones de arranque del AppImage extraído y la instalación desde DMG, produciendo paquetes 2.5.0 para cada plataforma.

**Ronda 8 (etiqueta `v2.5.0`, ejecución 40660748693)**: empujar la etiqueta sola activó el pipeline de etiqueta, los cuatro runners pasaron y el trabajo de lanzamiento revisó los seis paquetes, generó `SHA256SUMS.txt` y publicó. El paquete de Windows se volvió a descargar de la página del lanzamiento, su SHA256 coincidió con la lista y se extrajo y arrancó aquí con las mismas aserciones que cualquier otra compilación. Los paquetes de Linux y macOS los cubre solo su propio runner.


**Ronda 9 (`5a21201`, el primer commit de cinco idiomas) falló solo en macOS**: la nueva aserción de ajuste de etiquetas reportó la línea de ritmo *en inglés* 12px fuera de su caja en macOS Apple Silicon, mientras la compilación idéntica estaba limpia en Windows y Linux — la línea se había dimensionado contra las fuentes de la máquina que la escribió. La comprobación además se paraba en el primer escenario fallido, así que una ronda solo podía revelar el primer problema de una plataforma.
**Ronda 10 (`819601e`, los cuatro verdes)**: el barrido de ajuste ahora recoge cada escenario y estado y falla una sola vez con la lista completa, y el texto inglés pasó a `15 active days of 30` — lo mismo dicho con menos caracteres, que es la diferencia entre una etiqueta y una etiqueta cortada.
**Ronda 11 (etiqueta `v2.6.0`, ejecución 40801968504)**: empujar la etiqueta sola activó el pipeline de etiqueta, los cuatro runners pasaron y el trabajo de lanzamiento verificó los seis paquetes, generó `SHA256SUMS.txt` y publicó. El paquete de Windows se volvió a descargar de la página del lanzamiento, su SHA256 coincidió con la lista y se extrajo y arrancó aquí con las mismas aserciones que cualquier otra compilación (`isPackaged`, versión 2.6.0). Los paquetes de Linux y macOS los cubre solo su propio runner.

**Ronda 12 (`a244fa4`, un commit solo de documentación) volvió a fallar en macOS — en la prueba, no en el producto**: la comprobación de la deformación reportó `596 -> 593` en Apple Silicon aunque el mismo código había estado verde en ese runner una ronda antes. El muestreo paraba con la clase CSS que vigilaba, y macOS aplica `setSize` con su propio calendario: con el runner ocupado, el borde de la ventana se movió después de que la clase se hubiera ido. La medición estaba ciega; la animación ocurría.

**Ronda 13 (`c52a77e`, los cuatro verdes)**: la deformación se califica ahora desde los fotogramas en los que el borde se mueve de verdad, con hasta tres tomas registradas por ejecución. Comprobado contra un salto real: forzar la duración a 1ms hace que la comprobación falle con "biggest single step 668px of 668px".

**Rondas 14–16 (`1f78fb2`, `ef16b04`, `f7f336f` — los cuatro runners en rojo)**: una comprobación nueva que pasa magnitudes que la cuenta de demostración nunca muestra encontró desbordes reales en todas partes: la cifra de hoy de la franja 21px fuera de su hueco con ¥123.456,78, el microepígrafe inglés en ritmo, la línea de desglose del libro. La primera corrección (ajustar el número contra la caja que lo recorta de verdad, no contra sí mismo) falló de otra manera: el elemento no reportaba tamaño de fuente en línea alguno, lo que significaba que el ajustador había corrido y había concluido que el texto cabía.

**Rondas 17–19 (`b7a3e58`, `796f101`, `6ee238f` — Linux verde, tres en rojo)**: seis rondas en las que la comprobación y el producto no se ponían de acuerdo sobre cuándo vale una medición. La tarjeta ganó: volver a medir tras su propia ventana de estabilización, anunciar esa ventana, revalidar sus números ya decididos una vez por segundo, y corregir un paso tomado con una vista oculta — que estaba borrando un ajuste ya correcto. La ronda 19 fue la primera en nombrar el fallo por idioma y no por plataforma (`zh` en Windows, `es` en Apple Silicon), y así quedó claro que la comprobación seguía leyendo en el momento equivocado.

**Ronda 20 (`a5240d5` — tres en rojo)**: la lista de recortes, la prueba del encogimiento y la prueba del aspecto enviado salen ahora de una única instantánea en una sola tarea, y una lectura que todavía desborda no es veredicto hasta que la revalidación propia de la tarjeta ha pasado por ella (tres pasadas como máximo, de modo que un tope real sí se reporta, con el número de pasadas al lado). La contradicción —página limpia, pero el número nunca se encogió— desapareció, y lo que quedó fueron tres desbordes auténticos que los runners veían y esta máquina no: la línea de desglose alemana 63px fuera de un hueco de 160px, la cabecera del saldo 6px, el microepígrafe inglés de muestra escasa 4px.

**Ronda 21 (`c63d872` — tres en rojo)**: el desglose pasa a notación compacta por encima de un millón (`90 Mio.` / `90M` / `9000 万`) mientras la cabecera conserva cada dígito, la cabecera ganó un paso más de margen de encogimiento, y el epígrafe inglés dice lo mismo con tres caracteres menos. Los tres desbordes desaparecieron. Lo que quedaba era un exceso de la propia comprobación: exigía que un hueco concreto *fuera* el que cediera al gastar ¥99.999.999.999,99 en un día, y eso es un hecho de las métricas de una plataforma, no del instrumento.

**Ronda 22 (`d7e4253` — Windows, Linux e macOS Intel verdes; Apple Silicon en rojo)**: la magnitud extrema ahora documenta el conjunto de huecos que pueden ceder y solo falla si cede uno que nadie enumeró, e igualmente imprime cuál cedió aquí y por cuántos píxeles. Apple Silicon volvió a caer una ronda consecutiva con una sola palabra — "timed out waiting for expanded again" — así que las esperas de vista reportan al vencer el plazo la clase del body, el ancho de la ventana y el estado de vista del propio renderizador, y el paso de expandir ganó un rebote registrado con la misma forma que ya usaba la calificación de la deformación.
**Ronda 23 (`7bb4591` — Windows, Linux y macOS Intel verdes; Apple Silicon rojo por un número)**: las esperas de vista llevaron su nueva evidencia y el expandir no volvió a fallar — ningún runner necesitó el rebote registrado, y el reporte lo dice. Quedó un residuo: la línea de desglose en alemán, ya en notación compacta, siguió midiendo 208px contra una caja de 202px en Apple Silicon, seis píxeles por encima de su límite de tipo. El símbolo de moneda salió de la forma compacta — la cabecera de arriba ya lleva uno, y esos dos signos *eran* los seis píxeles — y esa microcelda ganó un paso más de margen.
**Ronda 24 (`98a7693`, los cuatro verdes)**: los seis píxeles resultaron ser exactamente los dos símbolos de moneda que eran, y la escalera de magnitudes —con la métrica tardía inyectada en cada ejecución— pasó en Windows x64, Linux x64, macOS Apple Silicon y macOS Intel.

**Ronda 25 (etiqueta `v2.6.1`, ejecución 40846036293)**: empujar la etiqueta sola activó el pipeline de etiqueta, los cuatro runners pasaron y el trabajo de lanzamiento verificó los seis paquetes, generó `SHA256SUMS.txt` y publicó. El paquete de Windows se volvió a descargar de la página del lanzamiento, su SHA256 coincidió con la lista publicada y con el digest del propio recurso de GitHub, y se extrajo y arrancó aquí con las mismas aserciones que cualquier otra compilación (`isPackaged`, versión 2.6.1). Los paquetes de Linux y macOS los cubre solo su propio runner.
**Ronda 26 (`389bbb7`, solo documentación)**: los mismos seis píxeles volvieron, esta vez señalando el libro español en Apple Silicon, y el artefacto ya era lo bastante concreto como para dejar de adivinar: la cifra *había* sido ajustada, el tamaño en línea estaba puesto, y algo seguía midiendo fuera.

**Ronda 27 (`1d61df6`)**: `fittedNodes` pasó a ser un Map que recuerda el suelo de cada hueco, así que revalidar repite la decisión en vez de aplicar un valor por defecto. Apple Silicon se puso verde por primera vez; macOS Intel falló con esos mismos seis píxeles.

**Ronda 28 (`14a08be`)**: el suelo de la cabecera pasó de 0.6 a 0.5. Intel quedó verde y Apple Silicon siguió seis píxeles fuera — ya con 16.5px, dentro de una caja de 226px que sostenía unos 113px de dígitos, lo que dijo que la caja no era problema del lector.

**Ronda 29 (`4084742`, versión 2.6.2)**: llegó la primera medición por tinta y los cuatro trabajos de prueba pasaron; la ejecución siguió fallando un paso después, en macOS Intel, con `hdiutil` saliendo 16 — "Resource busy" — al montar el DMG construido para verificar el paquete.

**Ronda 30 (`2595944`)**: esa carrera del DMG recibió el rebote acotado y registrado que la ronda 3 ya había establecido para el paso de construcción. Intel falló entonces en la suite de código por la línea alemana del libro: reportada 16px por fuera con su tinta terminando dos píxeles *dentro* del borde de recorte — el último falso positivo, y el que los campos nuevos de `ink` y `wall` nombraron con precisión.

**Ronda 31 (`9b24c8a`, los cuatro verdes)**: el ajustador y la comprobación hacen ahora la misma pregunta — ¿se ve cada dígito dentro del muro que el texto podría tocar (el ancestro que recorta más cercano, o el siguiente elemento de su línea)? Rebosar hacia espacio vacío ya no es defecto; que un elemento recorte su propio texto sí lo sigue siendo, y la tarjeta dejó de encoger cifras que tenían sitio. El tope del extremo se reporta como 19px de tinta en vez de 32px de caja, y `--wide-fonts="Courier New"` sigue atrapando el mismo hueco a 28px: la regla más suelta no está ciega.

**Ronda 32 (etiqueta `v2.6.2`, ejecución 40862991393)**: empujar la etiqueta sola activó el pipeline de etiqueta, los cuatro runners pasaron y el trabajo de lanzamiento verificó los seis paquetes, generó `SHA256SUMS.txt` y publicó. El paquete de Windows se volvió a descargar de la página del lanzamiento, su SHA256 coincidió con la lista publicada y con el digest del propio recurso de GitHub, y se extrajo y arrancó aquí con las mismas aserciones que cualquier otra compilación (`isPackaged`, versión 2.6.2). Los paquetes de Linux y macOS los cubre solo su propio runner.
**Ronda 33 (`640bf33`, solo documentación)**: tres runners verdes, y macOS Intel nombró un hueco que la v2.6.2 publicada todavía tiene. La línea de desglose en alemán con ¥999.999,99 + ¥234.567,90 midió ocho píxeles por fuera de su muro bajo la regla nueva de tinta — una pérdida real esta vez, no el artefacto de la caja — porque el límite de lo compacto estaba en un millón y esa magnitud pasaba como texto exacto. El límite es ahora diez mil, el que `formatTokens` ya usa, así que una línea resumen deja de fingir que es una factura antes de quedarse sin sitio. Hasta que eso llegue a un lanzamiento, la v2.6.2 puede mostrar una línea de desglose cortada en una máquina con métricas tan ajustadas; la cabecera de encima no se ve afectada.
**Ronda 34 (`a113118`, los cuatro verdes)**: el límite de lo compacto bajó de un millón a diez mil — el mismo que usa `formatTokens` — porque la línea de desglose alemana con ¥999.999,99 + ¥234.567,90 midió ocho píxeles fuera de su muro en macOS Intel, y esa era real: tinta más allá del borde, no un artefacto de la caja. La suite quedó verde en windows-2022, ubuntu-22.04, macos-15 y macos-15-intel, y la v2.6.2 publicada conserva el hueco hasta que el siguiente lanzamiento se lo lleve — dicho fuera del pliegue, no dejado dentro del relato.
**Ronda 35 (`1ce43a3`, los cuatro verdes)**: solo documentación — el hueco publicado salió del pliegue y tuvo un párrafo propio; los runners no tuvieron nada sobre lo que discrepar.

**Ronda 36 (`272be9d`, los cuatro verdes)**: la regla de ajuste se fue a `renderer/text-fit.js`, llamada por la tarjeta y por las dos comprobaciones, con `check:i18n` afirmando que la página la carga antes que `app.js` y que ninguna parte volvió a su copia privada. La revisión del flujo de trabajo entró en el mismo commit: una pasada semanal contra `main`; los paquetes se guardan tres días en vez de catorce fuera de las ejecuciones por etiqueta, porque un día de rondas normales había dejado 278 artefactos y 8,9GB; un tiempo máximo en el job de lanzamiento y una comprobación posterior de que los activos publicados y sus resúmenes son los archivos que los runners construyeron; y el archivo de estado provisional del paso de publicación salió del directorio que se convierte en activos de la Release.

**Ronda 37 (`7fef1e5`, una ejecución sin ningún job)**: `runner.temp` no está disponible en un `env` de nivel de job, así que el archivo de flujo no pudo parsearse, y todo el informe de GitHub fue una ejecución nombrada por el archivo con "This run likely failed because of a workflow file issue". Vale dejarla en la historia porque el intento previo enseña algo más incómodo: ese paso de caché puso verde las cuatro plataformas sin guardar nada, y la API de cachés respondió cero. "¿De verdad cacheó?" se pregunta hoy a la API, no a una palomita verde.

**Ronda 38 (`2d2bd9d`, los cuatro verdes)**: los directorios de caché se movieron dentro del workspace, donde un job puede nombrarlos y donde `build.files` —una lista explícita— no puede arrastrarlos a un paquete. La API de cachés lista una entrada por plataforma y arquitectura: 133MB en Linux, 158MB en Windows, 197MB y 202MB en los dos macOS. Esa es la carga de Electron y electron-builder que la siguiente ronda restaura en vez de volver a descargar; las claves llevan el hash del lockfile, así que un cambio de dependencia abre un juego nuevo, y al llenarse la cuota se descarta la caché más antigua.

</details>

**Lo que v2.6.2 todavía trae**: en `main` la línea de desglose del saldo pasa a notación compacta desde diez mil; la v2.6.2 publicada traza esa línea en un millón. Así que, si uno de esos dos campos cae entre ¥10.000 y ¥999.999,99, una máquina con métricas ajustadas —macOS Intel, en las propias mediciones de CI— renderiza la versión alemana de la línea con sus últimos ocho píxeles fuera del borde. La cabecera del saldo y todas las demás cifras no se ven afectadas, y ninguna cuenta de demostración ni de tamaño normal llega al caso. La corrección está en `main` (ronda 34, verde en los cuatro runners) y saldrá con el siguiente lanzamiento en vez de llevar su propia etiqueta.

**Qué significa de verdad el llavero de macOS en CI**: ejecutar desde el código sondea `keychain` (la entrada de Electron sin firmar viene autorizada de fábrica en el runner), mientras que **la app empaquetada se queda en `pending`** — el sistema nunca responde. Las comprobaciones ahora aceptan y reportan eso en lugar de colgarse, pero significa que **el cifrado real del llavero en la app empaquetada de macOS no se ha verificado en ninguna parte**, y este README no afirma que sí.

| Comando | Qué cubre |
| --- | --- |
| `npm test` | Las suites de datos, almacenamiento, interfaz y entorno de idioma, en orden |
| `npm run check:release` | Puerta de versión: `package.json`, el lock y las dos literales del renderizador deben coincidir, y una etiqueta debe ser `v` + versión |
| `npm run check:i18n` | Paridad de diccionarios entre todos los idiomas incluidos — mismas claves, mismas formas interpoladas, sin respuestas en chino, y una forma de uno distinta de la de muchos — más la comprobación de demanda de glifos contra `scripts/font-corpus.txt` |
| `npm run check:docs` | Puerta de paridad entre los cinco README: cada uno enlaza a todos los demás idiomas y se marca como el actual, y todos comparten la misma estructura de secciones, las mismas capturas, `<details>` equilibrados y enlaces markdown / HTML / entre idiomas que funcionan |
| `npm run test:parse` | Parseo, agregación, los dos ritmos y casos límite; sin interfaz gráfica |
| `npm run test:store` | 22 grupos de aserciones sobre backends del sistema simulados: sondeo perezoso, rechazo mientras está pendiente, conservación del cifrado existente, actualización de `plain:` y la lista de idiomas aceptados; no es un llavero real |
| `npm run test:ui` | Formas, temas, privacidad, ajustes, ramas de credenciales y borrado, restauración tras reinicio, muestreo de la deformación, el cambio a inglés seguido de un reinicio, y un recorrido por el selector en español, portugués y alemán que debe recargar la ventana y volver a resaltar el idioma guardado. Todas las fases salvo las que a propósito no fijan nada fijan chino, porque las aserciones están escritas para un idioma y el idioma del host no es nuestro para suponerlo (la primera versión de esto falló en los cuatro runners, cuyos hosts responden en inglés) La deformación se califica desde los fotogramas en los que el borde de la ventana se mueve de verdad y puede necesitar hasta tres tomas, todas registradas: pasar a la segunda es evidencia sobre el runner, no una segunda oportunidad escondida. |
| `npm run test:i18n` | Las comprobaciones de idioma / zona horaria de Chromium, de fuentes y de ajuste de etiquetas descritas abajo |
| `npm run test:numbers` | Recorre diez escalas de magnitud —de ¥0,01 y 7 tokens a un saldo de ¥99.999.999,99, 109,6 millones de tokens, una autonomía `999+` e ids de modelo largos— por la ruta real de dibujo en los cinco idiomas y las dos formas de ventana, y falla si el lector perdería un dígito — medido como el texto dentro del muro que podría tocar (el ancestro que recorta más cercano, o el siguiente elemento de su línea), no como la caja del elemento. Corre en una ventana real a propósito: el modo escaparate coloca la tarjeta sobre un lienzo publicitario más ancho, y la primera versión de esta comprobación midió ahí y dejó pasar un desborde real de 5px. Califica esperando al producto y no a un retardo: la lista de recortes, la prueba del encogimiento y la del aspecto enviado salen de una única instantánea en una sola tarea, y una lectura que aún desborda no es veredicto hasta que la revalidación por segundo de la tarjeta haya pasado por ese estado (tres pasadas como máximo, así un tope real se sigue reportando, con el conteo de pasadas al lado). Después de que la tarjeta ajusta una cifra se cambia el ancho del mismo texto sin repintado ni redimensionado que lo anuncie —el estado al que los runners llegaron solos—, de modo que la ruta de reparación se recorre en cada ronda y en cada plataforma; `--freeze-watch` detiene esa revalidación y la comprobación debe negarse a calificar, y `--wide-fonts=<familia>` mide el margen contra una tipografía más ancha que la de cualquier plataforma publicada. Los hallazgos de todos los idiomas, formas y magnitudes fallan juntos, y `shots/numbers-report.json` se escribe antes de las aserciones para que una ronda roja llegue con su evidencia. Registra además dónde se detiene el instrumento: con ¥99.999.999.999,99 gastados en un día hay cajas de dinero que no caben en ningún tamaño legible, y *cuál* cede es un hecho de las métricas de la plataforma — cinco huecos están enumerados como capaces de ceder, y la comprobación falla el día que ceda una fila distinta. |
| `npm run test:packaged` | Compilación en directorio: arranque, fuentes, versión y restauración de la forma |
| `npm run test:distributable` | Extrae el ZIP / DMG / AppImage real de `release/` y lanza el ejecutable que contiene; nunca repliega a `dist/` |
`npm run shots` refresca las cinco imágenes de demostración del escaparate; las variantes por idioma (`deck-en`, `deck-es`, `deck-pt-BR`, `deck-de`, `strip-en`) salen de `node scripts/launch.mjs --shot=<nombre> --locale=<idioma>`

Las regresiones usan directorios de configuración aislados y datos de demostración. La ruta de fallo de credenciales sí envía a DeepSeek una clave de prueba deliberadamente inválida y acepta un error de autenticación o de red: no es un simulador sin conexión y no es una prueba positiva contra una cuenta real.
El proxy de brillo de la deformación es `min(max(opacidad de franja, opacidad de libro) por fotograma)`, no una suma de las dos capas, y ese muestreo no prueba la ausencia de fantasmas en todas partes.

### Comprobaciones de idioma, entorno y fuentes

`test:i18n` lanza **16 escenarios**:

- Once idiomas de Chromium — `zh-CN`, `en-US`, `es-ES`, `es-MX`, `pt-BR`, `pt-PT`, `de-DE`, `ja-JP`, `fr-FR`, `ko-KR`, `ar-SA`. Chromium canoniza algunos (`ja-JP` → `ja`, `es-MX` → el neutro `es-419`) y el informe guarda el valor pedido y el real. Cada escenario afirma **qué idioma de interfaz resolvió la app**: `zh*` se queda en chino, `es*` / `pt*` / `de*` / `en*` usan su diccionario y un idioma sin diccionario (ja, fr, ko, ar) recibe inglés. En cada modo traducido la comprobación exige que no quede texto chino ni cadenas sin traducir en pantalla.
- Dos escenarios de zona horaria emulan zonas de Chromium por CDP: `Pacific/Kiritimati` (UTC+14) y `Pacific/Niue` (UTC−11). Ninguno cambia el SO anfitrión ni la zona del proceso principal.
- Tres escenarios de anulación fijan el idioma contra el idioma del navegador (`--locale=en` con `zh-CN`, `--locale=zh` con `en-US`, `--locale=es` con `de-DE`), que es justo lo que hace el selector de Ajustes.
- Cada escenario recibe su propio perfil cuya ruta contiene caracteres CJK y espacios, comprueba lo escrito en disco y recorre franja clara, libro claro, ajustes y libro oscuro.
- Saldo, autonomía y gasto de hoy se comparan como cadenas exactas contra la base `zh-CN`; los recuentos de tokens se comparan numéricamente, interpretando la agrupación de cada idioma (`1096 万`, `11M`, `11 M`, `11 Mio.`). Relojes y etiquetas dependientes de la fecha no se comparan.
- Se revisa el estado FontFace de Inter / MiSans, los caracteres del DOM recogidos deben pertenecer a `scripts/font-corpus.txt`, y en modo chino CDP `CSS.getPlatformFontsForNode` lee la fuente real de la plataforma que usa una etiqueta china para confirmar que viene del subconjunto MiSans incluido.
- **Cada etiqueta visible se mide con una única regla compartida** — `renderer/text-fit.js`, que carga la página y que la propia tarjeta llama: la tinta del texto debe quedar dentro del muro al que podría chocar (el ancestro que recorta más cercano, o el siguiente elemento que empieza en su línea); si el elemento recorta su propio texto, se mide contra esa caja, porque un idioma más largo pasaría todas las comprobaciones de texto mientras muestra `Fenster über 30 T…` cortado. Informa de todos los escenarios a la vez en lugar de pararse en el primero, porque las métricas de la fuente cambian por sistema: la misma línea que cabía en Windows y Linux se desbordó 12 píxeles en macOS, y así fue como también se acortó el texto inglés.

Estas comprobaciones **no** prueban una cobertura cmap completa, cada glifo de reemplazo, el dibujo de los menús nativos, una edición del idioma del SO anfitrión, ni el cifrado real de credenciales; la suite de idiomas nunca introduce credenciales y no hace ningún viaje de cifrado / descifrado.

## GitHub Actions y lanzamientos

El flujo de trabajo es [`.github/workflows/build.yml`](.github/workflows/build.yml); los cuatro runners han completado ejecuciones reales, y la ruta de lanzamiento ha publicado cinco veces — v2.4.1, v2.5.0, v2.6.0, v2.6.1 y v2.6.2. Una ejecución semanal contra main caza la deriva de las imágenes del runner cuando no espera ninguna publicación; la descarga de Electron y electron-builder se guarda en caché por plataforma y lockfile; y tras publicar, el trabajo de lanzamiento vuelve a comprobar el conjunto de activos, sus resúmenes y `SHA256SUMS.txt` contra los archivos que los runners construyeron.
Un `git commit` local no dispara nada en la nube; un push, un pull request o una ejecución manual sí. GitHub Packages es para npm / registros de contenedores y similares — este proyecto distribuye binarios de escritorio mediante Artifacts y recursos de Release.

| Disparador | Comportamiento |
| --- | --- |
| Push a `main` / pull request contra `main` | Prueba, empaqueta, verifica los artefactos y sube Artifacts; sin Release |
| `workflow_dispatch` manual | Las mismas pruebas y empaquetado; sin Release |
| Empujar una etiqueta `v*` | La etiqueta debe ser `v` + la versión de `package.json`; la Release se publica solo después de que los cuatro runners tengan éxito |

Los runners son `windows-2022` x64, `ubuntu-22.04` x64, `macos-15` arm64 y `macos-15-intel` x64, con Node.js 24.
Cada trabajo de compilación empieza con `npm run check:release` y `npm run check:docs`: el host debe coincidir con la matriz, la versión debe coincidir en cuatro sitios, con una etiqueta el nombre debe ser `v` + versión, y los cinco documentos deben seguir reflejándose entre sí. El trabajo de lanzamiento no ejecuta ninguno de los dos, porque los cuatro trabajos de compilación ya comprobaron lo mismo antes de subir.
La interfaz de Linux corre en un escritorio X11 virtual (Xvfb + Openbox), lo cual no significa que estén verificadas las sesiones GNOME o Wayland.
El paso de compilación de macOS permite al paso de `dmgbuild` tres intentos en total y solo desmonta volúmenes llamados `Token Monitor*`; cuando los intentos se agotan el trabajo falla en lugar de esconder un error real de empaquetado.
La comprobación de la app empaquetada acepta `pending` (el sistema nunca respondió sobre el llavero) como estado reportado y sigue con las aserciones restantes, pero lo registra de forma explícita en vez de contarlo como cifrado verificado.
Los Artifacts de paquete se guardan **14 días**, los diagnósticos de pruebas 7; a un Artifact descargado puede hacer falta una extracción de archivo más.

Una Release debe contener seis paquetes más `SHA256SUMS.txt`, con prefijo `token-monitor-<version>-`:

- `win-x64.zip`, `linux-x64.AppImage`
- `mac-arm64.dmg`, `mac-arm64.zip`
- `mac-x64.dmg`, `mac-x64.zip`

Una etiqueta con `-` (por ejemplo `v2.7.0-beta.1`) se publica como pre-lanzamiento; una etiqueta de versión simple se publica como la última versión estable. Una Release pública existente nunca se sobrescribe — publica una versión nueva.

### Publicar

1. Actions está activado en este repositorio; los cuatro runners alojados y los permisos de publicación se han ejercitado.
2. El flujo de trabajo debe existir en la **rama por defecto** antes de poder ejecutarse a mano desde la página de Actions: **Build desktop apps → Run workflow**.
3. No hace falta un token personal: el trabajo de lanzamiento declara `contents: write` y usa el `GITHUB_TOKEN` integrado; las políticas de la organización aún pueden restringirlo.
4. Los commits y pushes ocurren solo después de que la persona usuaria confirme. Los resultados en la nube vienen de ejecuciones reales; los cambios locales nunca se reportan como enviados.

**Empuja la etiqueta por separado.** Este repositorio tiene evidencia en los dos sentidos: `git push --atomic origin main refs/tags/v2.4.0` produjo solo la ejecución de `main`, ninguna de etiqueta y por tanto ninguna Release (esa etiqueta vacía se borró después); empujar `v2.4.1` solo activó el pipeline de etiqueta de inmediato. La documentación oficial solo dice que "no se crearán eventos para etiquetas cuando se empujan más de tres etiquetas a la vez" y no dice nada de empujar una rama y una etiqueta juntas, así que trata el empuje combinado como no fiable.

```bash
git push origin main          # primero: deja que los cuatro runners se pongan verdes con el commit nuevo
git push origin v2.6.2        # después: empuja la etiqueta sola, que es lo que dispara una Release
```

Documentación de GitHub: [runners alojados](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) · [Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts) · [eventos que disparan flujos de trabajo](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Estructura y límites

- `main.js` / `preload.js`: ventanas, bandeja, IPC y el puente mínimo.
- `lib/deepseek.js` / `lib/store.js`: endpoints de la cuenta, agregación de métricas y almacenamiento de configuración.
- `renderer/`: interfaz, estilos, gráficas, fuentes incluidas y el diccionario compartido `i18n.js`; `scripts/`: arranque, empaquetado y regresión.
- `shots/`: capturas del escaparate y en vivo; `dist/` guarda compilaciones en directorio y `release/` los paquetes distribuibles.

Solo DeepSeek: sin agregación multi-proveedor, sin sincronización entre dispositivos, sin inicio de sesión automatizado, sin arrancar con el sistema, sin actualización automática.
Los datos de demostración no son una cuenta real; los costes y el uso dependen de lo que devuelva la plataforma y de tu fecha local, y una previsión nunca es una garantía de gasto.

## Créditos y licencia

Proyectos de referencia: [token-monitor](https://github.com/Javis603/token-monitor), [agent-sessions](https://github.com/jazzyalex/agent-sessions), [CodexBar](https://github.com/steipete/CodexBar).

El código de este repositorio está bajo licencia [MIT](LICENSE). Las fuentes mantienen sus propias licencias y no las cubre la licencia MIT del proyecto:

- **Inter**: aportado por rsms bajo la SIL OFL 1.1 — usarlo, recortarlo y redistribuirlo exige conservar licencia y aviso de copyright, y así se hace: ver [OFL-Inter.txt](renderer/assets/font/licenses/OFL-Inter.txt). El subconjunto no declara Reserved Font Name y su `OS/2.fsType` es 0 (Installable), así que aquí no depende de ninguna interpretación.
- **MiSans**: lo aporta Xiaomi, con glifos de Hanyi. La aplicación incluye un subconjunto de la variable oficial y lo reconoce en el README, en **Ajustes → Acerca de** y en [MiSans-Notice.txt](renderer/assets/font/licenses/MiSans-Notice.txt); el contrato viaja también en el paquete como [MiSans-License.pdf](renderer/assets/font/licenses/MiSans-License.pdf), porque la cláusula 2(4) pide conservarlo en cualquier copia de la fuente.
- **Qué resuelve la licencia de MiSans y qué no.** La cláusula 2 concede una licencia de derechos "intransferible, no exclusiva, libre de regalías, **revocable** y mundial", y la 2(3) permite explícitamente distribuir o vender "aplicaciones (Apps)" creadas con la fuente — esa es la base en la que esta app la incluye. La misma cláusula prohíbe distribuir *individualmente* la fuente o sus copias, que es más bien lo que es un archivo en un repositorio público; la 2(2) prohíbe adaptar o redesarrollar la fuente sin definir esos términos ni mencionar el subsetting; y el `OS/2.fsType` del subconjunto incluido es 8 (Preview & Print). **Por eso este proyecto no afirma que el recorte esté autorizado.** Cerrarlo exige una autorización escrita de Xiaomi (§7.2 del contrato) o descargar en la compilación la fuente oficial sin modificar. `npm run check:release` verifica los papeles —contrato junto a la fuente y aviso redactado con honestidad—, no la conclusión.
