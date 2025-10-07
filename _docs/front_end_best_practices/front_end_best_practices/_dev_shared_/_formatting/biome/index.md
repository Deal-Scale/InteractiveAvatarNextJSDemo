
Getting Started
Installation
Section titled Installation

The fastest way to download Biome is to use a package manager such as npm. This requires Node.js v14.18 or newer. The CLI is also available as a standalone executable if you want to use Biome without installing Node.js.

To install Biome, run the following commands in a directory containing a package.json file.

npm
yarn
pnpm
bun

    deno

Terminal window

npm install --save-dev --save-exact @biomejs/biome

Note

We instruct the package manager to pin an exact version of Biome. This ensures that everyone within a project has exactly the same version of Biome. Even a patch release can result in slightly different behavior. See the versioning page for more information.
Configuration
Section titled Configuration

We recommend that you create a biome.json or a biome.jsonc configuration file for each project. This eliminates the need to repeat the CLI options each time you run a command, and ensures that Biome uses the same configuration in your editor. Some options are also only available from a configuration file. If you are happy with Biome’s defaults, you don’t need to create a configuration file. To create the biome.json file, run the init command in the root folder of your project:

npm
yarn
pnpm
bun

    deno

Terminal window

npx @biomejs/biome init

Pass the --jsonc option to emit a biome.jsonc file instead.

After running the init command, you’ll have a new biome.json file in your directory:
biome.json

{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": false,
    "clientKind": "git",
    "useIgnoreFile": false
  },
  "files": { "ignoreUnknown": false, "ignore": [] },
  "formatter": { "enabled": true, "indentStyle": "tab" },
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "javascript": { "formatter": { "quoteStyle": "double" } }
}

The linter.enabled: true enables the linter and rules.recommended: true enables the recommended rules. This corresponds to the default settings.

Formatting is enabled by default, but you can disable it by explicitly using formatter.enabled: false.
Usage
Section titled Usage

The Biome CLI comes with many commands and options, so you can use only what you need.

You can format files and directories using the format command with the --write option:

npm
yarn
pnpm
bun

    deno

Terminal window

npx @biomejs/biome format --write <files>

You can lint and apply safe fixes to files and directories using the lint command with the --write option:

npm
yarn
pnpm
bun

    deno

Terminal window

npx @biomejs/biome lint --write <files>

You can run both of them by leveraging the check command:

npm
yarn
pnpm
bun

    deno

Terminal window

npx @biomejs/biome check --write <files>

The check command runs multiple tools at once. It formats, lints, and organizes imports.
Install an editor plugin
Section titled Install an editor plugin

We recommend installing an editor plugin to get the most out of Biome. Check out the editor page to know which editors support Biome.
CI Setup
Section titled CI Setup

If you’re using Node.js, the recommended way to run Biome in CI is to use your preferred package manager. This ensures that your CI pipeline uses the same version of Biome as you do inside the editor or when running local CLI commands. Alternatively, you can use a dedicated CI Action.
Next Steps
Section titled Next Steps

Success! You’re now ready to use Biome. 🥳

    Migrate from ESLint and Prettier
    Learn more about how to configure Biome
    Learn more about how to use and configure the formatter
    Learn more about how to use and configure the linter
    Get familiar with the CLI options
    Get familiar with the configuration options
    Join our community on Discord
