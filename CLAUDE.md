# CLAUDE.md

Guidance for Claude Code when working in this repo. See `README.md` first for
project overview, setup, design system, i18n, and the docs-sidebar structure —
this file only adds things not already covered there.

## Commands

```sh
bin/bridgetown start        # dev server (http://localhost:4000/R2P2-ESP32-docs/)
bin/tailwindcss              # compile Tailwind CSS
npm run esbuild-dev          # esbuild in watch mode
bin/bridgetown deploy        # full production build (rake default task)
```

There is no test suite; verify changes by running the dev server and checking
the page in a browser (especially for `/installer/`, which talks to real
hardware over WebSerial/WebUSB — Chrome/Edge only).

## Conventions

- Every docs page needs both `src/_docs/<slug>.md` and `<slug>.ja.md`. Keep
  the two in sync — don't add English content without its Japanese pair (or
  vice versa).
- Never hardcode a link or asset path; always go through `relative_url` (ERB)
  so `base_path: "/R2P2-ESP32-docs"` (see `config/initializers.rb`) is
  respected in both local dev and the GitHub Pages deployment.
- UI strings go in `src/_locales/en.yml` / `ja.yml`, read via the `t` helper
  — don't inline English/Japanese text in `.erb` partials/layouts.
- `available_locales` / `default_locale` in `config/initializers.rb` must
  stay symbols (`:en`, `:ja`), not strings — Bridgetown core compares them
  with `.to_sym` internally.
- Don't name a `docs_nav.yml` group/field `key` — collides with Ruby's
  `Hash#key` under `HashWithDotAccess`. Use `id:` instead.
- `@material/web` is pinned to `2.2.0` in `package.json` for `esp-web-tools`
  compatibility — check `README.md`'s Installer section before bumping it.
- Pagefind's index (`output/pagefind/`) only exists after running `rake
  pagefind` against a completed build — a Bridgetown rebuild (including the
  dev server's own file watcher) wipes `output/` and takes it with it. Don't
  `rm -rf output` and expect the index to survive; re-run `rake pagefind`
  after re-building whenever you need to test search locally.
