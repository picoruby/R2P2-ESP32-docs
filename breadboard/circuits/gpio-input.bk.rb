title "Switch input"
use_boards "../boards/*.bkboard.yml"
board :esp32_wide
use_parts "../parts/*.bkpart.yml"
part :U1, :esp32_devkitc_v4_wroom32e, at: "c2"
lint_disable "Electrical/FloatingPin", reason: "unused DevKitC pins"
lint_disable "Electrical/PowerPinUnconnected", reason: "USB powers the DevKitC"

button :SW1, at: "f26"

wire "b2", "b26", color: :red, route: :arc      # 3V3 -> switch
wire "a16", "a28", color: :orange, route: :arc  # switch -> IO13

expect do
  connected "U1.3V3", "SW1.1"
  connected "SW1.3", "U1.IO13"
  isolated "U1.3V3", "U1.IO13"
end
