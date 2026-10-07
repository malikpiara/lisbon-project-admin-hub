import localFont from "next/font/local";

// The app's two families, self-hosted, defined once and imported by every root
// layout ((frontend), (payload), global-error, global-not-found).
//
// Why not next/font/google: it downloads the fonts from Google on every build,
// and on 2026-10-04 one Workers Build failed inside that download
// ("next/font/google queries have exactly one entry") with no code change. A
// build that can't reach or parse Google can't deploy. These files are the same
// fonts, so nothing renders differently.
//
// Source: the variable fonts in github.com/google/fonts (ofl/quicksand,
// ofl/jetbrainsmono; OFL licences alongside), subset with fontTools to Google
// Fonts' own unicode ranges and saved as woff2:
//   python3 -m fontTools.subset <font>.ttf --unicodes=<ranges> \
//     --layout-features='*' --flavor=woff2 --output-file=<font>.woff2
// next/font/local takes one file per family, not Google's per-script files
// loaded on demand, so each file's coverage is a choice:
//   • Quicksand (body and headings): latin + latin-ext + vietnamese, as Google
//     served it. Editors' content and people's names on a migrant-integration
//     site need more than latin. 45 KB, against Google's 28 KB latin file.
//   • JetBrains Mono (UI labels, never editor content): latin only, the same
//     file Google served (40 KB).

// Quicksand variable, wght 300–700.
export const quicksand = localFont({
  src: "./Quicksand.woff2",
  weight: "300 700",
  variable: "--font-quicksand",
  display: "swap",
});

// JetBrains Mono variable, wght 100–800.
export const jetBrainsMono = localFont({
  src: "./JetBrainsMono.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});
