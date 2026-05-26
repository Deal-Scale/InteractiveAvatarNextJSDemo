9 Playwright Best Practices and Pitfalls to Avoid
API Monitoring
Best Practices
Playwright
Ayooluwa Isaiah
Updated on February 28, 2024

If you want to improve the reliability, efficiency, and effectiveness of your Playwright tests, the best place to start is by implementing best practices and avoiding common pitfalls.

In this guide, we will cover 9 essential best practices to help you write more effective Playwright tests for your websites and applications.

Get a call when your website goes down.

Playwright best practices

    Define your end-to-end test coverage goals
    Use stable selectors to locate elements
    Keep your tests focused and isolated
    Focus your tests on user interactions
    Write descriptive test and step titles
    Test in all relevant browsers
    Continuously run and monitor your tests
    Use Playwright's tooling to your advantage
    Don't test factors out of your control

1. Establish your test coverage goals upfront

Before writing end-to-end (E2E) tests for your application, it's necessary to first determine the key workflows that should be tested. Since not all workflows are equally crucial for E2E testing, an ambition to to achieve 100% test coverage for every feature is unrealistic and impractical for most apps.

The focus should be on capturing the essence of user interaction through the testing of core, frequently utilized workflows that are pivotal to business functionality. This strategy guarantees the inclusion of critical features within a reasonable testing scope. For a standard CRUD (Create, Read, Update, Delete) application, essential workflows may encompass:

    User account creation and login.
    Data entry and retrieval, like adding or viewing records.
    Updating existing records.
    Deleting records or account deactivation.
    Processing transactions or changes in data status.

To understand where to place your testing focus, consider using analytics tools that show your most frequently used URLs, as well as the devices and browsers used to access your application. This provides a useful starting point when deciding what aspects of your application to test.

Screenshot 2024-02-27 at 08-01-59 Plausible Analytics Live Demo.png

It's also important to not overlook less common but significant workflows like account recovery and password updates. Although these functions might be infrequently executed, their malfunction can drastically degrade user satisfaction. Including these in your tests ensures that potential issues are identified and rectified swiftly, maintaining a high-quality user experience.

Once you've identified the critical workflows, you can begin to construct an efficient and targeted E2E test suite that effectively covers your needs. 2. Use stable selectors to locate elements

Before you can test the behavior of your web application, you need to find elements on the page and perform actions on them. Playwright encourages using its built-in locators to select the elements you're interested in.

For example, assuming you're interested in clicking the following button:

<button data-testid="post-comment" title="Submit" class="btn btn--green btn--large btn--text-shadow" data-style="expand-right">
  Post comment
</button>

You could use a variety of locators such as getByRole(), getByTitle() or getByTestId() as follows:

await page.getByTestId('post-comment'); // select element using its `data-testid` attribute

await page.getByRole('button', { name: 'Post comment', exact: true }); // select element based on accessibility attributes

await page.getByTitle('Submit') // select element using its `title` attribute

These locators are essential to writing maintainable, resilient and non-flaky tests (when tests randomly fail without any code changes) in Playwright for several reasons:

    They allow easy targeting of elements in complex web applications, even if they don't have specific IDs or classes.

    They are designed to handle dynamic content gracefully by automatically waiting for elements to appear, disappear, or change state, which is particularly useful for testing JavaScript-driven web UIs.

    Every action using a locator fetches a fresh DOM element, ensuring the latest version is always used even if the DOM changes between actions.

    Locators can also be chained to refine your element targeting further which is useful for navigating complex DOM structures.

The Playwright team recommends prioritizing role locators (getByRole()) to select elements since it closely mirrors how users and assistive technologies view the page.

Selecting Locators in Playwright

Alternatively, employing data-testid attributes for element identification offers a stable method for element targeting, safeguarding against test fragility.

The main issue with test IDs is that they may not mimic real user interactions, as users rely on visual cues and text, not IDs, which could possibly cause a disconnect between the tests and actual usage. 3. Keep your tests focused and isolated

Playwright tests are designed to run in isolated environments, ensuring each test has its own local storage, session storage, cookies, and so forth. This isolation guarantees that tests are unaffected by the outcomes or side effects of others, promoting independent and reliable test results.

To benefit from this architecture, you must keep your tests streamlined and focused so that they precisely mirror the workflow they are intended to assess.

For example, when writing E2E tests for a TodoMVC application, it might seem efficient to cluster multiple operations on to-do items within a single test for time savings:

test('existing todo actions', async ({ page }) => {
await page.goto('https://todomvc.com/examples/react/dist/');

// locate the todo input element through its placeholder
const todoInput = page.getByPlaceholder('What needs to be done?');

// Add the todo items

// Verify that the todo item was added

// Edit the newly added item

// Verify the to-do item is edited

// Mark as completed

// Verify that the item is marked completed
});

However, bundling these actions compromises the ability to test each functionality in isolation and could leading to cascading failures across your test suite.

