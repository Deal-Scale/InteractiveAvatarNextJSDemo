
Node js Best Practices and Security
Last Updated on Apr 16, 2025
Node js Best Practices and Security
Table of Content

    Node.JS Project Structure Best Practices
    Error Handling of the App
    Code Style Node.js Best Practices
    Node.js Security Best Practices
    Best Practices for Testing and Overall Quality
    Node JS Performance Best Practices
    Production Best Practices
    Conclusion

Node.js is a JavaScript runtime built on Chrome’s V8 JavaScript engine. Being an asynchronous event-driven JavaScript-based runtime, Node.js is widely used for building lightweight & scalable network-driven apps. Node.js applications development can be up-scaled easily in both directions- horizontal as well as vertical. Node js based apps are used for both client-side and server-side app. It has an open-source JavaScript runtime production environment/ model that provides caching of single modules. Due to which, the popularity of Node.JS in 2022 is expected to grow even more.

In this blog, we will be going through some of the important best practices for programming performance using node.js via relevant code examples. With the implementation of these best practices, the app automatically is able to minimize JavaScript runtime errors and turn into a high-performance, robust node.js application, and node process. Note that since the Node.js runtime is based on JavaScript, the standard JavaScript best practices also apply on top of the coding practices mentioned in this article. These best practices are applicable and can be used by Node Js development company and the entire Node.js developer community – from experts to beginners writing “hello world”! Without further ado, let’s take a look at them.
Node.JS Project Structure Best Practices
1. Divide Your Solution by Components

One of the hardest things for larger applications is to maintain a huge code base with tons of dependencies. This slows down production and development while adding new features. According to Node.js best practices, we should divide the entire codebase into smaller components so that each module gets its own folder, and certain that each module is kept simple and small.
Solution By Component

As a part of Node.js development services, some tried and tested best practices includes development of modular applications by dividing the whole codebase into modular components. In this way, we don’t have to share code with others (e.g. APIs, services, data access, test cases, etc.) This makes the process easier. So that it’s very easy to reason about it.
2. Layering Components

Layering is important and thus each component is designed to have ‘layers’. As a node.js best practices, these layers have a dedicated object that can be used on the web, logic, and data access code. By doing this, it can make a clean separation of performance issues and can significantly differentiate processes from mock and test codes.

Many developers mix the layers by passing the layer objects (Express req, res) to the Service layer and data layers. This makes your application tightly coupled. your app performance tightly coupled.
3. Use npm in it for a New Project

Npm init will automatically generate a package.json file for your project that shows all the packages/node app of npm install has the information of your project.
$ mkdir demo-node app
$ cd demo-node app
$ npm init –yes
 
Now you need to specify an engine’s key with the currently installed version of node (node -v):
 
"engines": {
  "node": "10.3.16"
}
view raw
npm_init_for_a_new_project.txt hosted with ❤ by GitHub
4. Wrap Common Utilities as npm Package

Larger app/project process typically has the same code used repeatedly multiple times at different locations. We can combine them into a single private package files and use that package at various places within our app. Npm install eliminates code duplication and makes code more manageable.
5. Separate Express ‘app’ and ‘server’

The most common mistake that many developers do in any project is to define the entire express application process on huge files. Instead of doing that, we should separate the ‘Express’ definition into at least two different files. One for the API declaration (app.js) and another one for the network concerns. We can also locate our API declarations within multiple components.
6. Using Environment Aware, Secured and Hierarchical Configuration File

As security best practices, we should keep our app-level keys easily readable from file and environment variables. We should also keep secrets outside the committed code and make a config file hierarchy for easier accessibility. To meet all this, a perfect and flawless configuration setup is required. There are few node.js development project structure that are available that can help to do this like rc, nconf and config.

Also, developers should leverage the power of npmrc file in their projects, which can automatically restarts a few environment production configurations during npm init like setting up production of metadata inside project package.json config file – Author name/email/licensing details/version, setting up production of npm registry changes, log levels, log messages output level changes, installing global modules and many more.

Developers can set default values can be set through npmrc file with the below commands:
npm config set init.author.name "Your Name"
npm config set init.author.email "name.lastname@tatvasoft.com"
npm config set init.author.url "http://www.tatvasoft.com"
npm config set init.license "MIT"
npm config set init.version "1.0.0" 
view raw
npmrc.txt hosted with ❤ by GitHub
7. Avoiding Garbage in-app

