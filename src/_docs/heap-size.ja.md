---
title: ヒープ領域を拡張する
description: ビルド時にRuby VMのヒープサイズを上書きします。
---

Ruby VMのヒープは、`components/picoruby-esp32/picoruby-esp32.c`で確保される
固定サイズのプールです。デフォルトサイズはビルド内容によって異なります。

| 条件 | デフォルトの`HEAP_SIZE` |
| --- | --- |
| `CONFIG_SPIRAM`が有効([パーティション](../partitions/) / `sdkconfigs/spiram`を参照) | 1MB(PSRAMから確保) |
| SPIRAMなし、FemtoRuby(mruby/c) | 100KB |
| SPIRAMなし、PicoRuby(mruby) | 220KB |

## 上書きする

ビルド前に`HEAP_SIZE`環境変数(バイト単位)を設定します。

```sh
$ export HEAP_SIZE=524288  # 512KB
$ rake build
```

`USE_WIFI`([Wi-Fiを有効にする](../wifi/)を参照)と同様、これはCMakeがプロジェクトを
構成するときにしか読み込まれません。すでに[ターゲットのセットアップ](../target-setup/)を
これを設定せずに実行済みの場合は、`HEAP_SIZE`をエクスポートした状態でやり直し、
強制的に再構成してください。

```sh
$ export HEAP_SIZE=524288
$ rake setup_esp32   # ビルド対象のターゲットに合わせて
$ rake build
```

SPIRAMがない場合、ヒープは単純な静的配列(`uint8_t heap_pool[HEAP_SIZE]`)です。
そのため、そのチップの内部RAMでは実際には確保できないような`HEAP_SIZE`を指定すると、
リンクエラーになるか、実行時に失敗します。`CONFIG_SPIRAM`が有効な場合は、代わりに
`heap_caps_malloc`でPSRAMから確保されるため、はるかに余裕があります(SPIRAM対応の
ボードは[デバイス](../supported-devices/)を参照)。

## 次のステップ

ヒープではなく、Ruby VMタスク自体のFreeRTOSスタックを制御する設定については
[スタックサイズを拡張する](../stack-size/)を参照してください。
