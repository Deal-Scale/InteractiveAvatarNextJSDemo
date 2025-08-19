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
      | Vitest         | Unit and integration testing               |
      | Husky          | Git hooks for enforcing checks pre-commit  |
      | pnpm audit     | Dependency vulnerability scanning          |
      | Codecov        | Code coverage reporting in CI              |
      | GitHub Secret Scanning | Detect accidental secret commits   |

    And these are suggestions based on dependencies in package.json
    And the purpose is to automate linting, formatting, testing, security, and quality checks on every contribution

  Scenario: Example CI/CD pipeline outline
    When setting up CI/CD
    Then the workflow could include:
      | Step                        | Tool           |
      | Checkout repository         | GitHub Actions |
      | Install dependencies        | pnpm           |
      | Lint and format code        | Biome          |
      | Type check                  | TypeScript     |
      | Build Next.js app           | next build     |
      | Run tests                   | Vitest         |
      | Check code coverage         | Codecov        |
      | Scan dependencies           | pnpm audit     |
      | Check for secrets           | GitHub Secret Scanning |

    And Husky can be used locally to enforce formatting/linting and optionally tests before commit

  # These are only suggestions and should be tailored to team preferences and project requirements.

  Scenario: Current repository setup with file locations and lines
    Given Husky is configured
    Then the hook file exists at ".husky/pre-commit" with:
      | Lines | Content summary                          |
      | 1-2  | Shebang and Husky shim                  |
      | 4    | Comment: Format with Biome              |
      | 5    | Runs: pnpm run format                  |
      | 7    | Re-stage: git add -A                   |

    And Biome is configured in "biome.json" with:
      | Lines | Content summary                                      |
      | 2    | $schema 2.2.0                                        |
      | 3-7  | vcs block (disabled; git client; ignore off)         |
      | 8-20 | files includes/excludes                              |
      | 21-30| linter enabled with recommended rules                |
      | 31-35| javascript.formatter.quoteStyle = "double"          |

    And the package.json scripts are defined at "package.json" with:
      | Lines | Script        | Command                 |
      | 6    | dev           | next dev                |
      | 7    | build         | next build              |
      | 8    | start         | next start              |
      | 9    | lint          | biome lint .            |
      | 12   | format        | biome format --write .  |
      | 13   | check         | biome check .           |
      | 14   | test          | vitest run              |
      | 16   | prepare       | husky                   |

    And Prettier is not configured in the repository root (no .prettierrc or prettier config in package.json)
    But a Prettier template exists only under "submodules/front_end_best_practices/_dev_shared_/_formatting/prettier/" for reference
