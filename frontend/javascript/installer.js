import "esp-web-tools/dist/install-button.js"

// Flashes R2P2-ESP32 firmware straight from the browser via Web Serial,
// using the official ESP Web Tools component. Firmware choices come from
// the latest R2P2-ESP32 GitHub release, which `rake firmware:fetch`
// mirrors into /firmware/ at build time (GitHub release downloads send no
// CORS headers, so the browser can't fetch them directly). The scheduled
// workflow in .github/workflows/update-firmware.yml keeps it fresh.
//
// Release assets (`R2P2-ESP32-{chip}[-{variant}]-{ruby}.bin`) are app-only
// images (`build/R2P2-ESP32.bin`), with no bootloader or partition table. So,
// as in picoruby/R2P2-ESP32-installer, each install writes four parts:
// bootloader + partition table + storage (committed under src/installer-base/,
// served at /installer-base/) and the app from the release (served at /firmware/).
// Only chips/variants that have a committed bootloader + partition table here
// are offered (the keys of BASE_DIR).
// Bootloader flash offsets, taken from ESP Web Tools' own chip ROM
// definitions (`BOOTLOADER_FLASH_OFFSET` in `esp-web-tools/dist/web/*.js`).
const BOOTLOADER_OFFSET = {
  esp32: 0x1000,
  esp32c3: 0x0,
  esp32s3: 0x0,
}
const PARTITION_TABLE_OFFSET = 0x8000
const APP_OFFSET = 0x10000
const STORAGE_OFFSET = 0x210000

// chipKey (chip[_variant]) -> directory under /installer-base/
const BASE_DIR = {
  esp32: "esp32",
  esp32c3: "esp32c3",
  esp32s3: "esp32s3",
  esp32s3_usb_console: "esp32s3-usb_console",
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
    .filter((a) => a.chipKey in BASE_DIR && a.ruby in RUBY_LABEL)
}

function buildManifest(asset, version, installerBaseUrl) {
  const base = (file) => new URL(`${BASE_DIR[asset.chipKey]}/${file}`, installerBaseUrl).href
  return {
    name: "R2P2-ESP32",
    version,
    new_install_prompt_erase: true,
    builds: [
      {
        chipFamily: CHIP_FAMILY[asset.chip],
        improv: false,
        parts: [
          { path: base("bootloader.bin"), offset: BOOTLOADER_OFFSET[asset.chip] },
          { path: base("partition-table.bin"), offset: PARTITION_TABLE_OFFSET },
          { path: asset.url, offset: APP_OFFSET },
          { path: new URL("storage.bin", installerBaseUrl).href, offset: STORAGE_OFFSET },
        ],
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

  const installerBaseUrl = new URL(statusEl.dataset.installerBaseUrl, location.href).href
  let releaseInfo = null
  let parsedAssets = []
  let currentManifestUrl = null

  function updateManifest() {
    if (!releaseInfo || parsedAssets.length === 0) return
    const asset = parsedAssets.find(
      (a) => a.chipKey === boardSelect.value && a.ruby === rubySelect.value
    )
    if (!asset) return

    const manifest = buildManifest(asset, releaseInfo.tag_name, installerBaseUrl)
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

// After a successful flash, ESP Web Tools shows "Next" (leading to a
// "Logs & Console" dashboard). Replace that with: reset reminder -> OK ->
// link to the web terminal + Close. The dialog is a shadow-DOM element
// appended to <body>, so we watch for it and patch it when it reaches the
// "Installation complete!" page.
const BUTTON_STYLE =
  "background:#e60033;color:#fff;border:none;padding:10px 32px;border-radius:4px;cursor:pointer;font-size:14px;font-family:inherit"

// The dashboard offers "Logs & Console", which we don't want: the web terminal
// is linked from the completion page instead.
function hideConsoleItem(root) {
  for (const item of root.querySelectorAll("ew-list-item")) {
    if (item.querySelector('[slot="headline"]')?.textContent.trim() === "Logs & Console") {
      item.remove()
    }
  }
}

function injectCompletionUI(dialog, button) {
  const root = dialog.shadowRoot
  if (!root) return
  if (!root.querySelector('ewt-page-message[label="Installation complete!"]')) return
  const actions = root.querySelector('div[slot="actions"]')
  if (!actions || actions.querySelector(".r2p2-completion")) return

  const { resetMessage, okLabel, closeLabel, terminalLabel, terminalUrl } = button.dataset
  actions.innerHTML = ""

  const container = document.createElement("div")
  container.className = "r2p2-completion"
  container.style.cssText =
    "display:flex;flex-direction:column;align-items:center;gap:14px;padding:4px 16px;width:100%;box-sizing:border-box"

  const message = document.createElement("p")
  message.textContent = resetMessage
  message.style.cssText = "font-size:15px;font-weight:500;text-align:center"

  const ok = document.createElement("button")
  ok.textContent = okLabel
  ok.style.cssText = BUTTON_STYLE
  ok.addEventListener("click", () => {
    container.innerHTML = ""

    const link = document.createElement("a")
    link.href = terminalUrl
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    link.textContent = terminalLabel
    link.style.cssText = "color:#e60033;font-size:15px;font-weight:500"

    const close = document.createElement("button")
    close.textContent = closeLabel
    close.style.cssText = BUTTON_STYLE
    close.addEventListener("click", () => root.querySelector("ew-dialog")?.close())

    container.append(link, close)
  })

  container.append(message, ok)
  actions.append(container)
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector("[data-installer-button]")
  if (!button) return

  new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeName !== "EWT-INSTALL-DIALOG") continue
        const wait = setInterval(() => {
          if (!node.shadowRoot) return
          clearInterval(wait)
          new MutationObserver(() => {
            hideConsoleItem(node.shadowRoot)
            injectCompletionUI(node, button)
          }).observe(node.shadowRoot, {
            childList: true,
            subtree: true,
          })
        }, 50)
      }
    }
  }).observe(document.body, { childList: true })
})
