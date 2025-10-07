Say Goodbye to Flaky Tests: Playwright Best Practices Every Test Automation Engineer Must Know
Sam Sperling
Sam Sperling
8 min read
·
Jan 27, 2025

A test suite is like a parachute — you only trust it when it works every time. If your tests pass today but fail mysteriously tomorrow, they’re doing more harm than good. Stability is the key that makes tests valuable. In this article, we’ll explore Playwright’s top strategies for creating stable, resilient tests, so you can confidently ship code without worrying about flakiness.
Playwright Testing Best Practices

1. Use Reliable Selectors

Goal: Ensure your tests are resilient to frequent UI changes.

Prefer Data or Role-Based Locators

    Use data-testid or getByRole rather than brittle CSS classes or auto-generated IDs. This approach focuses on stable attributes that rarely change.

Avoid Dynamic Attributes

    Don’t rely on selectors that contain timestamps, session tokens, or random strings. These are likely to change with every build or test run.

Handle Complex DOM Structures

    For Shadow DOM or iframes, use page.frame(...) or nested locator(...). Always ensure you’re pointing to the correct document context.

Enforce Naming Standards

    Keep test-specific attributes consistent. For example, always use data-testid="submit-button" or similar naming patterns to reduce confusion.

2. Leverage Auto-Waiting and Explicit Conditions

Goal: Let Playwright intelligently handle timing to eliminate flakiness due to delays.

Auto-Wait with Locators

    Use page.locator('selector') and chain actions like .click(). Playwright automatically retries until the element is ready.

Use Assertion-Based Waits

    Avoid waitForTimeout; prefer expect(locator).toBeVisible(), expect(locator).toHaveText(), etc. Each includes a retry mechanism within a default or configured timeout.

Minimal Manual Pauses

    Only resort to explicit page.waitForTimeout() if external services outside your control introduce real delays.

Expect Polling

    For more complex conditions (like verifying a list count), use expect.poll(...). This reduces custom loops or repeated checks.

3. Isolate Tests and Avoid Shared State

Goal: Make each test self-contained so one failure or leftover data doesn’t impact the next.

Independent Setup and Teardown

    Whether via Playwright fixtures or beforeEach/afterEach hooks, recreate only what you need for each test. Don’t rely on state from a previous test.

Use Playwright’s Fixture Model

    Leverage built-in fixtures to initialize pages, contexts, or user states, ensuring consistency across parallel runs.

Reference Dedicated Data Approaches

    If you need ephemeral environments or containerized databases, see the Managing Test Data and Databases doc for deeper strategies.

4. Keep Tests Atomic and Focused

Goal: Reduce debugging complexity and risk of partial failures.

Single Feature per Test

    Test only one primary scenario (e.g., “user can submit a valid form”). Large, end-to-end flows are more prone to intermittent breaks.

Reusability

    For repeated steps like login, use helper functions or fixtures. Don’t repeat complex login flows in every test.

Step Annotations

    Use test.step(...) to provide clarity on what’s happening at each stage. This helps identify exactly where a test fails.

5. Manage Asynchronous Operations Properly

Goal: Eliminate race conditions and timing issues tied to network responses or async processes.

Wait for Network Responses

    When an action triggers an API call, confirm the UI state or wait for the relevant response with page.waitForResponse(...).

Stub External Services

    Use Playwright’s request interception to control or mock external dependencies. This avoids flakiness from third-party outages or rate limits.

Timeout Configuration

    Set standard timeouts in playwright.config.ts. Keep them generous enough for real-world conditions but not so long that failures go undetected.

6. Control Your Test Environment

Goal: Ensure tests run under consistent conditions for minimal variability.

Containerization / CI

    Containerize your setup (Docker) or standardize your CI environment. Mismatched OS or browser versions can introduce difficult-to-debug errors.

Stable Builds

    Always run the E2E tests on code that has passed linting, unit tests, and integration tests. Catch small issues early before hitting E2E.

Reset Snapshots/Logs

    Clear out old snapshots or logs before a new run to avoid stale artifacts generating false positives or confusion.

7. Implement Robust Assertions

Goal: Ensure success criteria are clear and detect both positive and negative conditions reliably.

Built-In Matchers

    Use toHaveText, toBeVisible, toHaveCount, etc. These incorporate retries and help reduce manual sleeps.

Negative Assertions

    When expecting no results, use toBeHidden() or toHaveCount(0). These also include time-based retries to handle slow UI updates.

Granular Checks

    If a test checks multiple sub-features, break them into separate expect calls. More granular assertions yield clearer error reporting.

8. Use Tracing and Debugging Features

Goal: Diagnose root causes quickly, especially in CI or parallelized environments.

Playwright Trace

    Use --trace on or --trace retain-on-failure for failing tests. Replay traces in the Trace Viewer to see step-by-step screenshots, logs, and network calls.

Screenshots and Videos

    Capture screenshots or full video on failure. This is invaluable on headless CI runs where you can’t watch the browser.

Console / Network Logs

    Listen for page.on('console', ...) or network events. Understanding console errors or request statuses can pinpoint flakiness fast.

9. Write Clear and Maintainable Code

Goal: Keep your test code easy to evolve and debug over the long haul.

Use Page Objects / Abstractions

    Centralize common selectors and actions in a Page Object or helper module. A single change updates all tests referencing that component.

Avoid Hardcoded Strings

    Store repeated URLs, credentials, or text in config or constants. This reduces duplication and risk of typos.

