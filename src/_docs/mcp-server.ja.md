---
title: MCPサーバー
description: 同梱のMCPサーバーを使って、AIアシスタントにR2P2-ESP32のビルド・書き込み・デバイス操作を任せます。
---

R2P2-ESP32リポジトリには[MCP](https://modelcontextprotocol.io/)サーバー(`mcp/`)が
同梱されています。AIアシスタントが開発ループ全体を回せるようになります。具体的には、
ビルド、書き込み、デバイスとのやり取り(シェルコマンド、ログ、ファイル転送)、
[QEMU](../qemu/)による実機なしの動作確認、mrbgemの管理です。

> **ステータス:** デバイス系ツールはQEMUでのみ動作確認しており、実機ではまだ
> 試していません。実機での未確認事項: USB Serial/JTAGポートを開くとボードが
> リセットされる可能性(DTR/RTS)があること、`flash`は固定2秒待ってから再接続する
> ことです。

## 必要なもの

- Ruby(ビルドにリポジトリが要求するバージョン)とBundler
- Docker(デフォルトのビルド環境。[環境構築](../environment-setup/)を参照)
- サブモジュールの取得: `git submodule update --init --recursive`

## インストール

```sh
$ cd mcp
$ bundle install
```

MCPクライアントがサーバーを起動するときと同じRubyを使ってください。gemが不足して
いる場合、サーバーは起動時にstderrへヒントを出して終了します。表示された
`bundle install`を実行してからサーバーを再起動してください。

## MCPクライアントへの登録

リポジトリ直下に`.mcp.json`があるため、Claude Codeをこのリポジトリで起動すると
サーバーが自動的に認識されます(確認を求められたら承認してください)。他のクライアント
では、`mcp/bin/r2p2-esp32-mcp`をstdioサーバーとして起動します。例:

```sh
$ claude mcp add r2p2-esp32 -- /path/to/R2P2-ESP32/mcp/bin/r2p2-esp32-mcp
```

## 典型的な流れ

1. `target: "esp32s3"`、`sdkconfigs: ["usb_console", "spiram"]`で`setup`
2. `build`(デフォルトはpicoruby VM。`sdkconfigs`は同じものを指定)
3. `flash` — 完了後、サーバーはポートに再接続します
4. `device_upload`でスクリプトをアップロードし、`device_exec`(`./app.rb`)で実行、
   `device_log`で結果を確認

手順1〜3はジョブの完了を待って戻ります。`sdkconfigs`は`sdkconfigs/`配下の
フラグメントファイル名(`usb_console`、`spiram`など)で、`SDKCONFIG_DEFAULTS`に
指定するものと同じです([設定](../settings/)を参照)。`use_wifi`は`USE_WIFI=1`を
設定します。どちらも変更した場合は`setup`をやり直す必要があります。

## ツール

### ビルド系ツール

`setup`、`build`、`clean`、`flash`はrakeタスクをジョブとして実行し、**完了を待ちます**
(`timeout`、デフォルト300秒。`0`なら即座に戻ります)。それより長くかかる場合はジョブは
動き続け、その旨が返るので、`job_wait`で待ってください。同時に実行できるジョブは1つ
だけです。`native: true`を渡さない限り、すべてDocker(`rake docker:*`)で実行されます。

| ツール | 引数 | 内容 |
|--------|------|------|
| `setup` | `target`(必須: `esp32`、`esp32c3`、`esp32c6`、`esp32h2`、`esp32p4`、`esp32s3`)、`sdkconfigs`、`use_wifi`、`native`、`timeout` | `rake setup_<target>`。`sdkconfig`は`SDKCONFIG_DEFAULTS`をキャッシュするため、先に削除します。 |
| `build` | `vm`(`picoruby`(デフォルト) / `femtoruby`)、`sdkconfigs`、`use_wifi`、`native`、`timeout` | `rake <vm>:build` |
| `clean` | `deep`、`native`、`timeout` | `rake clean`。`deep: true`なら`deep_clean` |
| `job_wait` | `job_id`(デフォルト: 最新)、`timeout` | 実行中だったジョブの完了を待って結果を返す |
| `job_status` | `job_id`(デフォルト: 最新) | 待たずに実行中/成功/失敗を返す。失敗時はエラー行と末尾20行のログを含む |
| `job_log` | `job_id`、`lines`(デフォルト100) | ジョブログの末尾 |

### デバイス系ツール

サーバーが保持する1本の接続を通じて、デバイスの`picoruby-shell`とやり取りします。

| ツール | 引数 | 内容 |
|--------|------|------|
| `serial_list_ports` | | `/dev/ttyACM*`、`ttyUSB*`、`cu.usb*`のポート一覧 |
| `serial_connect` | `port`(必須)、`baud` | シリアルデバイスまたは`tcp://host:port`(QEMUのUARTなど)に接続し、`$> `プロンプトを確認。以前の接続は置き換えられます。 |
| `serial_disconnect` | | ポートを解放(`rake monitor`やWebターミナルを使う前に実行) |
| `device_exec` | `command`(必須)、`timeout`(デフォルト10秒) | シェルコマンドを実行し、プロンプトが戻ったら出力を返す。タイムアウト時はCtrl-C、それでも戻らなければ(`irb`内など)Ctrl-D。シェルがコマンドをエコーしなかった場合(起動中またはハング)は何も送信しません。 |
| `device_log` | `lines`(デフォルト100)、`since_last` | 接続以降にデバイスが出力したすべて(直近256 KiBを保持)。クラッシュの目印(`Guru Meditation`、`Backtrace:`、`assert failed`など)を先頭に列挙します。 |
| `device_reset` | `timeout`(デフォルト60秒) | シェルの`reboot`を実行し、次のプロンプトまでのブートログを返す。プロンプトが来ない場合、シリアルデバイスはDTR/RTSでリセットされます。 |
| `device_upload` | `remote_path`、`local_path`または`content` | `rake picomodem:put`でデバイスにファイルを書き込む(CRC32検証付き)。`content`ならローカルファイルなしでテキストをアップロードできます。 |
| `device_download` | `remote_path`(必須)、`local_path` | `rake picomodem:get`でデバイスからファイルを読み出し、ローカルに保存 |
| `flash` | `port`、`reconnect`(デフォルトtrue)、`timeout` | ホスト側で`rake flash`を実行。先にシリアルポートを解放し、成功後に再接続します。`tcp://`ポートに接続中は使えません。 |

ファイル転送には、シェルがプロンプト状態であること(`irb`内ではない)と、`setup`で
ビルドされたホスト用`picoruby`が必要です。macOSでは、Dockerのみのビルドだとここに
Linux用バイナリが残るため、一度ネイティブで`rake setup_<target>`を実行してください。

### QEMU系ツール

ハードウェアなしでファームウェアを動かします(QEMU上のESP32-S3。周辺機器やWiFiは
なし)。ロジックやスクリプトの確認向けで、制限事項は[QEMU上で動作させる](../qemu/)を
参照してください。UARTは`tcp://127.0.0.1:5555`で公開され、シリアルポートと同様に
接続されるため、`device_*`ツールがすべてそのまま使えます。

| ツール | 引数 | 内容 |
|--------|------|------|
| `qemu_start` | `vm`、`native`、`timeout`(デフォルト120秒) | `rake qemu_serve`: `build-qemu`をビルド(自動セットアップ。初回は数分かかります)し、新しい`/home`でDocker上のQEMUを起動、シェルに接続します。 |
| `qemu_status` | `lines` | 実行中/ビルド中の状態と、rake/ビルド出力の末尾 |
| `qemu_stop` | | QEMUを停止(`/home`は破棄されます) |

### mrbgem系ツール

ファームウェアに含まれるgemは`components/picoruby-esp32/build_config/*.rb`
(アーキテクチャ × VMごとに1ファイル)で決まります。自作gemはリポジトリ直下の
`mrbgems/`に置きます。

| ツール | 引数 | 内容 |
|--------|------|------|
| `mrbgem_list` | `query`、`enabled_only` | gemの一覧(自作が先、次にpicoruby)と、それぞれが有効な場所。「via X」はgemboxが提供していることを示します |
| `mrbgem_enable` | `name`、`vm`、`arch` | gemをビルド設定に追加(デフォルトは4つすべて)。`picoruby-`プレフィックスは省略可 |
| `mrbgem_disable` | `name`、`vm`、`arch` | 削除。gemboxが提供するgemはこの方法では削除できません |
| `mrbgem_scaffold` | `name`、`summary`、`author`、`enable` | `mrbgems/picoruby-<name>/`(純Ruby)を作成。両VMで`require "<name>"`として使えます |

gemを変更したら`build`を実行します(ハードウェアなしで試すなら`qemu_start`)。
C言語のコードを含むgemはscaffoldされません。既存のgem(例: `picoruby-base64`)を
コピーして出発点にしてください。
