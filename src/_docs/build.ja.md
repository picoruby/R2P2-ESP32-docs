---
title: ビルド
description: ESP-IDFまたはDockerを使い、PicoRubyまたはFemtoRubyでR2P2-ESP32をビルドします。
---

[ターゲットのセットアップ](../target-setup/)が終わったら、好きなVMでビルドします。
[環境構築](../environment-setup/)でどちらの方法を選んでいても、どちらのVMも
利用できます。

## ESP-IDFを使う場合

### PicoRuby

```sh
$ rake picoruby:build
```

これは`rake build -DPICORB_VM=mruby`と同等です。`PICORB_VM=mruby`によって、
`components/picoruby-esp32/CMakeLists.txt`が`*-esp-picoruby.rb`のビルド設定を
選択します([設定](../settings/)を参照)。

### FemtoRuby

```sh
$ rake femtoruby:build
```

これは`rake build -DPICORB_VM=mruby/c`と同等で、`*-esp-femtoruby.rb`の
ビルド設定を選択します。

## Dockerを使う場合

### PicoRuby

```sh
$ rake docker:picoruby:build
```

### FemtoRuby

```sh
$ rake docker:femtoruby:build
```

## クリーンアップ

### ESP-IDFを使う場合

```sh
$ rake clean       # idf.py clean に加え、4つのbuild_configすべてでmruby cleanを実行
$ rake deep_clean  # cleanに加え、idf.py fullcleanとmrubyのbuild/repos/esp32の削除も実行
```

ターゲットやVMを切り替えて、通常の`clean`では直らない古いビルドに起因するエラーが
出た場合は`deep_clean`を試してください。

### Dockerを使う場合

```sh
$ rake docker:clean
$ rake docker:deep_clean
```

## 次のステップ

ビルドした結果を[フラッシュしてモニタリング](../flashing/)しましょう。
