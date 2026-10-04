// Builds the "On this page" table of contents from the h2/h3 headings inside
// the docs content, and highlights the section currently in view.
document.addEventListener("DOMContentLoaded", () => {
  const content = document.querySelector("[data-docs-content]")
  const tocList = document.querySelector("[data-toc-list]")
  const tocContainer = document.querySelector("[data-toc]")
  if (!content || !tocList || !tocContainer) return

  const headings = Array.from(content.querySelectorAll("h2, h3")).filter((h) => h.id)
  if (headings.length === 0) {
    tocContainer.classList.add("hidden")
    return
  }

  const fragment = document.createDocumentFragment()
  const linksByHeadingId = new Map()

  headings.forEach((heading) => {
    const li = document.createElement("li")
    li.className = heading.tagName === "H3" ? "ps-6" : "ps-3"

    const a = document.createElement("a")
    a.href = `#${heading.id}`
    a.textContent = heading.textContent
    a.className =
      "toc-link block truncate py-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"

    li.appendChild(a)
    fragment.appendChild(li)
    linksByHeadingId.set(heading.id, a)
  })

  tocList.appendChild(fragment)

  const clearActive = () => {
    linksByHeadingId.forEach((link) => link.removeAttribute("aria-current"))
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length > 0) {
        clearActive()
        linksByHeadingId.get(visible[0].target.id)?.setAttribute("aria-current", "true")
      }
    },
    { rootMargin: "-80px 0px -70% 0px", threshold: 1.0 }
  )

  headings.forEach((heading) => observer.observe(heading))
})
