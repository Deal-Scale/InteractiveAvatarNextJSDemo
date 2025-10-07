Tips & Tricks: Deno Scripting
Bobby Galli
Bobby Galli
3 min read
·
Aug 16, 2023

Type-Safe Scripts with Invisible Dependencies
Automating Tasks With Deno Is So Easy a Dino Could Do It! (📸 bobbyg603)
Scripting ✍️

The other day I decided to write a script to manipulate some JSON and create a zip file from a collection of folders. Historically I’ve written scripts in a language native to the platform I was currently using, be it bash on Linux/MacOS or PowerShell on Windows. For simple operations, a primitive, untyped languages such as bash or PowerShell is usually fine. However, native OS scripting languages don’t work great across platforms, are difficult to debug, and often have unfamiliar syntax or unclear return types. How can you expect to write scripts efficiently if you’re wasting time setting up debuggers or learning goofy syntax quirks?
Node ❌

Adding a Node.js script to a project that isn’t already using Node.js requires a lot of boilerplate, thus making it a hard sell. Automating tasks with Node.js requires defining a package.json file for dependency management and installing dependencies creates a bloated node_modules folder in your project's root. Additionally it can take some heroics to configure TypeScript properly for Node.js. You could forgo the package.json file and rely on globally installed dependencies, but implicitly defining dependencies isn't a great idea when you need to work with a team or support CI/CD machines. Node.js is great for scripting tasks in Node.js projects, but is not a great option for automating tasks in other types of projects.
Python ❌

Developers often use Python to automate common project tasks. Python offers debug-ability, dependency management, cross-platform compatibility and is a solid choice if you already know Python. However, if you enjoy using types, Python’s type support isn’t native to the language, and often isn’t provided by package authors. For languages and packages you don’t use regularly, having types readily available improves your development speed by reducing the amount of time spent reading docs and searching for sample implementations. Python is a reasonable option for task automation, but it lacks some niceties and hinders productivity as a result.
Deno ✅

According to deno.land, Deno is “the easiest, most secure JavaScript runtime.” and has “the best developer experience without the learning curve”. With Deno, dependencies are defined by importing modules from URLs directly in the file that needs them. When you run a script with Deno, missing dependencies are automatically detected and installed behind the scenes. Deno supports TypeScript natively so there’s no need to set up a tsconfig.json file or fiddle with commonjs and ESM. Also, native TypeScript support means that the vast majority of packages in the Deno ecosystem are strongly typed right out of the box. VS Code supports debugging Deno scripts - all you need to do is install the Deno extension, type cmd + shift + p, and run Deno: Initialize Workspace Configuration.

The video below demonstrates how quickly I’m able to download and run a script using Deno that hasn’t previously been run on my system. The video is sped up by 3x in the interest of time.
Cloning a Repo and Running Deno Run for the First Time
