# Small helpers for locale-aware navigation, used by the language switcher,
# docs sidebar, and prev/next navigation. For turning a locale-less path into
# one prefixed for a given locale, use Bridgetown's built-in `in_locale`
# helper (see `url_filters.rb`) rather than duplicating that logic here.
class I18nHelpers < SiteBuilder
  def build
    helper :other_locales do |site, current_locale|
      site.config.available_locales.reject { |locale| locale.to_s == current_locale.to_s }
    end

    helper :locale_label do |locale|
      { "en" => "English", "ja" => "日本語" }.fetch(locale.to_s, locale.to_s)
    end

    helper :find_doc do |site, slug, locale|
      site.collections.docs.resources.find do |doc|
        doc.data.slug.to_s == slug.to_s && doc.data.locale.to_s == locale.to_s
      end
    end
  end
end
