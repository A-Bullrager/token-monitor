<p align="right"><a href="./README.md">EN</a> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.es.md">Español</a> | <strong>Português</strong> | <a href="./README.de.md">Deutsch</a></p>

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

Descansa como uma faixa, expande para um extrato e estima *quanto tempo o seu dinheiro dura* com dois ritmos de gasto (`30D / 7D`). A interface vem em **chinês, inglês, espanhol, português do Brasil e alemão**: `Auto` segue o idioma do sistema, e qualquer um dos cinco pode ser fixado nas Configurações. Feito sobre Electron 45 com DOM e SVG puros. Sem servidor intermediário, sem telemetria.

## Vitrine

Todas as imagens abaixo mostram dados locais de demonstração; elas mostram a interface e não são evidência de nenhuma execução de teste específica.

<table>
<tr>
<td width="50%" align="center"><img src="shots/deck-en.png" width="440" alt="O extrato em inglês"><br><sub><b>Extrato</b> — medidor de autonomia, saldo, curva de 30 dias, mistura de modelos e acertos de cache</sub></td>
<td width="50%" align="center"><img src="shots/deck.png" width="440" alt="A mesma interface em chinês"><br><sub><b>Extrato (中文)</b> — o mesmo instrumento, escrito originalmente em chinês</sub></td>
</tr>
<tr>
<td width="50%" align="center"><img src="shots/strip-en.png" width="440" alt="A faixa do dia a dia em inglês"><br><sub><b>Faixa</b> — a forma sempre visível: dias de autonomia, saldo, gasto de hoje e um sparkline</sub></td>
<td width="50%" align="center"><img src="shots/strip.png" width="440" alt="Faixa em chinês"><br><sub><b>Faixa (中文)</b> — a mesma forma, escrita originalmente em chinês</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/settings.png" width="290" alt="Gaveta de configurações"><br><sub><b>Configurações</b> — credenciais, atualização, tema, idioma e atalhos</sub></td>
<td width="33%" align="center"><img src="shots/dark.png" width="290" alt="Tema escuro"><br><sub><b>Escuro</b> — para a noite ou desktops escuros</sub></td>
<td width="33%" align="center"><img src="shots/empty.png" width="290" alt="Estado sem conexão"><br><sub><b>Sem conexão</b> — dados de demonstração até você informar credenciais</sub></td>
</tr>
<tr>
<td width="33%" align="center"><img src="shots/deck-es.png" width="290" alt="Ledger en español"><br><sub><b>Español</b> — <i>Autonomía</i>, <i>Recarga / bono</i>, <i>Se agota 5 mar</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-pt-BR.png" width="290" alt="Livro em português do Brasil"><br><sub><b>Português (Brasil)</b> — <i>Autonomia</i>, <i>Recarga / bônus</i>, <i>Acaba 5 de mar.</i></sub></td>
<td width="33%" align="center"><img src="shots/deck-de.png" width="290" alt="Buch auf Deutsch"><br><sub><b>Deutsch</b> — <i>Reichweite</i>, <i>Aufladung / Gutschrift</i>, <i>Am 5. März leer</i></sub></td>
</tr>
</table>

As duas imagens abaixo vêm de uma janela real em execução, não da vitrine encenada, como checagem de que o produto de verdade se parece com as fotos acima:

<table>
<tr>
<td width="50%" align="center"><img src="shots/live-strip.png" width="420" alt="Faixa em uma janela real"><br><sub><b>Faixa real</b> — capturada de uma janela em execução</sub></td>
<td width="50%" align="center"><img src="shots/live-deck.png" width="420" alt="Extrato em uma janela real"><br><sub><b>Extrato real</b> — capturado de uma janela em execução</sub></td>
</tr>
</table>

## O que ele mostra

- **Faixa / extrato**: saldo, gasto de hoje, dois ritmos de autonomia e uma data estimada de fim.
- **Detalhe de uso**: curva de gasto de 30 dias, tokens, mistura de modelos, taxa de acerto de cache, contagem de requisições e preço unitário efetivo.
- **Comportamento de desktop**: arrastável, manter no topo, bandeja do sistema, duas formas de janela; os efeitos de janela transparente variam por plataforma.
- **Tela e privacidade**: claro / escuro / sistema, um clique para ocultar valores, dados locais de demonstração por padrão.
- **Sincronização**: atualização manual, ou a cada 30 segundos / 1 minuto / 5 minutos.

## Baixar e executar