A more effective strategy involves stripping tests of interdependencies and extraneous steps, focusing solely on the behaviors or actions pertinent to the workflow under examination.

You can avoid repeating yourself through the before and after hooks which lets you minimize step duplication by performing certain actions before and after each test.

In the example below, the beforEach() hook is used to navigate to the To-do app and pre-fill the app with to-do items before each test.

test.describe('existing todo actions', () => {
test.beforeEach(async ({ page }) => {
// Visit the page and add todos before each test
await page.goto('https://todomvc.com/examples/react/dist/');

    // Add todos and verify that they were added

});

test('user can edit a todo', async ({ page }) => {
// . . .
});

test('user can mark a todo as completed', async ({ page }) => {
// . . .
});

test('user can delete a todo', async ({ page }) => {
// . . .
});
});

This way, each test is completely isolated from all others avoiding unnecessary steps that fall outside the workflow's scope. For more intricate scenarios, such as reusing authenticated sessions across tests, you can use Playwright's setup project. See the Authentication docs for guidance on implementing these advanced testing patterns. 4. Write assertions from an end-user's perspective

Meaningful assertions are those that accurately mimic user interactions and expectations within your application. They are not just about checking if an element is present but verifying that the application's behavior aligns with what a user would expect or do. This includes:

    Verifying the presence or absence of specific content.
    Ensuring elements or text appear as expected on a page.
    Checking that a list has a specific number of children.
    Confirming that an element is enabled or focused.

For instance, when a user orders something from your website, a meaningful assertion could check that a confirmation dialog appears with a message like "Thank you for your order!":

await expect(page.getByText('Thank you for your order!')).toBeVisible();

Screenshot from 2024-02-28 09-35-17.png

This directly reflects the user's expectation of receiving immediate feedback upon form submission and gives you confidence in your application's checkout effectiveness.

Using auto-retrying assertions like toBeVisible() configures Playwright to automatically wait for the expected condition to be fulfilled or until a timeout occurs (set to five seconds by default). This reduces test flakiness since short, intermittent delays in the network won't cause the test to fail. 5. Use descriptive test and step titles to clarify intent

Imagine it's late in the day and you're wrapping up several hours worth of refactoring effort. Everything seems to be in order, but then a test fails:

1. [chromium] › example.spec.js:4:1 › has title ──────────────────────────────────────────────────


    Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

    Locator: locator(':root')
    Expected pattern: /Playwright docs/
    Received string:  "Fast and reliable end-to-end testing for modern web apps | Playwright"

At this moment, deciphering the issue from such output becomes a puzzle. You'll definitely need to read your test scripts and actions to figure out where things went wrong.

Contrast this with a scenario where the test output is more informative:

1. [chromium] › example.spec.js:4:1 › Page title should contain Playwright docs substring ────────


    Error: Timed out 5000ms waiting for expect(locator).toHaveTitle(expected)

    Locator: locator(':root')
    Expected pattern: /Playwright docs/
    Received string:  "Fast and reliable end-to-end testing for modern web apps | Playwright"

Suddenly, the problem area becomes clear. The precise failing action and the expected versus actual outcomes are immediately evident.

By using descriptive names for your tests and steps, you'll ensure a faster troubleshooting process, and it also helps with preventing the test from becoming overloaded with superfluous checks.

Here's a practical example using Playwright to illustrate the value of descriptive test naming:

test.describe('User login flow', () => {
test('Valid user credentials redirects to profile dashboard', async ({ page }) => {
await page.goto('https://example.com/login');

    await page.fill('input[name="email"]', 'user@example.com');
    await page.fill('input[name="password"]', 'securePassword123');

    await page.getByRole('button', { name: 'Login' }).click();

    // Asserting the redirection and welcome message
    await expect(page).toHaveURL('https://example.com/dashboard');
    await expect(page.getByText('Welcome, user!')).toBeVisible();

});
});

In this example, the test suite is named "User login flow", and the test itself is labeled "Valid user credentials redirects to profile dashboard". These titles are not only indicative of the workflow being tested but also of the specific user actions and expected outcomes, such as filling out the login form and being redirected to the dashboard upon successful authentication.

Playwright supports structuring tests in a way that each step can be understood through its actions (e.g., page navigation, filling out forms, clicking buttons) and assertions (e.g., URL changes and visibility of elements). And with its UI mode, you're able to easily connect each test action to a UI screenshot, helping you visualize the effects of each step. 6. Test in all relevant browsers

Playwright simplifies cross-browser testing on any platform to ensure that your application functions correctly for all users. Within your configuration file, you can establish projects, specifying their names along with the designated browser or device.

Screenshot 2024-02-28 at 09-56-52 Playwright Test Report.png

The defaults are Chromium, WebKit, and Firefox, but you can also included branded browsers like Google Chrome, Safari, and Microsoft Edge. You can also emulate mobile and tablet viewports easily in the same manner:
playwright.config.js

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
projects: [
{
name: 'chromium',
use: { ...devices['Desktop Chrome'] },
},

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    },
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 15'] },
    },

],
});

