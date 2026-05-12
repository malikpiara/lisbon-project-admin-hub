export function SiteFooter() {
  return (
    <footer className="bg-neutral-900 py-6 text-center text-xs text-neutral-300">
      <p>
        © {new Date().getFullYear()} Lisbon Project. Building community, one
        connection at a time.
      </p>
    </footer>
  );
}
