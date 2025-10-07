Common Configurations

A list of common tasks and configurations
Suggest Edits

We've made a list of the commonly asked tasks and created a recipe guide on how to do them by adjusting your codecov.yml.

    📘

    Changing one of these common configurations?

    When modifying the Codecov YAML, please validate the new YAML using curl -X POST --data-binary @codecov.yml https://codecov.io/validate

I want to:
Set project coverage checks on a pull request

By default, Codecov will only show git diff coverage checks on a PR.

"Project coverage" checks and "project coverage" reporting is not available for Private Repos on the Codecov team plan.

For all other private repos, and for all public repos, here's how you can also show project coverage checks on a PR.

coverage:
  status:
    project: #add everything under here, more options at https://docs.codecov.com/docs/commit-status
      default:
        # basic
        target: auto #default
        threshold: 0%
        base: auto 

Set status checks to block coverage

Set status checks to block coverage values on my pull requests

coverage:
  status:
    project:
      default:
        target: 80%    # the required coverage value
        threshold: 1%  # the leniency in hitting the target

Increase overall coverage on each pull request

Set blocking coverage targets so that each PR must increase coverage

coverage:
  status:
    project:
      default:
        target: auto  # auto compares coverage to the previous base commit

Ease target coverage

Relax my coverage target, because I have flaky tests

coverage:
  status:
    project:
      default:
        target: auto
        # adjust accordingly based on how flaky your tests are
        # this allows a 10% drop from the previous base commit coverage
        threshold: 10%

Ensure all code is covered

Set blocking coverage so that new code must be fully tested

coverage:
  status:
    patch:
      default:
        target: 100%

Set non-blocking status checks

See status checks but prevent them from blocking

coverage:
  status:
    project:
      default:
        informational: true
    patch:
      default:
        informational: true

Change the pull request comment

Change the format of the pull request comment

comment:
  layout: "diff, flags, files"  # Remove items here to change the format

Show project coverage changes on the pull request comment

By default, Codecov only shows coverage changes on the git diff on the pull request comment.

"Project coverage" checks and "project coverage" reporting is not available for Private Repos on the Codecov team plan.

For all other private repos, and for all public repos, here's how you can also show project coverage on a PR comment.

comment:                  #this is a top-level key
  layout: " diff, flags, files"
  behavior: default
  require_changes: false  # if true: only post the comment if coverage changes
  require_base: false        # [true :: must have a base report to post]
  require_head: true       # [true :: must have a head report to post]
  hide_project_coverage: false # [true :: only show coverage on the git diff aka patch coverage]]

Only comment on coverage changes

    Show the comment only on coverage changes

comment:
  require_changes: true

See coverage on CI test failures

Show the Codecov status without waiting for other status checks to complete or pass

codecov:
  require_ci_to_pass: false

Send coverage notifications even if all CI statuses have not completed

Send notifications as soon as possible, even if the CI has not completed or a manual CI workflow step is required.

codecov:
  notify:
    wait_for_ci: false

Isolate my coverage

Isolate coverage based on the coverage report uploads

flags:
  projectA:
    paths: 
      - src/projectA/
  projectB:
    paths:
      - src/projectB/
  
# To see status checks based on flags
coverage:
  status:
    project:
      default:
        flags:
          - projectA
          - projectB
      projectA:
        flags:
          - projectA
      projectB:
        flags:
          - projectB

You will need to assign a flag to each coverage report uploaded. We strongly do not recommend using multiple flags on the same report. Instead, upload the report twice.

##Your Codecov Uploader approach here
##See more at https://docs.codecov.com/docs/codecov-uploader

./codecov  -f coverage.xml -F projectA
./codecov  -f coverage.xml -F projectB

Disable pull request comments

Disable PR comments from Codecov

comment: false

Disable GitHub Check Run Annotations

By default, GitHub Check Run Annotations are enabled, and look like the following in your Pull Request:

While these annotations provide a helpful "at a glance" view of uncovered lines of code, GitHub's default styling rules for annotations can lead to excessive visual clutter. To disable these annotations you have three options:

    Temporarily: Toggle the visibility of all annotations by pressing the A key. This will immediately hide all annotations.
    Permanently: Update (or create) a codecov.yml in the root of your repository and paste the following lines into it:

github_checks:
	annotations: false

    Alternatively: If the information presented by the annotation is meaningful, but causes too much visual clutter, we recommend disabling Check Run Annotations using the YAML snippet above and installing the Codecov Browser Extension instead.

With the Codecov Browser Extension installed, covered and uncovered lines of code in the Pull Request will look as follows:

    With annotations disabled

    With annotations enabled

