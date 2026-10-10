---
title: 動作確認済デバイス
description: R2P2-ESP32の動作が確認されているボードと、それぞれ対応するVM・機能。
---

以下のデバイスで動作が確認されています。

| デバイス | ターゲット | VM | USBコンソール | SPIRAM |
| --- | --- | --- | --- | --- |
| ESP32-DevKitC | ESP32 | FemtoRuby (mruby/c) | No | No |
| ATOM Matrix | ESP32 | FemtoRuby (mruby/c) | No | No |
| M5Stamp C3 Mate | ESP32-C3 | FemtoRuby (mruby/c) | No | No |
| ESPr® Developer S3 Type-C | ESP32-S3 | FemtoRuby (mruby/c), PicoRuby (mruby) | No | Yes |
| ATOMS3 Lite | ESP32-S3 | FemtoRuby (mruby/c), PicoRuby (mruby) | Yes | No |
| M5Stack CoreS3 | ESP32-S3 | FemtoRuby (mruby/c), PicoRuby (mruby) | Yes | Yes |

- **USBコンソール** — 外部のUSB-UARTチップなしで、ボードのネイティブUSBを
  コンソールとして使えるかどうか。`sdkconfigs/usb_console`フラグメントで
  有効にします([設定](../settings/)を参照)。
- **SPIRAM** — ボードにPSRAMが搭載されているかどうか。`sdkconfigs/spiram`で
  有効にすると、デフォルトの[ヒープサイズ](../heap-size/)も1MBに引き上げられます。

[Web Installer](../../installer/)は現在、ESP32、ESP32-C3、ESP32-C6、ESP32-H2、
ESP32-P4、ESP32-S3向けのビルド済みイメージを公開しています(該当する場合は
USBコンソール版も含む)。そのため、上記に個別に載っていなくても、これらのチップを
搭載した他のボードでも動作する可能性が高いです。新しいハードウェアで
R2P2-ESP32を動かせた場合は、ぜひ[プルリクエスト](https://github.com/picoruby/R2P2-ESP32)
でここに追加することを検討してください。
