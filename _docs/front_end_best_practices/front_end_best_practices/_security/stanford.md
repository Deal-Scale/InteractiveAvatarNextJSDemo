CS 253 Web Security
Fall 2021

This course is a comprehensive overview of web security. The goal is to build an understanding of the most common web attacks and their countermeasures. Given the pervasive insecurity of the modern web landscape, there is a pressing need for programmers and system designers to improve their understanding of web security issues.

We'll be covering the fundamentals as well as the state-of-the-art in web security.

Topics include: Principles of web security, attacks and countermeasures, the browser security model, web app vulnerabilities, injection, denial-of-service, TLS attacks, privacy, fingerprinting, same-origin policy, cross site scripting, authentication, JavaScript security, emerging threats, defense-in-depth, and techniques for writing secure code. Course projects include writing security exploits, defending insecure web apps, and implementing emerging web standards.
Meeting time and place

Tuesdays and Thursdays, 1:30 PM - 2:50 PM in classroom 320-105
Course Staff
Instructor

    Feross Aboukhadijeh (feross@cs.stanford.edu)
        Stanford CS BS '12, MS '20, Socket founder & CEO

Teaching Assistants

    Anna Zeng (aszeng@stanford.edu)
    Timothy Gu (timothygu@stanford.edu)
    David Estrada-Arias (dae783@stanford.edu)

Office Hours

    Feross: Thursday 9am-11am, Google Meet (link in Ed)
    Anna: Tuesday 3:15-5:15pm, Thursday 9:30-11:30am, Huang 019
    Timothy: Wednesday 1:30-3:30pm, Huang 019
    David: Monday 2-4pm, Thursday 10-12pm, Huang 020

Course Policies
Communication

We will primarily use Ed for sending out course announcements and answering questions.

We use Gradescope for assignment submissions. Enroll with the code ZR5E5Z.

To submit anonymous feedback to Feross at any point during the quarter, you may use this form.
Prerequisites

CS 142, or an equivalent amount of web development experience, is a prerequisite. You should also be curious about web security and excited to learn clever attacks, defenses, and techniques for writing secure code.

An introductory security course, such as CS 155, is not a formal prerequisite. The material in this course is focused specifically on the web, while CS 155 covers security more broadly.
Attendence

Attendance at lectures is mandatory. Do not enroll in this course if you are taking another course that meets at the same time.
Grading

    Assignments (75%)
    Final Exam (25%)

Each assignment is worth 15%. There is no midterm.
Final Exam

    Tuesday, December 7, 3:30pm - 6:30pm, 420-040

Previous Final Exams

    Final Exam 2021 (Solutions)
    Final Exam 2019 (Solutions)
    More Sample Final Exam Questions (Solutions)

Collaboration Policy

You may discuss the assignments with other students but do not share code or attack inputs. When designing an attack, there's usually an amazing aha moment when you finally figure out the "trick"; if someone tells you the solution before you've figured it out yourself you'll be robbed of the best part of this course. If you discuss an assignment with another student, you must list their name in the submission. Each student must write up their solutions independently.
Late Submissions

You get three “late days” in total during the quarter. You may use a late day to submit an assignment after the deadline. You can use at most three late days for any single assignment, and you may only use late days in one-day increments (no partial late days).

If you submit an assignment more than 72 hours after the deadline, or if you submit an assignment late after running out of late days, you will receive no credit for the submission. Please submit your assignments on time and save your late days for extraordinary situations.

If you have questions about these policies, please ask us.
Schedule
Part 1: Basics
Sep 21: What is Web Security?

    Slides
    Reading
        Inside look at modern web browser (part 1)
        Inside look at modern web browser (part 2)
        Inside look at modern web browser (part 3)
        A Re-Introduction to JavaScript

Sep 23: DNS, HTTP

    Slides
    Reading
        An overview of HTTP
        A typical HTTP session
        Skim: HTTP headers

Sep 28: Same Origin Policy

    Slides
    Reading
        Same Origin policy

Part 2: Client-side attacks and defenses
Sep 30: Cookies and Sessions

    Slides
    Reading
        HTTP Cookies

