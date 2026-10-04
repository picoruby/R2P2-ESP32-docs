// Adds a "copy to clipboard" button to every code block in the docs content.
const COPY_ICON = `<svg data-icon="copy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`
const CHECK_ICON = `<svg data-icon="check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector("[data-docs-content]")
  if (!content || !navigator.clipboard) return

  content.querySelectorAll("pre").forEach((pre) => {
    if (pre.closest("[data-code-copy-wrapped]")) return

    pre.classList.add("relative", "group")

    const button = document.createElement("button")
    button.type = "button"
    button.className =
      "code-copy-button absolute right-2 top-2 rounded-md border border-white/10 bg-neutral-800/80 p-1.5 text-neutral-300 opacity-0 transition hover:text-white group-hover:opacity-100 focus:opacity-100"
    button.setAttribute("aria-label", "Copy code to clipboard")
    button.innerHTML = COPY_ICON + CHECK_ICON

    button.addEventListener("click", async () => {
      const code = pre.querySelector("code")?.textContent ?? pre.textContent
      try {
        await navigator.clipboard.writeText(code)
        button.dataset.copied = "true"
        setTimeout(() => delete button.dataset.copied, 1500)
      } catch {
        // Clipboard API can fail without permission - fail silently
      }
    })

    pre.dataset.codeCopyWrapped = "true"
    pre.appendChild(button)
  })
})
