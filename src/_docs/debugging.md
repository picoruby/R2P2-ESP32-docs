---
title: Debugging
description: Interactive Ruby-level debugging with picoruby-debug.
---

For Ruby-level debugging — breakpoints, stepping, inspecting locals — add
[picoruby-debug](https://github.com/yuuu/picoruby-debug) to your
[settings](../settings/). It only supports the PicoRuby (mruby) VM; on
FemtoRuby (mruby/c) it prints an "unsupported" message and does nothing.

```ruby
# in components/picoruby-esp32/build_config/xtensa-esp-picoruby.rb (or riscv-*)
conf.gem github: 'yuuu/picoruby-debug', branch: 'main'
```

## Breakpoints

Drop `binding.debugger` into your script:

```ruby
require 'debug'

a = 1
b = 2
binding.debugger # or binding.b / binding.break
c = a + b
puts c
```

Running this pauses at the `binding.debugger` line and drops you into an
interactive prompt over your existing serial connection:

```text
Breakpoint: /test.rb:5
(prdb)>
```

Key commands at the `(prdb)>` prompt:

| Command | Description |
| --- | --- |
| `c` / `continue` | Resume until the next breakpoint |
| `s` / `step` | Stop at the next line, stepping into calls |
| `n` / `next` | Stop at the next line in the same/shallower frame |
| `b [file:]line` | Add a breakpoint, or list current ones with no argument |
| `bt` / `where` | Show the call stack |
| `p expr` | Evaluate `expr` against the selected frame and print it |
| `w expr` | Break automatically whenever `expr`'s value changes |
| `q` / `quit` | Stop the script |

See the [picoruby-debug README](https://github.com/yuuu/picoruby-debug) for
the full command reference (frame navigation, display expressions, and
more).

## Remote debugging over WiFi (DAP)

If `picoruby-socket` is also in your build, picoruby-debug can act as a
[Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)
server on port 4711 — letting an editor like VS Code drive it instead of (or
alongside) the `(prdb)` prompt. It's on by default whenever
`picoruby-socket` is available; just `require 'debug'` and hit your first
`binding.debugger` as usual, which blocks until a DAP client completes its
handshake. This is what [Enabling WiFi](../wifi/) (`USE_WIFI=1`) is for.
