title "SPI dot matrix"
use_boards "../boards/*.bkboard.yml"
board :esp32_wide
use_parts "../parts/*.bkpart.yml"
part :U1, :esp32_devkitc_v4_wroom32e, at: "c2"
lint_disable "Electrical/FloatingPin", reason: "unused DevKitC pins"
lint_disable "Electrical/PowerPinUnconnected", reason: "USB powers the DevKitC"

offboard :MAT, :max7219_matrix, side: :right

wire "MAT.VCC", "b20", color: :red, route: :arc
wire "MAT.GND", "n8", color: :black, route: :arc
wire "MAT.DIN", "m3", color: :blue, route: :arc
wire "MAT.CS", "n11", color: :green, route: :arc
wire "MAT.CLK", "m10", color: :yellow, route: :arc

expect do
  connected "MAT.VCC", "U1.5V"
  connected "MAT.GND", "U1.GND2"
  connected "MAT.DIN", "U1.IO23"
  connected "MAT.CS", "U1.IO5"
  connected "MAT.CLK", "U1.IO18"
end
