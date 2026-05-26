Product analytics best practices

Last updated: Feb 11, 2025
|
Edit this page

1. Set up a reverse proxy

Tracking and ad blockers can prevent your events from being sent to PostHog. By setting up a reverse proxy, you can send events to PostHog using your own domain. This means that events are less likely to be blocked and you'll capture more data.

See our docs on how to set up a reverse proxy for more details on how to do this. 2. Capture pageviews and pageleaves in single-page apps

PostHog automatically sends $pageview events whenever it gets loaded and $pageleave when they leaves. If you have a single-page app, that means it only sends pageview and pageleave once (when your app loads and when they leave).

To make sure any navigating a user does within your app gets captured, you can capture pageviews and pageleaves manually.
Web

// Capture pageview
posthog.capture('$pageview')

// Capture pageleave
posthog.capture('$pageleave')

3. Implement a naming convention

As your product grows, the amount of analytics data grows with it. Without naming conventions, your data quickly becomes difficult to work with.

For example, let's say you're capturing signup metrics. Your team might capture events differently and with multiple names:

    Web developer: Captures Create Account when a user clicks a button to begin signing up.
    iOS developer: Captures the same event but names it user_sign_up.
    Android developer: Calls it create-account but only captures it when they have finished signing up.

All these differences make it more likely that you'll misinterpret your data. Implementing a naming convention prevents these problems.
Suggested naming guide

    Only use lowercase letters.
    Use present-tense verbs, e.g., "submit" and "create" instead of "submitted" and "created".
    Use snake case, i.e., signup_button_click.
    Create a dedicated list of allowed verbs, and don't deviate from it. Here's a list of the most common ones you're likely to use:

- click
- submit
- create
- view
- add
- invite
- update
- delete
- remove
- start
- end
- cancel
- fail
- generate
- send

  For event names, use the category:object_action framework to make it easier to find a specific event within a long list:

        category describes the context the event took place in – e.g., account_settings or signup_flow.

        object is a noun that refers to the component or location the event took place in – e.g., forgot_password_button or pricing_page.

        action is a verb that describes what happened – e.g., click, submit, or create.

        Putting all of these together, you get account_settings:forgot_password_button_click or signup_flow:pricing_page_view.

  For property names:

        Use the object_adjective pattern – e.g., user_id, item_price, or member_count.

        Use is/has prefixes for boolean properties – e.g., is_subscribed, has_seen_upsell.

        If the property's value is a date or timestamp, include _date or _timestamp at the end – e.g., user_creation_date, last_login_timestamp.

4. Version your events

As your app evolves, so do the events you track. Implementing a versioning system for events ensures you can easily distinguish between older and newer events, especially when significant changes occur.

For example, if you initially tracked an event as registration:sign_up_button_click and later revamped your registration flow, you can introduce a new version of this event registration_v2:sign_up_button_click. This way, you preserve historical data on the old event while making it easy to compare the impact of your new changes. 5. Prefer backend to frontend tracking

Backend analytics are more reliable than frontend analytics. There are 3 reasons for this:

    Many users have tracking disabled or blocked on their browsers, which can prevents events from being sent.
    Frontend analytics often rely on JavaScript execution, which can be interrupted by various factors – such as network issues, CORS, browser settings, and more.
    You have complete control of your backend implementation and execution.

Where possible, it's a good idea to log events on your server instead of your client. Here's a guide to help you decide when to rely on frontend or backend analytics:

    Use frontend analytics where getting partial data is acceptable, for example:
        Understanding user journeys, such as the sequence of pages a user visits.
        Tracking user interactions like clicks, scrolls, or form submissions.
        Gathering data on client-side performance, like page load times and responsiveness.

    Use backend analytics (or query your database) if:
        You need accurate data – e.g., the number of users that signed up in the last week.
        You want to analyze data alongside other business metrics.

6. Filter out internal users

Apps with few users can inadvertently inflate their own metrics by not filtering out their own usage. This leads to a bias in their data. For this reason, it's important to filter out events sent by your own team.

There are a few ways to do this:

    Filter out events from users with internal emails.
    Add a property on your events is_employee or is_test_user and filter events where these are true.
    Exclude internal IPs from your analytics tracking.
    Filter events by domain host e.g., exclude localhost:3000, staging.yourapp.com.
    Turn off tracking in development using a localhost, dev, or config check.

See our guide on how to filter out internal users for more details on how to do this in PostHog. 7. Use the same project for your website and app

We recommend to track both your marketing site and app in the same project. This enables you to do the following:

    Track complete user journeys from first website visit through to product usage
    Understand which marketing channels and content lead to the most engaged product users
    Calculate accurate customer acquisition costs (CAC) and lifetime value (LTV)
    Analyze how marketing activities impact product metrics like retention and churn
    Create cross-platform funnels (e.g., from blog post → signup → feature usage)

Questions? Ask Max AI.

It's easier than reading through 635 docs articles.
Community questions

    Alex
    Edited 4 months ago

Case for past-tense naming

Hey Posthog team! Love your guys product.

I'm a bit confused why you guys recommend present-tense naming as a best practice.

I'd like to make the case for past-tense naming.

    Events describe actions that have already occurred.
        Even when you guys talk about events in this document, you use past tense. “e.g., the number of users that signed up in the last week.”
    I believe past-tense naming for events is more common in the industry. Domain events, Amplitude, Segment, Intercom
    Semantically it's confusing. If you're seeing the event in Posthog, it has occurred. If it failed for some reason, you don't report the event.
    For me, it creates some confusion between "events" with "commands". Imagine we use Posthog's data pipelines, and I receive a "user:create" event. Am I supposed to go and create the user in a destination function? Or am I being notified that a user was created?

Would love to hear y’alls thoughts on the topic 😃

    Jan
    a month ago

    push
