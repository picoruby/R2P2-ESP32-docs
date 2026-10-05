---
title: ファイル転送
description: デバイスにファイルを配置する3つの方法 — Webターミナル、Rakeタスク、ビルドへの組み込み。
---

デバイスにファイルを配置するには3つの方法があります。

- **Webターミナルで配置する** — 既存の接続経由でブラウザからアップロードします。
  再ビルドや再フラッシュは不要です。
- **Rakeタスクで配置する** — ホストのコマンドラインからアップロード(ダウンロードも可)
  します。こちらも再ビルドや再フラッシュは不要です。
- **ビルド時に配置する** — ビルドする前にプロジェクトの`storage/`ディレクトリに
  ファイルを置いておき、ファームウェアイメージ自体に組み込みます。

## Webターミナルで配置する

[Webターミナル](https://picoruby.org/terminal)のFile Editor(または任意のシリアル
接続)を使います。[クイックスタート](../quick-start/)で`hello.rb`をアップロードした
のと同じ方法です。素早く試せますが、この方法でアップロードしたものは、デバイスを
消去して再書き込みすると失われます。

## Rakeタスクで配置する

`rakelib/picomodem.rake`には、ホストのコマンドラインからシリアル接続経由でファイルを
転送するタスクが用意されています。`picoruby-picomodem`に同梱のPicoModemクライアントを
使います。`rake setup_<target>`でビルドされたホストの`picoruby`(または環境変数
`PICORUBY`で指定したもの、`PATH`上のもの)で動作します。

```sh
# アップロード: REMOTEを省略するとLOCALのファイル名になります
rake "picomodem:put[hello.rb,/home/hello.rb]"

# ダウンロード: LOCALを省略するとREMOTEのファイル名になります
rake "picomodem:get[/home/hello.rb,hello.rb]"
```

- シェルが`[...]`を解釈しないよう、タスク名は引用符で囲んでください。
- シリアルポートは`rake flash`と同様に`PORT`で指定します(クライアントの
  デフォルトは`/dev/ttyACM0`)。例: `PORT=/dev/ttyUSB0 rake "picomodem:put[...]"`
- デバイスのシェルがプロンプトで待機している必要があります。また、シリアルモニターや
  Webターミナルなど、他のプログラムがポートを使用していないようにしてください。

Webターミナルと同様に、デバイスを消去して再書き込みすると失われます。

## ビルド時に配置する

プロジェクトルートの`storage/`ディレクトリは、そのままデバイス自身のファイルシステムに
なります。現在は2つのサブディレクトリがあります。

```text
storage/
├── etc/
└── home/
```

ビルド時、`main/CMakeLists.txt`は`littlefs_create_partition_image`を使って
`storage/`ディレクトリ全体を[LittleFS](https://github.com/littlefs-project/littlefs)
イメージにまとめ、`partitions.csv`で定義された`storage`パーティション(1MB)に対象化します。
この呼び出しには`FLASH_IN_PROJECT`が含まれているため、`idf.py flash`
(および`rake flash`、[フラッシュとモニタリング](../flashing/)を参照)は
このイメージをアプリと一緒に自動的に書き込みます。特別な手順は不要です。

起動時には、`main_task.rb`がこれをルートボリュームとしてマウントします。

```ruby
Shell.setup_root_volume(:flash, label: 'storage')
```

これにより、実行中の`picoruby-shell`では`storage/home`が`/home`に、`storage/etc`が
`/etc`になります。クイックスタートで見た`/home/hello.rb`というパスと同じ仕組みです。

デフォルトの`/home/app.rb`を同梱したい場合(`mrblib/main_task.rb`を参照 —
`/home/app.mrb`か`/home/app.rb`が存在すれば自動的に`load`します)や、ファームウェアが
依存する設定をコミットしておきたい場合に便利です。

### 例: Wi-Fi自動接続の設定

`rake gen_wifi_config`([Wi-Fiを有効にする](../wifi/)を参照)は、暗号化された
`storage/etc/network/wifi.yml`を書き出し、`main_task.rb`が起動時にこれを読み込んで
自動接続します。これは上記のビルド時に配置する方法の具体例です。

> **注意:** ストレージイメージは`FLASH_IN_PROJECT`付きでビルドされるため、
> デフォルトの`rake flash`([フラッシュとモニタリング](../flashing/)を参照)は
> アプリと一緒にこれを書き換えます。実行時(Webターミナルやrakeタスク)にアップロードしたファイルは、ローカルの
> `storage/`ディレクトリの内容で上書きされてしまいます。アプリだけを更新して
> デバイス上のストレージをそのまま残したい場合は、factory/appパーティションのみを
> 書き換える`rake flash_factory`を使ってください。
