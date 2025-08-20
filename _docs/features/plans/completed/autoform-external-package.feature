Feature: Package AutoForm as a standalone NPM module with a single external folder structure
  In order to reuse the working AutoForm across projects
  As a developer
  I want a clear external package folder structure, build, and usage contract documented and testable via acceptance criteria

  Background:
    Given the current working AutoForm implementation under "components/forms/"
      And supporting utilities under "components/forms/utils.ts" and "components/forms/useZodForm.tsx"
      And it depends on peer libraries: react, react-dom, react-hook-form, zod, @hookform/resolvers
      And the destination external folder is "components/external/zod-react-form-auto/"
      And the internal source files live at:
        | location                                   |
        | components/forms/AutoForm.tsx              |
        | components/forms/AutoField.tsx             |
        | components/forms/useZodForm.tsx            |
        | components/forms/utils.ts                  |

  Scenario: Copy internal implementation into destination external folder
    When I prepare the externalized copy
    Then copy the following files into "components/external/zod-react-form-auto/src/" with the same names:
      | from                                      | to                                                        |
      | components/forms/AutoForm.tsx             | components/external/zod-react-form-auto/src/AutoForm.tsx  |
      | components/forms/AutoField.tsx            | components/external/zod-react-form-auto/src/AutoField.tsx |
      | components/forms/useZodForm.tsx           | components/external/zod-react-form-auto/src/useZodForm.tsx|
      | components/forms/utils.ts                 | components/external/zod-react-form-auto/src/utils.ts       |
    And create an index barrel at "components/external/zod-react-form-auto/src/index.ts" exporting AutoForm, AutoField, useZodForm, unwrapType, and types
    And create a minimal stylesheet at "components/external/zod-react-form-auto/styles/index.css"
    And add a README at "components/external/zod-react-form-auto/README.md" with install and usage
    And add an .npmignore at "components/external/zod-react-form-auto/.npmignore" to exclude src maps and examples

  Scenario: Add local package.json for external folder (pre-NPM extraction)
    Given the external folder is nested inside this repo under "components/external/zod-react-form-auto/"
    Then create a package.json at that path with fields:
      | field            | value/contains                                                   |
      | name             | @your-scope/zod-react-form-auto                                  |
      | private          | true (until moved to packages/ or published)                    |
      | type             | module                                                           |
      | main             | ./dist/index.cjs                                                 |
      | module           | ./dist/index.js                                                  |
      | types            | ./dist/index.d.ts                                                |
      | exports          | . -> ESM/CJS/types map                                           |
      | files            | ["dist", "styles", "README.md", "LICENSE"]                 |
      | sideEffects      | false                                                            |
      | peerDependencies | react, react-dom, react-hook-form, zod, @hookform/resolvers      |
      | scripts          | build, dev, typecheck, lint, test                                |

  Scenario: Integration points inside this repo
    When using the externalized folder in-place (pre-publish)
    Then update imports to point to the new local source where desired, for example:
      | before import                                                | after import                                                                 |
      | ../../components/forms/AutoForm                              | ../../components/external/zod-react-form-auto/src/AutoForm                   |
      | ../../components/forms/useZodForm                            | ../../components/external/zod-react-form-auto/src/useZodForm                 |
    And ensure relative asset/style imports are adjusted to "components/external/zod-react-form-auto/styles/index.css"

  Scenario: Scaffold external package folder structure
    When I create a new package directory at "packages/autoform/"
    Then it should contain at minimum:
      | path                                  |
      | packages/autoform/package.json        |
      | packages/autoform/README.md           |
      | packages/autoform/LICENSE             |
      | packages/autoform/tsconfig.json       |
      | packages/autoform/src/index.ts        |
      | packages/autoform/src/AutoForm.tsx    |
      | packages/autoform/src/AutoField.tsx   |
      | packages/autoform/src/useZodForm.tsx  |
      | packages/autoform/src/utils.ts        |
      | packages/autoform/styles/index.css    |
      | packages/autoform/.npmignore          |

  Scenario: Define package.json for library distribution
    Given a valid package name "@your-scope/autoform"
    Then package.json must declare:
      | field           | value/contains                                            |
      | name            | @your-scope/autoform                                      |
      | version         | semver                                                    |
      | type            | module                                                    |
      | main            | ./dist/index.cjs                                          |
      | module          | ./dist/index.js                                           |
      | types           | ./dist/index.d.ts                                         |
      | exports         | . -> ESM/CJS/types map                                    |
      | files           | ["dist", "styles", "README.md", "LICENSE"]              |
      | sideEffects     | false                                                     |
      | peerDependencies| react, react-dom, react-hook-form, zod, @hookform/resolvers |
      | scripts         | build, dev, typecheck, lint, test                         |

  Scenario: Export a stable, minimal API surface
    When I build the entry file at "src/index.ts"
    Then it should export only:
      | symbol        |
      | AutoForm      |
      | AutoField     |
      | useZodForm    |
      | unwrapType    |
      | FieldsConfig  |
      | AutoFieldProps|
    And internal helpers remain private unless explicitly exported

  Scenario: Preserve styling with opt-in CSS import
    Given consumers may not use Tailwind
    When publishing the package
    Then include a small default CSS at "styles/index.css" for basic layout
      And document Tailwind class usage as optional for enhanced UI
      And ensure importing "@your-scope/autoform/styles" works without bundler config

  Scenario: Build configuration supports ESM + CJS + types
    Given a bundler (e.g., tsup, rollup, or tsup via tsup.config.ts)
    Then the build must output:
      | artifact          |
      | dist/index.js     |
      | dist/index.cjs    |
      | dist/index.d.ts   |
    And the build preserves JSX runtime settings compatible with React 17+ automatic runtime
  Scenario: Correct peer dependencies and versions
    Then the package.json peerDependencies field must include the following with appropriate version ranges:
      | package             | version            |
      | react               | ^18 || ^19         |
      | react-dom           | ^18 || ^19         |
      | react-hook-form     | ^7  ||              
      | zod                 | ^3 || ^4           |
      | @hookform/resolvers | ^3 || ^4 || ^5     |

  Scenario: Import paths are clean and tree-shakeable
    When a consumer imports from the package
    Then both of the following work:
      | import style                                         |
      | import { AutoForm } from "@your-scope/autoform"      |
      | import { useZodForm } from "@your-scope/autoform"    |
    And deep imports are discouraged but allowed via exports map if needed

  Scenario: Docs include a Next.js usage example
    Given a Next.js 15 app with React 19
    Then README must include a minimal example:
      """
      import { z } from "zod";
      import { useZodForm, AutoForm } from "@your-scope/autoform";

      const schema = z.object({
        name: z.string().min(1),
        temperature: z.number().min(0).max(1).default(0.7),
        language: z.enum(["en", "es"]).default("en"),
      });

      export default function Page() {
        const form = useZodForm(schema, { defaultValues: { name: "" } });
        return (
          <AutoForm
            schema={schema}
            form={form}
            onSubmit={(values) => console.log(values)}
            fields={{
              temperature: { widget: "slider", min: 0, max: 1, step: 0.1 },
              language: {
                widget: "select",
                options: [
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                ],
              },
            }}
          />
        );
      }
      """

  Scenario: Publishing checklist
    Then the package passes typecheck and tests
      And LICENSE is present and correct
      And README covers install, peer deps, usage, theming, and troubleshooting
      And a dry-run publish succeeds via pnpm: "pnpm -r publish --dry-run"

  Scenario: Non-breaking migration from internal to external package
    Given the current internal imports like "../../components/forms/AutoForm"
    When switching to the external package
    Then imports become "@your-scope/autoform"
      And no code changes are required besides imports
      And the runtime output matches the internal behavior
