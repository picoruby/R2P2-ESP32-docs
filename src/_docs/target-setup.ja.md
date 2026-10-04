---
title: ターゲットのセットアップ
description: ビルドの前に、対象チップ用のセットアップタスクを一度だけ実行します。
---

対象チップでの最初のビルドの前に、そのチップ用のセットアップタスクを一度だけ実行します。
これにより依存関係がインストールされ、ホスト用の`mruby`/`mruby/c`がビルドされたあと、
ESP-IDFが対象ターゲットを指すように設定されます。ターゲットを切り替えたり、
`SDKCONFIG_DEFAULTS`を変更した場合([設定](../settings/)を参照)は、再実行してください。

## ESP-IDFを使う場合

```sh
$ rake setup_esp32   # または setup_esp32c3 / setup_esp32c6 / setup_esp32h2 / setup_esp32p4 / setup_esp32s3
```

## Dockerを使う場合

```sh
$ rake docker:setup_esp32s3   # または docker:setup_esp32, docker:setup_esp32c3, ...
```

初回実行時には、`espressif/idf`ベースのイメージもビルドされます
([環境構築](../environment-setup/)を参照)。Gem(`bundle install`)と
ccacheの出力は、プロジェクトルート下の`.bundle-docker` / `.ccache`(gitignore済み)に
キャッシュされ、実行のたびに再利用されます。ホスト上でもネイティブビルドを行っている
場合、`docker:*`タスクは`components/picoruby-esp32/picoruby/build`以下に残った
ホストアーキテクチャの古い`mrbc`を自動検出して再ビルドします。そうしないと
「ビルド済み」と誤認識され、「file format not recognized」でリンクに失敗します。
`rake docker:reset`は、状態がおかしくなった場合にgem/ccacheキャッシュをクリアします。

## 次のステップ

[ビルド](../build/)に進んでください。