Node js has a default limit of 1.5 GB Single CPU core as process manager but still, it uses a greedy and lazy garbage collector. It waits until the memory usage is reached and gets recovered on its own.

If you want to gain more control over the garbage collector then we can set the flags on V8.

web: node --optimize_for_size --max_old_space_size=920 --gc_interval=100 server.js

You can also otherwise try to run the application using the Docker image. This is important if the app is running in an environment with less than 1.5 GB of available memory usage. For example, if you’d like to tailor a node.js to a 512 MB container, try:

web: node --optimize_for_size --max_old_space_size=460 --gc_interval=100 server.js

8. Hook Things Up

For automation, we can make use of Npm’s lifecycle scripts to make great hooks. If we want to run something before building our app, we can use preinstall script. You can use a post-install script in JSON package to develop assets with a grunt, gulp and browserify or webpack of production application.

In package.json:

"scripts": {
    "postinstall": "bower install && grunt build",
	  "start": "nf start"
}

To take hold of these scripts, you can also otherwise use an environment variable.

"postinstall": "if $BUILD_ASSETS; then npm run build-assets; fi",
"build-assets": "bower install && grunt build"

You can convert your scripts into files if they aren’t in control.

"postinstall": "scripts/postinstall.sh"

Scripts in package.json automatically have ./node_modules/.bin added to their PATH, so you can execute binaries like bower or webpack directly.
Error Handling of the App
9. Using Async-Await or Promises

Good development practices say to use javascript ‘synchronous function’ for multiple callbacks inside promises to handle async error this process results in a callback hell problem. We can take a look at the available libraries or async and await of javascript to overcome this performance issue. The process manager will use the promises function to catch code error. It reduces code complexity and makes code more readable.

Code Example – use promises
return A()
  .then((a) => B(a))
  .then((b) => C(b))
  .then((c) => D(c))
  .catch((error) => logger.error(error))
  .then(E())
Code Example - using async/await to catch errors
async function E() {
  try {
    const a= await A();
    const b= await B(a);
    const c= await C(c);
    return await D(c);
  }
  catch(error) {
    logger.error(error);
  }
}
view raw
promises.js hosted with ❤ by GitHub
10. Handling Errors Centrally

Every logic that handles errors like logging performance , sending mails regarding error should be written in such a way so that all APIs, night-jobs, unit testing can debug messages and call this method whenever any error occurs.
11. Validating Request Body

Developers can use available open-source packages like Joi to ensure the request body is proper and does not contain any malicious content. We can validate all the request parameters and body parameters to meet the expected schema before executing actual logic. By doing so we can throw an error to the user input that the requested body is not valid before executing actual logic.
12. Using Built-in Error Handling Mechanism

There are many ways otherwise available for developers to raise error and resolve them. They can use strings or even define custom types. The Built-in error object makes a uniform approach to handle errors within our source code and other open-source JSON packages.

It is also recommended to log errors and their names and other Meta properties of errors so that it can be easily identifiable.
// throwing an Error from typical function, whether sync or async
if(!productToAdd)
throw new Error('How can I add new product when no value provided?');

// 'throwing' an Error from EventEmitter
const myEmitter = new MyEmitter();
myEmitter emit('error', new Error('whoops!'));

// 'throwing' an Error from a Promise
const addProduct = async (productToAdd) => {
try {
const existingProduct = await DAL.getProduct (productToAdd.id);
if (existingProduct !== null) {
throw new Error('Product already exists!');
}
} catch (err) {
// ...
}
}
view raw
error_handling.js hosted with ❤ by GitHub
13. Always Await Promises before Returning to Avoid a Partial Stacktrace

When an error occurs, whether, from a synchronous or asynchronous flow, it’s imperative to have a full stacktrace of the error flow. Surprisingly, if an async function returns a promise (e.g., calls another async function) without awaiting, then an error should occur that makes the caller function disappear in the stacktrace.

This will leave the person to diagnose the problem with partial information – All the more if the error cause lies within that caller function then there is a feature v8, also called “zero-cost async stacktraces” that allow stacktraces not to be cut on the most recent await. But due to non-trivial implementation details, it will not work if the return value of a function (sync or async) is a promise. So, to avoid these loopholes in stacktraces for the cases when the returned promises would get rejected. So, we must always explicitly resolve these promises by waiting before returning them from the functions.
Code Style Node.js Best Practices
14. Use Linting Packages

