---
title: Verified Devices
description: Boards confirmed to work with R2P2-ESP32, and which VM/features each supports.
---

The following devices have been confirmed to work:

| Device | Target | VM | USB Console | SPIRAM |
| --- | --- | --- | --- | --- |
| ESP32-DevKitC | ESP32 | FemtoRuby (mruby/c) | No | No |
| ATOM Matrix | ESP32 | FemtoRuby (mruby/c) | No | No |
| M5Stamp C3 Mate | ESP32-C3 | FemtoRuby (mruby/c) | No | No |
| ESPr® Developer S3 Type-C | ESP32-S3 | FemtoRuby (mruby/c), PicoRuby (mruby) | No | Yes |
| ATOMS3 Lite | ESP32-S3 | FemtoRuby (mruby/c), PicoRuby (mruby) | Yes | No |
| M5Stack CoreS3 | ESP32-S3 | FemtoRuby (mruby/c), PicoRuby (mruby) | Yes | Yes |

- **USB Console** — whether the board has native USB you can use as the
  console (no external USB-to-UART chip needed); enable it with the
  `sdkconfigs/usb_console` fragment (see [Settings](../settings/)).
- **SPIRAM** — whether the board has PSRAM; enable it with
  `sdkconfigs/spiram`, which also raises the default [heap
  size](../heap-size/) to 1 MB.

The [Web Installer](/installer/) currently publishes prebuilt images for
ESP32, ESP32-C3, ESP32-C6, ESP32-H2, ESP32-P4, and ESP32-S3 (with and
without the USB console variant, where applicable) — so other boards built
around those chips are likely to work too, even if not individually listed
above. If you get R2P2-ESP32 running on new hardware, consider [opening a
pull request](https://github.com/picoruby/R2P2-ESP32) to add it here.
