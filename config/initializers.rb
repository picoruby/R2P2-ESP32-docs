# Welcome to Bridgetown!
#
# This configuration file is for settings which affect your whole site.
#
# For more documentation on using this initializers file, visit:
# https://www.bridgetownrb.com/docs/configuration/initializers/
#
# A list of all available configuration options can be found here:
# https://www.bridgetownrb.com/docs/configuration/options
#
# For technical reasons, this file is *NOT* reloaded automatically when you use
# `bin/bridgetown start`. If you change this file, please restart the server process.
#
# For reloadable site metadata like title, SEO description, social media
# handles, etc., take a look at `src/_data/site_metadata.yml`

Bridgetown.configure do |config|
  # The base hostname & protocol for your site, e.g. https://example.com
  url "https://picoruby.github.io"

  # This is a GitHub Pages *project* site (not a `<user>.github.io` root site),
  # so every internal link/asset must be prefixed with this path. Always use
  # the `relative_url` helper for links and assets in HTML so this works both
  # in local dev and once deployed.
  base_path "/R2P2-ESP32-docs"

  # Available options are `erb` (default), `serbea`, or `liquid`
  template_engine "erb"

  # --- Internationalization (English + Japanese) ---
  #
  # English is the default locale and is served unprefixed at the root
  # (e.g. /docs/quick-start/). Japanese content lives under /ja/ and is
  # picked up automatically from files named `*.ja.md` (or with
  # `locale: ja` in the front matter). See src/_locales for UI strings.
  # NOTE: these must be symbols, not strings - several places in Bridgetown
  # core compare `data.locale.to_sym` against these values directly (see
  # `resource/permalink_processor.rb` and `resource/base.rb`), so string
  # values here silently break locale detection and permalink prefixing.
  available_locales [:en, :ja]
  default_locale :en
  prefix_default_locale false

  # --- Collections ---
  collections do
    docs do
      output true
      permalink "/:locale/docs/:slug/"
    end
  end

  # Front matter defaults
  config.defaults << {
    scope: { collection: "docs" },
    values: { layout: "docs" },
  }
  config.defaults << {
    scope: { collection: "pages", path: "" },
    values: { layout: "default" },
  }

  # Other options you might want to investigate:

  # See list of timezone values here:
  # https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  #
  # timezone "America/Los_Angeles"

  # Add collection pagination features to your site. Documentation here:
  # https://www.bridgetownrb.com/docs/content/pagination
  #
  # pagination do
  #   enabled true
  # end

  # Configure the permalink style for pages and posts. Custom collections can be
  # configured separately under the `collections` key. Documentation here:
  # https://www.bridgetownrb.com/docs/content/permalinks
  #
  # permalink "simple"

  # You can also modify options on this configuration object directly, like so:
  #
  # config.autoload_paths << "models"

  # If you find you're having trouble using the new Fast Refresh feature in development,
  # you can disable it to force full rebuilds instead:
  #
  # fast_refresh false

  # You can use `init` to initialize various Bridgetown features or plugin gems.
  # For example, you can use the Dotenv gem to load environment variables from
  # `.env`. Just `bundle add dotenv` and then uncomment this:
  #
  # init :dotenv
  #

  # Uncomment to use Bridgetown SSR (aka dynamic rendering of content via Roda):
  #
  # init :ssr
  #
  # Add `sessions: true` if you need to use session data, flash, etc.
  #

  # Uncomment to use file-based dynamic template routing via Roda (make sure you
  # uncomment the gem dependency in your `Gemfile` as well):
  #
  # init :"bridgetown-routes"
  #
  # NOTE: you can remove `init :ssr` if you load this initializer
  #

  # We also recommend that if you're using Roda routes you include this plugin
  # so you can get a generated routes list in `.routes.json`. You can then run
  # `bin/bridgetown roda:routes` to print the routes. (This will require you to
  # comment your route blocks. See example in `server/routes/hello.rb.sample`.)
  #
  # only :server do
  #   init :parse_routes
  # end
  #

  # You can configure the inflector used by Zeitwerk and models. A few acronyms are provided
  # by default like HTML, CSS, and JS, so a file like `html_processor.rb` could be defined by
  # `HTMLProcessor`. You can add more like so:
  #
  # config.inflector.configure do |inflections|
  #   inflections.acronym "W3C"
  # end
  #
  # Bridgetown's inflector is based on Dry::Inflector so you can read up on how to add inflection
  # rules here: https://dry-rb.org/gems/dry-inflector/1.0/#custom-inflection-rules

  # For more documentation on how to configure your site using this initializers file,
  # visit: https://edge.bridgetownrb.com/docs/configuration/initializers/
end
