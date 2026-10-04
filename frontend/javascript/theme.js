// Dark mode toggle. The initial class is set synchronously by an inline
// script in `src/_partials/_head.erb` (before first paint, to avoid FOUC);
// this module only wires up the toggle button once the DOM is ready.
const STORAGE_KEY = "r2p2-docs-theme"

function isDark() {
  return document.documentElement.classList.contains("dark")
}

function setTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage may be unavailable (privacy mode, etc.) - safe to ignore
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-pressed", String(isDark()))
    button.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark"
      setTheme(next)
      document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(next === "dark"))
      })
    })
  })
})
