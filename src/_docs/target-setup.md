---
title: Target Setup
description: Run the one-time setup task for your chip before building.
---

Before your first build for a given chip, run its setup task once. This
installs dependencies and builds `mruby`/`mruby/c` for the host, then points
ESP-IDF at your target. Re-run it if you switch targets or change
`SDKCONFIG_DEFAULTS` (see [Settings](../settings/)).

## Using ESP-IDF

```sh
$ rake setup_esp32   # or setup_esp32c3 / setup_esp32c6 / setup_esp32h2 / setup_esp32p4 / setup_esp32s3
```

## Using Docker

```sh
$ rake docker:setup_esp32s3   # or docker:setup_esp32, docker:setup_esp32c3, ...
```

The first run also builds the `espressif/idf`-based image (see
[Environment Setup](../environment-setup/)). Gems
(`bundle install`) and ccache output are cached in `.bundle-docker` /
`.ccache` under the project root (gitignored) so they persist between runs.
If you've also built natively on the host, `docker:*` tasks automatically
detect and rebuild a stale host-arch `mrbc` left under
`components/picoruby-esp32/picoruby/build` — otherwise it would look
"already built" and fail to link with "file format not recognized".
`rake docker:reset` clears the gem/ccache caches for a clean slate if they
ever end up in a bad state.

## Next steps

Continue to [Build](../build/).
