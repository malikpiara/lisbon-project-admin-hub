"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

// Lightweight FLIP animation for reorderable lists. Whenever a registered row's
// layout position changes between renders (e.g. a move up/down), it slides from
// its old spot to the new one instead of jumping — so a discrete reorder is
// legible for non-technical editors.
//
// Usage:
//   const flipRef = useFlip();
//   items.map((it) => <li ref={flipRef(it.id)} key={it.id}>…</li>)
//
// Notes:
// - Keys must be stable per item (a document id, or a client-assigned key for
//   draft arrays). Index keys won't work — React swaps content in place.
// - Measures offsetTop (not getBoundingClientRect), which ignores transforms, so
//   rapid moves don't compound a half-finished animation.
export function useFlip() {
  const nodes = useRef(new Map()); // key -> element
  const pos = useRef(new Map()); // key -> { left, top } (last offset position)
  const cbs = useRef(new Map()); // key -> stable ref callback

  // Stable ref callback per key, so React only fires it on real mount/unmount
  // (a fresh inline callback each render would churn the maps).
  const flipRef = useCallback((key) => {
    let cb = cbs.current.get(key);
    if (!cb) {
      cb = (el) => {
        if (el) nodes.current.set(key, el);
        else nodes.current.delete(key);
      };
      cbs.current.set(key, cb);
    }
    return cb;
  }, []);

  useLayoutEffect(() => {
    nodes.current.forEach((el, key) => {
      const left = el.offsetLeft;
      const top = el.offsetTop;
      const prev = pos.current.get(key);
      // Animate both axes so this also works for grid layouts (a move shifts an
      // item left/right as well as up/down), not just single-column lists.
      if (prev && (prev.left !== left || prev.top !== top)) {
        const dx = prev.left - left;
        const dy = prev.top - top;
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        requestAnimationFrame(() => {
          el.style.transition = "transform 280ms cubic-bezier(0.2, 0.8, 0.2, 1)";
          el.style.transform = "";
        });
      }
      pos.current.set(key, { left, top });
    });
    // Drop remembered positions for rows that have unmounted, so a later remount
    // doesn't animate from a stale spot.
    for (const key of pos.current.keys()) {
      if (!nodes.current.has(key)) {
        pos.current.delete(key);
        cbs.current.delete(key);
      }
    }
  });

  return flipRef;
}
