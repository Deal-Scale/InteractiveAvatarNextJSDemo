https://copier.readthedocs.io/en/stable/
Comparing Copier to other project generators¶

The subject of code scaffolding has been around for some time, and there are long established good projects.

Here's a simple comparison. If you find something wrong, please open a PR and fix these docs! We don't want to be biased, but it's easy that we tend to be:

Important

Although Copier was born as a code scaffolding tool, it is today a code lifecycle management tool. This makes it somehow unique. Most tools below are only scaffolders and the comparison is not complete due to that.
Feature 	Copier 	Cookiecutter 	Yeoman
Can template file names 	Yes 	Yes 	Yes
Can generate file structures in loops 	Yes 	No 	No
Configuration 	Single YAML file1 	Single JSON file 	JS module
Migrations 	Yes 	No 	No
Programmed in 	Python 	Python 	NodeJS
Requires handwriting JSON 	No 	Yes 	Yes
Requires installing templates separately 	No 	No 	Yes
Requires programming 	No 	No 	Yes, JS
Requires templates to have a suffix 	Yes by default, configurable3 	No, not configurable 	You choose
Task hooks 	Yes 	Yes 	Yes
Context hooks 	Yes5 	Yes 	?
Template in a subfolder 	Not required, but you choose 	Yes, required 	Yes, required
Template package format 	Git repo2, Git bundle, folder 	Git or Mercurial repo, Zip file 	NPM package
Template updates 	Yes4 	No6 	No
Templating engine 	Jinja 	Jinja 	EJS

    The file itself can include other YAML files. ↩

    Git repo is recommended to be able to use advanced features such as template tagging and smart updates. ↩

    A suffix is required by default. Defaults to .jinja, but can be configured to use a different suffix, or to use none. ↩

    Only for Git templates, because Copier uses Git tags to obtain available versions and extract smart diffs between them. ↩

    Context hooks are provided through the ContextHook extension. ↩

    Updates are possible through Cruft. ↩

