title "Piezo speaker"
use_boards "../boards/*.bkboard.yml"
board :esp32_wide
use_parts "../parts/*.bkpart.yml"
part :U1, :esp32_devkitc_v4_wroom32e, at: "c2"
lint_disable "Electrical/FloatingPin", reason: "unused DevKitC pins"
lint_disable "Electrical/PowerPinUnconnected", reason: "USB powers the DevKitC"

part :BZ1, :piezo_speaker, pins: %w[j26 j28]

wire "m16", "m26", color: :orange, route: :arc # IO2 -> piezo
wire "n8", "n28", color: :black, route: :arc   # GND -> piezo

expect do
  connected "U1.IO2", "BZ1.1"
  connected "BZ1.2", "U1.GND2"
end
