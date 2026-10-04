# Recursively flattens `src/_data/docs_nav.yml` (sections containing either
# leaf `{slug: ...}` pages or nested `{key: ..., items: [...]}` groups) into
# an ordered list of slugs, used to build prev/next navigation in
# `src/_layouts/docs.erb`. The sidebar partial (`_docs_nav_items.erb`) walks
# the same tree structurally (for headings/indentation) rather than through
# this flattened list.
class DocsNavHelpers < SiteBuilder
  def build
    helper :flatten_docs_nav do |items|
      DocsNavHelpers.flatten(items)
    end

    # Returns the chain of ancestor group/section ids leading to `slug`
    # (e.g. ["build", "environment_setup"] for a page nested two levels
    # deep), for rendering breadcrumbs in `src/_layouts/docs.erb`. Each id
    # is translated via `nav.sections.<id>`, same as the sidebar.
    helper :docs_breadcrumb_ids do |items, slug|
      DocsNavHelpers.find_path(items, slug) || []
    end
  end

  def self.flatten(items)
    items.flat_map { |item| item.slug ? [item.slug] : flatten(item.items) }
  end

  def self.find_path(items, target_slug, trail = [])
    items.each do |item|
      if item.slug
        return trail if item.slug == target_slug
      else
        found = find_path(item.items, target_slug, trail + [item.id])
        return found if found
      end
    end
    nil
  end
end
