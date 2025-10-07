Vite Quick Start (React, Vue, Svelte, SolidJS, etc.)

Quick start guide for Codecov Bundle Analysis and Vite.
Suggest Edits
Step 1: Install the Codecov Vite Plugin

To install the @codecov/vite-plugin to your project, use the following commands.

npm install @codecov/vite-plugin --save-dev

Step 2: Configure the bundler plugin

Import the bundler plugin, and add it to the end of your plugins array found inside your vite.config.ts file.

You can find a Codecov upload token on the Configuration page for your repository, under General, or your organization settings page in the Codecov UI. For more information, see the documentation.

import { defineConfig } from "vite";
import { codecovVitePlugin } from "@codecov/vite-plugin";

export default defineConfig({
  plugins: [
    // Put the Codecov Vite plugin after all other plugins
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "<bundle project name>",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});

Step 3: Commit and push your latest changes

The plugin requires at least one commit to be made to properly upload bundle analysis information to Codecov.

git add -A && git commit -m "Add Codecov bundler plugin" && git push

Step 4: Build the Application

When building your application the plugin will automatically upload the stats information to Codecov.

npm run build

Sending Telemetry Data on Issues and Performance

By default, Codecov's bundler plugins collects telemetry data on issues and performance metrics internally, enabling us to analyze the plugins for performance and monitor potential issues.

You can opt-out of sending this telemetry data by setting the options.telemetry option in the plugin config to false. For example if you're using the Vite plugin, the Codecov plugin configuration might look like the following:

codecovVitePlugin({
  enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
  bundleName: "<bundle project name>",
  uploadToken: process.env.CODECOV_TOKEN,
  telemetry: false // <- Setting to `false`
  // ... other options
})
