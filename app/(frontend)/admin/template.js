// A Next template re-mounts on every navigation (unlike a layout, which
// persists), so this fades the content pane in as you move between admin routes.
// Kept quiet — opacity + a whisper of scale, 240ms — and disabled by the global
// prefers-reduced-motion guard. It wraps only the content pane (it sits inside
// the sidebar layout), so the sidebar stays put while the page settles in.
//
// This is a one-way fade-in, not a true old↔new cross-fade (see the ds-fade note
// in globals.css) — the native cross-fade is tracked as a follow-up.
export default function AdminTemplate({ children }) {
  return <div className="animate-fade">{children}</div>;
}
