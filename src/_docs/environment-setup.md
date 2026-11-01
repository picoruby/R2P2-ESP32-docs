---
title: Environment Setup
description: Build in Docker (the default), or set up ESP-IDF locally to build natively — pick whichever fits your setup.
---

Either way, start by cloning the repository together with its submodules:

```sh
$ git clone --recursive https://github.com/picoruby/R2P2-ESP32.git
$ cd R2P2-ESP32
```

The build tasks (`setup_*`, `build`, `clean`, the QEMU tasks, ...) run in
Docker by default. To build on the host with ESP-IDF instead, use their
`native:` counterparts (e.g. `rake native:build`) — see
[Building natively](#building-natively).

## Using Docker (default)

The build runs inside a container based on the official
[`espressif/idf`](https://hub.docker.com/r/espressif/idf) image, so you don't
need ESP-IDF on your machine. All you need on the host is **Docker** and
**Ruby (3.2 or later, to run `rake`)**.

### 1. Install Docker and Ruby

Install Docker (Docker Engine on Linux; Docker Desktop, Rancher Desktop,
Colima, etc. on macOS) and Ruby, then check that both work:

```sh
$ docker run --rm hello-world   # should print "Hello from Docker!"
$ ruby --version                # 3.2 or later
```

On macOS, continue with [macOS: enable virtiofs](#macos-enable-virtiofs) below.

### 2. Run the `rake` tasks as usual

Nothing else to prepare. The first time you run a `rake` task from
[Target Setup](../target-setup/) or [Build](../build/), the Docker image
(`docker/Dockerfile`) is built automatically. Each task runs its `native:`
counterpart inside the container (e.g. `rake setup_esp32s3` →
`rake native:setup_esp32s3`).

To work in a shell inside the container:

```sh
$ rake docker:shell
```

### macOS: enable virtiofs

On macOS, Docker's file-sharing backend must be **virtiofs**. Other backends
(`gRPC FUSE` / `osxfs` / `reverse-sshfs` / `9p`) don't handle symlinks
correctly and the build fails with `Operation not permitted`. Depending on
the tool you use:

**Docker Desktop**

1. Open Docker Desktop's **Settings** → **General**
2. Under **Virtual Machine Manager**, select **Apple Virtualization framework**
3. Under **Choose file sharing implementation for your containers**, select **VirtioFS**
4. Click **Apply & restart**

**Rancher Desktop**

1. In **Preferences** → **Virtual Machine** → **Emulation**, select **VZ**
2. In **Preferences** → **Virtual Machine** → **Volumes**, set **Mount Type** to **virtiofs**
3. Click **Apply** (the VM restarts)

**Colima**

The VM has to be recreated (existing containers and images are deleted):

```sh
$ colima delete
$ colima start --vm-type vz --mount-type virtiofs
```

### Choosing an ESP-IDF version

To use a different ESP-IDF patch version than the pinned default
(`v5.5.4`, see `DOCKER_IDF_TAG` in `rakelib/docker.rake`), set
`ESP_IDF_DOCKER_TAG` to any tag from the
[image's tag list](https://hub.docker.com/r/espressif/idf/tags):

```sh
$ export ESP_IDF_DOCKER_TAG=v5.5.5
$ rake build
```

### Configuration via `.env`

Unlike the native build, the Docker tasks only forward `SDKCONFIG_DEFAULTS`
and `USE_WIFI` from your shell (when set). For any other variable — or to
keep them out of your shell — put them in a gitignored `.env` file at the
project root instead; it's passed to the container as-is if present.
Docker's `--env-file` format doesn't strip quotes the way a shell does, so
**don't quote the value**:

```sh
# .env
SDKCONFIG_DEFAULTS=sdkconfig.defaults;sdkconfigs/usb_console
```

See [Settings](../settings/) for what goes in `SDKCONFIG_DEFAULTS`.

> **Note:** `rake flash` / `rake monitor` always run on the host, not in the
> container, because most container setups (Docker Desktop, Rancher Desktop
> on macOS/Windows) can't pass the device's serial port through to the
> container — it's not a Dockerfile/CLI-flag issue, the port simply isn't
> visible inside their Linux VM. They [flash and monitor](../flashing/) the
> image built by `rake build` from the host, and don't need a full ESP-IDF
> install either (see below). On native Linux, `docker run
> --device=/dev/ttyUSB0 ...` can pass a serial device through if you want to
> flash from inside a container (`rake docker:shell`) too.

## Building natively

To build on the host with a local ESP-IDF instead of Docker, use the
`native:` tasks (`rake native:setup_esp32s3`, `rake native:build`, ...).

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

## Installing the gems for flashing

Whichever way you build, `rake flash` / `rake monitor` (see
[Flashing](../flashing/)) run on the host. They are implemented in plain
Ruby by the [esp_flash](https://rubygems.org/gems/esp_flash) gem, so besides
the Ruby (3.2 or later) that runs `rake` they need nothing else — no
ESP-IDF, Python, or esptool — and they work with a `build/` produced by
Docker too. Install the gems declared in the repository's `Gemfile` once:

```sh
$ bundle install
```

That's it — no ESP-IDF activation required for flashing/monitoring alone.
They run on Linux and macOS; Windows support is untested.

## Next steps

Continue to [Settings](../settings/) for hardware-specific configuration,
then [Target Setup](../target-setup/) before your first build.
