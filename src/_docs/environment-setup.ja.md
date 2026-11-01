---
title: 環境構築
description: Docker(デフォルト)でビルドするか、ESP-IDFをローカルにセットアップしてネイティブでビルドします。お好みの方法をどうぞ。
---

どちらの方法でも、まずはサブモジュールを含めてリポジトリをクローンします。

```sh
$ git clone --recursive https://github.com/picoruby/R2P2-ESP32.git
$ cd R2P2-ESP32
```

ビルド系のタスク(`setup_*`、`build`、`clean`、QEMU関連のタスクなど)は、デフォルトで
Docker上で実行されます。ESP-IDFを使ってホスト上でビルドしたい場合は、対応する
`native:`付きのタスク(例: `rake native:build`)を使います(下記の
「ネイティブでビルドする場合」を参照)。

## Dockerを使う場合(デフォルト)

ビルドは公式の[`espressif/idf`](https://hub.docker.com/r/espressif/idf)イメージを
ベースにしたコンテナ内で行われるため、ESP-IDFをホストにインストールする必要はありません。
ホスト側で用意するのは**Docker**と**Ruby(3.2以降、`rake`の実行用)**だけです。

### 1. DockerとRubyを用意する

Docker(Linuxでは Docker Engine、macOSでは Docker Desktop / Rancher Desktop / Colima など)と
Rubyをインストールし、動作を確認します。

```sh
$ docker run --rm hello-world   # "Hello from Docker!" と表示されればOK
$ ruby --version                # 3.2以降
```

macOSの場合は、続けて下記の「macOS: virtiofsを有効にする」を行ってください。

### 2. あとは通常どおり`rake`タスクを実行する

追加の準備は不要です。[ターゲットのセットアップ](../target-setup/)や[ビルド](../build/)の
`rake`タスクを初めて実行したときに、Dockerイメージ(`docker/Dockerfile`)が自動でビルドされます。
各タスクはコンテナ内で対応する`native:`タスクを実行します
(例: `rake setup_esp32s3` → `rake native:setup_esp32s3`)。

コンテナ内のシェルで作業したい場合は次のコマンドを使います。

```sh
$ rake docker:shell
```

### macOS: virtiofsを有効にする

macOSでは、Dockerのファイル共有方式を**virtiofs**にする必要があります。それ以外の方式
(`gRPC FUSE` / `osxfs` / `reverse-sshfs` / `9p`)ではシンボリックリンクを正しく扱えず、
ビルドが`Operation not permitted`エラーで失敗します。お使いのツールに応じて以下を行ってください。

**Docker Desktop**

1. Docker Desktopの **Settings** → **General** を開く
2. **Virtual Machine Manager** で **Apple Virtualization framework** を選択する
3. ファイル共有方式(**Choose file sharing implementation for your containers**)で **VirtioFS** を選択する
4. **Apply & restart** をクリックする

**Rancher Desktop**

1. **Preferences** → **Virtual Machine** → **Emulation** で **VZ** を選択する
2. **Preferences** → **Virtual Machine** → **Volumes** で **Mount Type** を **virtiofs** にする
3. **Apply** をクリックする(VMが再起動します)

**Colima**

VMを作り直す必要があります(既存のコンテナ・イメージは削除されます)。

```sh
$ colima delete
$ colima start --vm-type vz --mount-type virtiofs
```

### ESP-IDFバージョンの指定

デフォルトで固定されているESP-IDFパッチバージョン(`v5.5.4`、`rakelib/docker.rake`の
`DOCKER_IDF_TAG`を参照)と異なるバージョンを使いたい場合は、
[イメージのタグ一覧](https://hub.docker.com/r/espressif/idf/tags)から`ESP_IDF_DOCKER_TAG`を
設定します。

```sh
$ export ESP_IDF_DOCKER_TAG=v5.5.5
$ rake build
```

### `.env`による設定

ネイティブビルドと異なり、Dockerのタスクがシェル環境から引き継ぐのは
`SDKCONFIG_DEFAULTS`と`USE_WIFI`(設定されている場合)だけです。それ以外の変数を
渡したい場合や、シェルに設定したくない場合は、プロジェクトルートに(gitignore済みの)
`.env`ファイルを置いてください。存在する場合はそのままコンテナに渡されます。
Dockerの`--env-file`形式はシェルのようにクォートを取り除かないため、
**値をクォートしないでください**。

```sh
# .env
SDKCONFIG_DEFAULTS=sdkconfig.defaults;sdkconfigs/usb_console
```

`SDKCONFIG_DEFAULTS`に何を指定するかは[設定](../settings/)を参照してください。

> **Note:** `rake flash` / `rake monitor`はコンテナ内ではなく、常にホスト上で実行されます。
> ほとんどのコンテナ環境(macOS/WindowsのDocker DesktopやRancher Desktop)では、デバイスの
> シリアルポートをコンテナに渡すことができないためです。これはDockerfileやCLIフラグの
> 問題ではなく、それらのLinux VM内からポートそのものが見えないことが原因です。
> `rake build`でビルドしたイメージは、ホスト側から[フラッシュとモニタリング](../flashing/)
> します。これらもフルのESP-IDFインストールは不要です(下記参照)。ネイティブLinuxでは、
> `docker run --device=/dev/ttyUSB0 ...`でシリアルデバイスを渡せば、コンテナ内
> (`rake docker:shell`)から書き込むことも可能です。

## ネイティブでビルドする場合

Dockerではなく、ローカルのESP-IDFを使ってホスト上でビルドするには、`native:`付きの
タスク(`rake native:setup_esp32s3`、`rake native:build`など)を使います。

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

## フラッシュ用gemのインストール

どちらの方法でビルドした場合でも、`rake flash` / `rake monitor`
([フラッシュ](../flashing/)を参照)はホスト上で実行されます。これらは
[esp_flash](https://rubygems.org/gems/esp_flash) gemによって純粋なRubyで実装されているため、
`rake`を実行するRuby(3.2以降)以外には何も必要ありません。ESP-IDFやPython、esptoolは
不要で、Dockerでビルドした`build/`でもそのまま使えます。リポジトリの`Gemfile`に
宣言されたgemを一度インストールしておきます。

```sh
$ bundle install
```

これだけです。フラッシュ・モニタリングだけであれば、ESP-IDFの有効化(activate)は
必要ありません。LinuxとmacOSで動作します(Windowsは未検証です)。

## 次のステップ

[設定](../settings/)でハードウェア固有の設定を確認し、最初のビルドの前に
[ターゲットのセットアップ](../target-setup/)を行ってください。
