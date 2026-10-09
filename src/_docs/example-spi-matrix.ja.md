---
title: SPIドットマトリックス
description: SPIで8x8ドットマトリックスLEDを点灯させます (picoruby-spi)。
---

代表的なバスの最後はSPIです。筆者のRubyKaigi 2025の発表のデモ動画で使ったのがこれです。

## 部品

- MAX7219 8×8ドットマトリックスLEDモジュール

## 回路

<%= partial "breadboard", name: "spi-matrix", alt: "配線図: MAX7219モジュールのVCCを5Vへ、GNDをGNDへ、DINをGPIO23へ、CSをGPIO5へ、CLKをGPIO18へ接続" %>

| MAX7219モジュール | ESP32-DevKitC |
| --- | --- |
| VCC | 5V |
| GND | GND |
| DIN | GPIO23 (VSPI MOSI) |
| CS | GPIO5 (VSPI SS) |
| CLK | GPIO18 (VSPI SCLK) |

## プログラム

OLEDと同様、このモジュールもコマンドがデータシートに定義されています。最初に初期化コマンドを
送り、その後、1ビットが1個のLEDに対応する8行×8ビットのデータで、各LEDの点灯・消灯を切り替えます。

```ruby
require 'spi'

spi = SPI.new(unit: 'ESP32_VSPI_HOST', frequency: 10_000_000, sck_pin: 18, cipo_pin: 19, copi_pin: 23, cs_pin: 5, mode: 0, first_bit: 0)

spi.write([0x0c, 0x01])
spi.write([0x09, 0x00])
spi.write([0x0a, 0x0f])
spi.write([0x0b, 0x07])

[
  0b01010101,
  0b10101010,
  0b01010101,
  0b10101010,
  0b01010101,
  0b10101010,
  0b01010101,
  0b10101010,
].each_with_index do |val, i|
  spi.write([i + 1, val])
end

loop { sleep_ms(500) }
```

## 実行

プログラムを`spi.rb`として保存し、デバイスの`/home`に配置します
([ファイル転送](../file-transfer/)を参照)。その後、シェルから実行します。

```text
$> ./spi.rb
```

ドットマトリックスLEDに市松模様が点灯すれば成功です。