There are many linting tools available, ESLint is one the most popular linting package which is used to check possible errors in code otherwise you can also check code styles to meet best practices standards. It identifies spacing issues to any potential code patterns that could lead to any security threats as well as possible app-breaking that could occur in the future.

There are also other tools available that automatically format code and put it in a more readable way. Also, it resolves minor syntax errors like adding semicolons at the end of each statement, etc.
15. Name Your Functions

You can name all the functions which may include the closures and callbacks. You can restrict the use of anonymous functions. Make sure you use the Naming function. Naming will allow you to simply implement what you want and then Take a snapshot of memory usage.
16. Proper Naming Conventions for Constants, Variables, Functions, and Classes

As a standard best practice, we should use all constants, functions, variables, and class names in lowercase when we declare them. Also, we should not use any short forms instead use only full forms that are easily understandable by everyone using it. We should use underscore between two words.

Code Example
// for class name we use Uppercase
class MyClassExample {}
// Use the const keyword and lowercase
const conf = {
  key: 'value'
};
// for variables and functions names use lowercase
let variableExample = 'value';
function foo() {}
view raw
naming_convention.js hosted with ❤ by GitHub
17. Use Const Over Let, Do Not Use Var

Const variables assigned cannot be changed, this will help you prevent the use of a single variable multiple times so that way we can keep our code clean. In some scenarios where we need to re-assign variables, we will use the let keyword. For example, in a loop, if we want to re-declare variable value we can use let.

Apart from this, “let variables” have blocked the scope, meaning they are accessible inside of a particular block where they are declared. Variables declared using var can be used anywhere inside the function.

The process manager is a simple command-line interface that keeps the inflow of scripts continuously in all the projects.
18. Add Required Modules at the Beginning, Avoid Inside Functions

We should put required modules at the beginning of the and avoid putting them in the middle of the function, By doing this we can easily identify dependencies of the entire file and avoid some of the potential performance issues.
19. Add Required Modules by Folders, Instead of Whole Files

We can place the index.js files which exports the module’s members so that we can import it into other files. It behaves as an interface to our module and makes it easy to change in the future without breaking the contract.

Code example
// Do
module.exports.ServiceProvider = require('./ServiceProvider');
module.exports.NumberResolver = require('./NumberResolver ');
 
// Avoid
module.exports.Service Provider = require('./ServiceProvider/ServiceProvider .js');
module.exports.NumberResolver = require('./NumberResolver /NumberResolver .js');
view raw
add_required_modules.js hosted with ❤ by GitHub
20. Use of Strict Equality Operator (===)

Use the strict equality operator === instead of weaker abstract equality operator = ==. == will convert two variables to a common type then compare them while === doesn’t type case variables, and ensures that both variables are of the same type and equal.

Example
null == undefined   // true
true == 'true'    // false
false == undefined  // false
'' == '0'           // false
false == '0'        // true
0 == '0'            // true
' \t\r\n ' == 0     // true
0== ''             // true
false == null       // false
view raw
equality_operator.txt hosted with ❤ by GitHub

All above statements will return false when === is used
21. Don’t Use Callbacks, Instead Use Async Await

Async-await is supported in all node.js version above Node 8 LTS. We can minimize the use of ‘callbacks’ and ‘promises’ to better deal with asynchronous code. It makes code look synchronous but in reality, it’s a non-blocking mechanism. The best thing with async-await we can do is to make code compact and make code syntax like try-catch.
22. Using Arrow Functions (=>)

The Arrow functions make the code more compact and keep the lexical context of the root function (i.e. this). However, it is a suggestion to use async-await applications to stop the use of functional parameters when they are working with old API’s which can accept promises or callbacks.
Node.js Security Best Practices

We can implement the below security practices to keep the Node.js application safe from attacks. In this blog, we have ensured to cover all the top OWASP (Open Web Security Project) practices for all the Node js security vulnerabilities you come across. Please find security tips below for your web application.
23. Use Lint Plug-ins

We can use linter plugins like eslint-plugin-security to identify security plugins and vulnerabilities when we implement codes in Node.js.
Possible Errors

