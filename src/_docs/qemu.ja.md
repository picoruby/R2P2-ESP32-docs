---
title: QEMU上で動作させる
description: 実機なしで、QEMU(ESP32-S3)上でR2P2-ESP32を動作させます。
---

R2P2-ESP32は、実機がなくても[QEMU](https://github.com/espressif/qemu)上で
ESP32-S3をターゲットに動作させることができます。これにはESP-IDF組み込みの
`idf.py qemu`サポートと、`qemu-xtensa`ツールパッケージを使用します。

## ESP-IDFを使う場合

専用のビルドディレクトリ(`build-qemu`)を一度だけセットアップします。UARTコンソール
付きのESP32-S3をターゲットにします(QEMUはUSB Serial/JTAGコンソールをエミュレート
しません)。

```sh
$ rake setup_qemu
```

続いて、好きなVMで実行します。

```sh
$ rake femtoruby:qemu # VM: mruby/c
$ rake picoruby:qemu  # VM: mruby
$ rake qemu           # build-qemuに現在設定されているVM(デフォルトはfemtoruby/mrubyc)
```

これでエミュレートされたUART上の`picoruby-shell`プロンプトに入ります。QEMUの終了は
`Ctrl-A X`です(`-nographic`モード)。

## Dockerを使う場合

[環境構築](../environment-setup/)でDockerを使っている場合は、`docker:`名前空間の下に
同等のタスクがあります。

```sh
$ rake docker:setup_qemu
$ rake docker:femtoruby:qemu   # または docker:picoruby:qemu, docker:qemu
```

## 既知の制限事項

- **USB Serial/JTAGコンソールはエミュレートされません。** `rake setup_qemu`は、
  普段の`SDKCONFIG_DEFAULTS`([設定](../settings/)を参照)に関わらず
  `sdkconfigs/qemu`(UARTコンソール)でビルドします。USB Serial/JTAGコンソール
  ビルドは、QEMUが決して提供しないホスト接続を待ち続けて永遠にハングしてしまうためです。
- **ADC/SENSペリフェラルはエミュレートされません。** そのため、通常`app_main`の前に
  実行されるADCハードウェアの自己キャリブレーションが無限に回り続けます。
  `rake qemu`は、初回実行時にQEMUのeFuseイメージに`BLK_VERSION_MAJOR=1`を
  書き込むことでこれを回避します。これによりキャリブレーションはハードウェアに
  触れる代わりに(ゼロ埋めされた)eFuseデータを読むようになります。そのため、
  QEMU上でのADCの読み取り値には意味がありません。
- **PSRAMは8MBに制限されます。** 実機はそれ以上搭載していることがありますが、
  デフォルトの32MBのままだとQEMUがPSRAM全体を仮想アドレス空間にマップできず、
  [`storage`](../file-transfer/)(LittleFS)パーティションのマウント時に
  `esp_mmu_map: no such vaddr range`でクラッシュします。
- **`USE_WIFI`ビルド自体はコンパイルできます**が、QEMUはEthernet MAC
  (`open_eth`)のみをエミュレートし、実際のWi-Fiハードウェアはエミュレートしないため、
  `Network::WiFi` / `ESP32::WiFi`はQEMU上では動作しません
  ([Wi-Fiを有効にする](../wifi/)を参照)。
