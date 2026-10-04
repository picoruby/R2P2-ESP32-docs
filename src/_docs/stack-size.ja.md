---
title: スタックサイズを拡張する
description: ビルド時にRuby VMタスクのFreeRTOSスタックサイズを上書きします。
---

Ruby VMは専用のFreeRTOSタスク(`components/picoruby-esp32/picoruby-esp32.c`)上で
動作しており、`xTaskCreatePinnedToCore`で固定サイズのスタックとともに作成されます。
これはVMがオブジェクトを確保する[ヒープ](../heap-size/)とは別物です。デフォルトは
8KB(`PICORB_TASK_STACK_SIZE`、バイト単位)です。

```c
#ifndef PICORB_TASK_STACK_SIZE
#define PICORB_TASK_STACK_SIZE (1024 * 8)
#endif
```

深い再帰や、ローカル変数のフレームが大きいコードはこれを超えてクラッシュすることが
あります。スタックオーバーフローが発生した場合は、これを増やしてください。

```sh
$ export PICORB_TASK_STACK_SIZE=16384  # 16KB
$ rake build
```

`HEAP_SIZE`や`USE_WIFI`と同様、これはCMakeがプロジェクトを構成するときにしか
読み込まれません。すでに[ターゲットのセットアップ](../target-setup/)をこれを
設定せずに実行済みの場合は、`PICORB_TASK_STACK_SIZE`をエクスポートした状態で
やり直し、強制的に再構成してください。

```sh
$ export PICORB_TASK_STACK_SIZE=16384
$ rake setup_esp32   # ビルド対象のターゲットに合わせて
$ rake build
```

## 次のステップ

Ruby VMがオブジェクトのために使えるメモリ量を制御する設定については
[ヒープ領域を拡張する](../heap-size/)を参照してください。
