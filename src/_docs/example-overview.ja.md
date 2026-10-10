---
title: 概要
description: ブレッドボード上に組める簡単な回路とサンプルプログラム。
---

ブレッドボード上に組める小さな回路を、配線図とR2P2-ESP32向けのサンプルプログラムとともに
紹介します。

| サンプル | クラス | 内容 |
| --- | --- | --- |
| [LED点滅](../example-led-blink/) | `GPIO` | デジタル出力 |
| [スイッチ入力](../example-gpio-input/) | `GPIO` | プルダウン付きのデジタル入力 |
| [圧電スピーカー](../example-pwm-piezo/) | `PWM` | ドレミを鳴らす |
| [分圧回路](../example-adc-divider/) | `ADC` | アナログ電圧を読む |
| [UARTエコー](../example-uart-echo/) | `UART` | シリアル通信 |
| [I2C OLED](../example-i2c-oled/) | `I2C` | OLEDに表示する |
| [SPIドットマトリックス](../example-spi-matrix/) | `SPI` | 8×8 LEDを点灯する |

## 準備するもの

- R2P2-ESP32が動作する[ESP32-DevKitC](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html)
  ([クイックスタート](../quick-start/)または[ビルド](../build/)を参照)。
  他社の互換品はピンアサインが異なることがあります。
- USBケーブルとブレッドボード。初心者の方は大きめのブレッドボードがおすすめです。
- 各ページに記載の部品。

ページ内のピン番号はすべてESP32のGPIO番号で、DevKitC上に`IO26`、`IO13`などと印字されている番号です。

## 配線図について

ESP32-DevKitCは幅が広く、2列のピンが10穴離れているため、標準的なブレッドボードに挿すと片側にほとんど
空き穴が残りません。そのため配線図では、両側のピン列の外側にも空き穴がある幅広のブレッドボードを
使っています。標準的なブレッドボードを使う場合は、ジャンパー線でピンに配線するか、ブレッドボードを2枚使ってください。

配線図は[BreadKit](https://breadkit.github.io/breadkit/)で描画しています。

## プログラムの実行方法

各サンプルは単一のRubyファイルです。デバイスの`/home`に配置し
(Webターミナルまたは`rake "picomodem:put[...]"`、[ファイル転送](../file-transfer/)を参照)、
シェルから`./<ファイル名>.rb`で実行します。
