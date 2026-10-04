---
title: Settings
description: Hardware sdkconfig fragments and the per-VM MRuby::CrossBuild config files.
---

Build settings cover two layers: ESP-IDF's own hardware configuration, and
PicoRuby/FemtoRuby's own cross-compilation config (`build_config/`).

## Hardware configuration (`SDKCONFIG_DEFAULTS`)

Some boards need extra ESP-IDF configuration. Fragment files for each option
live under `sdkconfigs/`; combine as many as you need via the
`SDKCONFIG_DEFAULTS` environment variable, separated by semicolons.

**Boards without an external USB-to-UART chip** (USB console):

```sh
$ export SDKCONFIG_DEFAULTS="sdkconfig.defaults;sdkconfigs/usb_console"
```

**USB console with SPIRAM:**

```sh
$ export SDKCONFIG_DEFAULTS="sdkconfig.defaults;sdkconfigs/usb_console;sdkconfigs/spiram"
```

Set this **before** running [Target Setup](../target-setup/) — it's only
read while ESP-IDF configures the project. If you change it later, re-run
Target Setup (e.g. `rake setup_esp32`) to force a fresh configure.

Using Docker instead? `docker:*` tasks don't read this from your shell; put
it in a gitignored `.env` file at the project root instead (see
[Environment Setup](../environment-setup/)).

## The PicoRuby/FemtoRuby build config (`build_config/`)

`components/picoruby-esp32/build_config/` has four `MRuby::CrossBuild`
config files — one per architecture × VM combination:

```text
build_config/
├── xtensa-esp-picoruby.rb   # ESP32, ESP32-S3 · PicoRuby (mruby)
├── xtensa-esp-femtoruby.rb  # ESP32, ESP32-S3 · FemtoRuby (mruby/c)
├── riscv-esp-picoruby.rb    # ESP32-C3/C6/H2/P4 · PicoRuby (mruby)
└── riscv-esp-femtoruby.rb   # ESP32-C3/C6/H2/P4 · FemtoRuby (mruby/c)
```

`components/picoruby-esp32/CMakeLists.txt` picks the right file
automatically from `PICORB_VM` (set by `rake picoruby:build` /
`rake femtoruby:build`, see [Build](../build/)) and the target's
architecture (`CONFIG_IDF_TARGET`).

Each file sets the cross toolchain (`xtensa-*-elf-gcc` or
`riscv32-esp-elf-gcc`), preprocessor defines (`MRB_*`/`MRBC_*` tuning flags,
plus `USE_WIFI` when that environment variable is set), and — most
relevantly if you're customizing your build — the list of gems:

```ruby
conf.gembox 'minimum'
conf.gembox 'core'
conf.gem core: 'picoruby-shell'
conf.gem core: 'picoruby-gpio'
# ...
```

**This is where you add or remove mrbgems.** To include your own gem, add a
line here, e.g. `conf.gem github: 'yourname/your-mrbgem'` (see
[Debugging](../debugging/) for a real example using `picoruby-debug`), then
rebuild.

> Two more build-time environment variables — `HEAP_SIZE` and
> `PICORB_TASK_STACK_SIZE` — are read by the surrounding
> `components/picoruby-esp32/CMakeLists.txt` (the C glue code's own build,
> separate from these Ruby cross-build configs). See
> [Memory Tuning](../heap-size/) for details.
