is a modern JavaScript runtime built as a drop-in replacement for Node.js, offering powerful features to enhance the developer experience. Beyond just running JavaScript, Bun includes an npm-compatible package manager, first-class TypeScript support, a built-in test runner, and robust support for Web APIs. One of its standout claims is its exceptional speed, attributed to its use of the JavaScriptCore engine and optimized system calls, making it one of the fastest JavaScript runtimes available.

This guide will walk you through Bun's features, giving you the knowledge to leverage Bun effectively and improve your development workflow.
Prerequisites

To follow this guide, ensure you have:

    The latest version of Bun installed. See the installation instructions for details.
    Familiarity with building applications using JavaScript.

Understanding Bun

Bun was created to address the complexities and performance limitations of Node.js, serving as a drop-in replacement. It was written in Zig and built on WebKit's JavaScriptCore engine to enhance its performance.

Key features of Bun include:

    Native support for TypeScript and JSX with automatic transpilation.
    Cross-platform shell scripting via the Bun.$ API.
    Built-in tools for watch mode, reading environment variables, and a test runner.
    Implementation of Web-standard APIs like fetch, ReadableStream, Request, Response, and WebSocket.
    Full compatibility with Node.js and npm packages.
    Support for Node.js core APIs, including fs, path, and Buffer.
    Seamless use of both CommonJS and ECMAScript modules (ESM).

With Bun, you can easily use CommonJS and ECMAScript modules without complexities in Node.js's module resolution process. As a drop-in replacement for Node.js, you can switch to Bun as your runtime with minimal application changes. You can integrate specific Bun features, such as its utility functions, package management, or APIs, into your existing Node.js codebase without fully migrating. Even if you fully transition to Bun, you'll still have access to Node.js APIs and npm packages, ensuring a familiar development environment with a wide range of tools and libraries.

We call when your
website goes down

Get notified with a radically better infrastructure monitoring platform.

Getting started with Bun

In this section, you'll begin by initializing the directory with Bun and writing your first program.

First, verify your installation:

bun --version

You should see an output like this:
Output

1.1.26

To initialize a new Bun project:

bun init

You'll be prompted with configuration options:
Output

package name (bun-article): bun-demo
entry point (index.ts): index.js
Done! A package.json file was saved in the current directory.

- index.js
- .gitignore
- jsconfig.json (for editor auto-complete)
- README.md
  To get started, run:
  bun run index.js

Bun creates a TypeScript-friendly environment by adding a jsconfig.json file to the directory. It also generates a package.json with "type": "module", enabling ES modules by default and creates a .gitignore file to exclude common files from version control.

Now, create a simple JavaScript file to test Bun:
index.js

function welcomeUser(user) {
return `Hello, ${user.name}!`;
}
console.log(welcomeUser({ name: "Alice" }));

Run the script:

bun run index.js

The output will be:

Hello, Alice!

With that, you've written your first program with Bun. You can now proceed to the next step is to learn about Bun's tooling.
Bun tooling

Bun simplifies development by offering a suite of built-in, stable tools that are ready to use right out of the box. Unlike Node.js, which for many years required developers to rely heavily on third-party packages for tooling, Bun provides an integrated experience from the start. The emergence of Bun and Deno has pushed the JavaScript ecosystem forward, leading Node.js to begin incorporating some of these built-in tools.
File watcher

To ensure a smooth development experience, Bun includes built-in options that eliminate the need to restart the server or download external dependencies like nodemon. Bun provides two modes for reloading your application when it detects changes:

    --watch
    --hot

The --watch mode automatically restarts your application whenever it detects changes in your files:

bun --watch index.js

The --hot mode reloads your code without restarting the entire process, distinguishing it from Node.js, which only offers a watch mode. This feature is particularly valuable for applications where maintaining state between changes is crucial, such as long-running HTTP servers.

bun --hot index.js

Test runner

Bun also has a built-in test runner that supports JavaScript and TypeScript. It offers features like mocks, hooks, snapshot testing, and UI and DOM testing.

When you use the test runner, it can automatically detect files that match common naming conventions:

    \*.test.{js|jsx|ts|tsx}
    \*\_test.{js|jsx|ts|tsx}
    \*.spec.{js|jsx|ts|tsx}
    \*\_spec.{js|jsx|ts|tsx}

Here’s an example test file:
index_test.js

import { expect, test } from "bun:test";

test("addition of two numbers", () => {
const result = 2 + 2;
expect(result).toBe(4);
});

Run the tests with:

bun test

When you run the test, you will see an output similar to this:
Output

bun test v1.1.26 (0a37423b)

index_test.js:
✓ addition of two numbers [0.66ms]

1 pass
0 fail
1 expect() calls
Ran 1 tests across 1 files. [121.00ms]

As you can see, you can test your code without installing additional tools.
Compile command for creating executables

Bun makes it easy to create standalone executables by compiling your JavaScript or TypeScript code. The advantage of this feature is that users can run your application without having to install Bun on their system.

To compile your code into an executable, use the following command:

bun build ./index.js --compile --outfile myindexcli

This will bundle the index.js into an executable, which you can run directly like this:

./myindexcli

Output

Hello, Alice!

This is much simpler than in Node.js, where you need to follow multiple steps or rely on a third-party package like pkg.

To target different operating systems, you can read the documentation for more details.
Environment variables

Environment variables are essential to projects as they allow you to configure settings outside your code. With Bun, you don't need to install a dependency to read environment variables; you can access them directly.

Assuming you have the following .env file:
.env

DATABASE_HOST="localhost"
DATABASE_PORT="3306"

You can read the variables with Bun like this:

