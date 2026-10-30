#!/usr/bin/env python3
"""Cut the CJK subset that ships in renderer/assets/font from the official
Noto Sans SC variable font.

Manual, and deliberately not part of CI or `npm run package:*`: the subset is a
build artifact we commit so that cloning the repository is enough to run and
build the app. Re-run this when scripts/font-corpus.txt grows and the bundle has
to cover new copy.

    python scripts/subset-font.py --source "release/font-src/NotoSansSC[wght].ttf"

The source is the unmodified file published by the Google Fonts project:
https://github.com/google/fonts/raw/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf
Its licence is SIL OFL 1.1 (see renderer/assets/font/licenses/), whose only
Reserved Font Name is 'Source' — naming a modified version "Noto Sans SC" is
therefore allowed, and OFL explicitly permits subsetting and redistribution.

Two things this script does on purpose:

* It leaves the variable axes alone. Clamping `wght` to the range the interface
  uses is tempting and wrong: partial instancing only narrows the axis, it does
  not re-cut the default master, so a hand-set `fvar` default makes the browser
  serve the wrong outlines for a CSS weight. A measured trial on 2026-10-30 was
  fooled by exactly that and reported the face as lighter than it is.
* It rewrites only the name records that describe the instance (family,
  subfamily, full name, PostScript name) and keeps the copyright, licence and
  licence-URL records — the default master is Thin, and leaving those names
  standing would describe a face this file is not.
"""
import argparse
import pathlib
import sys

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

NAME_RECORDS = {
    1: 'Noto Sans SC',        # font family
    2: 'Regular',             # font subfamily
    3: None,                  # unique ID: recomputed below
    4: 'Noto Sans SC Regular',  # full name
    6: 'NotoSansSC-Regular',  # PostScript name
    16: 'Noto Sans SC',       # typographic family
    17: 'Regular',            # typographic subfamily
}


def main():
    here = pathlib.Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', default='release/font-src/NotoSansSC[wght].ttf',
                        help='official variable font to cut from')
    parser.add_argument('--corpus', default='scripts/font-corpus.txt',
                        help='the characters the interface is allowed to ask for')
    parser.add_argument('--out', default='renderer/assets/font/NotoSansSC-subset.woff2')
    args = parser.parse_args()

    source = (here / args.source).resolve()
    out = (here / args.out).resolve()
    text = (here / args.corpus).read_text(encoding='utf-8')
    if not source.exists():
        sys.exit(f'missing source font: {source}\n'
                 f'download the official NotoSansSC[wght].ttf into release/font-src/ first')

    font = TTFont(source)
    options = Options()
    options.flavor = 'woff2'
    options.drop_tables += ['DSIG']
    # Keep the licence-relevant name records the subsetter would otherwise prune.
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13, 14, 16, 17]
    options.name_legacy = True
    options.notdef_outline = True
    subsetter = Subsetter(options=options)
    subsetter.populate(text=text)
    before = font['maxp'].numGlyphs
    subsetter.subset(font)

    name = font['name']
    for name_id, value in NAME_RECORDS.items():
        if value is None:
            continue
        name.setName(value, name_id, 3, 1, 0x409)
    name.setName('NotoSansSC-Regular:2026', 3, 3, 1, 0x409)

    out.parent.mkdir(parents=True, exist_ok=True)
    # Options.flavor steers the subsetter's table pruning, not the writer: the
    # TTFont itself has to be told. Without this the script happily wrote an
    # uncompressed TrueType file under a .woff2 name — 210,100 bytes of it, and
    # the browser would have refused every glyph.
    font.flavor = 'woff2'
    font.save(out)
    magic = out.read_bytes()[:4]
    if magic != b'wOF2':
        out.unlink()
        sys.exit(f'{out} is not a woff2 container (magic {magic!r}) — refusing to ship it')

    check = TTFont(out)
    cmap = set()
    for table in check['cmap'].tables:
        cmap |= set(table.cmap.keys())
    missing = [ch for ch in sorted(set(text)) if ord(ch) not in cmap and not ch.isspace()]
    axis = check['fvar'].axes[0] if 'fvar' in check else None
    print(f'{out.relative_to(here)}')
    print(f'  {out.stat().st_size:,} bytes, {before} -> {check["maxp"].numGlyphs} glyphs')
    print(f'  axes: {axis.axisTag} {axis.minValue}-{axis.defaultValue}-{axis.maxValue}' if axis else '  axes: none')
    print(f'  OS/2.fsType {check["OS/2"].fsType} (0 = Installable), upem {check["head"].unitsPerEm}')
    print(f'  hhea {check["hhea"].ascender}/{check["hhea"].descender}, typo '
          f'{check["OS/2"].sTypoAscender}/{check["OS/2"].sTypoDescender}/{check["OS/2"].sTypoLineGap}')
    print(f'  family name: {name.getDebugName(1)!r} / {name.getDebugName(2)!r}')
    if missing:
        sys.exit(f'  !! {len(missing)} corpus characters are NOT in the subset: {"".join(missing)}')
    print(f'  coverage: all {len(set(text))} corpus characters present')


if __name__ == '__main__':
    main()
