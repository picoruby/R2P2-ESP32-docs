title "LED blink"
use_boards "../boards/*.bkboard.yml"
board :esp32_wide
use_parts "../parts/*.bkpart.yml"
part :U1, :esp32_devkitc_v4_wroom32e, at: "c2"
lint_disable "Electrical/FloatingPin", reason: "unused DevKitC pins"
lint_disable "Electrical/PowerPinUnconnected", reason: "USB powers the DevKitC"

resistor :R1, "330", pins: %w[e26 e30]
led :D1, color: :red, anode: "d30", cathode: "d32"

wire "a11", "a26", color: :orange, route: :arc # IO26 -> R1
wire "b15", "b32", color: :black, route: :arc  # GND -> LED cathode

expect do
  connected "U1.IO26", "R1.1"
  connected "R1.2", "D1.anode"
  connected "D1.cathode", "U1.GND1"
end
