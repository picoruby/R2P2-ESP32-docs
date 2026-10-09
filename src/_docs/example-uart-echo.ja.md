---
title: UARTエコー
description: UARTでPCとシリアル通信します (picoruby-uart)。
---

UART(シリアル通信)は、デバイス同士の通信の代表例です。ここでは、ESP32が受け取った文字を
そのまま送り返します。

## 部品

- USBシリアル変換モジュール(3.3Vロジックのもの)

## 回路

<%= partial "breadboard", name: "uart-echo", alt: "配線図: USBシリアル変換モジュールのTXをRXへ、RXをTXへ、GNDをGNDへ、3V3を3V3へ接続" %>

| USBシリアル変換モジュール | ESP32-DevKitC |
| --- | --- |
| TX | RX |
| RX | TX |
| GND | GND |
| 3V3 | 3V3 |
| 5V | 接続しない |

TXとRXは交差させます。片方の送信側をもう片方の受信側につなぎます。

> **Note:** DevKitCの`RX`/`TX`はGPIO3/GPIO1、つまりUART0で、ボード上のUSBブリッジも
> このピンを使っています。両方の接続でこのピンを共有する点に注意してください。

## プログラム

```ruby
require 'uart'

uart = UART.new(unit: 'ESP32_UART0', txd_pin: 1, rxd_pin: 3)
loop do
  str = uart.read
  unless str.nil?
    uart.write(str)
  end
  sleep_ms(10)
end
```

届いた文字を1つ読み出し、そのまま書き込み返す(エコーする)プログラムです。

## 実行

変換モジュールのUSBをPCに接続すると、2つ目のシリアルポートとして認識されます。
ターミナルソフトで開いてください。例:

```sh
$ screen /dev/ttyUSB0
```

(デバイス名はOSによって異なります。macOSなら`/dev/tty.usbserial-*`など。)

次に、プログラムを`uart.rb`として保存し、デバイスの`/home`に配置して
([ファイル転送](../file-transfer/)を参照)、シェルから実行します。

```text
$> ./uart.rb
```

`screen`のウィンドウでキー入力すると、入力した文字がそのまま表示されます。
