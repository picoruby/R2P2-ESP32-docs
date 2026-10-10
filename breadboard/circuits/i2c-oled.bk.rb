title "I2C OLED"
use_boards "../boards/*.bkboard.yml"
board :esp32_wide
use_parts "../parts/*.bkpart.yml"
part :U1, :esp32_devkitc_v4_wroom32e, at: "c2"
lint_disable "Electrical/FloatingPin", reason: "unused DevKitC pins"
lint_disable "Electrical/PowerPinUnconnected", reason: "USB powers the DevKitC"

offboard :OLED, :ssd1306_oled_i2c, side: :right

wire "OLED.VCC", "b2", color: :red, route: :arc
wire "OLED.GND", "m8", color: :black, route: :arc
wire "OLED.SCL", "m4", color: :yellow, route: :arc
wire "OLED.SDA", "n7", color: :blue, route: :arc

expect do
  connected "OLED.VCC", "U1.3V3"
  connected "OLED.GND", "U1.GND2"
  connected "OLED.SCL", "U1.IO22"
  connected "OLED.SDA", "U1.IO21"
end
