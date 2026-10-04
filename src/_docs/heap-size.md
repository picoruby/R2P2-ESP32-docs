---
title: Expanding the Heap
description: Override the Ruby VM's heap size at build time.
---

The Ruby VM's heap comes from a fixed-size pool allocated in
`components/picoruby-esp32/picoruby-esp32.c`. Its default size depends on
your build:

| Condition | Default `HEAP_SIZE` |
| --- | --- |
| `CONFIG_SPIRAM` enabled (see [Partitions](../partitions/) / `sdkconfigs/spiram`) | 1 MB (allocated from PSRAM) |
| No SPIRAM, FemtoRuby (mruby/c) | 100 KB |
| No SPIRAM, PicoRuby (mruby) | 220 KB |

## Overriding it

Set the `HEAP_SIZE` environment variable (in bytes) before building:

```sh
$ export HEAP_SIZE=524288  # 512 KB
$ rake build
```

Like `USE_WIFI` (see [Enabling WiFi](../wifi/)), this is only read while
CMake configures the project. If you already ran
[Target Setup](../target-setup/) without it, re-run it with `HEAP_SIZE`
exported to force a fresh configure:

```sh
$ export HEAP_SIZE=524288
$ rake setup_esp32   # or whichever target you're building for
$ rake build
```

Without SPIRAM, the heap is a plain static array (`uint8_t
heap_pool[HEAP_SIZE]`) — so a `HEAP_SIZE` you can't actually afford on a
given chip's internal RAM will simply fail to link or fail at runtime. With
`CONFIG_SPIRAM` enabled, it's allocated from PSRAM via `heap_caps_malloc`
instead, so you have much more headroom (see the SPIRAM boards in
[Devices](../supported-devices/)).

## Next steps

See [Expanding the Stack](../stack-size/) for the companion setting that
controls the Ruby task's own FreeRTOS stack (not the heap).
