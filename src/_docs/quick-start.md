---
title: Quick Start
description: Flash R2P2-ESP32 from your browser and run your first Ruby program.
---

If this is your first time running PicoRuby on an ESP32, you can be up and
running in just a few steps — no toolchain installation required.

## Prerequisites

- An ESP32 board (see [Verified Devices](../supported-devices/) for tested
  hardware)
- A USB cable to connect it to your computer
- Google Chrome, Microsoft Edge, or Opera (required for [Web Serial](https://developer.chrome.com/docs/capabilities/serial))

## 1. Flash the firmware

1. Connect your device to your computer via USB.
2. Open the [R2P2-ESP32 Web Installer](https://picoruby.org/R2P2-ESP32-installer/).
3. Select your target board and VM (PicoRuby or FemtoRuby), then click
   **Connect and Flash**.

The installer talks to the device directly from the browser over Web
Serial — there's nothing to install locally.

## 2. Open the web terminal

Once flashing finishes, open the [R2P2 Web Terminal](https://picoruby.org/terminal)
and click **Connect**. You'll land in `picoruby-shell`, a small shell
running on the device itself.

## 3. Start irb

```text
$> irb
irb> 1 + 2
=> 3
irb> words = ["Hello", "PicoRuby", "!"]
=> ["Hello", "PicoRuby", "!"]
irb> words.join(" ")
=> "Hello PicoRuby !"
irb>
```

Type `exit` (or press `Ctrl-D`) to leave `irb` and return to the shell.

## 4. Upload and run a program

In the **File Editor** panel of the Web Terminal, write a small program:

```ruby
words = ["Hello", "PicoRuby", "!"]
puts words.join(" ")
```

Set the path to `/home/hello.rb` and click **Upload**. Back in the shell,
run it directly:

```text
$> ls
hello.rb
$> ./hello.rb
Hello PicoRuby !
$>
```

## Other shell commands

`picoruby-shell` ships with a handful of familiar commands:

```text
$> echo 'Hello!'
Hello!
$> cat hello.rb
words = ["Hello", "PicoRuby", "!"]
puts words.join(" ")
$> mkdir 'tmp'
$> cd 'tmp'
$> pwd
/home/tmp
$> reboot
```

See the [`picoruby-shell` executables](https://github.com/picoruby/picoruby/tree/master/mrbgems/picoruby-shell/shell_executables)
for the full list of built-in commands.

## Next steps

For the full set of classes and standard library features available in
PicoRuby, see [picoruby.org](https://picoruby.org/index.html). To build
firmware yourself instead of using the prebuilt Web Installer images,
continue to [When to Build It Yourself](../why-build/).
