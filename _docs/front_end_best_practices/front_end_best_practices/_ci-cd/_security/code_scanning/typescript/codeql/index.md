https://codeql.github.com/docs/codeql-language-guides/codeql-for-javascript/

JavaScript and TypeScript queries for CodeQL analysis

Explore the queries that CodeQL uses to analyze code written in JavaScript or TypeScript when you select the default or the security-extended query suite.
Who can use this feature?

CodeQL is available for the following repository types:

    Public repositories on GitHub.com, see GitHub CodeQL Terms and Conditions
    Organization-owned repositories on GitHub Team with GitHub Code Security enabled

CodeQL includes many queries for analyzing JavaScript and TypeScript code. All queries in the default query suite are run by default. If you choose to use the security-extended query suite, additional queries are run. For more information, see CodeQL query suites.
Built-in queries for JavaScript and TypeScript analysis

This table lists the queries available with the latest release of the CodeQL action and CodeQL CLI. For more information, see CodeQL change logs in the CodeQL documentation site.
Query name Related CWEs Default Extended Copilot Autofix
Arbitrary file access during archive extraction ("Zip Slip") 022
Bad HTML filtering regexp 020, 080, 116, 184, 185, 186
Case-sensitive middleware path 178
Clear text storage of sensitive information 312, 315, 359
Clear text transmission of sensitive cookie 614, 311, 312, 319
Clear-text logging of sensitive information 312, 359, 532
Client-side cross-site scripting 079, 116
Client-side URL redirect 079, 116, 601
Code injection 094, 095, 079, 116
CORS misconfiguration for credentials transfer 346, 639, 942
Creating biased random numbers from a cryptographically secure source 327
Cross-window communication with unrestricted target origin 201, 359
Database query built from user-controlled sources 089, 090, 943
Dependency download using unencrypted communication channel 300, 319, 494, 829
Deserialization of user-controlled data 502
Disabling certificate validation 295, 297
Disabling Electron webSecurity 79
Disabling SCE 116
DOM text reinterpreted as HTML 079, 116
Double compilation 1176
Double escaping or unescaping 116, 020
Download of sensitive file through insecure connection 829
Enabling Electron allowRunningInsecureContent 494
Exception text reinterpreted as HTML 079, 116
Exposure of private files 200, 219, 548
Expression injection in Actions 094
Hard-coded credentials 259, 321, 798
Host header poisoning in email generation 640
Improper code sanitization 094, 079, 116
Inclusion of functionality from an untrusted source 830
Incomplete HTML attribute sanitization 079, 116, 020
Incomplete multi-character sanitization 020, 080, 116
Incomplete regular expression for hostnames 020
Incomplete string escaping or encoding 020, 080, 116
Incomplete URL scheme check 020, 184
Incomplete URL substring sanitization 020
Incorrect suffix check 020
Inefficient regular expression 1333, 730, 400
Information exposure through a stack trace 209, 497
Insecure configuration of Helmet security middleware 693, 1021
Insecure randomness 338
Insecure URL whitelist 183, 625
JWT missing secret or public key verification 347
Loop bound injection 834, 730
Missing CSRF middleware 352
Missing rate limiting 770, 307, 400
Overly permissive regular expression range 020
Polynomial regular expression used on uncontrolled data 1333, 730, 400
Prototype-polluting assignment 078, 079, 094, 400, 471, 915
Prototype-polluting function 078, 079, 094, 400, 471, 915
Prototype-polluting merge call 078, 079, 094, 400, 471, 915
Reflected cross-site scripting 079, 116
Regular expression injection 730, 400
Replacement of a substring with itself 116
Resource exhaustion 400, 770
Resources exhaustion from deep object traversal 400
Second order command injection 078, 088
Sensitive data read from GET request 598
Sensitive server cookie exposed to the client 1004
Server crash 248, 730
Server-side request forgery 918
Server-side URL redirect 601
Shell command built from environment values 078, 088
Storage of sensitive information in build artifact 312, 315, 359
Storage of sensitive information in GitHub Actions artifact 312, 315, 359
Stored cross-site scripting 079, 116
Template Object Injection 073, 094
Type confusion through parameter tampering 843
Uncontrolled command line 078, 088
Uncontrolled data used in path expression 022, 023, 036, 073, 099
Unnecessary use of cat process 078
Unsafe dynamic method access 094
Unsafe expansion of self-closing HTML tag 079, 116
Unsafe HTML constructed from library input 079, 116
Unsafe jQuery plugin 079, 116
Unsafe shell command constructed from library input 078, 088
Untrusted domain used in script or other content 830
Unvalidated dynamic method call 754
Use of a broken or weak cryptographic algorithm 327, 328
Use of a weak cryptographic key 326
Use of externally-controlled format string 134
Use of password hash with insufficient computational effort 916
Useless regular-expression character escape 020
XML external entity expansion 611, 827
XML internal entity expansion 776, 400
XPath injection 643
Client-side request forgery 918
Empty password in configuration file 258, 862
Failure to abandon session 384
File data in outbound network request 200
Hard-coded data interpreted as code 506
Indirect uncontrolled command line 078, 088
Insecure temporary file 377, 378
Log injection 117
Missing origin verification in postMessage handler 020, 940
Missing regular expression anchor 020
Network data written to file 912, 434
Password in configuration file 256, 260, 313, 522
Potential file system race condition 367
Remote property injection 250, 400
Sensitive cookie without SameSite restrictions 1275
Unsafe code constructed from library input 094, 079, 116
User-controlled bypass of security check 807, 290
