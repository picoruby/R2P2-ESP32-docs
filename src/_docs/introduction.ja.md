---
title: 概要
description: R2P2-ESP32とは何か、そしてPicoRubyがESP32上でどのように動作するか。
---

[R2P2-ESP32](https://github.com/picoruby/R2P2-ESP32)は、[PicoRuby](https://github.com/picoruby/picoruby)
シェルである**R2P2**（Ruby Rapid Portable Platform）をESP32マイコン上で動かすプロジェクトです。
インタラクティブなRubyプロンプト、小さなファイルシステム、そしてシェルをチップ上で直接提供し、
一度書き込んでしまえばホストPCは不要になります。

## PicoRubyとは

PicoRubyは、ワンチップマイコン向けに設計された最小のRuby実装です。クラス、ブロック、
`Array`／`Hash`／`String`のメソッドなど、Ruby言語と標準ライブラリの実用的なサブセットを実装しており、
わずか数百キロバイトのRAMしかない環境でも本物のRubyを書くことができます。

言語仕様とAPIリファレンスの詳細は[picoruby.org](https://picoruby.org)を参照してください。

## R2P2が追加するもの

R2P2はPicoRubyを`picoruby-shell`でラップしています。これは`ls`、`cat`、`mkdir`、`cd`、`pwd`、
`echo`などを備えた小さなPOSIX風シェルに`irb`を組み合わせたもので、ファイルシステムの操作や
プログラムの編集・実行をインタラクティブに行えます。小さな組み込みLinuxマシンで作業している
ような感覚に近いですが、環境全体がRubyでできている点が異なります。

```text
$> irb
irb> 1 + 2
=> 3
irb> words = ["Hello", "PicoRuby", "!"]
=> ["Hello", "PicoRuby", "!"]
irb> words.join(" ")
=> "Hello PicoRuby !"
```

## 2つの仮想マシン

R2P2-ESP32は現在、ビルド時に選択できる2つのVMをサポートしています。

- **PicoRuby** — `mruby`をベースに構築
- **FemtoRuby** — `mruby/c`をベースに構築。さらに少ないメモリでも動作します

どちらのVMが使えるかは対象チップによって異なるため、ボードを選ぶ前に仕様を確認してください。

## 次に読むべきページ

- [クイックスタート](../quick-start/) — ブラウザからビルド済みファームウェアを書き込み、
  数分で最初のプログラムを実行します。
- [どういうときにビルドするか](../why-build/) — ESP-IDF(またはDocker)をセットアップして
  自分でファームウェアをビルドしたり、mrbgemを追加したり、本体プロジェクトに
  貢献したりする方法です。