Oct 05: Session attacks, Cross-Site Request Forgery

    Slides
    Reading
        SameSite Cookies Explained
        Incrementally Better Cookies
        CSRF Is Dead
        Cross-Site Request Forgery Prevention

Oct 07: Cross-Site Scripting (XSS)

    Slides
    Reading
        Cross Site Scripting Prevention Cheat Sheet
        XSS Filter Evasion Cheat Sheet

Oct 12: Cross-Site Scripting Defenses

    Slides
    Reading
        Reining in the Web with Content Security Policy
        CSP is Dead: Long Live CSP
        Trusted Types
        Sanitising HTML: the DOM clobbering issue

Oct 14: Denial-of-service, Phishing

    Slides
    Reading
        Alice in Warningland: A Large-Scale Field Study of Browser Security
        Clickjacking
        Cross-Origin JavaScript Capability Leaks: Detection, Exploitation, and Defense
        XS-Leaks

Oct 19: Online Tracking, What Can Be Done About it, and Who’s Doing it

    Guest Lecture by Pete Snyder (Brave)
    Slides
    Reading
        Online tracking: A 1-million-site measurement and analysis
        Most websites don't need to vibrate: A cost-benefit approach to improving browser security
        Browser Fingerprinting: An Introduction and the Challenges Ahead
        WebKit Ad Click Attribution
        Protecting Browser State from Web Privacy Attacks
        Skim: WebKit Tracking Prevention Policy

Part 3: Server-side attacks and defenses
Oct 21: Code Injection

    Slides
    Reading
        Command injection
        SQL injection

Oct 26: Server security, Safe coding practices

    Slides
    Reading
        Exploiting Buffer

Oct 28: HTTPS and the Lock Icon

    Guest Lecture by Dan Boneh (Stanford)
    Slides
    Reading
        Looking back at the Snowden revelations
        HTTPS encryption on the web

Nov 02: No class
Nov 04: HTTPS in the Real World

    Guest Lecture by Joe DeBlasio (Google Chrome)
    Slides
    Reading
        DigiNotar on Wikipedia
        About Public Key Pinning
        What Is HPKP For?
        Rolling out Public Key Pinning with HPKP Reporting

Nov 09: Authentication

    Slides
    Reading
        Authentication Cheat Sheet

Nov 11: WebAuthn - The future of user authentication on the web

    Guest Lecture by Lucas Garron (GitHub)
    Slides
    Reading
        Guide to Web Authentication

Part 4: Web security in the real world
Nov 16: Local HTTP server security

    Slides
    Reading
        None

Nov 18: Web Security in the Real World

    Guest Lecture by Yan Zhu (Brave)
    Slides
    Reading
        The Security Architecture of the Chromium Browser
        Cross-Origin Read Blocking (CORB) primer
        Skim: Cross-Origin Read Blocking (CORB) explainer
        Backdooring Your JavaScript Using Minifier Bugs
        I’m harvesting credit card numbers and passwords from your site. Here’s how.
        Major sites running unauthenticated JavaScript on their payment pages

Nov 30: DNS rebinding attacks

    Slides
    Reading
        Millions of Streaming Devices Are Vulnerable to a Retro Web Attack
        Protecting Browsers from DNS Rebinding Attacks
        Private Network Access

Dec 02: Browser architecture, Writing secure code

    Slides
    Reading
        Google Chrome Exploitation – A Case Study
        The Rule of 2
        statement on event-stream compromise
        Browse: Socket: open source supply chain security SCA analysis tool

Assignments
Assignment 0 – Web Programming Adventure ✈️

    Assigned: Tuesday, September 21
    Due: Wednesday, September 29 at 5:00pm

Assignment 1 – Journey to the Dark Side 🌘

    Assigned: Tuesday, October 5
    Due: Friday, October 15 at 5:00pm

Assignment 2 – Oh What a Tangled Web We Weave 🕸

    Assigned: Tuesday, October 19
    Due: Friday, October 29 at 5:00pm

Assignment 3 – Somebody's Always Watching 👁️

    Assigned: Tuesday, November 2
    Due: Friday, November 12 at 11:59pm

Assignment 4 - Swiss Cheese Security 🧀

    Assigned: Wednesday, November 24
    Due: Friday, December 3 at 11:59pm
