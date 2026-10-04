import build from "./config/esbuild.defaults.js"

// You can customize this as you wish, perhaps to add new esbuild plugins.
//
// ```
// import { copy } from 'esbuild-plugin-copy'
// 
// const esbuildOptions = {
//   plugins: [
//     copy({
//       resolveFrom: 'cwd',
//       assets: {
//         from: ['./node_modules/somepackage/files/*')],
//         to: ['./output/_bridgetown/somepackage/files')],
//       },
//       verbose: false
//     }),
//   ]
// }
// ```
//
// You can also support custom base_path deployments via changing `publicPath`.
//
// ```
// const esbuildOptions = {
//   publicPath: "/my_subfolder/_bridgetown/static",
//   ...
// }
// ```

/**
 * @typedef { import("esbuild").BuildOptions } BuildOptions
 * @type {BuildOptions}
 */
const esbuildOptions = {
  // This site is deployed as a GitHub Pages *project* site under
  // /R2P2-ESP32-docs/, so any asset URLs esbuild rewrites internally (e.g.
  // `url(...)` references inside bundled CSS) need this prefix. This must be
  // kept in sync with `base_path` in `config/initializers.rb`.
  publicPath: "/R2P2-ESP32-docs/_bridgetown/static",
  // A second entry point for the Installer page's flashing tool (ESP Web
  // Tools) - kept out of the main bundle since it's only needed there.
  entryPoints: ["./frontend/javascript/index.js", "./frontend/javascript/installer.js"],
  plugins: [
    // add new plugins here...
  ],
  globOptions: {
    excludeFilter: /\.(dsd|lit)\.css$/
  }
}

build(esbuildOptions)