For a comprehensive list of supported devices, refer to the device parameters registry. 7. Automate and monitor your tests

Running tests solely on your local environment is insufficient for a robust development cycle. It's also necessary to integrate them into your CI/CD processes so that you can monitor them alongside your builds.

Ideally, tests should run on every commit and pull request made to your project repository, and Playwright makes this really easy by providing sample configurations for common CI providers such as GitHub Actions, Azure Pipelines, Circle CI, and others.

playwright-github-actions.png

As you create more tests, it's important to consider their execution times because they directly affect your release velocity. Playwright already executes the tests in parallel by default to move things along by fully utilizing the available CPU cores, but you can speed things up even further by sharding your tests so that they run on multiple machines simultaneously.

This means splitting the tests into a parts such that each one can run in parallel on different computers. For example, you could split your test suite into two like this:

npx playwright test --shard=1/2

npx playwright test --shard=2/2

When this is done and executed in parallel on different machines, the tests will complete twice as fast. Each generated report can then be merged so that you can inspect the results in one place. Many CI platforms support running jobs in parallel so ensure to take advantage of this feature to ensure your tests remain fast. A GitHub Actions example is provided in the documentation.

Beyond pre-production runs, continuously executing end-to-end (E2E) tests on live systems for critical functionalities—such as account registration, user login, and checkout processes—can uncover issues that slip through earlier testing stages.

Playwright tests in Better Stack

Instant notifications on test failures enable prompt interventions, minimizing user impact. Better Stack offers straightforward tools for setting up dependable Playwright monitoring for web applications, ensuring immediate feedback when test failures are detected in production environments.

playwright-test-betterstack.png

8. Take advantage of Playwright's tooling

Playwright isn't just a command-line interface for running tests; it also provides comprehensive toolkit designed to streamline test creation, execution, and debugging process. Ensure to explore some of the key tools that Playwright offers:

    Inspector: Playwright helps you debug your test scripts using its built-in inspector which can be launched by running the tests with the --debug flag. It lets you set breakpoints, step through your tests, select or edit locators, and view logs recorded by the test runner.

    UI Mode: This comprehensive interface enables the exploration, execution, and debugging of tests with a time-travel feature and watch mode. Tests are organized in a sidebar, allowing for individual management and filtering by text, tag, status, or project settings in your Playwright config file. It offers detailed test traces, step-by-step action review, and the ability to view DOM snapshots in a separate window for enhanced debugging.

playwright-ui-run.png

    Trace viewer: When Playwright tests fail in a CI environment, detailed information about each step of the test, including screenshots, network requests, API calls, and user interactions, are captured and stored in the test directory. To display such details, the trace viewer is provided and it can be used either locally or using a Progressive Web App at https://trace.playwright.dev. You only need to download your trace files from the CI platform and upload it to the tool to get started.

    Visual Studio Code Extension: This extension integrates Playwright's capabilities directly into your code editor, allowing you to generate, run, and debug tests in one place without context switching. Even if you don't primarily use VS Code, it might be worth installing and keeping it around for this one feature.

playwright-vscode.png

    Code generator: To make test generation much easier and faster, Playwright provides a codegen command that allows you to record a test simply by interacting with the page and copy the generated script into your editor. You can also do this using the VS Code extension discussed earlier.

    TypeScript: Playwright supports writing and running tests in .ts files for better validation and integration with your text editor. You don't even need to use TypeScript syntax, only ensure to place your scripts in .ts files to benefit from this feature.

9. Don't test third party integrations

It's common for web applications to depend on third-party APIs. However, integrating these into your end-to-end (E2E) tests can introduce challenges, including unpredictable response times, rate limits, and additional costs. These factors can slow down your tests and lead to intermittent failures due to network inconsistencies, creating an unreliable testing environment.

To circumvent these issues, it is advisable to avoid direct testing of third-party interfaces within your E2E tests. Instead, leverage the Playwright Network API to mock these external services. This approach enables you to simulate the exact behavior of these integrations, ensuring your tests remain both rapid and consistent, irrespective of the performance or availability of the third-party services.

await page.route('/api/users', route => route.fulfill({
status: 200,
body: dummyData,
}));

await page.goto('https://betterstack.com');

To ensure alignment between your mocks and the actual third-party API responses, establish a separate test suite dedicated to comparing your mock data with the real API outputs. This involves periodically invoking the API, verifying the accuracy of the responses against your expectations, and monitoring these comparisons.

Implementing API monitoring through a platform like Better Stack allows you to detect discrepancies early, differentiating between minor hiccups and significant service disruptions, and to receive timely alerts.
Final thoughts

Implementing these 9 best practices for Playwright will significantly enhance the quality, efficiency, and reliability of your end-to-end testing efforts.

Remember, the goal is not just to test more, but to test smarter and ensure that your applications deliver the best possible user experience with every release.

Thanks for reading, and happy testing!
