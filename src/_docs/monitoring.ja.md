---
title: モニタリング
description: rake monitorで、デバイスのシリアル出力を確認します。
---

デバイスに接続したシリアルターミナルを開きます。

```sh
$ rake monitor
```

これは`esp-idf-monitor`を直接呼び出します(`esp_idf_monitor`のPythonモジュールが
importできない場合は`idf-monitor`実行ファイルにフォールバックします)。ボーレートと、
バックトレースのシンボル解決に使うELFファイルのパスは`build/project_description.json`
から読み取るため、`rake flash`と同様に直前のビルドに常に一致します。

## ポートを指定する

フラッシュのときと同様に、自動検出が誤ったデバイスを選んでしまう場合は`PORT`を
設定してください。

```sh
$ PORT=/dev/tty.usbserial-0001 rake monitor
```

## 次のステップ

デバイスへの書き込みが完了し、出力を確認できたら、[高度な使い方](../wifi/)で
Wi-Fiの有効化やメモリのチューニング、QEMUでの実行に進むか、
[クイックスタート](../quick-start/)に戻って`picoruby-shell`自体の使い方を
おさらいしてください。
