---
title: デバッグ
description: mrdebugによるRubyレベルのインタラクティブなデバッグ。
---

ブレークポイント、ステップ実行、ローカル変数の確認といったRubyレベルのデバッグを
行うには、[mrdebug](https://github.com/yuuu/mruby-debug)(`picoruby-debug`
から改名)を[設定](../settings/)に追加します。対応しているのはPicoRuby
(mruby)VMのみです。FemtoRuby(mruby/c)にはこれが使うデバッグフックが
存在しません。

```ruby
# components/picoruby-esp32/build_config/xtensa-esp-picoruby.rb (または riscv-*) 内
conf.gem github: 'yuuu/mruby-debug', branch: 'main', path: 'console'
```

`path: 'console'`のサブgemが、以下で使うデバイスのコンソール上の
`(mrdbg)`プロンプトを追加するものです。これを外しても`mrdebug`自体は
使えますが、その場合デバイスはローカルでプロンプトを出す代わりに、常に
TCPポート4711で待ち受けるようになります([Wi-Fi経由のリモートデバッグ](#remote-debugging-over-wifi)を参照)。

> **Note:** PicoRubyのタスクスタックも最低32768バイトまで引き上げてください — `PICORB_TASK_STACK_SIZE=32768`
> ([スタックの拡張](../stack-size/)を参照)。デフォルトの8KBでは、
> デバッガが停止した時点でオーバーフローします。

## ブレークポイント

スクリプトに`binding.debugger`を挿入します。`require`は不要です。

```ruby
def add(a, b)
  a + b
end

x = 1
binding.debugger # または binding.b / binding.break
y = add(x, 2)
puts y
```

これを実行すると`binding.debugger`の行で一時停止し、既存のシリアル接続上で
インタラクティブなプロンプトに入ります。

```text
$> ./script.rb
Stop: script.rb:6
(mrdbg)
```

`(mrdbg)`プロンプトでの主なコマンド:

| コマンド | エイリアス | 説明 |
| --- | --- | --- |
| `continue` | `c`、空入力 | 次のブレークポイントまで再開 |
| `step [<n>]` | `s` | 呼び出し先にも入りながら次に実行される行で停止 |
| `next [<n>]` | `n` | 同じ/より浅いフレームの次の行で停止 |
| `finish` | `fin` | 選択中のフレームがreturnするまで実行 |
| `break [<file>:]<line> [if <expr>]` | `b` | ブレークポイントを追加(引数なしなら一覧表示) |
| `break <Class>#<method>` | `b` | メソッドブレークポイントを追加(`#`はインスタンス、`.`は特異メソッド) |
| `watch [<expr>]` | | `<expr>`の値が変化するたびに停止 |
| `print <expr>` | `p` | 選択中のフレームに対して`<expr>`を評価して表示 |
| `backtrace` | `bt` / `where` | コールスタックを表示 |
| `help [<command>]` | `h` | コマンド一覧、または`<command>`の使い方を表示 |

コマンドの全リファレンス(フレーム移動、表示式など)は
[mrdebugのREADME](https://github.com/yuuu/mruby-debug)を参照してください。

## Wi-Fi経由のリモートデバッグ {#remote-debugging-over-wifi}

ビルドに`picoruby-socket`も含まれている場合([Wi-Fiを有効にする](../wifi/)
の`USE_WIFI=1`はこのためにあります)、mrdebugは上記のオンデバイスコンソール
プロンプトの代わりに(あるいはそれと併用して)TCPポートで待ち受けることが
できます。`console`サブgemを使っている場合、これはオプトインです。
`storage/etc/config.yml`に`mrdebug_port`を設定してください(R2P2は起動時に
`env:`セクションを`ENV`へ読み込みます)。

```yaml
env:
  mrdebug_port: 4711
```

または、そのシェルセッション限りでよければ、スクリプトを実行する前に
`export MRDEBUG_PORT=4711`します。これで、次の`binding.debugger`で
デバイスはローカルの`(mrdbg)`プロンプトを開く代わりに、クライアントの
接続を待つようになります。

パソコン側からは、[mruby-debug](https://github.com/yuuu/mruby-debug)
リポジトリのホストビルドで得られる`mrdbg`CLIで接続します。

```sh
$ mrdbg --host 192.168.0.10 --port 4711
```

あるいはVS Codeから操作することもできます。`mrdbg`がデバイスのソケットを
[Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)
のポートへブリッジします。

```sh
$ mrdbg --host 192.168.0.10 --port 4711 --dap-port 12345
```

その上で、`localhost:12345`を指す`launch.json`の`attach`設定から
[vscode-rdbg](https://marketplace.visualstudio.com/items?itemName=KoichiSasada.vscode-rdbg)
で接続します。`tasks.json`/`launch.json`の完全な設定例はmruby-debugの
READMEを参照してください。
