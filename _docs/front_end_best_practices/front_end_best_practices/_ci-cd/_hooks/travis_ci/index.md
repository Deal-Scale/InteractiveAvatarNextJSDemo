https://www.travis-ci.com/

 How developers build simple, trustworthy CI/CD pipelines
Join hundreds of thousands who define tests and deployments in minutes, then scale up simply with parallel or multi-environment builds using Travis CI’s precision syntax—all designed with the developer experience in mind.
Where developers trust Travis CI with testing and automation
Klaviyo uses Travis CI
Microsoft Uses Travis CI
Lonely Planet Uses Travis CI
Linux Foundation Uses Travis CI
Kiva uses Travis CI
iHeart Radio uses Travis CI
Travis CI and iHeart Radio
Travis CI and Google
Travis CI and Facebook
Travis CI and Harvard University
Travis CI and BigCommerce
CapitalOne and Travis CI
Travis CI Customer Example
Dartmouth uses Travis CI
American Bible Society uses Travis CI
AWS uses Travis CI
American Medical Association Uses Travis CI
UN uses Travis CI
Amazon Uses Travis CI
Americas Test Kitchen uses Travis CI
Automattic uses Travis CI
Stripe uses Travis CI
St Jude's Hospital for Children Uses Travis CI
Stanford University uses Travis CI
Stanford and Travis CI
Travis CI Netflix
Travis CI customer MIT
Travis CI customer Moz
NIH and Travis CI
Klaviyo uses Travis CI
Microsoft Uses Travis CI
Lonely Planet Uses Travis CI
Linux Foundation Uses Travis CI
Kiva uses Travis CI
iHeart Radio uses Travis CI
Travis CI and iHeart Radio
Travis CI and Google
Travis CI and Facebook
Travis CI and Harvard University
Travis CI and BigCommerce
CapitalOne and Travis CI
Travis CI Customer Example
Dartmouth uses Travis CI
American Bible Society uses Travis CI
AWS uses Travis CI
American Medical Association Uses Travis CI
UN uses Travis CI
Amazon Uses Travis CI
Americas Test Kitchen uses Travis CI
Automattic uses Travis CI
Stripe uses Travis CI
St Jude's Hospital for Children Uses Travis CI
Stanford University uses Travis CI
Stanford and Travis CI
Travis CI Netflix
Travis CI customer MIT
Travis CI customer Moz
NIH and Travis CI
Klaviyo uses Travis CI
Microsoft Uses Travis CI
Lonely Planet Uses Travis CI
Linux Foundation Uses Travis CI
Kiva uses Travis CI
iHeart Radio uses Travis CI
Travis CI and iHeart Radio
Travis CI and Google
Travis CI and Facebook
Travis CI and Harvard University
Travis CI and BigCommerce
CapitalOne and Travis CI
Travis CI Customer Example
Dartmouth uses Travis CI
American Bible Society uses Travis CI
AWS uses Travis CI
American Medical Association Uses Travis CI
UN uses Travis CI
Amazon Uses Travis CI
Americas Test Kitchen uses Travis CI
Automattic uses Travis CI
Stripe uses Travis CI
St Jude's Hospital for Children Uses Travis CI
Stanford University uses Travis CI
Stanford and Travis CI
Travis CI Netflix
Travis CI customer MIT
Travis CI customer Moz
NIH and Travis CI
Klaviyo uses Travis CI
Microsoft Uses Travis CI
Lonely Planet Uses Travis CI
Linux Foundation Uses Travis CI
Kiva uses Travis CI
iHeart Radio uses Travis CI
Travis CI and iHeart Radio
Travis CI and Google
Travis CI and Facebook
Travis CI and Harvard University
Travis CI and BigCommerce
CapitalOne and Travis CI
Travis CI Customer Example
Dartmouth uses Travis CI
American Bible Society uses Travis CI
AWS uses Travis CI
American Medical Association Uses Travis CI
UN uses Travis CI
Amazon Uses Travis CI
Americas Test Kitchen uses Travis CI
Automattic uses Travis CI
Stripe uses Travis CI
St Jude's Hospital for Children Uses Travis CI
Stanford University uses Travis CI
Stanford and Travis CI
Travis CI Netflix
Travis CI customer MIT
Travis CI customer Moz
NIH and Travis CI
Klaviyo uses Travis CI
Microsoft Uses Travis CI
Lonely Planet Uses Travis CI
Linux Foundation Uses Travis CI
Kiva uses Travis CI
iHeart Radio uses Travis CI
Travis CI and iHeart Radio
Travis CI and Google
Travis CI and Facebook
Travis CI and Harvard University
Travis CI and BigCommerce
CapitalOne and Travis CI
Travis CI Customer Example
Dartmouth uses Travis CI
American Bible Society uses Travis CI
AWS uses Travis CI
American Medical Association Uses Travis CI
UN uses Travis CI
Amazon Uses Travis CI
Americas Test Kitchen uses Travis CI
Automattic uses Travis CI
Stripe uses Travis CI
St Jude's Hospital for Children Uses Travis CI
Stanford University uses Travis CI
Stanford and Travis CI
Travis CI Netflix
Travis CI customer MIT
Travis CI customer Moz
NIH and Travis CI
Klaviyo uses Travis CI
Microsoft Uses Travis CI
Lonely Planet Uses Travis CI
Linux Foundation Uses Travis CI
Kiva uses Travis CI
iHeart Radio uses Travis CI
Travis CI and iHeart Radio
Travis CI and Google
Travis CI and Facebook
Travis CI and Harvard University
Travis CI and BigCommerce
CapitalOne and Travis CI
Travis CI Customer Example
Dartmouth uses Travis CI
American Bible Society uses Travis CI
AWS uses Travis CI
American Medical Association Uses Travis CI
UN uses Travis CI
Amazon Uses Travis CI
Americas Test Kitchen uses Travis CI
Automattic uses Travis CI
Stripe uses Travis CI
St Jude's Hospital for Children Uses Travis CI
Stanford University uses Travis CI
Stanford and Travis CI
Travis CI Netflix
Travis CI customer MIT
Travis CI customer Moz
NIH and Travis CI
Build your new CI/CD pipeline in 20 minutes or less
Whether starting from scratch or rebuilding a rich ecosystem, get pipelines flowing with preconfigured environments for your language and a minimal syntax with up to 50% less YAML or JSON.

