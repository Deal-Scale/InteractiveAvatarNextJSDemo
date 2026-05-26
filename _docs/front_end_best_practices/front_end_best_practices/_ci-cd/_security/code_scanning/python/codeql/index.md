https://codeql.github.com/docs/codeql-language-guides/codeql-for-python/
CodeQL for Python

Experiment and learn how to write effective and efficient queries for CodeQL databases generated from Python codebases.

    Basic query for Python code: Learn to write and run a simple CodeQL query.

    CodeQL library for Python: When you need to analyze a Python program, you can make use of the large collection of classes in the CodeQL library for Python.

    Analyzing data flow in Python: You can use CodeQL to track the flow of data through a Python program to places where the data is used.

    Using API graphs in Python: API graphs are a uniform interface for referring to functions, classes, and methods defined in external libraries.

    Functions in Python: You can use syntactic classes from the standard CodeQL library to find Python functions and identify calls to them.

    Expressions and statements in Python: You can use syntactic classes from the CodeQL library to explore how Python expressions and statements are used in a codebase.

    Analyzing control flow in Python: You can write CodeQL queries to explore the control-flow graph of a Python program, for example, to discover unreachable code or mutually exclusive blocks of code.

    Customizing library models for Python: You can model frameworks and libraries that your codebase depends on using data extensions and publish them as CodeQL model packs.

Basic query for Python code

Learn to write and run a simple CodeQL query using Visual Studio Code with the CodeQL extension.

For information about installing the CodeQL extension for Visual Studio code, see “Installing CodeQL for Visual Studio Code.”
About the query

The query we’re going to run performs a basic search of the code for if statements that are redundant, in the sense that they only include a pass statement. For example, code such as:

if error: pass

Finding a CodeQL database to experiment with

Before you start writing queries for Python code, you need a CodeQL database to run them against. The simplest way to do this is to download a database for a repository that uses Python directly from GitHub.com.

    In Visual Studio Code, click the QL icon Icon for the CodeQL extension. in the left sidebar to display the CodeQL extension.

    Click From GitHub or the GitHub logo Icon for the CodeQL extension option to download a CodeQL database from GitHub. at the top of the CodeQL extension to open an entry field.

    Copy the URL for the repository into the field and press the keyboard Enter key. For example, https://github.com/saltstack/salt.

    Optionally, if the repository has more than one CodeQL database available, select python to download the database created from the Python code.

Information about the download progress for the database is shown in the bottom right corner of Visual Studio Code. When the download is complete, the database is shown with a check mark in the Databases section of the CodeQL extension (see screenshot below).
Running a quick query

The CodeQL extension for Visual Studio Code adds several CodeQL: commands to the command palette including Quick Query, which you can use to run a query without any set up.

    From the command palette in Visual Studio Code, select CodeQL: Quick Query.

    After a moment, a new tab quick-query.ql is opened, ready for you to write a query for your currently selected CodeQL database (here a python database). If you are prompted to reload your workspace as a multi-folder workspace to allow Quick queries, accept or create a new workspace using the starter workflow.

    image-quick-query

    In the quick query tab, delete select "" and paste the following query beneath the import statement import python.

    from If ifstmt, Stmt pass
    where pass = ifstmt.getStmt(0) and
      pass instanceof Pass
    select ifstmt, "This 'if' statement is redundant."

    Save the query in its default location (a temporary “Quick Queries” directory under the workspace for GitHub.vscode-codeql/quick-queries).

    Right-click in the query tab and select CodeQL: Run Query on Selected Database. (Alternatively, run the command from the Command Palette.)

    The query will take a few moments to return results. When the query completes, the results are displayed in a CodeQL Query Results view, next to the main editor view.

    The query results are listed in two columns, corresponding to the expressions in the select clause of the query. The first column corresponds to the expression ifstmt and is linked to the location in the source code of the project where ifstmt occurs. The second column is the alert message.

../../\_images/basic-python-query-results-1.png

If any matching code is found, click a link in the ifstmt column to open the file and highlight the matching if statement.
../../\_images/basic-python-query-results-2.png

    Note

    If you want to move your experimental query somewhere more permanent, you need to move the whole Quick Queries directory. The directory is a CodeQL pack with a qlpack.yml file that defines the content as queries for Python CodeQL databases. For more information about CodeQL packs, see “Managing CodeQL query packs and library packs.”

About the query structure

After the initial import statement, this simple query comprises three parts that serve similar purposes to the FROM, WHERE, and SELECT parts of an SQL query.

Query part

Purpose

Details

import python

Imports the standard CodeQL libraries for Python.

Every query begins with one or more import statements.

from If ifstmt, Stmt pass

Defines the variables for the query. Declarations are of the form: <type> <variable name>

We use:

    an If variable for if statements

    a Stmt variable for the statement

where pass = ifstmt.getStmt(0) and pass instanceof Pass

Defines a condition on the variables.

pass = ifstmt.getStmt(0): pass is the first statement in the if statement.

pass instanceof Pass: pass must be a pass statement.

In other words, the first statement contained in the if statement is a pass statement.

select ifstmt, "This 'if' statement is redundant."

Defines what to report for each match.

select statements for queries that are used to find instances of poor coding practice are always in the form: select <program element>, "<alert message>"

Reports the resulting if statement with a string that explains the problem.
Extend the query

Query writing is an inherently iterative process. You write a simple query and then, when you run it, you discover examples that you had not previously considered, or opportunities for improvement.
Remove false positive results

Browsing the results of our basic query shows that it could be improved. Among the results you are likely to find examples of if statements with an else branch, where a pass statement does serve a purpose. For example:

if cond():
pass
else:
do_something()

In this case, identifying the if statement with the pass statement as redundant is a false positive. One solution to this is to modify the query to ignore pass statements if the if statement has an else branch.

To exclude if statements that have an else branch:

    Extend the where clause to include the following extra condition:

    and not exists(ifstmt.getOrelse())

    The where clause is now:

    where pass = ifstmt.getStmt(0) and
      pass instanceof Pass and
      not exists(ifstmt.getOrelse())

    Re-run the query.

    There are now fewer results because if statements with an else branch are no longer included.
