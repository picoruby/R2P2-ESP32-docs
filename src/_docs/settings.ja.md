---
title: 設定
description: ハードウェア向けのsdkconfigフラグメントと、VMごとのMRuby::CrossBuild設定ファイル。
---

ビルド設定には2つの層があります。ESP-IDF自体のハードウェア設定と、
PicoRuby/FemtoRuby自体のクロスコンパイル設定(`build_config/`)です。

## ハードウェア設定(`SDKCONFIG_DEFAULTS`)

一部のボードでは、ESP-IDFの追加設定が必要です。各オプションのフラグメントファイルは
`sdkconfigs/`以下にあり、`SDKCONFIG_DEFAULTS`環境変数で必要な分だけセミコロン区切りで
組み合わせられます。

**外部USB-UARTチップを持たないボード(USBコンソール)の場合:**

```sh
$ export SDKCONFIG_DEFAULTS="sdkconfig.defaults;sdkconfigs/usb_console"
```

**USBコンソール＋SPIRAMの場合:**

```sh
$ export SDKCONFIG_DEFAULTS="sdkconfig.defaults;sdkconfigs/usb_console;sdkconfigs/spiram"
```

これは[ターゲットのセットアップ](../target-setup/)を実行する**前**に設定してください。
ESP-IDFがプロジェクトを構成するときにしか読み込まれません。後から変更した場合は、
ターゲットのセットアップ(例: `rake setup_esp32`)をやり直して強制的に再構成してください。

Dockerを使う場合は、`docker:*`タスクはシェル環境からこれを読み込みません。代わりに
プロジェクトルートの(gitignore済みの)`.env`ファイルに記述してください
([環境構築](../environment-setup/)を参照)。

## PicoRuby/FemtoRubyのビルド設定(`build_config/`)

`components/picoruby-esp32/build_config/`には、アーキテクチャ×VMの組み合わせごとに
4つの`MRuby::CrossBuild`設定ファイルがあります。

```text
build_config/
├── xtensa-esp-picoruby.rb   # ESP32, ESP32-S3 · PicoRuby (mruby)
├── xtensa-esp-femtoruby.rb  # ESP32, ESP32-S3 · FemtoRuby (mruby/c)
├── riscv-esp-picoruby.rb    # ESP32-C3/C6/H2/P4 · PicoRuby (mruby)
└── riscv-esp-femtoruby.rb   # ESP32-C3/C6/H2/P4 · FemtoRuby (mruby/c)
```

`components/picoruby-esp32/CMakeLists.txt`が、`PICORB_VM`(`rake picoruby:build` /
`rake femtoruby:build`で設定されます。[ビルド](../build/)を参照)と
対象のアーキテクチャ(`CONFIG_IDF_TARGET`)から、適切なファイルを自動的に選択します。

各ファイルはクロスツールチェーン(`xtensa-*-elf-gcc`または`riscv32-esp-elf-gcc`)、
プリプロセッサ定義(`MRB_*`/`MRBC_*`系のチューニングフラグ、および
`USE_WIFI`環境変数が設定されている場合はそれも)、そして——ビルドをカスタマイズする上で
最も関係が深い——gemの一覧を設定します。

```ruby
conf.gembox 'minimum'
conf.gembox 'core'
conf.gem core: 'picoruby-shell'
conf.gem core: 'picoruby-gpio'
# ...
```

**mrbgemの追加・削除はここで行います。** 自分のgemを組み込みたい場合は、ここに
`conf.gem github: 'yourname/your-mrbgem'`のような行を追加してから
([デバッグ](../debugging/)ページの`mrdebug`の実例も参照)、再ビルドしてください。

> もう2つのビルド時環境変数、`HEAP_SIZE`と`PICORB_TASK_STACK_SIZE`は、
> これらのRubyクロスビルド設定とは別の、周辺のC glueコードのビルドである
> `components/picoruby-esp32/CMakeLists.txt`側で読み込まれます。
> 詳細は[メモリをチューニングする](../heap-size/)を参照してください。
