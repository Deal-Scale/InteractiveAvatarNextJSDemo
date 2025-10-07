Defining High Quality Code

October 30, 2022 Tom Hu
Codecov

Share

Writing high-quality code is prized among software developers. Good code is enduring, bug-free, and helps improve the quality of the entire codebase. However, it’s not always clear what the standards of high-quality code are. They can differ from team to team and even among engineers.

But there are a few underlying principles that frequently come up. This article defines what these standards are and what it means to write high quality code. It also offers some tools and techniques to help developers maintain code value.

 
What should high-quality code do?

There are three main areas that contribute to high-quality code. High-quality code should:

    Be predictable and work as expected
    Work efficiently
    Be easy to understand and change

 
Code should be predictable and work as expected

When running software, the correct inputs should produce the correct outputs. It also means that another user should expect similar results when using the software.

So how do we ensure that our code works? The most direct way is to implement testing. There are many types of testing, but we encourage writing unit, integration, and end-to-end tests. This will help catch the vast majority of bugs if tests are well-written. You should also write tests that run in different environments (e.g. browsers, devices, OSes). We can do better than this by also ensuring a high code coverage percentage for both line and branch coverage. Using both in conjunction will help to catch edge cases in testing.

Another way to increase the quality of your tests would be to add in mutation testing. Mutation testing works by making changes to your inputs or codebase to see how it handles those changes. Successful tests will catch those changes, while mutants that survive will have avoided detection.

Although it’s not always possible to catch every bug, you can use tools like Sentry to monitor any errors in production. This will help you track and debug problems that your users will run into during runtime.

Another area to consider is security. As a user or developer, it’s expected that code both secures data entered and protects internal systems. There is no silver bullet to security, but you can use tools like Snyk to find vulnerabilities before you deploy code. Ensure that you properly sanitize all inputs and sensitive data, like secrets and passwords.

You can greatly increase your code predictability by

    writing high-quality tests
    using a variety of test types
    ensuring a high line and branch coverage
    eliminating mutants with mutation testing
    investing in tools to monitor bugs in production
    following best security practices

 
Code works efficiently

It’s also important to ensure that code is working efficiently, not just properly. If a user comes to a web app, but takes 20 minutes to load, the experience will be too excruciating to continue. This is not ideal and usually points to some inefficiency in the codebase.

When it comes to performance, there are two main concerns: speed and space. Although it is possible to optimize for both, and some point, you may need to decide to sacrifice one for the other. Speed is generally more important since space is often cheap, but that decision should fall to the type of application you are running.

    To help find performance issues: Establish baselines for what is acceptable and run your code against large datasets.
    To help narrow down issues that come up: Use a profiler that records the time and the frequency of instances it takes to run certain functions. This can help you narrow down which functions are causing the most headaches.

Another pain point for efficiency is database usage. There are low-hanging fixes like adding an index to a table, but after that is exhausted, it’s worth examining both the queries and the schema of the database. You can describe queries to understand how the query plan is optimized. You should also investigate whether or not your tables are normalized.

It’s also worth investigating whether the underlying algorithms are optimal. Although they may have begun as the best solution, product growth or changes can often skew the initial conditions. Re-evaluating the type of data structures used or the overall flow of a program can significantly reduce the overhead of running your codebase.

To ensure code efficiency:

    establish acceptable baselines for performance tests
    use a profiler to find functions and queries that could be optimized
    tighten up queries based on the query plan
    invest in database normalization
    re-assess business algorithms

 
Code is easy to understand and change

The first two sections help to ensure high-quality code in a static setting. It assumes that code is static, but this is rarely the case. Code is expected to be dynamic and changing. So to ensure that our code is high quality, we have to be sure that it can be understood and changed easily.

Readability is one of the most important things to consider when writing code. Not only does it make it easier for a code reviewer to understand, but you and future developers will also be able to understand the code. Although each language has its own quirks, generally you should write code that fits in a developer’s code window (i.e. limit the characters of a line to 80, 120, or whatever is suitable). That code should be broken into digestible chunks where each chunk is doing one very specific thing.

This also means that functions should be as specific as possible to avoid scope creep. It’s often easier for a developer to shove an extra bit of functionality into a method. But since it lives in the codebase, other developers may see that as acceptable. Sooner or later, that function will grow to encompass far more than it was initially intended to do. You can also use a metric like code complexity to find functions that are too complicated.

Sometimes it’s not possible to have code be self-explanatory. In these cases, it’s essential to document and link to that documentation. There are too many times in my experience where a comment on a line of code gives a little context to why it was written. Realize that many developers may see your code and need to understand its context before making a change. The more you document the thought process, the easier it will be to know if it can be updated.

Also, code architects and product owners should make it a point to record major architectural design patterns. Large codebases often suffer from having different teams work on pieces that aren’t written with the same paradigms. This can cause a lot of pain the first time those pieces need to be worked on by members of opposite teams. The problem can be easily remedied by ensuring that both patterns and anti-patterns are spelled out in the engineering organization.

To increase code quality to be more dynamic

    follow readability best practices
    avoid function scope creep
    decrease code complexity
    document and explain coding decisions and constants
    record architectural design patterns
