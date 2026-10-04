---
title: Build
description: Build R2P2-ESP32 with PicoRuby or FemtoRuby, using ESP-IDF or Docker.
---

Once [Target Setup](../target-setup/) is done, build with whichever VM you
want — both are available regardless of which [environment
setup](../environment-setup/) path you took.

## Using ESP-IDF

### PicoRuby

```sh
$ rake picoruby:build
```

Equivalent to `rake build -DPICORB_VM=mruby` — `PICORB_VM=mruby` is what
tells `components/picoruby-esp32/CMakeLists.txt` to select the
`*-esp-picoruby.rb` build config (see [Settings](../settings/)).

### FemtoRuby

```sh
$ rake femtoruby:build
```

Equivalent to `rake build -DPICORB_VM=mruby/c`, selecting the
`*-esp-femtoruby.rb` build config.

## Using Docker

### PicoRuby

```sh
$ rake docker:picoruby:build
```

### FemtoRuby

```sh
$ rake docker:femtoruby:build
```

## Cleaning

### Using ESP-IDF

```sh
$ rake clean       # idf.py clean, plus mruby clean for all 4 build_config combinations
$ rake deep_clean  # clean, plus idf.py fullclean and removing mruby's build/repos/esp32
```

Reach for `deep_clean` if you switch targets or VMs and hit stale-build
errors that a plain `clean` doesn't fix.

### Using Docker

```sh
$ rake docker:clean
$ rake docker:deep_clean
```

## Next steps

[Flash and monitor](../flashing/) the result.
