require "bridgetown"

Bridgetown.load_tasks

# Run rake without specifying any command to execute a deploy build by default.
task default: :deploy

#
# Standard set of tasks, which you can customize if you wish:
#
desc "Build the Bridgetown site for deployment"
task :deploy => [:clean, "firmware:fetch", "frontend:build"] do
  Bridgetown::Commands::Build.start
  # Don't use Rake::Task[:pagefind] here: Build runs inside Rake.with_application,
  # after which the task lookup fails with "Don't know how to build task".
  build_search_index
end

def build_search_index
  sh "npx pagefind --site output"
end

desc "Build the search index (needs a completed build in output/ first)"
task :pagefind do
  build_search_index
end

desc "Build the site in a test environment"
task :test do
  ENV["BRIDGETOWN_ENV"] = "test"
  Bridgetown::Commands::Build.start
end

desc "Runs the clean command"
task :clean do
  Bridgetown::Commands::Clean.start
end

namespace :firmware do
  FIRMWARE_RELEASES_API = "https://api.github.com/repos/picoruby/R2P2-ESP32/releases/latest"
  FIRMWARE_DIR = File.expand_path("src/firmware", __dir__)

  def firmware_get(url, limit = 5)
    raise "Too many redirects: #{url}" if limit.zero?
    uri = URI(url)
    req = Net::HTTP::Get.new(uri)
    req["Accept"] = "application/vnd.github+json"
    # Only send the token to the GitHub API, never to the asset CDN it redirects to.
    req["Authorization"] = "Bearer #{ENV["GITHUB_TOKEN"]}" if ENV["GITHUB_TOKEN"] && uri.host == "api.github.com"
    res = Net::HTTP.start(uri.host, uri.port, use_ssl: true) { |http| http.request(req) }
    case res
    when Net::HTTPSuccess then res.body
    when Net::HTTPRedirection then firmware_get(res["location"], limit - 1)
    else raise "GET #{url} failed: HTTP #{res.code}"
    end
  end

  desc "Download the latest R2P2-ESP32 release firmware into src/firmware/ (served by the Installer)"
  task :fetch do
    require "net/http"
    require "json"
    require "fileutils"

    release = JSON.parse(firmware_get(FIRMWARE_RELEASES_API))
    tag = release.fetch("tag_name")
    assets = release.fetch("assets").select { |a| a["name"] =~ /\AR2P2-ESP32-.+\.bin\z/ }
    raise "No firmware assets found in release #{tag}" if assets.empty?

    info_path = File.join(FIRMWARE_DIR, "release.json")
    current = File.exist?(info_path) ? JSON.parse(File.read(info_path))["tag_name"] : nil
    if current == tag && assets.all? { |a| File.exist?(File.join(FIRMWARE_DIR, a["name"])) }
      puts "Firmware already up to date: #{tag}"
      next
    end

    puts "Updating firmware: #{current.inspect} -> #{tag}"
    FileUtils.rm_rf(FIRMWARE_DIR)
    FileUtils.mkdir_p(FIRMWARE_DIR)
    assets.each do |a|
      puts "  #{a["name"]}"
      File.binwrite(File.join(FIRMWARE_DIR, a["name"]), firmware_get(a["browser_download_url"]))
    end
    File.write(info_path, JSON.pretty_generate(tag_name: tag, assets: assets.map { |a| { name: a["name"] } }))
    File.write(File.expand_path(".firmware-version", __dir__), "#{tag}\n")
  end
end

namespace :frontend do
  desc "Build the frontend with esbuild for deployment"
  task :build do
    # esbuild must run first: it (re)creates .bridgetown-cache/frontend-bundling/
    # manifest.json, which bin/tailwindcss then patches with its own fingerprinted
    # entry. On a fresh checkout (no manifest yet, e.g. right after `rake clean`),
    # running tailwindcss first fails with ENOENT reading that file.
    sh "npm run esbuild"
    sh "bin/tailwindcss"
  end

  desc "Watch the frontend with esbuild during development"
  task :dev do
    sh "npm run esbuild-dev"
  rescue Interrupt
  end
end

#
# Add your own Rake tasks here! You can use `environment` as a prerequisite
# in order to write automations or other commands requiring a loaded site.
#
# task :my_task => :environment do
#   puts site.root_dir
#   automation do
#     say_status :rake, "I'm a Rake tast =) #{site.config.url}"
#   end
# end
Rake::Task['frontend:watcher'].enhance do
  Bridgetown::Utils::Aux.run_process(
    'Tailwind',
    :blue,
    'bin/tailwindcss --watch'
  )
end