These rules relate to possible syntax or logic errors in JavaScript code:
for-direction 	enforce “for” loop update clause moving the counter in the right direction.
getter-return 	enforce ‘return’ statements in getters
no-async-promise-executor 	disallow using an async function as a Promise executor
no-await-in-loop 	disallow ‘await’ inside of loops
no-compare-neg-zero 	disallow comparing against -0
no-cond-assign 	disallow assignment operators in conditional expressions
no-console 	disallow the use of ‘console’
no-constant-condition 	disallow constant expressions in conditions
no-control-regex 	disallow control characters in regular expressions
no-debugger 	disallow the use of ‘debugger’
no-dupe-args 	disallow duplicate arguments in ‘function’ definitions
no-dupe-else if 	disallow duplicate conditions in if-else-if chains
no-dupe-keys 	disallow duplicate keys in object literals
no-duplicate-case 	disallow duplicate case labels
no-empty 	disallow empty block statements
no-empty-character-class 	disallow empty character classes in regular expressions
no-ex-assign 	disallow reassigning exceptions in ‘catch’ clauses

Linting plug-ins, which ensures we eliminate the vulnerable code during the development process.
24. Prevent DOS Attacks by Using Middlewares

In case when the legit users do not receive the desired service or in case they receive degraded services, here we can ensure that our node app is under the threat of a DOS attack.

To prevent this situation from happening, we should implement rare limiting using middleware for apps. For larger apps, there are some plug-ins available like rate-limiter-flexible package, Nginx, cloud firewalls, cloud load balancer.
25. Prevent SQL Injections

When you frequently use JS strings or string concatenations, this increases the risk of database manipulation. This practice makes your information invalidated, and the developed app highly vulnerable to SQL injection attacks.

In-built security against certain SQL injection attacks is available for ORMs such as Sequelize and mongoose. The built-in indexed parameterized queries provided by Object-Relational Mapping/Object Document Mapper ORM/ODM or database libraries supporting indexed parameterized queries must always be used to avoid these attacks.

Bad example:
public async searchDrivers(id:number, name:string): Promise<drivers[]> {
    const drivers = await db.sequelize.query(
      `SELECT * FROM "get_drivers"(${id}, ${name})`        
    );
 
  return drivers
}
</drivers[]>
view raw
SQL_injections_bad_example.js hosted with ❤ by GitHub

Good example:
public async searchDrivers(id:number, name:string): Promise<drivers[]> {
    const drivers = await db.sequelize.query(
      `SELECT * FROM "get_drivers"($id, $name)`,
	bind:{
		$id: id,
		$name: name
	}
    );
 
  return drivers
}
</drivers[]>
view raw
SQL_injections_good_example.js hosted with ❤ by GitHub
26. Secure Transmission of Data

For our application data’s integrity and confidentiality in transit is very important. One of the major reasons that compromise the application security of our data and confidentiality are some encryption misconfiguration in the tested infrastructure.

Protocols like TLS (Transport Layer Security) and SSL (Secure Sockets Layer), are used to establish an encrypted end-to-end connection between client side and server (web server and a browser). SSL makes use of strong ciphers and secure algorithms, for client-server communication the same way TLS ensures sensitive data such as card details and user credentials be transmitted securely.
27. Manage HTTP Headers

In order to prevent clickjacking, cross-site scripting (XSS attacks), and other malicious attacks, you can create a new impact on impactful impactful node.js applications with secure HTTP headers. We can use plug-ins like the helmet which is easy to configure and create our own Node.js security rules.
Recommendation:

Use HTTP headers as per the project’s requirements as shown below

    Access-Control-Allow-Origin: This shows if the response can be shared with requesting client from the given origin.
    Server: Describes the server information that generated the response.
    Strict-Transport-Security: Ensures website is accessed through HTTPS instead of HTTP.
    X-Content-Type-Options: Makes sure that MIME types mentioned in Content-type cannot be changed. In this way, you can restrict the app from MIME type sniffing.
    X-XSS-Protection: In the older versions of IE, Chrome and Safari it prevents loading of webpages when they find XSS attacks. Modern web browsers don’t need this kind of production setting when sites implement a strong Content-Security-Policy as it already disables inline javascript.
    X-frame-options: This header makes sure if a page is allowed to be rendered in frame/iframe.
    Content-Security-Policy: This helps to track and stop threats such as XSS attacks (Cross-Site Scripting) and data injection. These attacks can cause data theft, site defacement, and distribution of malware.
    Referrer-Policy: It controls how much referrer information should be included in requests

Recommendation:

Use HTTP headers as per the project’s requirements as shown below
Remove below HTTP headers,

    x-powered-by: It is set by servers to show what kind of servers are being requested. It unveils what technologies being used to develop the application which can be useful to attackers.

28. Examine for Vulnerable Dependencies

