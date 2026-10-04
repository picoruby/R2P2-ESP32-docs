---
title: 環境構築
description: ESP-IDFをローカルにセットアップするか、代わりにDockerを使います。お好みの方法をどうぞ。
---

どちらの方法でも、まずはサブモジュールを含めてリポジトリをクローンします。

```sh
$ git clone --recursive https://github.com/picoruby/R2P2-ESP32.git
$ cd R2P2-ESP32
```

## ESP-IDFを使う場合

### 前提条件

[Espressifのインストールガイド](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/get-started/index.html#installation)
に従ってESP-IDFをセットアップしてください。ビルドは**ESP-IDF v5.5**で確認されています。

### ESP-IDFを有効化する

新しいシェルセッションを開始するたびに、ESP-IDFを有効化してツールを`PATH`に追加します。

```sh
$ source ~/.espressif/tools/activate_idf_v5.5.x.sh
$ export PATH="$IDF_PATH/tools:$PATH"
```

続いて、お使いのバージョン管理ツールで対応するRubyを`PATH`に通します。

```sh
# mise
$ mise use ruby@4.0.5
# asdf
$ asdf local ruby 4.0.5
# rbenv
$ rbenv local 4.0.5
```

> **Tip:** [direnv](https://direnv.net/)を使うと、これらの環境変数をプロジェクト
> ディレクトリ内に限定して自動的に適用できるため、毎回手動で有効化する必要がなくなります。

> **Note:** [ターゲットのセットアップ](../target-setup/)は、一部の
> ホスト側ツールをネイティブ(クロスではない)ツールチェーンでビルドします。
> ESP-IDFのクロスツールチェーンが`PATH`に含まれていても通常は自動検出されますが、
> 検出結果が正しくない場合は`HOST_CC` / `HOST_AR`環境変数で上書きしてください。

## Dockerを使う場合

ESP-IDFやRuby、ホストツールチェーンをマシンに直接インストールする代わりに、
公式の[`espressif/idf`](https://hub.docker.com/r/espressif/idf)イメージをベースにした
コンテナ内で完結してビルドすることもできます。このイメージにはすでにESP-IDF、`gcc`、`ruby`が
含まれています。プロジェクトの`docker/Dockerfile`は、そのイメージに不足しているパッケージ
(`ruby-dev`、`libssl-dev`)を追加するだけのものです。`rake docker:*`タスクは、初回実行時に
このイメージを自動的にビルドします。ホスト側に必要なのはDockerだけです。

### macOS: virtiofsを有効にする

プロジェクトディレクトリはコンテナにバインドマウントされるため、Dockerのファイル共有
バックエンドがシンボリックリンクを正しく扱える必要があります。ビルドは
`components/picoruby-esp32/picoruby`以下にベンダリングされたシンボリックリンクを通じて
ファイルの読み書きを行います。

**macOSでは`virtiofs`を有効にする必要があります。** それ以外のバックエンド
(Docker Desktopの`gRPC FUSE` / `osxfs`、Rancher Desktopの`reverse-sshfs` / `9p`)では
`Operation not permitted`エラーが発生します。

### ESP-IDFバージョンの指定

デフォルトで固定されているESP-IDFパッチバージョン(`v5.5.4`、`rakelib/docker.rake`の
`DOCKER_IDF_TAG`を参照)と異なるバージョンを使いたい場合は、
[イメージのタグ一覧](https://hub.docker.com/r/espressif/idf/tags)から`ESP_IDF_DOCKER_TAG`を
設定します。

```sh
$ export ESP_IDF_DOCKER_TAG=v5.5.5
$ rake docker:build
```

### `.env`による設定

ネイティブビルドと異なり、`docker:*`タスクはシェル環境から`SDKCONFIG_DEFAULTS`や
`USE_WIFI`などを読み込みません。代わりに、プロジェクトルートに(gitignore済みの)
`.env`ファイルを置いてください。存在する場合はそのままコンテナに渡されます。
Dockerの`--env-file`形式はシェルのようにクォートを取り除かないため、
**値をクォートしないでください**。

```sh
# .env
SDKCONFIG_DEFAULTS=sdkconfig.defaults;sdkconfigs/usb_console
```

`SDKCONFIG_DEFAULTS`に何を指定するかは[設定](../settings/)を参照してください。

> **Note:** `docker:flash` / `docker:monitor`タスクは用意されていません。ほとんどの
> コンテナ環境(macOS/WindowsのDocker DesktopやRancher Desktop)では、デバイスの
> シリアルポートをコンテナに渡すことができないためです。これはDockerfileやCLIフラグの
> 問題ではなく、それらのLinux VM内からポートそのものが見えないことが原因です。
> `docker:build`でビルドしたイメージは、ホスト側から[フラッシュとモニタリング](../flashing/)
> してください。これらもフルのESP-IDFインストールは不要です。ネイティブLinuxでは、
> `docker run --device=/dev/ttyUSB0 ...`でシリアルデバイスを渡せば、コンテナ内から
> 書き込むことも可能です。

### 必要なツールのインストール

ホスト側でのフラッシュ・モニタリングにも、フルのESP-IDFインストールは不要です。
`rake flash` / `rake monitor`([フラッシュとモニタリング](../flashing/)を参照)は
`idf.py`ではなく`esptool` / `esp-idf-monitor`を直接呼び出すため、Dockerでビルドした
`build/`であっても、ホスト側は次の2つのPythonパッケージだけで動作します。

```sh
$ pip install esptool esp-idf-monitor
```

これだけです。フラッシュ・モニタリングだけであれば、ESP-IDFの有効化(activate)は
必要ありません。(ESP-IDFを直接使ってビルドした場合は、そのインストールの一部として
すでに手元にあります。)

## 次のステップ

[設定](../settings/)でハードウェア固有の設定を確認し、最初のビルドの前に
[ターゲットのセットアップ](../target-setup/)を行ってください。
