---
title: Flashing
description: Flash a self-built image to your device with rake flash.
---

Flash the built image to your device:

```sh
$ rake flash
```

This calls `esptool` directly, reading target/offsets from
`build/project_description.json` and `build/flash_args` (both written by
`idf.py build`), so it always matches whatever target and VM you last built
— see [Settings](../settings/) and [Build](../build/).

## Choosing a port

If the serial port isn't auto-detected correctly (e.g. multiple devices
connected), set `PORT`:

```sh
$ PORT=/dev/tty.usbserial-0001 rake flash
```

## Flashing just the app or just storage

Two more targeted tasks are available if you don't want to rewrite
everything:

```sh
$ rake flash_factory  # erase + reflash only the app partition
$ rake flash_storage  # erase + reflash only the storage partition
```

`rake flash_factory` is what you want for an app-only update that leaves
your on-device files alone — see [File Transfer](../file-transfer/) for why
the plain `rake flash` doesn't do that by default.

## Next steps

Continue to [Monitoring](../monitoring/) to see your device's serial output.
