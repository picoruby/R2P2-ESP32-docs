---
title: Environment Setup
description: Set up ESP-IDF locally, or use Docker instead — pick whichever fits your setup.
---

Either way, start by cloning the repository together with its submodules:

```sh
$ git clone --recursive https://github.com/picoruby/R2P2-ESP32.git
$ cd R2P2-ESP32
```

## Using ESP-IDF

### Prerequisites

Set up ESP-IDF by following
[Espressif's installation guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html#installation).
The build has been verified with **ESP-IDF v5.5**.

### Activate ESP-IDF

Each time you start a new shell session, activate ESP-IDF and put its tools
on `PATH`:

```sh
$ source ~/.espressif/tools/activate_idf_v5.5.x.sh
$ export PATH="$IDF_PATH/tools:$PATH"
```

Then make sure a matching Ruby is on `PATH`, using whichever version manager
you prefer:

```sh
# mise
$ mise use ruby@4.0.5
# asdf
$ asdf local ruby 4.0.5
# rbenv
$ rbenv local 4.0.5
```

> **Tip:** [direnv](https://direnv.net/) is convenient for keeping these
> environment variables scoped to the project directory, so you don't have
> to re-activate manually every time.

> **Note:** [Target Setup](../target-setup/) builds some host-side tools
> with your native (non-cross) toolchain. This is normally auto-detected
> even while ESP-IDF's cross toolchains are on `PATH` — if detection picks
> the wrong compiler, override it with the `HOST_CC` / `HOST_AR`
> environment variables.

## Using Docker

Instead of installing ESP-IDF, Ruby, and a host toolchain on your machine,
you can build entirely inside a container based on the official
[`espressif/idf`](https://hub.docker.com/r/espressif/idf) image, which
already bundles ESP-IDF, `gcc`, and `ruby`. The project's `docker/Dockerfile`
layers on the few packages that image is missing (`ruby-dev`, `libssl-dev`).
`rake docker:*` tasks build this image automatically the first time you use
them — all you need on the host is Docker itself.

### macOS: enable virtiofs

The project directory is bind-mounted into the container, so your Docker
file-sharing backend needs to handle symlinks correctly — the build reads
and creates files through symlinks vendored under
`components/picoruby-esp32/picoruby`.

**On macOS, `virtiofs` must be enabled.** Other backends (Docker Desktop's
`gRPC FUSE` / `osxfs`, Rancher Desktop's `reverse-sshfs` / `9p`) fail with
`Operation not permitted`.

### Choosing an ESP-IDF version

To use a different ESP-IDF patch version than the pinned default
(`v5.5.4`, see `DOCKER_IDF_TAG` in `rakelib/docker.rake`), set
`ESP_IDF_DOCKER_TAG` to any tag from the
[image's tag list](https://hub.docker.com/r/espressif/idf/tags):

```sh
$ export ESP_IDF_DOCKER_TAG=v5.5.5
$ rake docker:build
```

### Configuration via `.env`

Unlike the native build, `docker:*` tasks don't read `SDKCONFIG_DEFAULTS`,
`USE_WIFI`, etc. from your shell environment. Put them in a gitignored
`.env` file at the project root instead — it's passed to the container
as-is if present. Docker's `--env-file` format doesn't strip quotes the way
a shell does, so **don't quote the value**:

```sh
# .env
SDKCONFIG_DEFAULTS=sdkconfig.defaults;sdkconfigs/usb_console
```

See [Settings](../settings/) for what goes in `SDKCONFIG_DEFAULTS`.

> **Note:** There's no `docker:flash` / `docker:monitor` task, because most
> container setups (Docker Desktop, Rancher Desktop on macOS/Windows) can't
> pass the device's serial port through to the container — it's not a
> Dockerfile/CLI-flag issue, the port simply isn't visible inside their
> Linux VM. [Flash and monitor](../flashing/) the image built by
> `docker:build` from the host instead — that doesn't need a full ESP-IDF
> install either. On native Linux, `docker run --device=/dev/ttyUSB0 ...`
> can pass a serial device through if you want to flash from inside a
> container too.

### Installing the necessary tools

Flashing and monitoring that host-side doesn't need a full ESP-IDF install
either. `rake flash` / `rake monitor` (see
[Flash and Monitor](../flashing/)) call `esptool` / `esp-idf-monitor`
directly rather than `idf.py`, so a `build/` produced by Docker works from
a host with just these two Python packages:

```sh
$ pip install esptool esp-idf-monitor
```

That's it — no ESP-IDF activation required for flashing/monitoring alone.
(If you built with ESP-IDF directly, you already have these as part of
that install.)

## Next steps

Continue to [Settings](../settings/) for hardware-specific configuration,
then [Target Setup](../target-setup/) before your first build.
