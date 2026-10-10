---
title: スイッチ入力
description: GPIO入力でタクトスイッチの状態を読み取ります (picoruby-gpio)。
---

出力ができたら入力もやってみましょう。入力ができるだけでも簡単なゲームが作れるようになります。

## 部品

- タクトスイッチ

## 回路

<%= partial "breadboard", name: "gpio-input", alt: "配線図: 3Vからタクトスイッチを介してGPIO13に接続" %>

| 接続元 | 接続先 |
| --- | --- |
| 3V3 | スイッチ(片側) |
| スイッチ(反対側) | GPIO13 |

タクトスイッチは「押すと**対角**に位置するピン同士がつながる」と覚えておくと間違いがありません
(隣同士のピンはつながっていることも、いないこともあります)。

> **Note:** ESP32のGPIOは3.3Vロジックで、5Vには耐えられません。スイッチには5Vピンではなく
> 3V3を接続してください。

## プログラム

```ruby
require 'gpio'
require 'machine'

button = GPIO.new(13, GPIO::IN | GPIO::PULL_DOWN)

loop do
  puts "Button: #{button.high? ? 'Pressed' : 'Released'}"
  Machine.delay_ms(1000)
end
```

1秒ごとにボタンの状態をポーリングして標準出力に表示します。`GPIO::PULL_DOWN`はピンの内部
プルダウン抵抗を有効にするもので、スイッチが開いている間、ピンが不定にならずLOW(離している状態)
として読み取られます。余力のある方は「プルダウン」の意味を調べてみてください。

## 実行

プログラムを`gpio_in.rb`として保存し、デバイスの`/home`に配置します
([ファイル転送](../file-transfer/)を参照)。その後、シェルから実行します。

```text
$> ./gpio_in.rb
```

```text
Button: Released
Button: Released
Button: Pressed
Button: Pressed
Button: Released
```

1秒ごとにボタンの状態が表示されます。スイッチを押して、表示が変わることを確認してください。
