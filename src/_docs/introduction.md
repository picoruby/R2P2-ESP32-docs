---
title: Introduction
description: What R2P2-ESP32 is, and how PicoRuby fits on an ESP32.
---

[R2P2-ESP32](https://github.com/picoruby/R2P2-ESP32) runs **R2P2** (Ruby
Rapid Portable Platform), a [PicoRuby](https://github.com/picoruby/picoruby)
shell, on ESP32 microcontrollers. It gives you an interactive Ruby prompt,
a small filesystem, and a shell — running directly on the chip, with no
host computer required once it's flashed.

## What is PicoRuby?

PicoRuby is the smallest Ruby implementation designed for one-chip
microcontrollers. It implements a meaningful subset of the Ruby language
and standard library so you can write real Ruby — classes, blocks,
`Array`/`Hash`/`String` methods and more — in an environment with only a
few hundred kilobytes of RAM.

See [picoruby.org](https://picoruby.org) for the full language and API
reference.

## What R2P2 adds

R2P2 wraps PicoRuby in `picoruby-shell`, a small POSIX-ish shell (`ls`,
`cat`, `mkdir`, `cd`, `pwd`, `echo`, ...) plus `irb`, so you can explore the
filesystem, edit programs, and run them interactively — similar to working
on a tiny embedded Linux box, except the whole environment is Ruby.

```text
$> irb
irb> 1 + 2
=> 3
irb> words = ["Hello", "PicoRuby", "!"]
=> ["Hello", "PicoRuby", "!"]
irb> words.join(" ")
=> "Hello PicoRuby !"
```

## Two virtual machines

R2P2-ESP32 currently supports two VMs, selectable at build time:

- **PicoRuby** — built on `mruby`
- **FemtoRuby** — built on `mruby/c`, for even tighter memory budgets

Which VMs are available depends on the target chip; see each board's specs
before choosing.

## Where to go next

- [Quick Start](../quick-start/) — flash prebuilt firmware from your
  browser and run your first program in a few minutes.
- [When to Build It Yourself](../why-build/) — set up ESP-IDF (or Docker)
  to build firmware yourself, add mrbgems, or contribute upstream.