In any Node.js application, we can use any of the open-source packages available in various process management tools. We must always be sure of which dependencies package has and what patches are being made from time to time to keep our application safe. Here we are implementing functions with tools like nsp or snyk, and npm audit, to track, monitor, and patch vulnerabilities.

L../code/vacasb.github.10 node v10.15.1] (update-deps) $ npm 1
 npm WARN friendly-errors-webpack-plugin@1.7.0 requires a peer of webpack@^2.0.0 || ^3.0.0
 
audited 28156 packages in 8.916s
found 24 vulnerabilities (10 low, 11 moderate, 2 high, 1 critical)
run ‘npm audit fix’ to fix them, or ‘npm audit’ for details

29. Control Request Payload Size

When the traffic on our application increases, it is difficult to process other important requests, which lowers app performance and exposes our application to Denial-Of-Service (DOS) attacks. A bigger request body is executed by a single thread.

Because of the bigger payload size, attackers can implement vulnerabilities even without making multiple requests. We can limit the body size by using express body-parser that accepts only small-size payloads.

Example:-

Express body-parser throws an error if the request payload is greater than the specified limit.

Request entity too large

When the entered body crosses the size mentioned in the “limit” option, express throws the above error. The limit set in the byte limit and the length set to the body’s length. The status is set to 413 and the type is set to ‘entity.too.large’.
30. Hide Error Details from Clients

In the node.js application, We should use our own error handler that has the ability to handle server errors. While doing that, we must prevent the entire information to the user because it might expose some of our application’s sensitive data like physical paths of files, connection string, sensitive code, etc.

Bad Example of Error files:

