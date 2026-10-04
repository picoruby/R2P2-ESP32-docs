---
title: Changing the Partition Table
description: The project's partitions.csv layout, and how to change it.
---

R2P2-ESP32 uses a custom partition table, set via `sdkconfig.defaults`:

```text
CONFIG_PARTITION_TABLE_CUSTOM=y
CONFIG_PARTITION_TABLE_CUSTOM_FILENAME="partitions.csv"
```

`partitions.csv` at the project root defines it:

```text
# Name,   Type, SubType, Offset,  Size,    Flags
nvs,      data, nvs,     0x9000,  0x6000,
phy_init, data, phy,     0xf000,  0x1000,
factory,  app,  factory, 0x10000, 2M,
storage,  data, littlefs,       , 1M,
```

- **`factory`** — the app partition (2 MB), where your built firmware goes.
- **`storage`** — a 1 MB LittleFS partition built from the `storage/`
  directory at build time (see [File Transfer](../file-transfer/)).
- **`nvs`** / **`phy_init`** — small ESP-IDF system partitions (non-volatile
  storage, PHY calibration data).

`sdkconfig.defaults` also sets `CONFIG_ESPTOOLPY_FLASHSIZE_4MB=y`, so the
table above (0x10000 + 2M + 1M ≈ 3.06 MB, comfortably under 4 MB) is sized
for a 4 MB flash chip.

## Changing it

Edit `partitions.csv` directly — for example, to grow `factory` for a larger
app, or resize `storage` for more on-device file space. Keep the total
within your chip's actual flash size, and note that any offset left blank
(like `storage`'s here) is auto-computed to follow the previous partition,
so you may need to fill in explicit offsets if you reorder entries. See
[Espressif's partition table docs](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/partition-tables.html)
for the full format.

> **Important:** the `storage` partition's location and size are also
> hardcoded on the PicoRuby side, in
> `components/picoruby-esp32/picoruby/mrbgems/picoruby-littlefs/ports/esp32/flash_hal.c`
> — they don't follow `partitions.csv` automatically:
>
> ```c
> #if !defined(LFS_FLASH_TARGET_OFFSET)
>   #define LFS_FLASH_TARGET_OFFSET  0x00210000
> #endif
>
> #define LFS_FLASH_BLOCK_SIZE   4096  /* == SPI_FLASH_SEC_SIZE */
> #define LFS_FLASH_BLOCK_COUNT  256   /* 1 MB */
> ```
>
> If changing `partitions.csv` moves `storage` to a different offset (e.g.
> because you grew `factory`, or reordered entries), update
> `LFS_FLASH_TARGET_OFFSET` here to match. If you resize `storage` itself,
> update `LFS_FLASH_BLOCK_COUNT` too (`block_count × 4096` bytes). Mismatch
> either one and littlefs reads/writes the wrong flash region.

After changing it, a full rebuild and reflash is needed — and if you resize
`storage`, treat it like a fresh device (see the flashing note in [File
Transfer](../file-transfer/)).
