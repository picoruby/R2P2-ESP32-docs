# R2P2-ESP32 Docs

Documentation site for [R2P2-ESP32](https://github.com/picoruby/R2P2-ESP32), built with
[Bridgetown](https://www.bridgetownrb.com/) (Ruby SSG) + [Tailwind CSS v4](https://tailwindcss.com/),
served in English and Japanese, and deployed to GitHub Pages.

Colors/typography are borrowed from [picoruby.org](https://picoruby.org), the docs layout is inspired by
[herdr.dev/docs](https://herdr.dev/docs/quick-start/) (sidebar + content + "on this page" TOC + prev/next),
modernized with Tailwind. The docs cover the real build/flash/debug/tune workflow end to end (in English
and Japanese), and `/installer/` is a real browser-based flashing tool (via
[ESP Web Tools](https://esphome.github.io/esp-web-tools/)), not a mockup.

## Prerequisites

- Ruby (see `.ruby-version`) and [Bundler](https://bundler.io/)
- Node.js 22+ and npm

## Install

```sh
bundle install
npm install
```

## Development

```sh
bin/bridgetown start
```

Then open <http://localhost:4000/R2P2-ESP32-docs/> (note the `/R2P2-ESP32-docs/` base path — this repo
deploys as a GitHub Pages *project* site, so all local links/assets are prefixed the same way they will
be in production; see `base_path` in `config/initializers.rb`).

## Building for production

```sh
bin/tailwindcss          # compile Tailwind CSS (needs an esbuild manifest to already exist once)
npm run esbuild           # bundle JS/CSS via esbuild
BRIDGETOWN_ENV=production bin/bridgetown build
```

Or all at once via `bin/bridgetown deploy` / `rake deploy`, which chains `clean` → `frontend:build`
(Tailwind + esbuild) → `bridgetown build`. Output lands in `output/`.

## Deployment

`.github/workflows/gh-pages.yml` builds the site and deploys it to GitHub Pages via GitHub Actions on
every push to `main`. In the repo's Settings → Pages, set the source to **GitHub Actions**.

## Design system

- **Colors**: `frontend/styles/tailwind.css` defines a `brand` (red, from picoruby.org's `#e60033`) and
  `accent` (blue, `#248ec2`) palette under `@theme`. Dark mode is a manual `.dark` class toggle (see
  `frontend/javascript/theme.js`), not `prefers-color-scheme` alone.
- **Fonts**: [Inter](https://rsms.me/inter/) for UI/body text, [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
  for code — both self-hosted via `@fontsource/*` (no external font requests). Japanese text falls back to
  the OS's own Noto Sans JP / Hiragino stack.
- **Code blocks**: always rendered dark regardless of page theme (`frontend/styles/syntax-highlighting.css`),
  with a working copy-to-clipboard button (`frontend/javascript/code-copy.js`).
- **Layouts**: `src/_layouts/default.erb` (shell), `home.erb` (marketing landing page, fully data-driven
  from `home.*` keys in `src/_locales`), `docs.erb` (sidebar + prose + TOC + prev/next), `installer.erb`
  (the flashing tool page, data-driven from `installer.*` keys), `page.erb` (generic simple content page).

## Internationalization

- English is the default locale, served unprefixed (`/docs/...`); Japanese is served under `/ja/docs/...`
  (`prefix_default_locale false` in `config/initializers.rb`).
- UI strings live in `src/_locales/en.yml` and `src/_locales/ja.yml`, accessed via the `t` helper.
- Docs pages are per-locale files sharing a slug: `src/_docs/quick-start.md` (English) and
  `src/_docs/quick-start.ja.md` (Japanese) both resolve to the `quick-start` slug. Bridgetown detects the
  locale from the `.ja.` filename suffix automatically.
- The sidebar structure (`src/_data/docs_nav.yml`) lists slugs once; each page's title comes from its own
  front matter, so English and Japanese can have different nav labels without duplicating structure.
- `plugins/i18n_helpers.rb` adds small helpers (`other_locales`, `locale_label`, `find_doc`) used by the
  language switcher and sidebar; Bridgetown's built-in `in_locale` helper handles locale-prefixing URLs.

## The docs sidebar (`src/_data/docs_nav.yml`)

Each top-level entry is a section (translated via `nav.sections.<id>` in `src/_locales`). A section's
`items` are either leaf pages (`slug:` — title comes from the page's own front matter) or nested groups
(`id:` + `items:`, translated the same way as sections):

```yaml
- id: build
  items:
    - slug: why-build
    - slug: environment-setup
```

The sidebar is intentionally flat today (no section currently nests a group), but
`src/_partials/_docs_nav_items.erb` renders `items:` recursively and `plugins/docs_nav_helpers.rb`'s
`flatten_docs_nav` walks the same tree for prev/next order, so nested groups still work if a section ever
needs one again. Don't name a group/field `key` — it collides with Ruby's `Hash#key` and silently breaks
`HashWithDotAccess`'s dot-method lookup (hence `id:` instead).

To add a page: create `src/_docs/my-page.md` (+ `my-page.ja.md`) with `title` and `description` front
matter, then add its `slug` somewhere in `docs_nav.yml`.

## The Installer page

`/installer/` (`src/_layouts/installer.erb` + `frontend/javascript/installer.js`) flashes real firmware
via [ESP Web Tools](https://esphome.github.io/esp-web-tools/), sourced from the [latest R2P2-ESP32
release](https://api.github.com/repos/picoruby/R2P2-ESP32/releases/latest) — no hardcoded firmware list to
keep in sync. `rake firmware:fetch` (run by `rake deploy`) mirrors that release's `.bin` assets plus a
`release.json` into `src/firmware/` (gitignored, served at `/firmware/`), because GitHub release downloads
send no CORS headers. Run it once before local development of `/installer/`. The scheduled
`update-firmware.yml` workflow polls every 15 minutes, records the tag in `.firmware-version`, and
dispatches `gh-pages.yml` to redeploy when a new release appears.

Release assets are app-only images (no bootloader/partition table), so, like
[picoruby/R2P2-ESP32-installer](https://github.com/picoruby/R2P2-ESP32-installer), each install flashes four
parts: `bootloader.bin` (chip-specific offset), `partition-table.bin` (`0x8000`), the release app (`0x10000`)
and `storage.bin` (`0x210000`). All but the app are committed under `src/installer-base/` (copied from that
repo, served at `/installer-base/`). Only chips/variants with a directory there are offered (esp32, esp32c3,
esp32s3, esp32s3-usb_console); to support another chip, add its `bootloader.bin` and `partition-table.bin`
and register it in `BASE_DIR` in `installer.js`.

This pulls in `esp-web-tools` (which depends on `@material/web` and `esptool-js`) as a *second* esbuild
entry point (see `esbuild.config.js`), so its ~500KB bundle only loads on `/installer/`, not site-wide.
`@material/web` is pinned to `2.2.0` in `package.json` — later 2.x versions renamed some of the internal
`*-styles.js` files that `esp-web-tools`' dist code deep-imports (e.g. `checkbox-styles.js` →
`checkbox-styles.cssresult.js`), which breaks the esbuild bundle; re-check this pin before upgrading either
package.

## Search

The header search box is real, powered by [Pagefind](https://pagefind.app/) (`frontend/javascript/search.js`
+ the Pagefind JS API, not its prebuilt UI — so results match the site's own styling). Pagefind indexes the
*built* `output/` directory as a separate post-build step, not the dev server's live-reloading output:

```sh
rake pagefind          # needs output/ from a completed build first
```

`rake deploy` already runs this automatically after the Bridgetown build, so the GitHub Pages site always
ships a fresh index. For local testing: build the site (`bin/bridgetown start` or a manual `bridgetown
build` populates `output/`), then run `rake pagefind` — re-run it after any content change, since it won't
pick up edits on its own and a subsequent Bridgetown rebuild will delete its output (`output/pagefind/`)
along with the rest of `output/`.

Notes:
- Pagefind auto-detects each page's language from `<html lang>` (already set per-locale in
  `default.erb`) and searches only within the current locale by default — verified working (a Japanese
  query on a `/ja/` page only returns `/ja/` results).
- Header/sidebar/footer/breadcrumb/TOC/prev-next chrome is excluded from indexing via `data-pagefind-ignore`
  attributes, so only real page content (and the home/installer pages' own copy) gets indexed.
- `@material/web`'s `esp-web-tools` bundle doesn't touch this — it's a separate, unrelated dependency (see
  the Installer section above).

## Known follow-ups

- No OG/social preview image yet; see the commented-out `og_image` key in `src/_data/site_metadata.yml`.
  (The favicon itself — `src/favicon.svg` plus `.ico`/PNG/apple-touch-icon fallbacks — matches the header
  logomark and is already wired up in `src/_partials/_head.erb`.)
