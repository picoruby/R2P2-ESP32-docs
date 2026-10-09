---
title: SPI Dot Matrix
description: Light an 8x8 LED matrix over SPI (picoruby-spi).
---

The last of the common bus protocols is SPI. This is the one used in the
author's RubyKaigi 2025 demo.

## Parts

- A MAX7219 8×8 dot-matrix LED module

## Circuit

<%= partial "breadboard", name: "spi-matrix", alt: "Breadboard diagram: a MAX7219 module wired VCC to 5V, GND to GND, DIN to GPIO23, CS to GPIO5 and CLK to GPIO18" %>

| MAX7219 module | ESP32-DevKitC |
| --- | --- |
| VCC | 5V |
| GND | GND |
| DIN | GPIO23 (VSPI MOSI) |
| CS | GPIO5 (VSPI SS) |
| CLK | GPIO18 (VSPI SCLK) |

## Program

Like the OLED, the module defines its commands in a datasheet. The program
first sends the initialization commands, then switches each LED on or off
with one bit per LED, eight rows of eight.

```ruby
require 'spi'

spi = SPI.new(unit: 'ESP32_VSPI_HOST', frequency: 10_000_000, sck_pin: 18, cipo_pin: 19, copi_pin: 23, cs_pin: 5, mode: 0, first_bit: 0)

spi.write([0x0c, 0x01])
spi.write([0x09, 0x00])
spi.write([0x0a, 0x0f])
spi.write([0x0b, 0x07])

[
  0b01010101,
  0b10101010,
  0b01010101,
  0b10101010,
  0b01010101,
  0b10101010,
  0b01010101,
  0b10101010,
].each_with_index do |val, i|
  spi.write([i + 1, val])
end

loop { sleep_ms(500) }
```

## Run

Save the program as `spi.rb` and put it in `/home` on the device (see
[File Transfer](../file-transfer/)), then run it from the shell:

```text
$> ./spi.rb
```

A checkerboard pattern should light up on the dot matrix.
