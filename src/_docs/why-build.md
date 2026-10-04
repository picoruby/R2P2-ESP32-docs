---
title: When to Build It Yourself
description: Decide whether you need a full build environment, or if the Web Installer is enough.
---

The [Web Installer](/installer/) covers most getting-started needs — it flashes a
prebuilt firmware image straight from your browser, no toolchain required. You
only need to build R2P2-ESP32 yourself if you want to:

- Add or remove mrbgems
- Write and include your own custom mrbgem
- Contribute to [PicoRuby](https://github.com/picoruby/picoruby) or
  [R2P2-ESP32](https://github.com/picoruby/R2P2-ESP32)
- Expand heap space, tune stack size, or enable PSRAM support
- Change the partition layout
- Enable WiFi (`USE_WIFI`), which is off by default in prebuilt images
- Meet any other requirement not covered by the prebuilt firmware images

## The two build environments

[Environment Setup](../environment-setup/) covers two ways to get a working
build environment — install ESP-IDF directly on your machine, or use Docker
with the official `espressif/idf` image, no local ESP-IDF install at all.
Pick whichever fits your setup.

Either way, once your environment is ready, [Settings](../settings/),
[Target Setup](../target-setup/), and [Build](../build/) are the same.
