---
title: LED点滅
description: GPIO出力でLEDを点滅させます (picoruby-gpio)。
---

まずは電子工作の「Hello World」、通称「Lチカ」です。GPIOピンをオン・オフしてLEDを点滅させます。

## 部品

- LED(好きな色のもの)
- 抵抗 330Ω程度

> 厳密にはLEDの定格電流から抵抗値を計算する必要がありますが、330Ω程度にしておけば
> たいていのLEDでうまくいきます。

## 回路

<%= partial "breadboard", name: "led-blink", alt: "配線図: GPIO26から330Ωの抵抗とLEDを経由してGNDに接続" %>

| 接続元 | 接続先 |
| --- | --- |
| GPIO26 | 抵抗、続いてLEDのアノード(足の長い方) |
| LEDのカソード(足の短い方) | GND |

LEDには極性があります。足の長い方(アノード)をGPIO側にしてください。

## プログラム

```ruby
require 'gpio'
require 'machine'

led = GPIO.new(26, GPIO::OUT)

loop do
  led.write(1)
  Machine.delay_ms(1000)
  led.write(0)
  Machine.delay_ms(1000)
end
```

1秒ごとに、ピンの値を1(HIGH)→0(LOW)→1…と切り替えています。

## 実行

プログラムを`gpio_out.rb`として保存し、デバイスの`/home`に配置します
([ファイル転送](../file-transfer/)を参照)。その後、シェルから実行します。

```text
$> ./gpio_out.rb
```

LEDが1秒ごとに点滅すれば成功です。
