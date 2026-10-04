---
title: デバッグ
description: picoruby-debugによるRubyレベルのインタラクティブなデバッグ。
---

ブレークポイント、ステップ実行、ローカル変数の確認といったRubyレベルのデバッグを
行うには、[picoruby-debug](https://github.com/yuuu/picoruby-debug)を
[設定](../settings/)に追加します。対応しているのはPicoRuby(mruby)VMのみで、
FemtoRuby(mruby/c)では「unsupported」と表示されるだけで何も行いません。

```ruby
# components/picoruby-esp32/build_config/xtensa-esp-picoruby.rb (または riscv-*) 内
conf.gem github: 'yuuu/picoruby-debug', branch: 'main'
```

## ブレークポイント

スクリプトに`binding.debugger`を挿入します。

```ruby
require 'debug'

a = 1
b = 2
binding.debugger # または binding.b / binding.break
c = a + b
puts c
```

これを実行すると`binding.debugger`の行で一時停止し、既存のシリアル接続上で
インタラクティブなプロンプトに入ります。

```text
Breakpoint: /test.rb:5
(prdb)>
```

`(prdb)>`プロンプトでの主なコマンド:

| コマンド | 説明 |
| --- | --- |
| `c` / `continue` | 次のブレークポイントまで再開 |
| `s` / `step` | 呼び出し先にも入りながら次の行で停止 |
| `n` / `next` | 同じ/より浅いフレームの次の行で停止 |
| `b [file:]line` | ブレークポイントを追加、引数なしなら一覧表示 |
| `bt` / `where` | コールスタックを表示 |
| `p expr` | 選択中のフレームに対して`expr`を評価して表示 |
| `w expr` | `expr`の値が変化するたびに自動的に停止 |
| `q` / `quit` | スクリプトを停止 |

コマンドの全リファレンス(フレーム移動、表示式など)は
[picoruby-debugのREADME](https://github.com/yuuu/picoruby-debug)を参照してください。

## Wi-Fi経由のリモートデバッグ(DAP)

ビルドに`picoruby-socket`も含まれている場合、picoruby-debugはポート4711で
[Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)
サーバーとして動作でき、VS CodeなどのエディタからDAP経由で(あるいは`(prdb)`
プロンプトと併用して)操作できます。`picoruby-socket`が利用可能であれば
デフォルトで有効になっており、通常どおり`require 'debug'`して最初の
`binding.debugger`に到達すればよいだけです(DAPクライアントとのハンドシェイクが
完了するまでそこでブロックします)。これが[Wi-Fiを有効にする](../wifi/)
(`USE_WIFI=1`)の使いどころです。
