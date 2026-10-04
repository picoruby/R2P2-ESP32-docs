# Makes every rendered link that points off-site open in a new tab, so
# readers don't lose their place in the docs. Runs once per resource right
# after render (mirroring how `inspect_html` hooks into `:post_render`, see
# bridgetown-builder's DSL::Inspectors) so it catches both Markdown links and
# ones hardcoded in .erb layouts/partials without editing them individually.
#
# A link counts as "external" if its href is an absolute http(s) URL that
# doesn't point back at this site — which, per this repo's convention of
# always going through `relative_url`/`in_locale` (see CLAUDE.md), is every
# genuine internal link anyway.
class ExternalLinks < SiteBuilder
  ANCHOR_TAG = /<a\s[^>]*>/i
  HREF = /\shref="(https?:\/\/[^"]*)"/i

  def build
    hook :resources, :post_render do |resource|
      externalize(resource)
    end
    hook :generated_pages, :post_render do |page|
      externalize(page)
    end
  end

  private

  def externalize(item)
    return unless item.output.is_a?(String)
    return unless item.output_ext&.start_with?(".htm")

    internal_prefix = "#{site.config.url}#{site.config.base_path}"

    item.output = item.output.gsub(ANCHOR_TAG) do |tag|
      match = HREF.match(tag)
      next tag unless match
      next tag if match[1].start_with?(internal_prefix)
      next tag if tag =~ /\btarget=/i

      tag.sub(/>\z/, ' target="_blank" rel="noopener noreferrer">')
    end
  end
end
