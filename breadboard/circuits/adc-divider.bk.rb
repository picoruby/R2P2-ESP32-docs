title "Voltage divider"
use_boards "../boards/*.bkboard.yml"
board :esp32_wide
use_parts "../parts/*.bkpart.yml"
part :U1, :esp32_devkitc_v4_wroom32e, at: "c2"
lint_disable "Electrical/FloatingPin", reason: "unused DevKitC pins"
lint_disable "Electrical/PowerPinUnconnected", reason: "USB powers the DevKitC"

resistor :R1, "10k", pins: %w[f26 f29]
resistor :R2, "10k", pins: %w[c29 c32]

wire "b2", "b26", color: :red, route: :arc      # 3V3 -> R1
wire "a16", "a29", color: :orange, route: :arc  # midpoint -> IO13
wire "b15", "b32", color: :black, route: :arc   # R2 -> GND

expect do
  connected "U1.3V3", "R1.1"
  connected "R1.2", "R2.1"
  connected "R2.1", "U1.IO13"
  connected "R2.2", "U1.GND1"
end
