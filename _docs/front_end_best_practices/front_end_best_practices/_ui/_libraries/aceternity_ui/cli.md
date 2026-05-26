CLI

Installing Aceternity UI with the CLI
init

Use the init command to initialize configuration and dependencies for a new project.

The init command installs dependencies, adds the cn util, configures tailwind.config.js, and CSS variables for the project.

npx shadcn@latest init

You will be asked a few questions to configure components.json:

Which style would you like to use? › New York
Which color would you like to use as base color? › Zinc
Do you want to use CSS variables for colors? › no / yes

Options

Usage: shadcn init [options] [components...]
 
initialize your project and install dependencies
 
Arguments:
  components         the components to add or a url to the component.
 
Options:
  -d, --defaults    use default values i.e new-york, zinc and css variables. (default: false)
  -f, --force       force overwrite of existing components.json. (default: false)
  -y, --yes         skip confirmation prompt. (default: false)
  -c, --cwd <cwd>   the working directory. defaults to the current directory.
  -h, --help       display help for command

add

Use the add command to add components and dependencies to your project.

npx shadcn@latest add [component]

Options

Usage: shadcn add [options] [components...]
 
add a component to your project
 
Arguments:
  components         the components to add or a url to the component.
 
Options:
  -y, --yes          skip confirmation prompt. (default: false)
  -o, --overwrite    overwrite existing files. (default: false)
  -c, --cwd <cwd>    the working directory. defaults to the current directory.
  -p, --path <path>  the path to add the component to.
  -h, --help         display help for command

Monorepo

In a monorepo, you can specify the path to your workspace with the -c or --cwd option.

npx shadcn@latest init -c ./apps/www

or

npx shadcn@latest add alert-dialog -c ./apps/www

Installation through CLI

You can install Aceternity UI components through the CLI. Use the following command structure:

npx shadcn@latest add https://ui.aceternity.com/registry/[component].json

Adds a new component to your project.

npx shadcn@latest add https://ui.aceternity.com/registry/bento-grid.json