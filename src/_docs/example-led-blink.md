---
title: LED Blink
description: Blink an LED with GPIO output (picoruby-gpio).
---

Start with the "hello world" of electronics: switch a GPIO pin on and off to
blink an LED.

## Parts

- An LED (any color)
- A resistor of about 330 Ω

> Strictly speaking, the resistor value should be calculated from the LED's
> rated current, but around 330 Ω works for most LEDs.

## Circuit

<%= partial "breadboard", name: "led-blink", alt: "Breadboard diagram: GPIO26 goes through a 330 ohm resistor and an LED to GND" %>

| From | To |
| --- | --- |
| GPIO26 | Resistor, then LED anode (the longer leg) |
| LED cathode (the shorter leg) | GND |

LEDs are polarized: the longer leg is the anode and must be on the GPIO side.

## Program

```ruby
require 'gpio'
require 'machine'

led = GPIO.new(26, GPIO::OUT)

loop do
  led.write(1)
  Machine.delay_ms(1000)
  led.write(0)
  Machine.delay_ms(1000)
end
```

Every second, the program toggles the pin between 1 (HIGH) and 0 (LOW).

## Run

Save the program as `gpio_out.rb` and put it in `/home` on the device (see
[File Transfer](../file-transfer/)), then run it from the shell:

```text
$> ./gpio_out.rb
```

The LED should blink once per second.