language: python
python:
  - "3.7"
  - "3.8"
  - "3.9"

# Command to install dependencies
install:
  - pip install -r requirements.txt
  - pip install pytest pytest-cov

# Command to run tests
script:
  - pytest --cov=./ tests/

# Specify branches to build
branches:
  only:
    - main
    - develop

# Cache pip dependencies
cache: pip

# Run jobs in parallel
jobs:
  include:
    - name: "Lint"
      python: "3.9"
      before_script:
        - pip install flake8
      script:
        - flake8 .

    - name: "Docs"
      python: "3.9"
      before_script:
        - pip install sphinx
      script:
        - sphinx-build -b html docs docs/_build

after_success:
  - pip install coveralls
  - coveralls

notifications:
  email:
    on_success: never
    on_failure: always

Explore more with Travis CI's Quickstart 
A precision tool for every CI/CD demand
Travis CI elegantly compacts all your testing automation into one minimal Configuration as Code file for a true developer experience. Simple syntax and effortless extensibility.

language: python
python:
  - "3.7"
  - "3.8"
  - "3.9"
env:
  - DJANGO_VERSION=2.2
  - DJANGO_VERSION=3.0
  - DJANGO_VERSION=3.1
matrix:
  include:
    - python: "3.9"
      env: DJANGO_VERSION=3.2
  exclude:
    - python: "3.7"
      env: DJANGO_VERSION=3.1
  allow_failures:
    - python: "3.9"
      env: DJANGO_VERSION=3.2
before_install:
  - pip install -U pip
  - pip install -U setuptools
  - pip install -q Django==$DJANGO_VERSION
install:
  - pip install -r requirements.txt
script:
  - python manage.py test
after_success:
  - coveralls
notifications:
  email: false

Run tests against different versions of your runtimes or dependencies—or even multiple languages—for comprehensive automation and absolute quality guarantees on your way to production.
The most resilient name in CI/CD
Others commodify CI/CD, building overly complex DevSecOps Platforms. We remain steadfast in our original mission to help developers conquer their CI/CD pipelines faster, more fluently, and, dare we say… with more fun?
Why pay for CI/CD

That’s a tough but fair question. We’re still delivering the simplest and most extensible CI/CD for developers who want precision tools, not bloated platforms. 

Travis CI uniquely helps you take ownership of code quality, collaborate better with your peers, and take ownership of the results you create together.
Our security-forward promises

GDPR and PrivacyShield compliance. Build isolation to prevent interference. Clean VMs with every build. 

Plus, easy extensibility for you to protect your software supply chain with our HashiCorp Vault integration, collaborator management, scoped credentials, signed artifacts, and much more.
Engineering-driven customer support

Our CI/CD experts are here to help. Have a question before you jump in, or want to hear about Travis CI Enterprise?
A genuine community

Whether you need tips on extending your pipeline or code examples building a custom integration with the API, our community of CI/CD experts always steps up.
Simple to start. Intuitive to extend.
Developed upon by hundreds of thousands
