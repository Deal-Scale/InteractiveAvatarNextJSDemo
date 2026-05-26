Adding Linter Rules

The best and easiest way to contribute to Oxlint is by adding new linter rules.

This guide will walk you through this process, using ESLint's no-debugger rule as an example.

TIP

Make sure you've read the setup instructions first.
Step 1: Pick a Rule

Our Linter product plan and progress issue tracks the status of all rules we want to implement from existing ESLint plugins. From there, pick a plugin that looks interesting to you and find a rule that has not been implemented.

Most documentation pages for ESLint rules include a link to the rule's source code. Using this as a reference will help you with your implementation.
Step 2: Rule Generation

Next, run the rulegen script to generate boilerplate code for your new rule.

just new-rule no-debugger

This will:

    Create a new file in crates/oxc_linter/rules/<plugin-name>/<rule-name>.rs with the start of your rule's implementation and all test cases ported from ESLint
    Register the rule in the appropriate mod in rules.rs
    Add the rule to oxc_macros::declare_all_lint_rules!

For rules that are part of a different plugin, you'll need to use that plugin's own rulegen script.

TIP

Run just with no arguments to see all available commands.

just new-rule [name] # for eslint core rules
just new-jest-rule [name] # for eslint-plugin-jest
just new-ts-rule [name] # for @typescript-eslint/eslint-plugin
just new-unicorn-rule [name] # for eslint-plugin-unicorn
just new-import-rule [name] # for eslint-plugin-import
just new-react-rule [name] # for eslint-plugin-react and eslint-plugin-react-hooks
just new-jsx-a11y-rule [name] # for eslint-plugin-jsx-a11y
just new-oxc-rule [name] # for oxc's own rules
just new-nextjs-rule [name] # for eslint-plugin-next
just new-jsdoc-rule [name] # for eslint-plugin-jsdoc
just new-react-perf-rule [name] # for eslint-plugin-react-perf
just new-n-rule [name] # for eslint-plugin-n
just new-promise-rule [name] # for eslint-plugin-promise
just new-vitest-rule [name] # for eslint-plugin-vitest

The generated file will look something like this:
Click to expand

Your rule should now be ready to run! You can try it out with cargo test -p oxc_linter. The tests should fail, since you haven't implemented the rule yet.
Step 3: Fill Out the Template
Documentation

Fill out the various documentation sections.

    Provide a clear and concise summary of what the rule does.
    Explain why the rule is important and what undesirable behavior it prevents.
    Provide examples of code that violates the rule and code that does not.

Remember, we use this documentation to generate the rule documentation pages for this website, so make sure your documentation is clear and helpful!
Rule Category

First, pick a rule category that best fits the rule. Remember that correctness rules will be run by default, so be careful when choosing this category. Set your category within the declare_oxc_lint! macro.
Fixer Status

If the rule has a fixer, register what kind of fixes it provides within declare_oxc_lint!. If you're not comfortable with implementing a fixer, you can also use pending as a placeholder. This helps other contributors find and implement missing fixers down the line.
Diagnostics

Create a function to create diagnostics for rule violations. Follow these principles:

    The message should be an imperative statement about what is wrong, not a description of what the rule does.
    The help message should be a command-like statement that tells the user how to fix the issue.

good
bad

fn no_debugger_diagnostic(span: Span) -> OxcDiagnostic {
OxcDiagnostic::warn("`debugger` statement is not allowed")
.with_help("Remove this `debugger` statement")
.with_label(span)
}

Step 4: Rule Implementation

Read the rule's source code to understand how it works. Although Oxlint works similarly to ESLint, it is unlikely that the rule can be ported directly.

ESLint rules have a create function that returns an object whose keys are AST nodes that trigger the rule and values are functions that run lints on those nodes. Oxlint rules run on one of a few triggers, each of which come from the Rule trait:

    Run on each AST node (via run)
    Run on each symbol (via run_on_symbol)
    Run a single time on the entire file (via run_once)

In the case of no-debugger, we are looking for DebuggerStatement nodes, so we'll use run. Here's a simplified version of the rule:
Click to expand

TIP

You will want to get familiar with the data stored in Semantic, which is where all data extracted during semantic analysis is stored. You will also want to familiarize yourself with the AST structure. The two most important data structures here are AstNode and AstKind
Step 5: Testing

To test your rule whenever you make a change, run:

just watch "test -p oxc_linter -- rule-name"

Or to just test it once, run:

cargo test -p oxc_linter -- rule-name

# Or

cargo insta test -p oxc_linter -- rule-name

Oxlint uses cargo insta for snapshot testing. cargo test will fail if snapshots have changed or have just been created. You can run cargo insta test -p oxc_linter to not see diffs in your test results. You can review the snapshots by running cargo insta review, or skip the review and just accept all changes using cargo insta accept.

When you are ready to submit your PR, run just ready or just r to run CI checks locally. You can also run just fix to auto-fix any lint, format, or typo problems. Once just ready is passing, create a PR and a maintainer will review your changes.
General Advice
Pin point the error message to the shortest code span

We want the user to focus on the problematic code rather than deciphering the error message to identify which part of the code is erroneous.
Use let-else statements

If you find yourself deeply nesting if-let statements, consider using let-else instead.

TIP

CodeAesthetic's never-nesting video explains this concept in more detail.
good
bad

// let-else is easier to read
fn run<'a>(&self, node: &AstNode<'a>, ctx: &LintContext<'a>) {
let AstKind::JSXOpeningElement(jsx_opening_elem) = node.kind() else {
return;
};
let Some(expr) = container.expression.as_expression() else {
return;
};
let Expression::BooleanLiteral(expr) = expr.without_parenthesized() else {
return;
};
// ...
}

Use CompactStr where possible

Reducing allocations as much as possible is critical for performance in oxc. The String type requires allocating memory on the heap, which costs memory and CPU cycles. It is possible to store small strings inline (up to 24 bytes on 64-bit systems) on the stack using CompactStr, which means we don't need to allocate memory. If the string is too large to store inline, it will allocate the necessary space. Using CompactStr can be used almost anywhere that has the type String or &str, and can save a significant amount memory and CPU cycles compared to the String type.
good
bad

struct Element {
name: CompactStr
}

let element = Element {
name: "div".into()