Lançamentos: [GitHub Releases](https://github.com/A-Bullrager/token-monitor/releases). Compilações de desenvolvimento estão nos Artifacts de cada execução do Actions.
**[v2.6.0](https://github.com/A-Bullrager/token-monitor/releases/tag/v2.6.0) é a versão atual** — a de cinco idiomas: chinês, inglês, espanhol, português do Brasil e alemão. Os quatro runners nativos passaram, e a página traz seis pacotes mais `SHA256SUMS.txt`. O pacote do Windows foi baixado de novo daquela página, bateu com a soma de verificação e foi extraído e iniciado em um Windows 10 de verdade; os pacotes de Linux e macOS são cobertos apenas pelos seus próprios runners, não pela máquina do desenvolvedor.

| Plataforma | Pacote | Como executar |
| --- | --- | --- |
| Windows x64 | ZIP portátil | Extraia o diretório inteiro e execute `Token Monitor.exe` dentro dele; não solte o exe sozinho |
| Linux x64 | AppImage | Marque como executável e rode em uma sessão de desktop gráfica |
| macOS Apple Silicon | DMG + ZIP arm64 | Copie o app do DMG para Aplicativos, ou use o ZIP |
| macOS Intel | DMG + ZIP x64 | Pegue o pacote x64; não misture com arm64 |

### Notas por plataforma

- **macOS**: as compilações são assinadas ad-hoc (`identity: '-'`) com `notarize: false`. Isso não é assinatura Developer ID e o app não é notarizado, então uma cópia baixada pelo navegador pode ser bloqueada pelo Gatekeeper.
- Verifique primeiro o `SHA256SUMS.txt` da página do lançamento. Só se você confiar na origem, siga o aviso do sistema e permita o app em **Ajustes do Sistema → Privacidade e Segurança**; se o sistema recusar, não force a barra. Uma soma que bate não é atestado de identidade.
- **Linux**: precisa de um desktop gráfico mais as dependências do Electron (GTK, NSS, ATK, GBM, ALSA e companhia); a proteção de credenciais pede ainda um chaveiro de desktop funcionando. Siga a documentação da sua distribuição para os nomes de pacote e para a configuração de AppImage / FUSE.
- O GNOME pode pedir uma extensão AppIndicator / KStatusNotifierItem. Transparência, ficar no topo e o comportamento da bandeja mudam entre desktops, compositores e sessões Wayland; nada é garantido idêntico.

## Executando pelo código

Requer **Node.js ≥ 22.12.0, Node.js 24 recomendado**, mais npm. Na raiz do repositório:

```bash
npm ci
npm start
```

`npm start` remove um `ELECTRON_RUN_AS_NODE` esquecido do ambiente do filho, para o Electron não poder degradar para um modo Node sem janela.

### Compilando localmente

Compile na plataforma que você vai mirar; rode `npm run icons` antes da primeira compilação para gerar os ícones de empacotamento.

| Comando | Alvo e saída |
| --- | --- |
| `npm run package:dir` | Compilação em diretório para a plataforma e arquitetura do host, em `dist/Token Monitor-<platform>-<arch>/` |
| `npm run package:win` | Só o diretório do Windows x64 (`dist/`), sem arquivo |
| `npm run package:win:zip` | **Só hosts Windows x64**; empacota o diretório em `release/token-monitor-<version>-win-x64.zip`, o mesmo script que o CI usa |
| `npm run package:linux` | AppImage de Linux x64 em `release/` |
| `npm run package:mac` | DMG + ZIP de macOS para a arquitetura do host por padrão, em `release/` |

No macOS você pode ser explícito com `npm run package:mac -- --arm64` ou `-- --x64`; compilar para uma arquitetura não é o mesmo que ter executado o resultado em uma.
O `test:distributable` exige o arquivo real em `release/` — a compilação em diretório não conta. Ele também compara o arquivo com as fontes e **falha quando o pacote é mais velho que o código**, porque um "ZIP verificado" local acabou sendo resto da compilação anterior.

## Conectando uma conta DeepSeek

1. Abra as Configurações e leia primeiro a nota sobre armazenamento de credenciais, no fim.
2. Crie uma **API key** em [DeepSeek API Keys](https://platform.deepseek.com/api_keys); ela alimenta o endpoint oficial de saldo.
3. Para uso e autonomia, entre na [página de uso da plataforma](https://platform.deepseek.com/usage) no navegador, abra a aba Network das ferramentas de desenvolvimento e recarregue.
4. Copie o **Session Token** depois de `Bearer` no cabeçalho `Authorization` de uma requisição `api/v0`; colar o cabeçalho inteiro também funciona, o app remove o prefixo.
5. Desative *Usar dados de demonstração*, depois salve e sincronize. Quando a sessão expirar, você mesmo tem que renovar o token.

**Só com a API key dá para ler o saldo. A autonomia precisa do uso que vem do Session Token, então com apenas uma API key a pista continua vazia.**
Um Session Token é um segredo: mantenha longe de capturas de tela, logs, issues e repositórios públicos.

## De onde vem cada número

| Métrica | Fórmula / origem |
| --- | --- |
| Saldo total | `GET https://api.deepseek.com/user/balance` oficial, com preferência pela conta em CNY |
| Gasto / tokens de hoje | Dados por dia da plataforma, tomados no dia calendário local |
| Gasto / tokens de 30 dias | 30 dias calendário incluindo hoje, juntando o mês anterior quando necessário |
| Média diária 30D | Total de 30 dias ÷ número de dias que realmente tiveram gasto |
| Autonomia 30D | Saldo total ÷ média diária de 30D |
| Média diária 7D | Total dos últimos 7 dias calendário ÷ 7, incluindo dias com gasto zero |
| Autonomia 7D | Saldo total ÷ média diária de 7D |
| Data do fim | Hoje mais a autonomia arredondada em dias — uma estimativa, não uma promessa |
| Previsão mensal | Média diária do ritmo escolhido × 30 |
| Preço efetivo | Custo de 30 dias ÷ tokens × 1.000.000 |
| Acerto de cache | `hit ÷ (hit + miss + prompt/entrada) × 100%`, sobre tokens de entrada |
| Requisições / mistura de modelos | Agregados na mesma janela de 30 dias; cada linha de modelo traz sua própria dica de cache |

Quando a média é zero ou faltam dados necessários, nenhuma estimativa de autonomia é mostrada; uma amostra de gasto pequena é marcada como indicativa.
O uso da plataforma vem dos endpoints internos não documentados `/api/v0/usage/amount` e `/api/v0/usage/cost` (em `platform.deepseek.com`, pedidos por mês).
Campos, autenticação e atraso de dados podem mudar; se a requisição do mês anterior falhar, a implementação atual segue trabalhando com o que conseguiu buscar, então um número de 30 dias pode estar incompleto.

## Segurança e configuração local

As credenciais chegam ao processo principal pela ponte do preload, e só valores mascarados voltam para a interface. Se `safeStorage` está disponível depende da plataforma e dos serviços de desktop:

| Plataforma | Proteção quando disponível |
| --- | --- |
| Windows | DPAPI |
| macOS | Chaveiro (Keychain) |
| Linux | Um backend real `gnome_libsecret` ou KWallet (`kwallet` / `kwallet5` / `kwallet6`) |

No Linux, `basic_text`, `unknown` e qualquer outro backend não reconhecido ou indisponível é tratado como `none`.
**Quando a criptografia do sistema não está disponível, as credenciais viram `plain:` + base64 no disco. Isso não é criptografia: quem consegue ler o arquivo de configuração consegue recuperá-las.** A interface mostra então "Sem criptografia · não há chaveiro do sistema"; se você não aceita isso, não guarde credenciais reais.

**A sondagem é preguiçosa e assíncrona.** A checagem de disponibilidade (`isAsyncEncryptionAvailable`, com repliegue para a API síncrona só quando ela não existe) roda quando a gaveta de configurações abre, nunca no caminho de inicialização — no macOS um chaveiro bloqueado ou uma autorização pendente travam uma chamada síncrona e congelam o processo inteiro, que foi exatamente o que aconteceu na primeira execução na nuvem. Portanto:

- Até o sistema responder, o rótulo de armazenamento fica neutro ("Salvo só neste dispositivo"): ele não promete criptografia nem afirma texto puro.
- Salvar uma **credencial nova** enquanto o backend é desconhecido é recusado com "Criptografia do sistema não confirmada · credenciais não salvas" em vez de rebaixar em silêncio. Mudar tema, ritmo, fixação ou forma continua salvando normalmente.
- Uma credencial intocada mantém o texto cifrado que já está no disco; um salvamento não relacionado nunca a recifra nem a rebaixa. Um valor `plain:` legado vira `enc:` somente depois que um backend confiável é confirmado.
- O comportamento de ponta a ponta do armazenamento só foi verificado contra a DPAPI do Windows. Os caminhos de chaveiro no macOS e no Linux não foram verificados em máquinas reais.

Onde mora a configuração do dia a dia (as execuções de teste usam perfis isolados):

| Plataforma | Caminho do `config.json` |
| --- | --- |
| Windows | `%APPDATA%\Token Monitor\config.json` |
| macOS | `~/Library/Application Support/Token Monitor/config.json` |
| Linux | `${XDG_CONFIG_HOME:-~/.config}/Token Monitor/config.json` |

Deixar um campo de credencial vazio mantém o valor salvo; **Limpar credenciais** esvazia os dois e volta para o modo de demonstração.
As requisições da conta vão direto para `api.deepseek.com` / `platform.deepseek.com`; não há repasse nem analytics. Ícones, fontes e dados de demonstração são todos locais.

## Idiomas

A interface é escrita em chinês, e cada outro idioma é um dicionário cujas chaves são exatamente essas cadeias chinesas (`renderer/i18n.js` mais `renderer/locales/<idioma>.js`), carregado pelo processo principal *e* pelo renderizador. Um rótulo não pode ser atualizado em um só idioma: `npm run check:i18n` falha se faltar uma chave em algum dicionário, se ele responder em chinês, se esquecer uma forma interpolada ou se esquecer o plural.

| Interface em inglês | Interface em chinês |
| --- | --- |
| ![Ledger (English)](shots/deck-en.png) | ![中文界面](shots/deck.png) |

- **Idiomas incluídos**: chinês (o idioma de escrita), inglês, espanhol, português do Brasil e alemão. `Auto` casa o idioma do sistema pelo prefixo — `zh*`, `es*`, `pt*`, `de*`, `en*` — e todo o resto cai no inglês, o único reserva que qualquer fonte incluída consegue renderizar. `pt-PT` recebe portanto o dicionário brasileiro; `es-MX` e `es-ES` compartilham um só espanhol.
- **O que é traduzido**: as duas formas da janela, a gaveta de configurações, a lista de atalhos, os avisos, as mensagens de erro, o menu da bandeja, a dica da bandeja e o menu do aplicativo no macOS — mais a cartela ASCII do instrumento (`DAYS`, `TOTAL`, `SAMPLE`, `AVG`, `PEAK ¥29.10 · 10-03`, `SYNCED 18:02:18`), que em chinês também aparece em inglês.
- **O que não é traduzido**: o nome do produto, o slogan `Know your runway.`, `DeepSeek`, os nomes de campo `API KEY` / `SESSION TOKEN` e os códigos de instrumento `DEMO`, `SYNC`, `30D / 7D` e as unidades de ordem `M` / `K`.
- **Números e datas seguem o idioma**: o chinês agrupa os tokens em 万 / 亿 e escreve o fim como `约 3 月 5 日见底`; o inglês usa `12.5K` e `Runs out Mar 5`; o espanhol `12,5 mil` e `Se agota 5 mar`; o português `12,5 mil` e `Acaba 5 de mar.`; o alemão `12.500` e `Am 5. März leer`. As quantidades por trás são idênticas, e as checagens as comparam numericamente. Um número longo demais para o espaço dele —¥99.999.999,99 numa coluna calculada para ¥1,49— reduz o próprio tipo até caber, em vez de ser cortado.
- **O plural é de cada idioma**: o chinês não marca número gramatical, então cada dicionário flexiona o próprio substantivo contado (`1 día activo` / `15 días activos`, `1 Tag` / `15 Tage`). A checagem de paridade recusa um idioma cuja forma de um e de muitos saiam iguais, e trata `1.0` medido como plural.
- **Limite conhecido**: o dinheiro mantém um único estilo decimal em todos os idiomas (`¥145.09`), assim como o relógio. Só as contagens de tokens seguem o agrupamento do idioma. Trocar o idioma salva o ajuste e **recarrega a janela** — o único ajuste que faz isso, porque texto já escrito na página não pode ser retraduzido no lugar.

**Uma restrição real sobre o texto**: as fontes incluídas são subconjuntos. O subconjunto do MiSans foi cortado sobre um corpus fixo e não contém 语 / 言 / 英 / 文, então o texto chinês novo precisa ficar dentro de `scripts/font-corpus.txt` — por isso a linha do idioma se chama `LANGUAGE` e a opção chinesa diz `Chinese`. Os acentos que os idiomas novos pedem (`Á Ã Ç É Í Ó Ø Ú Ü ß á ã ä ç é ê í ñ ó ô õ ö ú ü`) foram conferidos com fontTools contra o cmap real do subconjunto do Inter, e `scripts/glyph-demand.mjs` falha antes de qualquer janela abrir se um dicionário pedir um caractere fora do corpus. A checagem de corpus em `npm run test:i18n` confere depois os caracteres que realmente estão na tela, e ela já pegou um bug de verdade: rótulos monoespaçados saindo como tofu nos runners de Linux porque a pilha de fontes não tinha um reserva CJK incluído.

## Testes e o que eles provam

nenhum rótulo fica cortado em nenhum idioma incluído; nas 10 passadas de caimento de número × 10 escalas de magnitude também nenhum número sai da caixa.

**Treze rodadas na nuvem até aqui; a versão publicada está verde nos quatro runners nativos.** A narrativa rodada a rodada está dobrada abaixo — tudo o que ela provou *negativo* está dito fora da dobra, para que dobrar não possa esconder uma ressalva. Um daqueles negativos é sobre os próprios testes: a checagem da deformação estava cega no macOS, onde a borda da janela se move depois que a classe CSS que ela amostrava já tinha sumido (rodada 12), então agora ela avalia o movimento observado.

<details>
<summary>Histórico de compilações na nuvem (rodadas 1–13)</summary>

**Rodada 1 na nuvem (`9faa78e`, quatro runners nativos)**: Windows x64 verde; Linux x64 leu errado "o socket do depurador fechou antes da resposta" durante o encerramento e tomou como falha; as duas compilações de macOS foram assinadas e verificadas, mas a checagem de inicialização do app empacotado expirou na primeira ida e volta CDP.

**Rodada 2 (`4fb1d4d`)**: Windows ainda verde; a suíte de idiomas do Linux ficou verde e a falha mudou de lugar — o electron-builder emite `linux-x86_64.AppImage` enquanto as checagens e o contrato do lançamento esperam `linux-x64`. Os dois jobs de macOS ainda expiravam, mas agora com pilhas de processo: 80 de 80 amostras estavam em `SecItemCopyMatching → SecurityServer → mach_msg`, ou seja, uma **leitura síncrona do chaveiro no caminho de inicialização** tinha congelado o processo principal (os testes pelo código usam Electron não assinado, cuja entrada no chaveiro já está autorizada no runner, então só o app empacotado esbarrava nisso).

**Correções feitas a partir daquela evidência**: a corrida do encerramento só é tolerada naquele caso e o processo ainda tem que sair com 0; os rótulos monoespaçados ganharam o reserva MiSans incluído e as checagens agora leem a fonte real da plataforma por CDP; o nome do artefato do Linux foi fixado em `linux-x64`; a sondagem do chaveiro saiu completamente da inicialização (veja *Segurança e configuração local*).

**Rodada 3 (`de0c757`)**: Windows x64, Linux x64 (AppImage extraído e iniciado) e macOS Apple Silicon (DMG + ZIP construídos, verificados com rigor, extraídos e com checagens de instalação a partir do DMG) todos verdes. macOS Intel falhou só ao criar o DMG: o `hdiutil detach` final do `dmgbuild` esbarrou em "Resource busy" embora o ZIP do mesmo passo tivesse sucesso e o job idêntico de arm64 passasse — uma corrida do runner, não um erro de empacotamento, então aquele passo ganhou uma retomada limitada a no máximo três tentativas que desmonta apenas o próprio volume.

**Rodada 4 (`036e326`, os quatro verdes)**: a corrida da Intel se reproduziu, a retomada a recuperou na segunda tentativa e passaram tanto a extração do ZIP quanto a instalação pelo DMG; os quatro runners enviaram seus pacotes.

**Rodada 5 (tag `v2.4.1`, execução 40642992704)**: enviar a tag sozinha ativou o pipeline de tag como esperado, os quatro runners passaram e o job de lançamento verificou os seis pacotes, gerou `SHA256SUMS.txt` e publicou. O pacote do Windows baixado de novo da página do lançamento bateu com a lista de somas e passou todas as asserções localmente (`isPackaged`, versão, nenhuma sondagem de chaveiro na inicialização, rótulo DPAPI nas configurações). Os pacotes de Linux e macOS só foram cobertos pelos seus próprios runners.

**O primeiro commit bilíngue (`1cedcc6`) falhou nos quatro runners ao mesmo tempo**: as asserções estavam escritas para a interface em chinês enquanto os hosts do runner respondem em inglês, então `auto` resolveu inglês. O produto se comportou certo e a suposição do teste, não. A correção faz a regressão declarar o idioma que afirma (veja `test:ui` acima) e deixa de propósito sem fixar apenas o passo "trocar para inglês e reiniciar".

**Segunda tentativa bilíngue (`d62fc57`, os quatro verdes)**: em runners Linux e macOS com host em inglês passaram os 11 cenários de idioma / fuso, a regressão da interface e as checagens de inicialização do AppImage extraído e da instalação pelo DMG, produzindo pacotes 2.5.0 para toda plataforma.

**Rodada 8 (tag `v2.5.0`, execução 40660748693)**: enviar a tag sozinha ativou o pipeline de tag, os quatro runners passaram e o job de lançamento conferiu os seis pacotes, gerou `SHA256SUMS.txt` e publicou. O pacote do Windows foi baixado de novo da página do lançamento, seu SHA256 bateu com a lista, e ele foi extraído e iniciado aqui pelas mesmas asserções de qualquer outra compilação. Os pacotes de Linux e macOS são cobertos apenas pelos seus próprios runners.


**Rodada 9 (`5a21201`, o primeiro commit de cinco idiomas) falhou só no macOS**: a nova asserção de caimento de rótulo reportou a linha de ritmo *em inglês* 12px fora da caixa no macOS Apple Silicon, enquanto a compilação idêntica estava limpa no Windows e no Linux — aquela linha tinha sido dimensionada pelas fontes da máquina que a escreveu. E a checagem parava no primeiro cenário com falha, então uma rodada só conseguia revelar o primeiro problema de uma plataforma.
**Rodada 10 (`819601e`, os quatro verdes)**: a varredura de caimento agora acumula todo cenário e estado e falha uma vez com a lista inteira, e o texto em inglês virou `15 active days of 30` — a mesma frase com menos caracteres, que é a diferença entre um rótulo e um rótulo cortado.
**Rodada 11 (tag `v2.6.0`, execução 40801968504)**: enviar a tag sozinha ativou o pipeline de tag, os quatro runners passaram e o job de lançamento conferiu os seis pacotes, gerou `SHA256SUMS.txt` e publicou. O pacote do Windows foi baixado de novo da página do lançamento, seu SHA256 bateu com a lista, e ele foi extraído e iniciado aqui pelas mesmas asserções de qualquer outra compilação (`isPackaged`, versão 2.6.0). Os pacotes de Linux e macOS são cobertos apenas pelos seus próprios runners.

**Rodada 12 (`a244fa4`, um commit só de documentação) falhou de novo no macOS — no teste, não no produto**: a checagem da deformação reportou `596 -> 593` no Apple Silicon embora o mesmo código tivesse ficado verde naquele runner uma rodada antes. A amostragem parava com a classe CSS observada, e o macOS aplica `setSize` no próprio ritmo: com o runner ocupado, a borda da janela se moveu depois que a classe tinha sumido. A medição estava cega; a animação aconteceu.

**Rodada 13 (`c52a77e`, os quatro verdes)**: a deformação passou a ser avaliada pelos quadros em que a borda realmente se move, com até três amostragens registradas por execução. Conferido contra um salto real: forçar a duração para 1ms faz a checagem falhar com "biggest single step 668px of 668px".
</details>

**O que o chaveiro do macOS realmente significa no CI**: rodar pelo código sonda `keychain` (a entrada do Electron não assinado vem pré-autorizada no runner), enquanto **o app empacotado fica em `pending`** — o sistema nunca responde. As checagens agora aceitam e relatam isso em vez de travar, mas isso significa que **a criptografia real do Chaveiro no app empacotado do macOS nunca foi verificada em lugar nenhum**, e este README não afirma que foi.

| Comando | O que cobre |
| --- | --- |
| `npm test` | As suítes de dados, armazenamento, interface e ambiente de idioma, em ordem |
| `npm run check:release` | Porta de versão: `package.json`, o lock e as duas literais do renderizador têm que concordar, e uma tag tem que ser `v` + versão |
| `npm run check:i18n` | Paridade de dicionários entre todos os idiomas incluídos — mesmas chaves, mesmas formas interpoladas, nenhuma resposta em chinês, e a forma de um diferente da de muitos — mais a checagem de demanda de glifos contra `scripts/font-corpus.txt` |
| `npm run check:docs` | Porta de paridade entre os cinco README: cada um linka todos os outros idiomas e se marca como o atual, e todos compartilham a mesma estrutura de seções, as mesmas capturas, `<details>` equilibrados e links markdown / HTML / entre idiomas funcionando |
| `npm run test:parse` | Parse, agregação, os dois ritmos e casos-limite; sem interface gráfica |
| `npm run test:store` | 22 grupos de asserções sobre backends do sistema simulados: sondagem preguiçosa, recusa enquanto pendente, retenção do cifrado existente, atualização de `plain:` e a lista de idiomas aceitos; não é um chaveiro real |
| `npm run test:ui` | Formas, temas, privacidade, configurações, ramos de credencial e limpeza, restauração após reinício, amostragem da deformação, a troca para inglês seguida de reinício e um percurso pelo seletor em espanhol, português e alemão que precisa recarregar a janela e redestacar o idioma salvo. Todas as fases, menos as que de propósito não fixam nada, fixam chinês, porque as asserções são escritas para um idioma e o idioma do host não é nosso para supor (a primeira versão disso falhou nos quatro runners, cujos hosts respondem em inglês) A deformação é avaliada pelos quadros em que a borda da janela realmente se move e pode levar até três amostragens, todas registradas — passar na segunda é evidência sobre o runner, não uma segunda chance escondida. |
| `npm run test:i18n` | As checagens de idioma / fuso do Chromium, de fonte e de caimento de rótulo descritas abaixo |
| `npm run test:numbers` | Passa dez escalas de magnitude — de ¥0,01 e 7 tokens a um saldo de ¥99.999.999,99, 109,6 milhões de tokens, uma autonomia `999+` e ids de modelo longos — pelo caminho real de renderização nos cinco idiomas e nas duas formas de janela, e falha se algum número sair da caixa para a qual foi calculado. Ele roda numa janela de propósito: o modo vitrine coloca o cartão numa tela publicitária mais larga, e a primeira versão dessa checagem mediu ali e deixou passar um estouro real de 5px Ele também registra onde o instrumento para: com ¥99.999.999.999,99 gastos num dia, o valor de hoje da faixa é o único espaço cujo limite de corpo cede (32px, nos cinco idiomas) enquanto o extrato ainda o mostra — a checagem afirma exatamente isso, então um espaço novo que quebre no extremo ainda falha. |
| `npm run test:packaged` | Compilação em diretório: inicialização, fontes, versão e restauração da forma |
| `npm run test:distributable` | Extrai o ZIP / DMG / AppImage real de `release/` e inicia o executável que está dentro; nunca recai para `dist/` |
`npm run shots` atualiza as cinco imagens de demonstração da vitrine; as variantes por idioma (`deck-en`, `deck-es`, `deck-pt-BR`, `deck-de`, `strip-en`) vêm de `node scripts/launch.mjs --shot=<nome> --locale=<idioma>`

As regressões usam diretórios de configuração isolados e dados de demonstração. O caminho de falha de credencial manda sim para o DeepSeek uma chave de teste deliberadamente inválida e aceita erro de autenticação ou de rede: não é mock offline e não é teste positivo contra uma conta real.
O proxy de brilho da deformação é `min(max(opacidade da faixa, opacidade do extrato) por quadro)`, não uma soma das duas camadas, e essa amostragem não prova ausência de fantasma em todo lugar.

### Checagens de idioma, ambiente e fonte

O `test:i18n` abre **16 cenários**:

- Onze idiomas de Chromium — `zh-CN`, `en-US`, `es-ES`, `es-MX`, `pt-BR`, `pt-PT`, `de-DE`, `ja-JP`, `fr-FR`, `ko-KR`, `ar-SA`. O Chromium canonicaliza alguns (`ja-JP` → `ja`, `es-MX` → o neutro `es-419`), e o relatório guarda o valor pedido e o real. Cada cenário afirma **qual idioma de interface o app resolveu**: `zh*` fica em chinês, `es*` / `pt*` / `de*` / `en*` usam o próprio dicionário e um idioma sem dicionário (ja, fr, ko, ar) recebe inglês. Em todo modo traduzido a checagem exige nenhum texto em chinês e nenhuma cadeia sem tradução na tela.
- Dois cenários de fuso emulam fusos do Chromium por CDP: `Pacific/Kiritimati` (UTC+14) e `Pacific/Niue` (UTC−11). Nenhum muda o SO hospedeiro nem o fuso do processo principal.
- Três cenários de override fixam o idioma contra o idioma do navegador (`--locale=en` em `zh-CN`, `--locale=zh` em `en-US`, `--locale=es` em `de-DE`), que é exatamente o que o seletor das Configurações faz.
- Cada cenário ganha o próprio perfil, cujo caminho tem caracteres CJK e espaços, confere o que foi escrito no disco e percorre faixa clara, extrato claro, configurações e extrato escuro.
- Saldo, autonomia e gasto de hoje são comparados como cadeias exatas contra a base `zh-CN`; as contagens de tokens são comparadas numericamente, interpretando o agrupamento de cada idioma (`1096 万`, `11M`, `11 M`, `11 Mio.`). Relógios e rótulos dependentes de data não são comparados.
- O estado FontFace de Inter / MiSans é conferido, os caracteres do DOM coletados têm que pertencer a `scripts/font-corpus.txt`, e no modo chinês o CDP `CSS.getPlatformFontsForNode` lê a fonte real da plataforma usada por um rótulo chinês para confirmar que vem do subconjunto MiSans incluído.
- **Cada rótulo visível é medido contra a própria caixa** (`scrollWidth` e o ancestral de recorte mais próximo), porque um idioma mais longo passaria por todas as checagens de texto enquanto mostra `Fenster über 30 T…` cortado. Ela reporta todos os cenários de uma vez em vez de parar no primeiro, porque as métricas de fonte mudam por sistema: a mesma linha que coube no Windows e no Linux estourou 12 pixels no macOS, e foi assim que o texto em inglês também foi encurtado.

Essas checagens **não** provam cobertura cmap completa, cada glifo de reserva, a renderização dos menus nativos, uma edição com o idioma do SO hospedeiro, nem criptografia real de credenciais; a suíte de idioma nunca digita credenciais e não faz ida e volta de cifra/decifra.

## GitHub Actions e lançamentos

O fluxo é [`.github/workflows/build.yml`](.github/workflows/build.yml); os quatro runners completaram execuções de verdade, e o caminho de lançamento publicou uma vez.
Um `git commit` local não dispara nada na nuvem; um push, um pull request ou uma execução manual disparam. GitHub Packages é para npm / registros de contêiner e afins — este projeto distribui binários de desktop por Artifacts e assets de Release.

| Gatilho | Comportamento |
| --- | --- |
| Push na `main` / pull request contra a `main` | Testa, empacota, verifica os artefatos e envia Artifacts; sem Release |
| `workflow_dispatch` manual | Mesmos testes e empacotamento; sem Release |
| Enviar uma tag `v*` | A tag tem que ser `v` + a versão do `package.json`; a Release é publicada só depois que os quatro runners têm sucesso |

Os runners são `windows-2022` x64, `ubuntu-22.04` x64, `macos-15` arm64 e `macos-15-intel` x64, no Node.js 24.
Todo job de build começa com `npm run check:release` e `npm run check:docs`: o host tem que casar com a matriz, a versão tem que concordar em quatro lugares, numa tag o nome tem que ser `v` + versão, e os cinco documentos têm que continuar se espelhando. O job de release não roda nenhum dos dois, porque os quatro jobs de build já conferiram a mesma coisa antes de enviar.
A interface no Linux roda em um desktop X11 virtual (Xvfb + Openbox), o que não significa que sessões GNOME ou Wayland estejam verificadas.
O passo de compilação do macOS permite ao passo do `dmgbuild` três tentativas no total e só desmonta volumes chamados `Token Monitor*`; quando as tentativas acabam, o job falha em vez de esconder um erro real de empacotamento.
A checagem do app empacotado aceita `pending` (o sistema nunca respondeu sobre o chaveiro) como estado relatado e segue com as outras asserções, mas registra isso explicitamente em vez de contar como criptografia verificada.
Os Artifacts de pacote ficam **14 dias**, os diagnósticos de teste 7; um Artifact baixado pode precisar de mais uma extração de arquivo.

Uma Release precisa conter seis pacotes mais `SHA256SUMS.txt`, com o prefixo `token-monitor-<version>-`:

- `win-x64.zip`, `linux-x64.AppImage`
- `mac-arm64.dmg`, `mac-arm64.zip`
- `mac-x64.dmg`, `mac-x64.zip`

Uma tag com `-` (por exemplo `v2.7.0-beta.1`) é publicada como pré-lançamento; uma tag de versão simples é publicada como a versão estável mais recente. Uma Release pública existente nunca é sobrescrita — publique uma versão nova.

### Publicar

1. O Actions está habilitado neste repositório; os quatro runners hospedados e as permissões de publicação já foram exercitados.
2. O fluxo precisa existir no **ramo padrão** antes de poder ser executado manualmente pela página do Actions: **Build desktop apps → Run workflow**.
3. Não é preciso token pessoal: o job de lançamento declara `contents: write` e usa o `GITHUB_TOKEN` embutido; políticas da organização ainda podem restringir isso.
4. Commits e pushes acontecem só depois que a pessoa usuária confirma. Os resultados na nuvem vêm de execuções reais; mudanças locais nunca são reportadas como entregues.

**Envie a tag sozinha.** Este repositório tem evidência dos dois lados: `git push --atomic origin main refs/tags/v2.4.0` produziu só a execução da `main`, nenhuma de tag e portanto nenhuma Release (essa tag vazia foi apagada depois); enviar `v2.4.1` sozinho ativou o pipeline de tag na hora. A documentação oficial só diz que "eventos não serão criados para tags quando mais de três tags forem enviadas de uma vez" e não fala de enviar um ramo e uma tag juntos, então trate o envio combinado como não confiável.

```bash
git push origin main          # primeiro: deixe os quatro runners ficarem verdes no commit novo
git push origin v2.6.0        # depois: envie a tag sozinha, que é o que dispara uma Release
```

Documentação do GitHub: [runners hospedados](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) · [Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts) · [eventos que disparam fluxos de trabalho](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Estrutura e limites

- `main.js` / `preload.js`: janelas, bandeja, IPC e a ponte mínima.
- `lib/deepseek.js` / `lib/store.js`: endpoints da conta, agregação de métricas e armazenamento da configuração.
- `renderer/`: interface, estilos, gráficos, fontes incluídas e o dicionário compartilhado `i18n.js`; `scripts/`: inicialização, empacotamento e regressão.
- `shots/`: capturas da vitrine e ao vivo; `dist/` guarda compilações em diretório e `release/` os pacotes distribuíveis.

Só DeepSeek: sem agregação multi-provedor, sem sincronia entre dispositivos, sem login automatizado, sem iniciar com o sistema, sem atualização automática.
Dados de demonstração não são uma conta real; custos e uso dependem do que a plataforma devolve e da sua data local, e uma previsão nunca é garantia de gasto.

## Créditos e licença

Projetos de referência: [token-monitor](https://github.com/Javis603/token-monitor), [agent-sessions](https://github.com/jazzyalex/agent-sessions), [CodexBar](https://github.com/steipete/CodexBar).

O código deste repositório está sob licença [MIT](LICENSE). As fontes mantêm suas próprias licenças e não são cobertas pela licença MIT do projeto:

- **Inter**: fornecida por rsms sob a SIL Open Font License 1.1; uso, subsetting e redistribuição precisam manter a licença e o aviso de copyright — veja [OFL-Inter.txt](renderer/assets/font/licenses/OFL-Inter.txt).
- **MiSans**: fornecida pela Xiaomi, com glifos produzidos pela Hanyi; este projeto usa um subconjunto e mantém o crédito no README, em **Configurações → Sobre** e em [MiSans-Notice.txt](renderer/assets/font/licenses/MiSans-Notice.txt).
- Se o subsetting e a redistribuição pública do MiSans conformam sua licença ainda precisa ser conferido contra os [termos oficiais e a página de download](https://hyperos.mi.com/font/download) para o seu uso específico. Acrescentar um crédito, não mexer nos contornos ou enviá-la só dentro de um app **não resolve por si só a questão da permissão**; o que vale é o texto do contrato oficial.
