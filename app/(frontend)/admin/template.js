// A Next template re-mounts on every navigation (unlike a layout, which
// persists), so this gives each admin route a gentle fade as you move between
// them — an app-wide route transition. Kept deliberately quiet: opacity only,
// 160ms, and disabled entirely by the global prefers-reduced-motion guard. It
// wraps only the content pane (it sits inside the sidebar layout), so the sidebar
// stays put while the page fades.
export default function AdminTemplate({ children }) {
  return <div className="animate-fade">{children}</div>;
}