SequelizeForeignKeyConstraintError: update or delete on table drivers violates foreign key constraint "drivers_driver_id_fkey" on
table " drivers_devices"
at Query.format Error (D:\Projects\api-
2\api lambda drivers.webpack\service webpack:\node_modules seguelize lib\dialects\postgresquery.js:295:1)
at
query.catch.err (D:\Projects\api-
2\api lambda drivers\.webpack service webpack:\node_modules sequelize\lib\dialects\postgresqueryjs:72:1)
at
tyCatcher (D:\Projects\api-2\api lambda drivers\.webpack\service webpack:\node_modules\bluebird is release\util.js:16:1)
 
 at Promise. settlePromiseFromHandler (D:\Projects\api-
2\api lambda drivers\.webpack\service webpack:\node_modules\bluebird is release\promise.js: 547:1)
at
Promise. settlePromise (D:\Projects\api-
2\api lambda\drivers\.webpack\service\webpack:\node_modules\bluebird is release\promise.js:604:11
at
Promise._settlePromised (D:\Projects\api-
2\api lambda drivers.webpack\service\webpack:\node_modules\bluebird is release\promise.js:649:1}
at
Promise. settlePromises (D:\Projects\api-
2\api lambda\drivers\.webpack\service webpack:\node_modules\bluebird is release\promise.js:725:1)
at
drainQueueStep (D:\Projects\api-2\api lambda\drivers webpack\service webpack:\node_modules\bluebird is release async.js:93:1)
   at_drainQueue (D:\Projects\api-
2\api lambda drivers\.webpack service webpack:\node_modules\bluebird is releaselasync.is:86:1)
at
Async../node_modules/bluebird/js/release/async.is. Async._drainQueues (D:\Projects\api-
2\api lambda\drivers\.webpack\service\webpack:\node_modules\bluebird is release async.js:102:1)
at
Immediate Async.drainQueues (as_onlmmediate) (D:\Projects\api-
2\api lambda\drivers\.webpack\service webpack:\node_modules\bluebird is release async.is:15:1)
at runCallback
(timers.is: 705:18)
at tryOnlmmediate (timers.js:676:5)

Good Example

{“message”: Requested resource is already in use, you cannot delete it.}

31. Configure 2FA for NPM or Yarn

The attackers can exploit the user-sensitive information and install malicious software in project libraries, even if we apply multi-factor authentication (MFA). If the attackers insert the malicious malware into the public domain, it is possible to degrade the whole web program and web app. Therefore, with npm/yarn, we must use two-factor authentication 2FA, which leaves little hope for hackers.
Best Practices for Testing and Overall Quality
32. Implement Automated Testing

You should plan your project deadline in such a way that all your developed functionality by developers can adhere to automated testing. It helps to test APIs without even actually calling them. We can mock database calls, and also it makes sure if the last changes done by someone else are not broken after implementing new features.
33. Structuring Test

You can use Arrange, Act & Assert (AAA) to structure your tests with 3 well-separated sections. Arrange contains all the data or parameters or expected output which will be used in subsequent calls or comparing actual and expected results, Act – calls actual implementation with all arranged parameters, Assert – compares the actual result with the expected result.

Code example:
describe.skip('Employee classification', () => {
    test('When employee ranks more than 3.5, classify as Good', () => {
        //Arrange
        const employee = {rank:3.5, joined: new Date(), id:1}
        const stub = sinon.stub(db, "getEmployee")
            .reply({id:1, class: 'Good'});
        //Act
        const actual_result = employeeClassifier.classifyEmployee(employee);
        //Assert
        expect(actual_result).toMatch('Good');
    });
});
view raw
structuring_test.js hosted with ❤ by GitHub
34. Detect Code Issues with a Linter

We can use linter plugins like eslint-plugin-security to catch code issues while we are coding our node.js app. Linting plugs-ins, which ensures we eliminate vulnerable code while developing.
35. Avoid Global Mock Data

While writing test cases we should use separate mock data for each process case rather than declaring it as global and modifying it every time.

Good Code example:
it("When name, it should get success message", async () => {
  const site = await service.add({
    name: "oldName"
  });
  const result = await service.update(site, "changedName");
  expect(result).to.be(true);
});
view raw
avoid_global_mock_data_good_example.js hosted with ❤ by GitHub

Bad Code Example:
before(() => {
 
  await dbmock.GetDataFromJson('mock.json');
});
it("When name, it should get success message", async () => {
 
  const site = await service.add({
    name: "oldName"
  });
  const result = await service.update(site, "changedName");
  expect(result).to.be(true);
view raw
avoid_global_mock_data_bad_example.js hosted with ❤ by GitHub
36. Inspect Vulnerable Dependencies

We can use tools like NPM audit or snyk.io to check vulnerable dependencies.
37. Tag Your Tests

There are multiple scenarios where we have to run tests like smoke testing, before committing changes to a source control system or when the pull request is created. We can do this by using tags on tests with different keywords.
38. Check Test Coverage

Each testing environment comes with this feature that shows how much percentage of your code is converted under test cases. Some of the frameworks also show different colored texts to identify whether the code is covered or not, or code is covered but the branch is not covered, etc. We can set a minimum limit of test coverage % before committing code to make sure most of the statements are covered.
39. Inspect for Outdated Packages

When we add any open-source package then we must check at regular intervals if it is outdated or not. We can do this using available packages like npm-check-update. We can add it into the CI-CD pipeline so that it checks if all the packages are up to date before deploying code to production, otherwise, the build fails and shows an Notice that a particular package is outdated.
40. Use Mock Data that is Similar to Real Data

In end-to-end testing, we should not use live data but we should use data that is identical to real ones so that it won’t affect the real data and proper testing can be performed.
41. Use Static Analysis Tools

Tools like SonarQube and Code Climate can do a static analysis that helps to improve code quality, performance and keeps our code manageable. We can add these tools to the CI-CD pipeline which causes build failure when they detect any areas where we can improve code quality so as to boost performance.
Docker Best Practices
42. Avoid npm Start, User Node Command to Bootstrap

You can try using CMD [‘node’, ‘myServer.js’] to start your application instead of using npm scripts. The reason behind it is that npm scripts cannot pass OS signals to the code. Besides, your code won’t notify any system shutdown, when no signals are passed. Hence there is a chance that your code will lose the ability to properly close currently running requests and data operations. So from a stability point of view, try avoiding npm scripts with docker.
43. Clean-up Dependencies before Production Release

When an image is shipped to the production, it must be clean from any kind of development dependencies and must also be minimal. Even though Dev-dependencies are necessary during the build and test lifecycle, eventually one needs to make sure to produce clutter-free production images. This guarantees the number of potential attacks is minimized. Also, it is worth noting that many infamous security vulnerabilities & breaches were found in the development packages.

While the development team decides to use the multi-stage build, achieving it can be really easy. All one needs to do is install all the dependencies and then finally run the below command:

npm ci --production

44. Avoid Secrets in Args & Clear Build-Time Secrets

One should make sure that no secret variables are leaking from the docker build environment. This is the case because a docker image is shared among multiple environments which are not as sanitized as the production environment. This can be avoided with a file like .npmrc. We can copy secrets to .npmrc and after doing so, we can remove them by using a Docker build-kit and multi-stage build secret feature that doesn’t give up any sort of traces.
45. Clean NODE_MODULE cache

It is good practice to remove the local cache after installing the dependencies. It makes somewhat sense to duplicate dependencies that enable faster installs for the future as there won’t be any further installs because of the immutable image of Docker.

If this is not done, then the resulting image will get shipped to production with 30% more size containing the files that are never going to be used.
46. Lint Your Dockerfile

Linting is always important and linting your dockerfile is no different. It can identify issues with dockerfile that differ from best practices. With the use of a specialized Docker linter, if the expert checks the potential flaws, he can easily find our performance and security improvements which can save countless hours that were wasted or can even save time that goes behind checking security issues in production code.
Node JS Performance Best Practices
47. Make Sure Not to Block the Event Loop

One must avoid CPU-intensive tasks as they have the potential to block mostly single-threaded event loops. They even offload single-threaded event loops to a dedicated process, thread, or even a different technology as per the context.

Because the Event Loop has been blocked, Node.js will be unable to manage other requests and this can cause delays for concurrent users. The content might be ready to get served, multiple users might be ready for a response, but if one single request blocks the server from shipping the results back, it can all be wasted. So it is advisable to make sure not to block the event loop.
48. Native JS should be Preferred Over User-land Utils

It is often more resource-consuming to use utility libs like lodash over native methods as it leads to unnecessary dependencies and overall slower performance. With the new V8 engine with new ES standards, native methods are performing better than before and 50% faster than utility libraries. So try to avoid using utility libraries until necessary.
Production Best Practices
49. Increase Transparency Using Smart Logging

Logs are often ignored at the project inception but they can be a life-saver when debugging a production-ready complex application. So it’s advisable to plan your logs from the first day. A proper framework should be defined for collecting, storing, and analyzing logs to ensure that desired information can be extracted easily in the time of need.
50. Lock Dependencies

Before NPM5, it allowed dependencies to move across different environments by default. To overcome this, one should use npm config files (.npmrc) that advise saving the exact version of each package to each environment.
51. Utilize All CPU Cores

When we talk about the basic form of Node application, we can see that it runs on a single CPU core while all cores are left unproductive. So it becomes the developer’s duty to utilize all CPU cores to reduce performance bottlenecks. For small to medium applications, you can use PM2 or Node Cluster. For a larger application, one must consider replicating the process with the use of some deployment scripts or Docker clusters that are based on the Linux init system.
52. Guard the Memory Usage

Node.js has a tricky relationship with memory management. The v8 engine comes with some soft limits on memory usage (1.4GB). Besides this, there are even some known memory leaks present in Node’s code and because of this, it becomes mandatory to monitor the memory usage of Node. Small apps can do with using shell commands periodically but in larger apps consider using a robust monitoring system to stay on top of memory usage of Node.
53. Front-end Assets Out of Node

It is good practice to store front-end assets to a dedicated location like S3, CDN, etc. because the node’s performance gets hit when it has to deal with many static files because of its single-thread model.

So it is always advisable to store front-end assets to dedicated storage rather than within the node server.
54. Use Automated Vulnerability Detection Tools

Even the most renowned dependencies such as Express have known issues that can put systems at risk. It can be easily rectified with the use of commercial and community tools that constantly keeps a check on the system for vulnerabilities and warn so that someone can address them instantly.
55. Set NODE_ENV=production

It is best practice to always set the environment variable NODE_ENV to ‘development’ or ‘production’ to indicate if the production optimizations should get mobilized. It is important since many npm packages discover the current environment and then it tries to optimize their code for production.
56. Prefer Using the LTS Release of Node.js

Using a Long Term Support version of Node gives you an added security of getting critical bug fixes, security updates, and performance improvements for a longer period. So it is advisable to use the LTS version of Node.js unless there is a strong reason not to do so.
57. Always Install Packages with npm ci

When it comes to installing packages, one needs to be sure that the production code is always using the same version of the packages that you have tested it with. So running npm ci would rigidly do a clean install of your dependencies corresponding to package-lock.json and package.json. Use of this command is recommended when it comes to automated environments such as CI/CD pipelines.
Conclusion

By enlisting the industry-standard Node.js best practices that are followed by us, we want to ensure all Node.js aspirants adopt them from the beginning of their development journey to produce high-quality production applications. These best practices can also be equally valuable for experienced developers wanting to hone their Node.js skills. With the help of these coding best practices, style guides and techniques, you can easily improve your application performance.

We have presented an info-graphical representation of Node.js Best Practices. Take a look:
NodeJS-Infographics
Want to embed this image? Please cite source to TatvaSoft.com

Share this Image On Your Site

Please include attribution to TatvaSoft.com with this graphic.
<a href="https://www.tatvasoft.com/blog/node-js-best-practices/"><img src="https://www.tatvasoft.com/blog/wp-content/uploads/2021/02/NodeJS-Infographics.jpg" alt="Nodejs Best Practices" width="952" height="3948"></a>

Frequently Asked Questions about Node.js (FAQ)
Q1.What are the best practices in Node js?

Node.js is one of the most popular choices when it comes to developing robust and scalable web applications. The capabilities of Node.js have brought big differences in the process of software development and that’s because you follow best and tested practices.

    Try to initiate all the projects in npm.init. This will enable the same project setup for simpler performance and will also get improved.
    Node Package manager- NPM set up is another important way for developers to work on the same type of javascript environment without specific dependencies.
    You can add scripts to your package. This will standardize all commands and add value to the launch of the application.
    Actions to Configuration management should be in place. Tthis is possible by loading environment variables from Github.
    Javascript also provides a simple style guide, you can adapt the one that suits for your business the most.
    Be prepared for the errors by maintaining a strategy for Exception management
    Try executing automated vulnerability scanning.
    Maximize the use of logging libraries for better vision and management of errors.

Q 2. How is Node better and faster?

Node js is a better and faster application but there lies many more aspects that makes it successful. Nodejs is single-threaded hence the operations have no waiting time. There are separate threads created for all operations which makes it faster and highly responsive. Also, the javascript has JIT compilation which combines with the machine functions and boosts the execution speed. This again makes the application run faster and show improved results.
Q3. Which Node framework is the best?

The frameworks are an irreplaceable part of the node and thus it is important to opt for a framework that works best for you. Here is a list of the best frameworks from which you can choose for your web apps.

    Express.js – One of the best frameworks currently with a plethora of new-edge features
    Socket.io- Best for full-stack development platform with lucid and clear API.
    Hapi- It’s an open-source Node.js framework with in-built plugins that simplified the process of development and enhances user experience.
    Feathersjs- It’s a backend development tool that ensures flexibility and convenience of fixing bugs speedily.
    Total.js- This framework offers CMS-like experience with a scope in the future IoT, REST services at a reasonable cost.

Q4. Is Node js more secure than PHP?

Node.js is secure and faster than PHP because it is lightweight and asynchronous. There are no security blockages or threats that interrupts the process since it is backed up with stronger Javascript code. It is also managed by the NPM package which also keeps security at front for both client and server side processing.
Q5. Why is Node JS faster than Java?

Though technically this is not a good comparison because Java is a language, while node.js is an ecosystem built on the basis of Javascript. Node js can work with multiple frameworks and yet it is light and simple in comparison to Java. It also offers ease and speed in code writing which makes it more preferable. Also, for Java you need a JVM or JIT compilation and some high-level language like Scala to write codes. This sometimes complicates the process while in Node it has NPM management and other library functions that manages all types of dependencies effortlessly. Hence Nodejs is faster than Java.
Q6. Is node the same as MVC?

No, Node is not the same as MVC. The confusion might have occurred because both of them are design-centric. It is not right to compare both because MVC is an architecture and Node is just a framework based ecosystem. MVC architecture is holistically responsible for the development of apps and has many other attributes concurrently playing a part. While Node.js is truly unique – rather than being a framework, Node.js is a cross-platform runtime environment designed for server use. Where once you might only see JavaScript in client-side programming, Node.js marks a bit of a revolution which takes care of the View side of apps.
Q7. When should I use Node JS?

Using Nodejs is a confirmed decision but when to use Node.js depends on what are your requirements and applications. Here are some of the business scenarios when node.js has performed at its best in the past.

    The best application of Node.js is seen in real-time applications like Online games, chat rooms, or any other type of real time need. The frameworks are extremely responsive and hence the users will get immediate response to all queries or actions.
    If you have a low-load application with less CPU cycles then this one works well for you. The non-blocking system gets stressed and consumes a lot of CPU cycles which delays the overall cycle and time.
    It also performs best for prototyping, Agile development and Rapid Product iteration.
