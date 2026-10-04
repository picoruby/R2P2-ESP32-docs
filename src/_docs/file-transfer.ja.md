---
title: ファイル転送
description: デバイスにファイルを配置する2つの方法 — 実行時に配置するか、ビルドに組み込むか。
---

デバイスにファイルを配置するには2つの方法があります。

- **実行時に配置する** — 既存の接続経由でアップロードします。再ビルドや
  再フラッシュは不要です。
- **ビルド時に配置する** — ビルドする前にプロジェクトの`storage/`ディレクトリに
  ファイルを置いておき、ファームウェアイメージ自体に組み込みます。

## 実行時に配置する

[Webターミナル](https://picoruby.org/terminal)のFile Editor(または任意のシリアル
接続)を使います。[クイックスタート](../quick-start/)で`hello.rb`をアップロードした
のと同じ方法です。素早く試せますが、この方法でアップロードしたものは、デバイスを
消去して再書き込みすると失われます。

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
> アプリと一緒にこれを書き換えます。実行時にアップロードしたファイルは、ローカルの
> `storage/`ディレクトリの内容で上書きされてしまいます。アプリだけを更新して
> デバイス上のストレージをそのまま残したい場合は、factory/appパーティションのみを
> 書き換える`rake flash_factory`を使ってください。
