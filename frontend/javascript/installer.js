import "esp-web-tools/dist/install-button.js"

// Flashes R2P2-ESP32 firmware straight from the browser via Web Serial,
// using the official ESP Web Tools component. Firmware choices come from
// the latest R2P2-ESP32 GitHub release, which `rake firmware:fetch`
// mirrors into /firmware/ at build time (GitHub release downloads send no
// CORS headers, so the browser can't fetch them directly). The scheduled
// workflow in .github/workflows/update-firmware.yml keeps it fresh.
//
// Release assets are single merged images (bootloader + partition table +
// app, produced by `esptool merge_bin`/`idf.py merge-bin` in CI) named
// `R2P2-ESP32-{chip}[-{variant}]-{ruby}.bin`. Each is flashed as the single
// manifest part for its chip, at that chip's bootloader offset.
// Bootloader flash offsets, taken from ESP Web Tools' own chip ROM
// definitions (`BOOTLOADER_FLASH_OFFSET` in `esp-web-tools/dist/web/*.js`).
// Verified against the actual release assets: each `.bin` starts with the
// ESP image magic byte (0xE9) at position 0, i.e. it's meant to be flashed
// starting at exactly this offset.
const BOOTLOADER_OFFSET = {
  esp32: 0x1000,
  esp32c3: 0x0,
  esp32c6: 0x0,
  esp32h2: 0x0,
  esp32p4: 0x2000,
  esp32s3: 0x0,
}

const CHIP_FAMILY = {
  esp32: "ESP32",
  esp32c3: "ESP32-C3",
  esp32c6: "ESP32-C6",
  esp32h2: "ESP32-H2",
  esp32p4: "ESP32-P4",
  esp32s3: "ESP32-S3",
}

const CHIP_LABEL = {
  esp32: "ESP32",
  esp32c3: "ESP32-C3",
  esp32c6: "ESP32-C6",
  esp32c6_usb_console: "ESP32-C6 (USB Console)",
  esp32h2: "ESP32-H2",
  esp32h2_usb_console: "ESP32-H2 (USB Console)",
  esp32p4: "ESP32-P4",
  esp32p4_usb_console: "ESP32-P4 (USB Console)",
  esp32s3: "ESP32-S3",
  esp32s3_usb_console: "ESP32-S3 (USB Console)",
}

const RUBY_LABEL = {
  femtoruby: "FemtoRuby (mruby/c)",
  picoruby: "PicoRuby (mruby)",
}

function parseAssets(assets, baseUrl) {
  return assets
    .filter((a) => a.name.endsWith(".bin"))
    .map((a) => {
      // R2P2-ESP32-{chip}[-{variant}]-{ruby}.bin
      const base = a.name.replace(/^R2P2-ESP32-/, "").replace(/\.bin$/, "")
      const parts = base.split("-")
      const ruby = parts[parts.length - 1]
      const chip = parts[0]
      const variant = parts.slice(1, -1).join("_") || null
      const chipKey = variant ? `${chip}_${variant}` : chip
      return { chip, chipKey, ruby, url: new URL(a.name, baseUrl).href }
    })
    .filter((a) => a.chip in CHIP_FAMILY && a.ruby in RUBY_LABEL)
}

function buildManifest(asset, version) {
  return {
    name: "R2P2-ESP32",
    version,
    new_install_prompt_erase: true,
    builds: [
      {
        chipFamily: CHIP_FAMILY[asset.chip],
        parts: [{ path: asset.url, offset: BOOTLOADER_OFFSET[asset.chip] ?? 0x1000 }],
      },
    ],
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.querySelector("[data-installer-status]")
  const selectArea = document.querySelector("[data-installer-selects]")
  const boardSelect = document.querySelector("[data-installer-board]")
  const rubySelect = document.querySelector("[data-installer-ruby]")
  const installButton = document.querySelector("[data-installer-button]")
  if (!statusEl || !installButton) return

  let releaseInfo = null
  let parsedAssets = []
  let currentManifestUrl = null

  function updateManifest() {
    if (!releaseInfo || parsedAssets.length === 0) return
    const asset = parsedAssets.find(
      (a) => a.chipKey === boardSelect.value && a.ruby === rubySelect.value
    )
    if (!asset) return

    const manifest = buildManifest(asset, releaseInfo.tag_name)
    const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" })

    if (currentManifestUrl) URL.revokeObjectURL(currentManifestUrl)
    currentManifestUrl = URL.createObjectURL(blob)
    installButton.setAttribute("manifest", currentManifestUrl)
  }

  function updateRubyOptions(chipKey) {
    const rubies = [...new Set(parsedAssets.filter((a) => a.chipKey === chipKey).map((a) => a.ruby))]
    rubySelect.innerHTML = rubies
      .map((r) => `<option value="${r}">${RUBY_LABEL[r] || r}</option>`)
      .join("")
  }

  async function fetchReleaseInfo() {
    try {
      const baseUrl = new URL(statusEl.dataset.firmwareUrl, location.href).href
      const res = await fetch(new URL("release.json", baseUrl))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      releaseInfo = await res.json()
      parsedAssets = parseAssets(releaseInfo.assets, baseUrl)

      if (parsedAssets.length === 0) throw new Error("No compatible firmware assets found")

      const chipKeys = [...new Map(parsedAssets.map((a) => [a.chipKey, a])).keys()]
      boardSelect.innerHTML = chipKeys
        .map((key) => `<option value="${key}">${CHIP_LABEL[key] || key}</option>`)
        .join("")

      boardSelect.addEventListener("change", () => {
        updateRubyOptions(boardSelect.value)
        updateManifest()
      })
      rubySelect.addEventListener("change", updateManifest)

      updateRubyOptions(chipKeys[0])

      statusEl.textContent = statusEl.dataset.loadedTemplate.replace("{version}", releaseInfo.tag_name)
      statusEl.dataset.state = "loaded"
      selectArea.classList.remove("hidden")
      updateManifest()
    } catch (err) {
      statusEl.textContent = statusEl.dataset.errorTemplate.replace("{message}", err.message)
      statusEl.dataset.state = "error"
    }
  }

  fetchReleaseInfo()
})
