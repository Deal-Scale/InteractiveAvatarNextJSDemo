https://prettier.io/docs/

What is Prettier?

Prettier is an opinionated code formatter with support for:

    JavaScript (including experimental features)
    JSX
    Angular
    Vue
    Flow
    TypeScript
    CSS, Less, and SCSS
    HTML
    Ember/Handlebars
    JSON
    GraphQL
    Markdown, including GFM and MDX v1
    YAML

It removes all original styling\* and ensures that all outputted code conforms to a consistent style. (See this blog post)

Prettier takes your code and reprints it from scratch by taking the line length into account.

For example, take the following code:

foo(arg1, arg2, arg3, arg4);

It fits in a single line so it’s going to stay as is. However, we've all run into this situation:

foo(reallyLongArg(), omgSoManyParameters(), IShouldRefactorThis(), isThereSeriouslyAnotherOne());

Suddenly our previous format for calling function breaks down because this is too long. Prettier is going to do the painstaking work of reprinting it like that for you:

foo(
reallyLongArg(),
omgSoManyParameters(),
IShouldRefactorThis(),
isThereSeriouslyAnotherOne(),
);

Prettier enforces a consistent code style (i.e. code formatting that won’t affect the AST) across your entire codebase because it disregards the original styling\* by parsing it away and re-printing the parsed AST with its own rules that take the maximum line length into account, wrapping code when necessary.

If you want to learn more, these two conference talks are great introductions:

A Prettier Printer by James Long on React Conf 2017

JavaScript Code Formatting by Christopher Chedeau on React London 2017
Footnotes

- Well actually, some original styling is preserved when practical—see empty lines and multi-line objects.
  Edit this page
