---
title: MCP Server
description: Let an AI assistant build, flash, and talk to your R2P2-ESP32 device through the bundled MCP server.
---

The R2P2-ESP32 repository ships with an [MCP](https://modelcontextprotocol.io/)
server (in `mcp/`) that lets an AI assistant run the whole development loop:
build, flash, talk to the device (shell commands, logs, file transfer), try
things without hardware on [QEMU](../qemu/), and manage mrbgems.

> **Status:** the device tools were verified against QEMU only and have not
> been tried on real hardware yet. Open points for real boards: opening a USB
> Serial/JTAG port may reset the board (DTR/RTS), and `flash` reconnects after
> a fixed 2 s wait.

## Requirements

- Ruby (the version the repo already requires for building) and Bundler
- Docker, the default build environment (see
  [Environment Setup](../environment-setup/))
- Submodules checked out: `git submodule update --init --recursive`

## Install

```sh
$ cd mcp
$ bundle install
```

Use the same Ruby that your MCP client will start the server with. If gems
are missing, the server exits at startup with a hint on stderr; run the
`bundle install` it names, then restart the server.

## Register with your MCP client

The repository root has a `.mcp.json`, so Claude Code picks the server up
automatically when started in the repository (approve it when prompted). For
other clients, run `mcp/bin/r2p2-esp32-mcp` as a stdio server, for example:

```sh
$ claude mcp add r2p2-esp32 -- /path/to/R2P2-ESP32/mcp/bin/r2p2-esp32-mcp
```

## Typical flow

1. `setup` with `target: "esp32s3"`, `sdkconfigs: ["usb_console", "spiram"]`
2. `build` (the picoruby VM by default; pass the same `sdkconfigs`)
3. `flash` — the server reconnects to the port afterwards
4. `device_upload` your script, then `device_exec` (`./app.rb`) and
   `device_log` to see what happened

Steps 1 to 3 return when the job is done. `sdkconfigs` are names of the
fragment files under `sdkconfigs/` (e.g. `usb_console`, `spiram`), the same
ones you would put in `SDKCONFIG_DEFAULTS` (see [Settings](../settings/)).
`use_wifi` sets `USE_WIFI=1`. Changing either requires running `setup` again.

## Tools

### Build tools

`setup`, `build`, `clean` and `flash` run the rake task as a job and **wait
for it** (`timeout`, default 300 s; `0` returns at once). If it takes longer
it keeps running and the call says so; follow it with `job_wait`. Only one
job runs at a time. Everything runs in Docker (`rake docker:*`) unless
`native: true` is passed.

| Tool | Arguments | What it does |
|------|-----------|--------------|
| `setup` | `target` (required: `esp32`, `esp32c3`, `esp32c6`, `esp32h2`, `esp32p4`, `esp32s3`), `sdkconfigs`, `use_wifi`, `native`, `timeout` | `rake setup_<target>`. Deletes the old `sdkconfig` first, because it caches `SDKCONFIG_DEFAULTS`. |
| `build` | `vm` (`picoruby` (default) / `femtoruby`), `sdkconfigs`, `use_wifi`, `native`, `timeout` | `rake <vm>:build` |
| `clean` | `deep`, `native`, `timeout` | `rake clean`, or `deep_clean` with `deep: true` |
| `job_wait` | `job_id` (default: latest), `timeout` | Wait for a job that was still running, then report it |
| `job_status` | `job_id` (default: latest) | Running / succeeded / failed, without waiting. On failure, includes extracted error lines and the last 20 log lines. |
| `job_log` | `job_id`, `lines` (default 100) | Tail of the job log |

### Device tools

These talk to the device's `picoruby-shell` through one connection held by
the server.

| Tool | Arguments | What it does |
|------|-----------|--------------|
| `serial_list_ports` | | List `/dev/ttyACM*`, `ttyUSB*`, `cu.usb*` ports |
| `serial_connect` | `port` (required), `baud` | Connect to a serial device or `tcp://host:port` (e.g. QEMU's UART) and check for the `$> ` prompt. Replaces a previous connection. |
| `serial_disconnect` | | Release the port (do this before `rake monitor` or a web terminal) |
| `device_exec` | `command` (required), `timeout` (default 10 s) | Run a shell command and return its output when the prompt returns. On timeout: Ctrl-C, then Ctrl-D if still stuck (e.g. in `irb`). If the shell never echoed the command (device still booting or hung), nothing is sent. |
| `device_log` | `lines` (default 100), `since_last` | Everything the device printed since connecting (last 256 KiB kept). Crash markers (`Guru Meditation`, `Backtrace:`, `assert failed`, ...) are listed first. |
| `device_reset` | `timeout` (default 60 s) | Shell `reboot`; returns the boot log up to the next prompt. If the prompt does not come, a serial device is reset through DTR/RTS. |
| `device_upload` | `remote_path`, `local_path` or `content` | Write a file to the device with `rake picomodem:put`, CRC32-checked. `content` uploads text without a local file. |
| `device_download` | `remote_path` (required), `local_path` | Read a file from the device (`rake picomodem:get`) and save it locally |
| `flash` | `port`, `reconnect` (default true), `timeout` | Host-side `rake flash`. Releases the serial port first and reconnects after success. Not available while connected to a `tcp://` port. |

File transfer needs the shell at its prompt (not inside `irb`) and the host
`picoruby` built by `setup`. On macOS, a Docker-only build leaves a Linux
binary there; run `rake setup_<target>` natively once.

### QEMU tools

Run the firmware without hardware (ESP32-S3 on QEMU; no peripherals, no WiFi),
for checking logic and scripts — see [Running on QEMU](../qemu/) for its
limitations. The UART is exposed on `tcp://127.0.0.1:5555` and connected like
a serial port, so all `device_*` tools work on it.

| Tool | Arguments | What it does |
|------|-----------|--------------|
| `qemu_start` | `vm`, `native`, `timeout` (default 120 s) | `rake qemu_serve`: builds `build-qemu` (set up automatically; the first time takes minutes), starts QEMU in Docker with a fresh `/home`, and connects to its shell. |
| `qemu_status` | `lines` | Running / building, and the tail of its rake / build output |
| `qemu_stop` | | Stop QEMU (its `/home` is discarded) |

### mrbgem tools

Which gems the firmware contains is decided by
`components/picoruby-esp32/build_config/*.rb` (one file per architecture ×
VM). Your own gems live in `mrbgems/` at the repository root.

| Tool | Arguments | What it does |
|------|-----------|--------------|
| `mrbgem_list` | `query`, `enabled_only` | List gems (custom first, then picoruby's) and where each is enabled; "via X" means a gembox provides it |
| `mrbgem_enable` | `name`, `vm`, `arch` | Add the gem to the build configs (all four by default); the `picoruby-` prefix is optional |
| `mrbgem_disable` | `name`, `vm`, `arch` | Remove it; gems provided by a gembox cannot be removed this way |
| `mrbgem_scaffold` | `name`, `summary`, `author`, `enable` | Create `mrbgems/picoruby-<name>/` (pure Ruby), usable as `require "<name>"` on both VMs |

After changing gems, run `build` (or `qemu_start` to try it without hardware).
Gems with C code are not scaffolded; copy an existing gem (e.g.
`picoruby-base64`) as a starting point.
