---
title: Monitoring
description: Watch your device's serial output with rake monitor.
---

Open a serial terminal connected to your device:

```sh
$ rake monitor
```

This calls `esp-idf-monitor` directly (falling back to the `idf-monitor`
executable if the `esp_idf_monitor` Python module isn't importable), reading
the baud rate and ELF path for symbolicated backtraces from
`build/project_description.json` — so, like `rake flash`, it always matches
your last build.

## Choosing a port

Just like flashing, set `PORT` if auto-detection picks the wrong device:

```sh
$ PORT=/dev/tty.usbserial-0001 rake monitor
```

## Next steps

Once your device is flashed and you can see its output, head to [Advanced
Usage](../wifi/) to enable WiFi, tune memory, or run under QEMU — or back to
[Quick Start](../quick-start/) for a refresher on using `picoruby-shell`
itself.
