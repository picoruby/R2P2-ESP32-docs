---
title: Expanding the Stack
description: Override the Ruby VM task's FreeRTOS stack size at build time.
---

The Ruby VM runs in its own FreeRTOS task
(`components/picoruby-esp32/picoruby-esp32.c`), created via
`xTaskCreatePinnedToCore` with a fixed stack size — separate from the
[heap](../heap-size/) the VM allocates objects from. The default is 8 KB
(`PICORB_TASK_STACK_SIZE`, in bytes):

```c
#ifndef PICORB_TASK_STACK_SIZE
#define PICORB_TASK_STACK_SIZE (1024 * 8)
#endif
```

Deep recursion or code with large local-variable frames can overflow this
and crash. If you hit a stack overflow, increase it:

```sh
$ export PICORB_TASK_STACK_SIZE=16384  # 16 KB
$ rake build
```

Like `HEAP_SIZE` and `USE_WIFI`, this is only read while CMake configures
the project — if you already ran [Target Setup](../target-setup/) without
it, re-run it with `PICORB_TASK_STACK_SIZE` exported to force a fresh
configure:

```sh
$ export PICORB_TASK_STACK_SIZE=16384
$ rake setup_esp32   # or whichever target you're building for
$ rake build
```

## Next steps

See [Expanding the Heap](../heap-size/) for the companion setting that
controls how much memory the Ruby VM has for objects.
