// Site search, powered by Pagefind (https://pagefind.app/). Pagefind builds
// its index as a post-build step (`rake pagefind`, wired into `rake deploy`)
// by scanning the built `output/` directory, so this only works against a
// site that's actually been built + indexed - see README.md.
//
// Pagefind auto-detects each page's language from `<html lang>` (which we
// already set per-locale) and searches only within the current locale by
// default, so no extra wiring is needed for i18n.
const MAX_RESULTS = 8

let pagefindPromise = null

function loadPagefind(url) {
  if (!pagefindPromise) {
    pagefindPromise = import(url).catch((err) => {
      pagefindPromise = null
      throw err
    })
  }
  return pagefindPromise
}

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-search]")
  const input = document.querySelector("[data-search-input]")
  const resultsEl = document.querySelector("[data-search-results]")
  if (!root || !input || !resultsEl) return

  const pagefindUrl = input.dataset.pagefindUrl
  const noResultsLabel = input.dataset.labelNoResults
  const unavailableLabel = input.dataset.labelUnavailable

  let activeIndex = -1
  let currentItems = []

  function closeResults() {
    resultsEl.classList.add("hidden")
    resultsEl.innerHTML = ""
    activeIndex = -1
    currentItems = []
  }

  function showMessage(text) {
    resultsEl.innerHTML = `<p class="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400">${text}</p>`
    resultsEl.classList.remove("hidden")
  }

  function renderResults(items) {
    currentItems = items
    activeIndex = -1
    resultsEl.innerHTML = ""
    items.forEach((item, index) => {
      const a = document.createElement("a")
      a.href = item.url
      a.dataset.searchResultIndex = String(index)
      a.className =
        "block border-b border-neutral-100 px-4 py-2.5 last:border-0 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"

      const title = document.createElement("p")
      title.className = "truncate text-sm font-medium text-neutral-800 dark:text-neutral-200"
      title.textContent = item.meta?.title ?? item.url

      const excerpt = document.createElement("p")
      excerpt.className =
        "mt-0.5 truncate text-xs text-neutral-500 [&_mark]:bg-transparent [&_mark]:font-semibold [&_mark]:text-brand-600 dark:text-neutral-400 dark:[&_mark]:text-brand-400"
      excerpt.innerHTML = item.excerpt

      a.append(title, excerpt)
      resultsEl.appendChild(a)
    })
    resultsEl.classList.remove("hidden")
  }

  function setActive(index) {
    const links = resultsEl.querySelectorAll("a")
    links.forEach((link) => link.classList.remove("bg-neutral-50", "dark:bg-neutral-800"))
    if (index >= 0 && links[index]) {
      links[index].classList.add("bg-neutral-50", "dark:bg-neutral-800")
      links[index].scrollIntoView({ block: "nearest" })
    }
    activeIndex = index
  }

  async function runSearch(query) {
    if (!query.trim()) {
      closeResults()
      return
    }

    let pagefind
    try {
      pagefind = await loadPagefind(pagefindUrl)
    } catch {
      showMessage(unavailableLabel)
      return
    }

    const search = await pagefind.debouncedSearch(query)
    if (!search) return // a newer search superseded this one

    if (search.results.length === 0) {
      showMessage(noResultsLabel)
      return
    }

    const items = await Promise.all(search.results.slice(0, MAX_RESULTS).map((r) => r.data()))
    renderResults(items)
  }

  input.addEventListener("input", (event) => {
    runSearch(event.target.value)
  })

  input.addEventListener("focus", () => {
    if (input.value.trim()) runSearch(input.value)
  })

  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      input.blur()
      closeResults()
    } else if (event.key === "ArrowDown" && currentItems.length) {
      event.preventDefault()
      setActive(Math.min(activeIndex + 1, currentItems.length - 1))
    } else if (event.key === "ArrowUp" && currentItems.length) {
      event.preventDefault()
      setActive(Math.max(activeIndex - 1, 0))
    } else if (event.key === "Enter" && activeIndex >= 0 && currentItems[activeIndex]) {
      window.location.href = currentItems[activeIndex].url
    }
  })

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) closeResults()
  })

  document.addEventListener("keydown", (event) => {
    const isModK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
    if (isModK) {
      event.preventDefault()
      input.focus()
      input.select()
    }
  })

  // Reflect the platform's modifier key in the visible kbd hint.
  const kbd = document.querySelector("[data-search-kbd]")
  if (kbd && /Mac|iPhone|iPad/.test(navigator.platform)) {
    kbd.textContent = "⌘K"
  }
})
