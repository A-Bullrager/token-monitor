// The one rule that decides whether a piece of text is too big for the card.
//
// It lives here, in one file, because three parties have to agree on it: the
// renderer's `fitNumber` (which shrinks a number until it passes), the number
// check in scripts/number-fit.mjs, and the language check in scripts/
// i18n-check.mjs. When each had its own copy they drifted — the card measured
// one thing and the checks graded another, and that disagreement cost more CI
// rounds than any product defect in this repository.
//
// What the rule is: text has escaped when the reader would lose part of it. That
// means the *ink* — the glyph rectangles of the text itself, not the element's
// box — getting past the wall it could hit. The wall is the nearest ancestor
// allowed to clip, or the first element that begins to the right of this one on
// the same line. An element wider than its digits is normal in these flex rows,
// so ink spilling into empty space is not a loss and was never worth shrinking
// for; an element that clips its own text (`overflow-x`, `text-overflow:
// ellipsis`) is a loss even when the ink looks fine, because the box is the
// limit there.
(function (globalScope) {
  // The nearest ancestor that can actually cut text off. The element itself is
  // not consulted here: its own clipping is `selfClips` and its own box below.
  function clipRight(el) {
    for (let node = el.parentElement; node; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (style.overflowX === 'visible' && style.textOverflow !== 'ellipsis') continue
      const box = node.getBoundingClientRect()
      return box.right - (parseFloat(style.paddingRight) || 0)
    }
    return window.innerWidth
  }

  // The right edge of the drawn glyphs. A Range over the node's contents reports
  // one rectangle per line of text, which is the only measurement that does not
  // confuse a wide box with wide ink.
  function inkRight(el) {
    const range = document.createRange()
    range.selectNodeContents(el)
    const rects = range.getClientRects()
    if (!rects.length) return el.getBoundingClientRect().right
    let right = 0
    for (const rect of rects) right = Math.max(right, rect.right)
    return right
  }

  // The wall: the clip edge, or any neighbour that starts to the right of this
  // element on the same line. Ancestors are walked because a flex row's sibling is
  // the element's real boundary even when the row itself is inside a panel.
  function wallRight(el) {
    const own = el.getBoundingClientRect()
    let stop = clipRight(el)
    for (let up = el; up && up !== document.body; up = up.parentElement) {
      for (let sibling = up.nextElementSibling; sibling; sibling = sibling.nextElementSibling) {
        const rect = sibling.getBoundingClientRect()
        if (!rect.width || rect.top >= own.bottom - 1 || rect.bottom <= own.top + 1) continue
        if (rect.left >= own.right - 1) stop = Math.min(stop, rect.left)
      }
    }
    return stop
  }

  function selfClips(el) {
    const style = getComputedStyle(el)
    return style.overflowX !== 'visible' || style.textOverflow === 'ellipsis'
  }

  // The verdict plus the numbers behind it, so a report can show its reasoning:
  // `pixels` is how far past the wall the reader loses text, `ownBox` is the
  // element's own clip, and `ink` is signed distance past the wall.
  function escape(el) {
    if (!el || !el.getClientRects().length) {
      return { escaped: false, reason: 'hidden', pixels: 0, ink: 0, ownBox: 0 }
    }
    const ownText = el.scrollWidth > el.clientWidth + 1
    const wall = wallRight(el)
    const ink = inkRight(el) - wall
    const byWall = ink > 1
    const bySelf = ownText && selfClips(el)
    return {
      escaped: byWall || bySelf,
      pixels: Math.round(Math.max(bySelf ? el.scrollWidth - el.clientWidth : 0, byWall ? ink : 0)),
      ink: Math.round(ink),
      ownBox: ownText ? Math.round(el.scrollWidth - el.clientWidth) : 0,
      box: [el.clientWidth, el.scrollWidth],
      selfClipped: Boolean(bySelf),
      wall: Math.round(wall)
    }
  }

  const api = { clipRight, inkRight, wallRight, selfClips, escape }
  if (typeof module !== 'undefined' && module.exports) module.exports = api
  else globalScope.TmTextFit = api
})(typeof globalThis !== 'undefined' ? globalThis : this)
