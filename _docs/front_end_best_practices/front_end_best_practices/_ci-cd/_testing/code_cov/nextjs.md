NextJS (Webpack) Quick Start

Quick start guide for Codecov Bundle Analysis and NextJS (Webpack).
Suggest Edits
Step 1: Install the Codecov NextJS (Webpack) Plugin

Install the @codecov/nextjs-webpack-plugin to your project.

npm install @codecov/nextjs-webpack-plugin --save-dev

Step 2: Configure the bundler plugin

Import the bundler plugin, and add it to the end of your plugins array found inside your next.config.mjs file.

For further configuration reference please the NextJS docs here.

You can find a Codecov upload token on the Configuration page for your repository, under General, or your organization settings page in the Codecov UI. For more information, see the documentation.

    Note: You can find your global upload inside your org settings on Codecov

import { codecovNextJSWebpackPlugin } from "@codecov/nextjs-webpack-plugin";

export default {
  webpack: (config, options) => {
    config.plugins.push(
      codecovNextJSWebpackPlugin({
        enableBundleAnalysis: true,
        bundleName: "example-nextjs-webpack-bundle",
        uploadToken: process.env.CODECOV_TOKEN,
        webpack: options.webpack,
      }),
    );

    return config;
  },
};

Step 3: Commit and push your latest changes

The plugin requires at least one commit to be made to properly upload bundle analysis information to Codecov.

git add -A && git commit -m "Add Codecov bundler plugin" && git push

Step 4: Build the application

When building your application the plugin will automatically upload the stats information to Codecov.

npm run build

Sending Telemetry Data on Issues and Performance

By default, Codecov's bundler plugins collects telemetry data on issues and performance metrics internally, enabling us to analyze the plugins for performance and monitor potential issues.

You can opt-out of sending this telemetry data by setting the options.telemetry option in the plugin config to false. For example if you're using the NextJS (Webpack) plugin, the Codecov plugin configuration might look like the following:

codecovNextJSWebpackPlugin({
  enableBundleAnalysis: true,
  bundleName: "example-nextjs-webpack-bundle",
  uploadToken: process.env.CODECOV_TOKEN,
  webpack: options.webpack,
  telemetry: false // <- Setting to `false`
  // ... other options
})
