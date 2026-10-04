---
title: パーティションを変更する
description: プロジェクトのpartitions.csvの構成と、その変更方法。
---

R2P2-ESP32は、`sdkconfig.defaults`で設定されたカスタムパーティションテーブルを
使用しています。

```text
CONFIG_PARTITION_TABLE_CUSTOM=y
CONFIG_PARTITION_TABLE_CUSTOM_FILENAME="partitions.csv"
```

プロジェクトルートの`partitions.csv`がその内容を定義しています。

```text
# Name,   Type, SubType, Offset,  Size,    Flags
nvs,      data, nvs,     0x9000,  0x6000,
phy_init, data, phy,     0xf000,  0x1000,
factory,  app,  factory, 0x10000, 2M,
storage,  data, littlefs,       , 1M,
```

- **`factory`** — アプリパーティション(2MB)。ビルドしたファームウェアが
  ここに入ります。
- **`storage`** — `storage/`ディレクトリからビルド時に作成される1MBの
  LittleFSパーティション([ファイル転送](../file-transfer/)を参照)。
- **`nvs`** / **`phy_init`** — ESP-IDFのシステム用の小さなパーティション
  (不揮発性ストレージ、PHYキャリブレーションデータ)。

`sdkconfig.defaults`では`CONFIG_ESPTOOLPY_FLASHSIZE_4MB=y`も設定されているため、
上記のテーブル(0x10000 + 2M + 1M ≈ 3.06MB、4MBに十分収まるサイズ)は
4MBフラッシュチップ向けのサイズになっています。

## 変更する

`partitions.csv`を直接編集します。例えば、より大きなアプリのために`factory`を
拡大したり、デバイス上のファイル容量を増やすために`storage`をリサイズしたり
できます。合計はお使いのチップの実際のフラッシュサイズに収まるようにしてください。
また、ここでの`storage`のようにオフセットを空欄にした場合は直前のパーティションに
続くよう自動計算されるため、エントリの順序を変える場合は明示的なオフセットを
指定する必要があるかもしれません。フォーマットの詳細は
[Espressifのパーティションテーブルのドキュメント](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/partition-tables.html)
を参照してください。

> **重要:** `storage`パーティションの位置とサイズは、PicoRuby側の
> `components/picoruby-esp32/picoruby/mrbgems/picoruby-littlefs/ports/esp32/flash_hal.c`
> にもハードコードされており、`partitions.csv`の変更に自動追従しません。
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
> `partitions.csv`の変更で`storage`のオフセットが変わる場合(`factory`を
> 拡大した、エントリの順序を変えた、など)は、ここの`LFS_FLASH_TARGET_OFFSET`も
> 合わせて変更してください。`storage`自体のサイズを変更する場合は
> `LFS_FLASH_BLOCK_COUNT`も更新してください(`block_count × 4096`バイト)。
> どちらか一方でも合わせないと、littlefsが誤ったフラッシュ領域を読み書きして
> しまいます。

変更後は、フルリビルドと再フラッシュが必要です。`storage`をリサイズした場合は、
新しいデバイスとして扱ってください([ファイル転送](../file-transfer/)の
フラッシュに関する注意も参照してください)。
