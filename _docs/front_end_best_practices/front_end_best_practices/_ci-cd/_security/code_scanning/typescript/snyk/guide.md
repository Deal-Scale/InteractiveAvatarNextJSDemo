Guidance for JavaScript and Node.js
Product
Description

Snyk Code

Scan your code for security vulnerabilities using source code analysis.

Snyk Open Source

Some capabilities may be limited for some languages and package managers.

    Open Source vulnerability testing and monitoring (All plans).

    Open Source dependency upgrade version bumping (All plans).

    License Compliance (paid plans).

Snyk Infrastructure as Code

Scan for configuration issues when you deploy your new applications using Kubernetes deployment files, Terraform, or Cloudformation templates.
For more details, see Snyk CLI for Infrastructure as Code.

Snyk Container

Scan for issues with container images if you are building containers.

Snyk Integrated IaC with cloud context

    Security from code to cloud and back.

    Scan for runtime misconfiguration issues in your cloud and containers, detect infrastructure drift, and fix issues at their source.

Validating, monitoring, alerting, and gating
With SCM integrations

    On the Snyk Enterprise plan only, Snyk can monitor container images and their open source or Linux-based packages being used in production using Kubernetes integration to notify customers of known vulnerabilities for applications in production.

    On All Snyk plans, where a production integration does not exist, use the snyk monitor CLI command to take a snapshot and monitor what is being pushed to production.

Package Registry Integrations (Artifactory/Nexus)

Artifactory, Nexus, npm Teams, and npm Enterprise Package Registry integrations are available to Snyk Enterprise plan users.

Snyk Open Source Gatekeeper plugins integrate with Artifactory and Nexus to block builds from downloading packages with vulnerability and license issues.

Snyk Open Source can also integrate with Artifactory, Nexus, npm Teams, and npm Enterprise to assist in the security testing of your applications. Snyk uses this integration for dependency resolution, fix calculation, and re-locking lock files.

If your Projects reference private dependencies in these repositories but you are not a Snyk Enterprise user, you can use the Snyk CLI in a properly configured local environment (such as your build pipeline) so these dependencies can be resolved and included in the test.

For more information, see the following:

    Package registry integrations: npm Teams and npm Enterprise, Artifactory Registry setup and Nexus Repository Manager setup.

    Gatekeeper plugins: Artifactory Gatekeeper plugin and Nexus Repository Manager Gatekeeper plugin

Language and package manager considerations
devDependencies analysis

devDependencies analysis is disabled by default as these are not typically elevated to production, often seen as “noise” by both security and development. To enable testing on dev-dependencies:

    Use the --dev parameter for CLI and CI/CD integrations.

    For SCM integrations, set using Settings > Languages in the relevant configuration item.

optionalDependencies analysis

optionalDependencies are included by default for CLI and CI/CD, as well as SCM integrations.
npm

Snyk can build a dependency tree with or without a lockfile. If a lockfile is present, this will be used.

    Locally and CI/CD: If a lockfile is not present and the scan is with the CLI or an IDE, Snyk looks at node_modules to determine what is installed.

    SCM integration: If a lockfile is not present, Snyk will approximate what the tree will look like at build time. This is highly valuable for getting insights into Projects in development or what the next build will look like when there is no lockfile present

As a user of npm, you may ask, “Why Snyk?” when npm-audit is at hand anytime you are working with your dependencies. You get the following capabilities:

    Snyk helps secure not only open source but also your first-party code. If you are using infrastructure as code and/or containers, Snyk can also provide visibility and remediation advice.

    It’s designed both for individuals and companies.

    In the context of Open Source:

        You receive all the benefits of the curation, updates, and additional value that the Snyk Security Team adds, such as Known Exploit and Trending on X (formerly known as Twitter).

        You have Automated Remediation.

    Central reporting.

    Git Code repository integration, but not just there, Snyk has integrations across your pipeline and visibility into production.

    Broad support across programming languages and package managers.

    Ignore capabilities.

