---
title: I2C OLED
description: I2CでOLEDディスプレイに市松模様を表示します (picoruby-i2c)。
---

I2Cは、デバイス間通信で2番目によく使われる方式です。ここでは小型のOLEDディスプレイを制御します。

## 部品

- SSD1306 OLEDディスプレイモジュール(128×64、I2C、4ピン)

## 回路

<%= partial "breadboard", name: "i2c-oled", alt: "配線図: OLEDモジュールのVCCを3V3へ、GNDをGNDへ、SCLをGPIO22へ、SDAをGPIO21へ接続" %>

| OLEDモジュール | ESP32-DevKitC |
| --- | --- |
| VCC | 3V3 |
| GND | GND |
| SCL | GPIO22 |
| SDA | GPIO21 |

## プログラム

OLEDに表示するには、データシートの仕様に沿ってコマンドやデータを送信する必要があるため、
プログラムは少し複雑です。`I2C`クラスで初期化コマンドを送り、続けて市松模様のピクセルデータを
書き込んでいます。

```ruby
require "i2c"

ADDR = 0x3C
CTRL_CMD, CTRL_DATA = 0x00, 0x40
CHUNK = 16
CELL_W = 16  # px
CELL_H = 2   # pages (1page=8px) => 16px

i2c = I2C.new(unit: :ESP32_I2C0, sda_pin: 21, scl_pin: 22, frequency: 400_000)

def cmd(i2c, addr, *bytes) bytes.each { |b| i2c.write(addr, CTRL_CMD, b & 0xff) } end
def data(i2c, addr, bytes) i2c.write(addr, CTRL_DATA, bytes) end

cmd(i2c, ADDR,
  0xAE, 0xD5,0x80, 0xA8,0x3F, 0xD3,0x00, 0x40, 0x8D,0x14, 0x20,0x00,
  0xA1, 0xC8, 0xDA,0x12, 0x81,0xCF, 0xD9,0xF1, 0xDB,0x40, 0xA4, 0xA6, 0xAF
)

# full screen range (horizontal addressing)
cmd(i2c, ADDR, 0x21,0x00,0x7F, 0x22,0x00,0x07)

buf = Array.new(CHUNK, 0)

8.times do |page|
  pb = (page / CELL_H) & 1
  (128 / CHUNK).times do |blk|
    col0 = blk * CHUNK
    CHUNK.times do |i|
      cb = ((col0 + i) / CELL_W) & 1
      buf[i] = (pb ^ cb) == 0 ? 0xFF : 0x00
    end
    data(i2c, ADDR, buf)
  end
end
```

モジュールのI2Cアドレスは`0x3C`です。`0x3D`のモジュールもあるので、その場合は`ADDR`を変更してください。

## 実行

プログラムを`i2c.rb`として保存し、デバイスの`/home`に配置します
([ファイル転送](../file-transfer/)を参照)。その後、シェルから実行します。

```text
$> ./i2c.rb
```

OLEDに市松模様が表示されれば成功です。
