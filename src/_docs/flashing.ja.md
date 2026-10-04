---
title: フラッシュ
description: rake flashで、自分でビルドしたイメージをデバイスに書き込みます。
---

ビルドしたイメージをデバイスに書き込みます。

```sh
$ rake flash
```

これは`esptool`を直接呼び出し、`idf.py build`が生成した
`build/project_description.json`と`build/flash_args`からターゲットとオフセットを
読み取ります。そのため、直前にビルドしたターゲット・VMに常に一致します
([設定](../settings/)、[ビルド](../build/)を参照)。

## ポートを指定する

シリアルポートが正しく自動検出されない場合(複数のデバイスが接続されているなど)は、
`PORT`を設定してください。

```sh
$ PORT=/dev/tty.usbserial-0001 rake flash
```

## アプリだけ、またはストレージだけを書き込む

すべてを書き換えたくない場合は、より対象を絞った2つのタスクが用意されています。

```sh
$ rake flash_factory  # アプリパーティションのみを消去・再書き込み
$ rake flash_storage  # ストレージパーティションのみを消去・再書き込み
```

デバイス上のファイルはそのままにアプリだけを更新したい場合は`rake flash_factory`を
使います。デフォルトの`rake flash`がなぜストレージも書き換えてしまうのかについては、
[ファイル転送](../file-transfer/)を参照してください。

## 次のステップ

[モニタリング](../monitoring/)に進み、デバイスのシリアル出力を確認しましょう。
