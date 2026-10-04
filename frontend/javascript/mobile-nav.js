// Mobile drawer for the docs sidebar. Desktop viewports show the sidebar
// inline (handled purely with Tailwind responsive classes); this only
// matters below the `lg` breakpoint.
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector("[data-sidebar-toggle]")
  const panel = document.querySelector("[data-sidebar-panel]")
  const overlay = document.querySelector("[data-sidebar-overlay]")

  if (!toggle || !panel || !overlay) return

  const open = () => {
    panel.classList.remove("-translate-x-full")
    overlay.classList.remove("hidden")
    toggle.setAttribute("aria-expanded", "true")
    document.body.classList.add("overflow-hidden", "lg:overflow-auto")
  }

  const close = () => {
    panel.classList.add("-translate-x-full")
    overlay.classList.add("hidden")
    toggle.setAttribute("aria-expanded", "false")
    document.body.classList.remove("overflow-hidden", "lg:overflow-auto")
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true"
    isOpen ? close() : open()
  })

  overlay.addEventListener("click", close)

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close()
  })

  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close)
  })
})
