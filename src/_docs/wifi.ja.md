---
title: Wi-Fiを有効にする
description: USE_WIFIでWi-Fiサポートをビルドに組み込みます。
---

Wi-Fiのネイティブコード(`Network::WiFi` / `ESP32::WiFi`、および`picoruby-socket`の
Wi-Fi経由の`TCPServer`/`TCPSocket`)は、デフォルトでは**組み込まれていません**。
有効にするには、ビルド前に`USE_WIFI`環境変数を設定してください
([ビルド](../build/)を参照)。

```sh
$ export USE_WIFI=1
$ rake build
```

これは、例えば[mrdebug](https://github.com/yuuu/mruby-debug)の
Wi-Fi経由のリモートデバッグを使う場合に必要です
([デバッグ](../debugging/)を参照)。

> **Note:** `USE_WIFI`はCMakeがプロジェクトを構成するときにしか読み込まれず、
> ビルドのたびに読まれるわけではありません。すでに[ターゲットのセットアップ](../target-setup/)や
> ビルドを`USE_WIFI`を設定せずに実行している場合、単に`USE_WIFI=1 rake build`と
> しても反映されず、`undefined reference to 'ESP32_WIFI_init'`のような
> リンクエラーになることがあります。`USE_WIFI=1`をエクスポートした状態で
> ターゲットのセットアップをやり直し、強制的に再構成してください。
>
> ```sh
> $ export USE_WIFI=1
> $ rake setup_esp32   # ビルド対象のターゲットに合わせて
> $ rake build
> ```

## 起動時に自動接続する

`storage/etc/network/wifi.yml`に暗号化されたWi-Fi認証情報ファイルを生成すると
([ファイル転送](../file-transfer/)を参照)、
`main_task.rb`が起動のたびにこれを読み込んで自動接続します。

```sh
$ rake gen_wifi_config SSID=your-ssid PASSWORD=your-password UNIQUE_ID=your-device-unique-id
```

- `UNIQUE_ID`はデバイス自身の`Machine.unique_id`から取得します。一度接続して
  ([クイックスタート](../quick-start/)の`irb`など)、`Machine.unique_id`を
  実行して確認してください。
- 任意項目: `AUTO_CONNECT`(デフォルト`true`)、`RETRY_IF_FAILED`
  (デフォルト`true`)、`WATCHDOG`(デフォルト`false`)、`COUNTRY_CODE`。

このファイルを生成したあとは、再ビルド・再フラッシュするか、`wifi.yml`を
デバイスに直接アップロードするのを忘れないでください。

## デバイス上で設定する(`nmcli`)

ビルド前にパソコン側で`wifi.yml`を生成する代わりに、デバイス自身のシェル
([クイックスタート](../quick-start/)を参照)から`nmcli`を実行して、動作中の
デバイスに直接書き込むこともできます。デバイス自身がすでに`Machine.unique_id`
を知っているので、事前に調べる必要はありません。

```text
$> nmcli
Ctrd-D to exit
Country Code? [JP]
WiFi SSID? your-ssid
WiFi Password? (leave blank if no password required)
Auto Connect? (y/n) [y]
Retry if failed? (y/n) [n]
Use Watchdog? (y/n) [n]

Successfully saved to /etc/network/wifi.yml
$> reboot
```

`nmcli`はファイルを書き込むだけです。デバイスは上記と同じ方法でこのファイルを
読み込んで自動接続しますが、それは次回起動時だけなので、反映させるには
`reboot`(または電源の入れ直し)が必要です。

> **Note:** これは実行時の変更のため([ファイル転送](../file-transfer/)を参照)、
> デバイス上にしか残りません。あとから`rake flash`を実行すると、ローカルの
> `storage/`ディレクトリの内容(またはその欠如)で上書きされてしまいます。
> オンデバイスのストレージに触れずにアプリだけを再フラッシュしたい場合は、
> 代わりに`rake flash_factory`を使ってください。
