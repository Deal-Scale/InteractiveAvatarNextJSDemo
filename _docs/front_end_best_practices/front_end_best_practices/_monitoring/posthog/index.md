https://posthog.com/docs/getting-started/install

Install PostHog

Last updated: Apr 02, 2025
|
Edit this page

This is the simplest way to get PostHog up and running. It only takes a few minutes.

Copy the snippet below and replace <ph_project_api_key> and <ph_client_api_host> with your project's values, then add it within the <head> tags at the base of your product - ideally just before the closing </head> tag. This ensures PostHog loads on any page users visit.

You can find the snippet pre-filled with this data in your project settings.
HTML

<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('<ph_project_api_key>', {api_host: 'https://us.i.posthog.com'})
</script>

Once the snippet is added, PostHog automatically captures $pageview and other events like button clicks. You can then enable other products, such as session replays, within your project settings.

Grouping products in one project (recommended)

Set up a reverse proxy (recommended)

Include ES5 support (optional)

Working with AI code editors?

Questions? Ask Max AI.

It's easier than reading through 635 docs articles.
Community questions

Ashwini
11 days ago
Custom values from code are not capturing correctly

When we are sending the custom dimesnsions like company_id from mytransfer application we are seeing null values in posthog for most of the users. Can someone please help me
Jacopo
3 months ago
How to separate dev and production ?

Which is the best practice to have data separated by dev and production ? So we test new “custom events” in dev and then do the same in production without tracking dev data into production dashboard ?

Adam
3 months ago

I'm no pro, but the support here seems to be lacking, so I'll do my best.

    Yes, you can add custom properties to auto-captured events. You can read more about that here: https://posthog.com/docs/product-analytics/autocapture#capturing-additional-properties-in-autocapture-events

    No, there is no native way to import settings, dashboards, and insights between projects. You can either recreate everything manually, or use the API (a bit of work) to do this. Many have suggested it, but there hasn't been much traction it seems.

Good luck!
Jon
8 months ago
Installing on Discourse

More of a comment than a question. ;-) I wrote a guide for installing PostHog on Discourse. It's probably easiest to use a Theme Component that can be shared across teams.

Since Discourse is a Rails application, it might be useful to create a plugin for Discourse using the Ruby library. But if you just want to get JavaScript events and session recordings, the Theme Component method works perfectly.
Rohit
8 months ago
Posthog installation on AWS account

Is there a self hosted version of Posthog. Where data do not leave our premises. We would like to install this on our own AWS accounts and let all the client integrate with it and send events to our own data ware houses. And visualisation also speaks to our system

    Ady
    8 months ago

    Hi Rohit, does this meet your needs?: https://posthog.com/docs/self-host

kyle
9 months ago
Install on one page

Hi there

Is it possible to install on only one page within my wordpress website?

    Ozan
    9 months ago

    Yes,

    The easiest way to do this is via Google Tag Manager via configured page view triggers.

    How to install GTM on your wordpress site: https://wordpress.com/go/tutorials/how-to-add-google-tag-manager-to-your-wordpress-website/

    Configuring a page view trigger: https://support.google.com/tagmanager/answer/7679319?hl=en

Marc
10 months ago
Are you planning to have Unity support?

Are you planning to have Unity support?

Max AI
8 months agoSolution

Based on the available information, PostHog does not currently have Unity support, and there are no immediate plans to implement it in the near future.(1)

While Unity integration has been discussed in the past, it's not currently on PostHog's active development roadmap. A PostHog team member mentioned that it was a future goal about two years ago, but there hasn't been any recent progress on this front.(1)

As of now, Unity support remains a potential future feature, but there's no specific timeline for its development. If you're interested in this integration, it might be worth keeping an eye on PostHog's updates or considering contributing to the project if you have the expertise.(1)

For the most up-to-date information on PostHog's plans and roadmap, you may want to check their official channels or community forums regularly.
Igor
a year ago
SvelteKit support?

Would be awesome to start supporting SvelteKit that's gaining popularity quite a bit :)

Ian
a year agoSolution

We do support Svelte, and have this tutorial for it: https://posthog.com/tutorials/svelte-analytics

Anything else you'd like to see?
Lucas
a year ago
C++ Support

Is there a plan to create a library for c++?

Marcus
a year ago

Hey Lucas, that is not something on our roadmap right now, but feel free to open a feature request on Github.
Jakob Felix Eugen
2 years ago
Good Typescript Support

Does this tool has good Typescript support?

Paul
(he/him)
2 years agoSolution

Hey Jakob,

posthog-js is written in TypeScript https://github.com/PostHog/posthog-js and we write the front end of app.posthog.com in TypeScript importing posthog-js. We also have multiple customers using PostHog with TypeScript projects.
Power
2 years ago
Does the snippet work with/in Retool?

I need to automatically capture all events.

Marcus
2 years agoSolution

Hey, we do not have a SDK that works with retool, a workaround is to use our API. (Note: this will not allow auto-capture)
