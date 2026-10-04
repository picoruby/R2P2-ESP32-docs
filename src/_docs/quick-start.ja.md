---
title: クイックスタート
description: ブラウザからR2P2-ESP32を書き込み、最初のRubyプログラムを実行します。
---

初めてESP32でPicoRubyを動かす場合でも、いくつかのステップだけですぐに始められます。
開発ツールチェーンのインストールは不要です。

## 前提条件

- ESP32ボード(動作確認済みのハードウェアは[動作確認済デバイス](../supported-devices/)を参照)
- PCと接続するUSBケーブル
- Google Chrome、Microsoft Edge、Opera のいずれか
  （[Web Serial](https://developer.chrome.com/docs/capabilities/serial)を利用するために必要です）

## 1. ファームウェアを書き込む

1. デバイスをUSBでPCに接続します。
2. [R2P2-ESP32 Web Installer](https://picoruby.org/R2P2-ESP32-installer/)を開きます。
3. 対象ボードとVM（PicoRubyまたはFemtoRuby）を選択し、**Connect and Flash**をクリックします。

インストーラーはWeb Serial経由でブラウザから直接デバイスと通信するため、
ローカルに何かをインストールする必要はありません。

## 2. Webターミナルを開く

書き込みが完了したら、[R2P2 Web Terminal](https://picoruby.org/terminal)を開き
**Connect**をクリックします。デバイス上で動作する小さなシェル、`picoruby-shell`に入ります。

## 3. irbを起動する

```text
$> irb
irb> 1 + 2
=> 3
irb> words = ["Hello", "PicoRuby", "!"]
=> ["Hello", "PicoRuby", "!"]
irb> words.join(" ")
=> "Hello PicoRuby !"
irb>
```

`exit`と入力するか`Ctrl-D`を押すと`irb`を終了してシェルに戻ります。

## 4. プログラムをアップロードして実行する

Webターミナルの**File Editor**パネルで、簡単なプログラムを書きます。

```ruby
words = ["Hello", "PicoRuby", "!"]
puts words.join(" ")
```

パスを`/home/hello.rb`に設定して**Upload**をクリックします。シェルに戻り、
そのまま実行できます。

```text
$> ls
hello.rb
$> ./hello.rb
Hello PicoRuby !
$>
```

## その他のシェルコマンド

`picoruby-shell`にはおなじみのコマンドがいくつか用意されています。

```text
$> echo 'Hello!'
Hello!
$> cat hello.rb
words = ["Hello", "PicoRuby", "!"]
puts words.join(" ")
$> mkdir 'tmp'
$> cd 'tmp'
$> pwd
/home/tmp
$> reboot
```

組み込みコマンドの一覧は
[`picoruby-shell`のexecutables](https://github.com/picoruby/picoruby/tree/master/mrbgems/picoruby-shell/shell_executables)
を参照してください。

## 次のステップ

PicoRubyで利用できるクラスや標準ライブラリの全機能については
[picoruby.org](https://picoruby.org/index.html)を参照してください。
Web Installerの配布イメージではなく自分でファームウェアをビルドしたい場合は、
[どういうときにビルドするか](../why-build/)に進んでください。
