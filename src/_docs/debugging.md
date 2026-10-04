---
title: Debugging
description: Interactive Ruby-level debugging with mrdebug.
---

For Ruby-level debugging — breakpoints, stepping, inspecting locals — add
[mrdebug](https://github.com/yuuu/mruby-debug) (renamed from
`picoruby-debug`) to your [settings](../settings/). It only supports the
PicoRuby (mruby) VM; FemtoRuby (mruby/c) has no debug hook for it to use.

```ruby
# in components/picoruby-esp32/build_config/xtensa-esp-picoruby.rb (or riscv-*)
conf.gem github: 'yuuu/mruby-debug', branch: 'main', path: 'console'
```

The `path: 'console'` sub-gem is what adds the `(mrdbg)` prompt on the
device's own console, used below. Leaving it off still gets you `mrdebug`
itself, but the device then always listens on TCP port 4711 instead (see
[Remote debugging over WiFi](#remote-debugging-over-wifi)) rather than
prompting locally.

> **Note:** also raise the PicoRuby task stack to at least 32768 bytes —
> `PICORB_TASK_STACK_SIZE=32768` (see [Expanding the Stack](../stack-size/))
> — the 8 KB default overflows as soon as the debugger stops.

## Breakpoints

Drop `binding.debugger` into your script — no `require` needed:

```ruby
def add(a, b)
  a + b
end

x = 1
binding.debugger # or binding.b / binding.break
y = add(x, 2)
puts y
```

Running this pauses at the `binding.debugger` line and drops you into an
interactive prompt over your existing serial connection:

```text
$> ./script.rb
Stop: script.rb:6
(mrdbg)
```

Key commands at the `(mrdbg)` prompt:

| Command | Alias | Description |
| --- | --- | --- |
| `continue` | `c`, empty input | Resume until the next breakpoint |
| `step [<n>]` | `s` | Stop at the next executed line, entering calls |
| `next [<n>]` | `n` | Stop at the next line in the same/shallower frame |
| `finish` | `fin` | Run until the selected frame returns |
| `break [<file>:]<line> [if <expr>]` | `b` | Add a line breakpoint (no argument lists current ones) |
| `break <Class>#<method>` | `b` | Add a method breakpoint (`#` instance, `.` singleton) |
| `watch [<expr>]` | | Stop whenever `<expr>`'s value changes |
| `print <expr>` | `p` | Evaluate `<expr>` against the selected frame and print it |
| `backtrace` | `bt` / `where` | Show the call stack |
| `help [<command>]` | `h` | List commands, or show `<command>`'s usage |

See the [mrdebug README](https://github.com/yuuu/mruby-debug) for the full
command reference (frame navigation, display expressions, and more).

## Remote debugging over WiFi

If `picoruby-socket` is also in your build — this is what
[Enabling WiFi](../wifi/) (`USE_WIFI=1`) is for — mrdebug can listen on a
TCP port instead of (or as well as) the on-device console prompt above.
With the `console` sub-gem, that's opt-in: set `mrdebug_port` in
`storage/etc/config.yml` (R2P2 loads its `env:` section into `ENV` at
boot):

```yaml
env:
  mrdebug_port: 4711
```

or, for a single shell session, `export MRDEBUG_PORT=4711` before running
your script. The device then waits for a client at the next
`binding.debugger`, instead of opening the local `(mrdbg)` prompt.

From your computer, connect with the `mrdbg` CLI (from a host build of the
[mruby-debug](https://github.com/yuuu/mruby-debug) repo):

```sh
$ mrdbg --host 192.168.0.10 --port 4711
```

Or drive it from VS Code — `mrdbg` bridges the device's socket to a
[Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)
port instead:

```sh
$ mrdbg --host 192.168.0.10 --port 4711 --dap-port 12345
```

then attach with
[vscode-rdbg](https://marketplace.visualstudio.com/items?itemName=KoichiSasada.vscode-rdbg)
via a `launch.json` `attach` config pointed at `localhost:12345`. See the
mruby-debug README for the full `tasks.json`/`launch.json` setup.
