---
title: Overview
description: Simple breadboard circuits and sample programs.
---

These pages walk through small circuits you can build on a breadboard, each with
a wiring diagram and a sample program for R2P2-ESP32.

| Example | Class | What it does |
| --- | --- | --- |
| [LED Blink](../example-led-blink/) | `GPIO` | Digital output |
| [Switch Input](../example-gpio-input/) | `GPIO` | Digital input with pull-down |
| [Piezo Speaker](../example-pwm-piezo/) | `PWM` | Play a scale |
| [Voltage Divider](../example-adc-divider/) | `ADC` | Read an analog voltage |
| [UART Echo](../example-uart-echo/) | `UART` | Serial communication |
| [I2C OLED](../example-i2c-oled/) | `I2C` | Draw on an OLED display |
| [SPI Dot Matrix](../example-spi-matrix/) | `SPI` | Light an 8×8 LED matrix |

## What you need

- An [ESP32-DevKitC](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html)
  running R2P2-ESP32 (see [Quick Start](../quick-start/) or [Build](../build/)).
  Look-alike boards from other vendors may have a different pin assignment.
- A USB cable and a breadboard. A larger breadboard is easier for beginners.
- The parts listed on each page.

All pin numbers in these pages are ESP32 GPIO numbers, which are the numbers
printed as `IO26`, `IO13`, … on the DevKitC.

## About the diagrams

The ESP32-DevKitC is wide: its two pin rows are 10 holes apart, so on a standard
breadboard it leaves little or no room on one side. The diagrams therefore use a
wider breadboard, with free holes beyond both pin rows. If you use a standard
breadboard, wire to the pins with jumper wires instead, or use two breadboards.

The diagrams are drawn with [BreadKit](https://breadkit.github.io/breadkit/).

## Running a program

Each example is a single Ruby file. Put it in `/home` on the device (via the Web
Terminal or `rake "picomodem:put[...]"`, see [File Transfer](../file-transfer/)),
then run it from the shell with `./<file>.rb`.