console.log(Bun.env.DATABASE_HOST); // Outputs: "localhost"
console.log(Bun.env.DATABASE_PORT); // Outputs: "3306"

Built-in TypeScript support

Bun offers first-class support for TypeScript, allowing you to write TypeScript code (.ts and .tsx files) just like regular JavaScript files without complex configuration. Bun internally transpiles your TypeScript code into JavaScript for seamless execution.

For example, consider the following TypeScript program:
index.ts

interface User {
name: string;
}

function welcomeUser(user: User): string {
return `Hello, ${user.name}!`;
}

console.log(welcomeUser({ name: "Alice" }));

You can directly execute your TypeScript file in the terminal using the Bun command:

bun index.ts

This will output:

Hello, Alice!

Bun also provides a default tsconfig.json when initializing projects with bun init, which is configured with best practices like enabling the strict flag. However, Bun's runtime doesn't perform type checking, as types are removed during transpilation. You should still use tools like IDEs and tsc to check static type during development.
Configuring Bun

Bun is highly configurable, allowing you to fine-tune its behaviour across various aspects of the development process. So far, you've seen how Bun can work out of the box with common configuration files like package.json and tsconfig.json. However, when configuring Bun-specific settings, you use the bunfig.toml file.

The bunfig.toml file allows you to customize runtime behaviour, package management, and even testing configurations. For instance, you can preload specific scripts or plugins before running your code, define how JSX should be processed, or enable a low-memory mode for performance-sensitive environments. Additionally, you can manage logging levels, set up custom file loaders, and replace global identifiers with constant expressions.

Here’s an example that configures Bun to preload a specific script before running your code:
bunfig.toml

preload = ["./preload.ts"]

With this, Bun will run the preload.ts script before executing any other code with bun run.

You can also configure package management to control the installation of dependencies, decide whether to use exact versioning and specify custom package registries or caching behaviours.

For example, the following option determines whether Bun should generate a lock file:
bunfig.toml

[install.lockfile]
save = true

Now that you can configure Bun, the next section will explore into how dependency management works in Bun.
How dependency management works in Bun

Bun has a built-in package manager fully compatible with Node.js, making it a seamless replacement for popular tools like npm, yarn, and pnpm. When you run a command like bun install, Bun reads your package.json file and handles the installation of dependencies, devDependencies, and optionalDependencies. By default, Bun also installs peer dependencies, distinguishing it from other package managers.

After resolving dependencies, Bun generates a binary lockfile named bun.lockb in your project root. This lockfile format is optimized for speed, enabling faster parsing and installation in comparison to traditional JSON- or YAML-based lockfiles. This focus on performance is also evident when Bun installs packages: it downloads them into a global cache and checks this cache for future installs, minimizing unnecessary re-downloading.

For production environments, Bun supports a production mode where it skips the installation of devDependencies and optionalDependencies, ensuring that only the necessary packages are included:

bun install --production

Bun's flexibility extends beyond just npm packages. It also lets you install packages directly from Git, GitHub, or local and remotely-hosted tarballs. For example, your package.json could specify dependencies like this:
package.json

{
"dependencies": {
"lodash": "git+ssh://github.com/lodash/lodash.git#4.17.21",
"moment": "git@github.com:moment/moment.git"
}
}

You can customize the behaviour of bun install through the bunfig.toml configuration file. This file allows you to fine-tune aspects like whether to install optional, dev, or peer dependencies:
bunfig.toml

[install]

# whether to install optionalDependencies

optional = true

# whether to install devDependencies

dev = true

# whether to install peerDependencies

peer = true

This configuration gives you control over your dependency management process, ensuring that Bun meets the specific needs of your project.
Standard library

Bun offers a comprehensive standard library accessible directly through the Bun global object, so importing individual modules is unnecessary. This differs from Node.js, where you typically import specific modules to interact with files, manage child processes, or handle other tasks. Bun also emphasizes compatibility with standard Web APIs, ensuring ease of use and integration. Where no standard APIs exist, Bun introduces its own optimized solutions.

Bun provides a variety of powerful APIs, including:

    HTTP Server: Bun.serve() allows you to start an HTTP server with minimal configuration easily.
    File I/O: Bun.file() and Bun.write() offer methods for reading from and writing to the file system.
    Child Processes: Bun.spawn() and Bun.spawnSync() provide straightforward ways to manage child processes.
    TCP and UDP Sockets: Bun.listen() and Bun.connect() enable low-level network communication.
    HTML Streaming Transformations: HTMLRewriter provides tools for modifying and rewriting HTML content on the fly.
    Hashing and Cryptography: Bun.hash() and Bun.CryptoHasher() offer fast, secure methods for generating hashes and performing other cryptographic operations.
    Utilities: Bun provides a wide array of utility functions, such as Bun.version(), Bun.env(), and Bun.deepEquals(), to assist with everyday tasks like version management, environment variable access, and deep comparison of objects.

You can refer to the official documentation for a complete list of Bun APIs.

For instance, the code below demonstrates using Bun’s standard library to create an HTTP server:
index.js

Bun.serve({
fetch(req) {
const url = new URL(req.url);
if (url.pathname === "/") return new Response("Hello World!");
return new Response("404!");
},
});

This code sets up a basic HTTP server with Bun that responds with "Hello World!" when the root URL / is accessed and "404!" for any other path.

You can run the program with the following command:

bun run index.js

The server will continue running, and in another terminal, you can test the root endpoint with curl:

curl http://localhost:3000/

The output should be similar to this:
Output

Hello World!

Now that you have an idea of how to use Bun's standard library, you'll explore the Web Platform APIs it supports next.
