---
title: Running on QEMU
description: Run R2P2-ESP32 on QEMU (ESP32-S3), without any real hardware.
---

R2P2-ESP32 can run under [QEMU](https://github.com/espressif/qemu) targeting
ESP32-S3, without any real hardware. This uses ESP-IDF's built-in `idf.py
qemu` support and the `qemu-xtensa` tool package.

## Using ESP-IDF

Set up a separate build directory (`build-qemu`) once, targeting ESP32-S3
with a UART console (QEMU does not emulate the USB Serial/JTAG console):

```sh
$ rake setup_qemu
```

Then run it with the VM of your choice:

```sh
$ rake femtoruby:qemu # VM: mruby/c
$ rake picoruby:qemu  # VM: mruby
$ rake qemu           # whichever VM is currently configured in build-qemu (defaults to femtoruby/mrubyc)
```

This drops you into the `picoruby-shell` prompt over the emulated UART. Use
`Ctrl-A X` to quit QEMU (`-nographic` mode).

## Using Docker

If you set up your environment [with Docker](../environment-setup/)
instead, the equivalent tasks are namespaced under `docker:`:

```sh
$ rake docker:setup_qemu
$ rake docker:femtoruby:qemu   # or docker:picoruby:qemu, docker:qemu
```

## Known limitations

- **USB Serial/JTAG console is not emulated.** `rake setup_qemu` builds with
  `sdkconfigs/qemu` (UART console) regardless of your usual
  `SDKCONFIG_DEFAULTS` (see [Settings](../settings/)), since a USB
  Serial/JTAG console build hangs forever waiting for a host connection
  that QEMU never provides.
- **ADC/SENS peripherals are not emulated**, so the ADC hardware
  self-calibration that normally runs before `app_main` spins forever.
  `rake qemu` works around this by burning `BLK_VERSION_MAJOR=1` into the
  QEMU eFuse image the first time it runs, which makes calibration read
  from (zeroed) eFuse data instead of touching the hardware. ADC readings
  under QEMU are therefore not meaningful.
- **PSRAM is capped at 8 MB** even though the real hardware may have more —
  with the default 32 MB, QEMU cannot map the full PSRAM into the virtual
  address space, and mounting the [`storage`](../file-transfer/)
  (LittleFS) partition then crashes with `esp_mmu_map: no such vaddr
  range`.
- **`USE_WIFI` builds still compile**, but QEMU only emulates an Ethernet
  MAC (`open_eth`), not real WiFi hardware, so `Network::WiFi` /
  `ESP32::WiFi` won't work under QEMU — see [Enabling WiFi](../wifi/).
