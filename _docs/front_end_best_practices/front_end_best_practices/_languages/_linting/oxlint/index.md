https://oxc.rs/docs/guide/usage/linter

Linter (oxlint)

    npm weekly downloads

Oxlint is designed to catch erroneous or useless code without requiring any configurations by default.

INFO

At this stage, Oxlint can be used to fully replace ESLint in small to medium projects.

For larger projects, our advice is to turn off ESLint rules via eslint-plugin-oxlint, and run Oxlint before ESLint in your local or CI setup for a quicker feedback loop.
Features

    50 - 100 times faster than ESLint, and scales with the number of CPU cores (benchmark).
    Over 500 rules with a growing list from eslint, typescript, eslint-plugin-react, eslint-plugin-jest, eslint-plugin-unicorn, eslint-plugin-jsx-a11y and many more.
    Supports
        .oxlintrc.json configuration file.
        Nested configuration file
        Comment disabling.
        Automatic Fixes

Language Support

    Supports:
        JavaScript and TypeScript by their extensions js, mjs, cjs, jsx, ts, mts, cts and tsx.
        <script> content of .vue, .astro and .svelte files.
    No support for:
        type-aware rules defined by typescript-eslint.
        stylistic rules.

Installation

Run oxlint directly at the root of your repository:
npm
pnpm
yarn
bun
deno

$ npx oxlint@latest

Or save it to your package.json:
npm
pnpm
yarn
bun

$ npm add -D oxlint

oxlint does not require Node.js, the binaries can be downloaded from the latest GitHub releases.
Command-line Interface

See Command-line Interface
Configuration File

See Configuration File
Migrate from eslint flat config

If you have an existing eslint.config.\* file, you can convert it to an .oxlintrc.json config with oxlint-migrate.
Integration
ESLint

If you are looking for a way to use oxlint in projects that still need ESLint, you can use eslint-plugin-oxlint to turn off ESLint rules that are already supported by oxlint. So you can enjoy the speed of oxlint while still using ESLint.
lint-staged
package.json

{
"lint-staged": {
"\*_/_.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue,astro,svelte}": "oxlint"
}
}

VSCode Extension

Download the official VSCode extension from the

    Visual Studio Marketplace
    Open VSX Registry

Zed Extension

https://zed.dev/extensions?query=oxc
Continuous Integration

Since oxlint only takes a few seconds to run, we recommend running oxlint before ESLint for faster feedback loops.
GitHub Actions

jobs:
oxlint:
name: Lint JS
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - run: npx --yes oxlint@0.0.0 --deny-warnings # change to the latest release

It is advised to pin the version, otherwise CI may fail after a new release.
pre-commit
.pre-commit-hooks.yaml

repos:

- repo: https://github.com/oxc-project/mirrors-oxlint
  rev: v0.0.0 # change to the latest version
  hooks:
  - id: oxlint
    verbose: true

Unplugin

https://www.npmjs.com/package/unplugin-oxlint
Vite plugin

https://www.npmjs.com/package/vite-plugin-oxlint
System Requirements

oxlint is built for darwin-arm64, darwin-x64, linux-arm64, linux-x64, win32-arm64 and win32-x64.
Suggest changes to this page
