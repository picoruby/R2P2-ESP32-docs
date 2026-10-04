---
title: Enabling WiFi
description: Compile in WiFi support with USE_WIFI.
---

WiFi native code (`Network::WiFi` / `ESP32::WiFi`, and by extension
`picoruby-socket`'s `TCPServer`/`TCPSocket` over WiFi) is **not** compiled in
by default. To enable it, set the `USE_WIFI` environment variable before
building (see [Build](../build/)):

```sh
$ export USE_WIFI=1
$ rake build
```

This is required, for example, to use [picoruby-debug](https://github.com/yuuu/picoruby-debug)'s
DAP remote debugging over WiFi — see [Debugging](../debugging/).

> **Note:** `USE_WIFI` is only read while CMake configures the project, not
> on every build. If you already ran [Target Setup](../target-setup/) or a
> build without `USE_WIFI` set, a plain `USE_WIFI=1 rake build` will not
> pick it up and can fail with linker errors such as `undefined reference
> to 'ESP32_WIFI_init'`. Re-run Target Setup with `USE_WIFI=1` exported to
> force a fresh configure:
>
> ```sh
> $ export USE_WIFI=1
> $ rake setup_esp32   # or whichever target you're building for
> $ rake build
> ```

## Auto-connecting on boot

Generate an encrypted WiFi credentials file at `storage/etc/network/wifi.yml`
(see [File Transfer](../file-transfer/)), which `main_task.rb` reads and
auto-connects with on every boot:

```sh
$ rake gen_wifi_config SSID=your-ssid PASSWORD=your-password UNIQUE_ID=your-device-unique-id
```

- `UNIQUE_ID` comes from `Machine.unique_id` on the device itself — connect
  once (e.g. via [Quick Start](../quick-start/)'s `irb`) and run
  `Machine.unique_id` to get it.
- Optional: `AUTO_CONNECT` (default `true`), `RETRY_IF_FAILED` (default
  `true`), `WATCHDOG` (default `false`), and `COUNTRY_CODE`.

Remember to rebuild and reflash (or upload `wifi.yml` directly to the
device) after generating this file.

## Configuring WiFi from the device (`nmcli`)

Instead of generating `wifi.yml` on your computer before building, you can
write it directly to the running device from its own shell (see
[Quick Start](../quick-start/)) with `nmcli` — no need to look up
`Machine.unique_id` first, since it runs on the device that already knows
it:

```text
$> nmcli
Ctrd-D to exit
Country Code? [JP]
WiFi SSID? your-ssid
WiFi Password? (leave blank if no password required)
Auto Connect? (y/n) [y]
Retry if failed? (y/n) [n]
Use Watchdog? (y/n) [n]

Successfully saved to /etc/network/wifi.yml
$> reboot
```

`nmcli` only writes the file — the device reads it and auto-connects the
same way described above, but only on the next boot, so `reboot` (or a
power cycle) is required to apply it.

> **Careful:** this is a runtime change (see [File Transfer](../file-transfer/)),
> so it only lives on the device — a later `rake flash` overwrites it with
> whatever is (or isn't) in your local `storage/` directory. Use `rake
> flash_factory` instead if you want to reflash the app without touching
> on-device storage.
