require "bridgetown"

Bridgetown.load_tasks

# Run rake without specifying any command to execute a deploy build by default.
task default: :deploy

#
# Standard set of tasks, which you can customize if you wish:
#
desc "Build the Bridgetown site for deployment"
task :deploy => [:clean, "frontend:build"] do
  Bridgetown::Commands::Build.start
  Rake::Task[:pagefind].invoke
end

desc "Build the search index (needs a completed build in output/ first)"
task :pagefind do
  sh "npx pagefind --site output"
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
