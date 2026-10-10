title "UART echo"
use_boards "../boards/*.bkboard.yml"
board :esp32_wide
use_parts "../parts/*.bkpart.yml"
part :U1, :esp32_devkitc_v4_wroom32e, at: "c2"
lint_disable "Electrical/FloatingPin", reason: "unused DevKitC pins"
lint_disable "Electrical/PowerPinUnconnected", reason: "USB powers the DevKitC"

offboard :SER, :usb_serial, side: :right, unused: ["5V"]

wire "SER.TX", "m6", color: :green, route: :arc    # -> ESP32 RX
wire "SER.RX", "n5", color: :yellow, route: :arc   # -> ESP32 TX
wire "SER.GND", "m8", color: :black, route: :arc
wire "SER.3V3", "b2", color: :red, route: :arc

expect do
  connected "SER.TX", "U1.RX"
  connected "SER.RX", "U1.TX"
  connected "SER.GND", "U1.GND2"
  connected "SER.3V3", "U1.3V3"
end