Descriptive Naming

    Title your tests with explicit outcomes (e.g., test('submitting a valid form shows success message', ...)) for clarity in reports.

10. Optimize for Parallel Execution (and Performance)

Goal: Speed up test runs without introducing cross-test interference.

Independent Browser Contexts

    Launch each test in its own context (or page). Shared state across tests is a common cause of flakiness.

Set Concurrency Wisely

    In playwright.config.ts, adjust workers based on available CPU and memory. Overloading the environment can slow or destabilize runs.

Balance Performance

    Running dozens of tests in parallel is fast, but watch system constraints. If tests suddenly slow or fail, lower concurrency or optimize environment resources.

11. Monitor and Triage Flaky Tests Quickly

Goal: Maintain trust in the test suite by addressing flakiness at its source.

Immediate Visibility

    Surface test outcomes promptly in your CI dashboard. Don’t hide flaky failures behind silent retries.

Quarantine Strategy

    Temporarily move known-flaky tests to a quarantine suite if they block builds. However, treat this as a short-term measure.

Root Cause Analysis

    Investigate and fix the underlying issue — often an async race or environment mismatch — rather than just re-running to get a passing result.

12. Additional Considerations

Use Playwright Test Runner

    Rely on Playwright’s native runner for streamlined parallelization, fixtures, and debugging tools.

Authentication Flows

    If your site requires login, consider storing a logged-in storageState to skip slow login steps across multiple tests.

Test Organization

    Group tests by features (e.g., login, profile, checkout). This makes it easy to run or maintain subsets of tests.

In Short

Playwright offers powerful features to minimize flakiness and maximize reliability, but success depends on:

    Strong fundamentals — using stable selectors, leveraging auto-waiting, and isolating tests.
    Good engineering practices — page objects, robust assertions, and parallelization done correctly.
    Proactive debugging — tracing, logs, and immediate triage of flaky tests.

Managing Test Data and Databases for E2E Testing

Stable tests are only as good as the data they’re built on. Even the most resilient test can fail if the underlying data or database setup is inconsistent or unreliable. That’s why managing test data and databases is critical — it ensures your tests have the consistent environment they need to deliver accurate results. Let’s explore how to do this effectively.

1. Use a Dedicated (and Disposable) Test Database

   Never Use Production or Shared Databases

   Avoid polluting real environments or risking data corruption. A dedicated test DB (e.g., myapp_test) ensures data is wholly under test control.

Spin Up Fresh Environments

    Use Docker or other container-based solutions to stand up a test DB. Tear it down after tests. This method guarantees a clean state for every run.

Database Snapshots

    If your schema is large, you can restore from a known “clean” snapshot before each run to avoid rebuilding from scratch.

2. Seed Known Good Data

Minimal Required Seed

    Only include absolutely necessary records (users, product references, etc.). Oversized datasets slow tests and complicate debugging.

Automated Seed Scripts

    Keep your seed logic in version control (SQL files or Node scripts). This ensures consistency across local and CI environments.

Environment-Specific Seeding

    If you have multiple test environments (e.g., QA, staging), maintain seeds per environment for clarity and maintainability.

3. Isolate and Clean Data Per Test (When Feasible)

Per-Test Setup/Teardown

    Create data needed by each test, then remove it or roll it back afterward. This ensures no leftover data pollutes subsequent tests.

Transaction Rollbacks

    Some frameworks let you run tests within a DB transaction and roll it back upon completion. This can be tricky in E2E setups but is highly effective for integration-level tests.

Unique Identifiers

    If you can’t fully isolate data, generate unique test user info (e.g., test-user-{timestamp}@example.com) to avoid collisions.

4. Coordinate with Parallel or CI Environments

Multiple DB Instances

    If you run tests in parallel, each worker can point to a different test DB (like myapp_test_1, myapp_test_2) to prevent overwrites.

Dedicated Containers per Worker

    For full isolation, spin up an entire DB container per parallel worker. This can be resource-heavy but nearly eliminates cross-test contamination.

Performance vs. Concurrency

    Monitor CI resource usage. If you see huge slowdowns or flakiness, reduce parallel workers or optimize data access patterns.

5. Mocking or Stubbing Database Calls

When to Mock

    If your test focuses on UI flows and not actual DB validation, mocking the DB layer reduces complexity and test time.

Real DB for Critical E2E

    Avoid mocking for truly end-to-end coverage (e.g., verifying schema constraints, indexes, or tricky DB logic). Real data surfaces real issues.

6. Continuous Monitoring of Database Health

Migrations

    Always migrate your test DB to the latest schema version before running tests. Mismatch in schema versions is a major flakiness cause.

Regular Cleanups

    If ephemeral containers are not possible, schedule routine purges (truncate tables or remove old data) to prevent test environments from ballooning over time.

Performance Tracking

    Keep an eye on test runtime. If you notice a gradual slowdown, investigate data bloat or missing indexes.

Final Thoughts

A robust approach to test data management and database setup amplifies your investment in Playwright. Combined with the general best practices (selectors, auto-wait, parallel execution) covered here, your team can achieve:

    Minimal Flakiness
    Tests are repeatable and stable, even with complex stateful data.
    Increased Confidence
    Realistic end-to-end coverage ensures the application works from UI down to DB.
    Greater Business Value
    Faster feedback loops and more reliable builds translate to higher productivity and fewer production bugs.
