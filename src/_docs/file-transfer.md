---
title: File Transfer
description: Two ways to get files onto the device — at runtime, or baked into the build.
---

There are two ways to get files onto the device:

- **At runtime** — upload over an existing connection, without rebuilding
  or reflashing anything.
- **At build time** — place files under the project's `storage/` directory
  before building, so they're baked into the firmware image itself.

## At runtime

Use the [Web Terminal](https://picoruby.org/terminal)'s File Editor (or any
serial connection) — like uploading `hello.rb` in
[Quick Start](../quick-start/). Fast to iterate with, but whatever you
upload this way is lost if you erase and reflash the device.

## At build time

The `storage/` directory at the project root becomes the device's own
filesystem. It currently has two subdirectories:

```text
storage/
├── etc/
└── home/
```

At build time, `main/CMakeLists.txt` packs the entire `storage/` directory
into a [LittleFS](https://github.com/littlefs-project/littlefs) image via
`littlefs_create_partition_image`, targeting the `storage` partition defined
in `partitions.csv` (1 MB). Because that call includes `FLASH_IN_PROJECT`,
`idf.py flash` (and `rake flash`, see [Flash and Monitor](../flashing/))
writes this image alongside the app automatically — no separate step
needed.

On boot, `main_task.rb` mounts it as the root volume:

```ruby
Shell.setup_root_volume(:flash, label: 'storage')
```

From there, `storage/home` becomes `/home` and `storage/etc` becomes `/etc`
in the running `picoruby-shell` — the same `/home/hello.rb` path you saw in
Quick Start.

This is useful for shipping a default `/home/app.rb` (see
`mrblib/main_task.rb` — it auto-`load`s `/home/app.mrb` or `/home/app.rb`
if present) or committing configuration your firmware depends on.

### Example: WiFi auto-connect config

`rake gen_wifi_config` (see [Enabling WiFi](../wifi/)) writes an encrypted
`storage/etc/network/wifi.yml`, which `main_task.rb` reads on boot to
auto-connect — a concrete example of the build-time approach above.

> **Careful:** because the storage image is built with `FLASH_IN_PROJECT`,
> the default `rake flash` (see [Flash and Monitor](../flashing/)) rewrites
> it along with the app — any files you uploaded at runtime are replaced
> with whatever is currently in your local `storage/` directory. To update
> just the app and leave on-device storage alone, use `rake flash_factory`
> instead, which only touches the factory/app partition.