For more information, see Snyk for npm.
Yarn

Requires yarn.lock and package.json

    Yarn 1 , 2, and 3 are fully supported in GIT and CLI.

    If a lock file is not present in CLI, the node_modules folder will be used to construct the dependency tree.

    nohoist is not supported for Yarn Workspaces.

For more information, see Snyk for Yarn.
Lerna/PNPM

Not officially supported, but if configured with Yarn workspaces, you may get Snyk results from the CLI or in an IDE.
Unmanaged JavaScript

If you are on the Enterprise plan and thus have access to the Snyk API, can use the API to get a full list of dependencies and their transitive dependencies.

To test for vulnerabilities, you can use the following API endpoints:

    Test for issues in a public package by name and version

    Test Dep Graph

    List issues for a package

Out of sync lockfiles

Control behavior when the lockfile and package file are in sync can be done using:

    CLI additional values: --strict-out-of-sync, --fail-on

    WebUI for Git Scans:

        Settings > Language > Javascript

Snyk integrations common usage patterns

npm and Yarn are well-designed package managers. The main considerations for npm and Yarn packages are whether there are multiple package managers or Projects in the same repository or build and what criteria you want to apply, such as the threshold severity of critical/high for each.

For source code scanning, this ecosystem is straightforward, with no special options required. Testing runs under Git and Snyk CLI with the basic features and commands.
Snyk CLI tips and tricks

See the CLI cheat sheet.
What to test

Use the --help option in the CLI for details of Snyk CLI commands.

For a list of all the CLI commands, see the CLI commands and options summary.
Open Source libraries

The snyk test command tests the first manifest it can find and performs a test on that singular entry point. To have Snyk analyze all manifests in the directory, use the following options:

    --all-projects: This option detects and scans all Yarn and other Projects in this directory.

    --yarn-workspaces: For Yarn Workspaces use the --all-projects flag to test and monitor your packages with other package managers or Yarn workspaces or use --yarn-workspaces to specifically scan Yarn Workspaces Projects only.

If you are using a package manager that requires options, it’s suggested to target individually with --file=
Codebase

    Framework support - see Supported languages, frameworks, and feature availability overview.

    Use the snyk code test command from the root of the Project to perform source code analysis.

Containers

    Snyk will automatically look for application (open source) vulnerabilities as part of a container scan. Consider having Snyk integrated via CLI earlier in the pipeline and utilize this for an additional signal of and insight into what is in production.

    If you ship your Node.JS application in a container, be aware that you might also be bundling insecure packages (Linux, open source), alongside your application in addition to what is brought in by the container base image. The Snyk Container CLI can help you identify a base image that minimizes the attack surface of your application.

    For more information on how you can filter to the layer you wish to work on,such as identifying a secure base image to build off of, the layers you are responsible for, or application (OS) vulnerabilities, see Snyk CLI for container security

Infrastructure as code

See Infrastructure as Code security.
Options and plugins

    To help generate reports locally or at build time, see the snyk-to-html plugin.

    See --json and --sarif options for generating output that can be programmatically accessed.

    For advanced filtering options, see snyk-filter.

Additional security topics that Impact Node.Js and JavaScript developers

The following is a collection of articles from the Snyk Security team and Developer Relations that impact this ecosystem. For more industry, security, and technology-related articles, visit the Snyk Blog:

    Securing your modern software supply chain

    Best practices for creating Modern npm package

    Detect and prevent dependency confusion attacks on npm to maintain supply chain security

    Switching between Node.Js versions

    DevSecOps tools for open-source projects in JavaScript and Node.Js

PreviousGit repositories and JavaScript
Next.NET

Last updated 3 months ago

Was this helpful?
More information

    Snyk privacy policy

© 2024 Snyk Limited | All product and company names and logos are trademarks of their respective owners.

This site uses cookies to deliv