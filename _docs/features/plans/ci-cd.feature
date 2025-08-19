Feature: Suggested CI/CD tools for Raretae front-end based on package.json

  As a developer on the Raretae project
  I want recommendations for CI/CD tools tailored to our stack
  So that we can implement automated quality checks and security in our workflow

  Background:
    Given the project repository contains a package.json file
    And the package.json lists dependencies such as React, TypeScript, Vitest, and Biome

  Scenario: Suggested quality and CI/CD tools
    Given the stack uses Node.js, React, and TypeScript
    Then it is suggested to use:
      | Tool           | Purpose                                    |
      | GitHub Actions | CI/CD orchestration for builds and tests   |
      | Biome          | All-in-one formatter and linter            |
      | Jest           | Unit and integration testing               |
      | Husky          | Git hooks for enforcing checks pre-commit  |
      | snyk      | Dependency vulnerability scanning          |
      | Codecov        | Code coverage reporting in CI              |
      | GitHub Secret Scanning | Detect accidental secret commits   |

    And these are suggestions based on dependencies in package.json
    And the purpose is to automate linting, formatting, testing, security, and quality checks on every contribution

  Scenario: Example CI/CD pipeline outline
    When setting up CI/CD
    Then the workflow could include:
      | Step                        | Tool         |
      | Checkout repository         | GitHub Actions |
      | Install dependencies        | pnpm          |
      | Lint and format code        | Biome        |
      | Run tests                   | Jest or Vitest |
      | Check code coverage         | Codecov      |
      | Scan dependencies           | snyk    |
      | Check for secrets           | GitHub Secret Scanning |

    And Husky can be used locally to enforce linting and tests before commit

  # These are only suggestions and should be tailored to team preferences and project requirements.
