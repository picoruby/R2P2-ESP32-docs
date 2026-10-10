---
title: Voltage Divider
description: Read an analog voltage with the ADC (picoruby-adc).
---

A GPIO can only tell 1 from 0. To read a voltage that changes continuously
(0 V → 0.5 V → 1.0 V …), use the ADC (analog-to-digital converter).

A joystick or potentiometer would be ideal, but two resistors forming a voltage
divider are enough to try it.

## Parts

- Two resistors of the same value (10 kΩ here)

## Circuit

<%= partial "breadboard", name: "adc-divider", alt: "Breadboard diagram: two 10k resistors in series between 3V3 and GND, with the midpoint connected to GPIO13" %>

| From | To |
| --- | --- |
| 3V3 | Resistor 1 |
| Resistor 1 / Resistor 2 midpoint | GPIO13 |
| Resistor 2 | GND |

With equal resistors, the midpoint sits at half the supply voltage, about
1.65 V.

## Program

```ruby
require 'adc'

input = ADC.new(13)

loop do
  puts "Input: #{input.read_raw}"
  sleep 1
end
```

`read_raw` returns the raw ADC value.

## Run

Save the program as `adc.rb` and put it in `/home` on the device (see
[File Transfer](../file-transfer/)), then run it from the shell:

```text
$> ./adc.rb
```

```text
Input: 2012
Input: 2015
Input: 2011
```

(The exact numbers will differ on your board.)

The ESP32's ADC roughly maps 0–3.3 V to 0–4095, but the recommended input
range is somewhat narrower and the response is not perfectly linear. Treat
the value as an approximate voltage rather than a precise measurement.
