React

Last updated: Apr 01, 2025
|
Edit this page
Which features are available in this library?

    AvailableEvent capture

AvailableAutocapture
AvailableUser identification
AvailableSession replay
AvailableFeature flags
AvailableGroup analytics
AvailableSurveys
Not availableLLM observability
AvailableError tracking

PostHog makes it easy to get data about traffic and usage of your React app. Integrating PostHog into your site enables analytics about user behavior, custom events capture, session recordings, feature flags, and more.

This guide will walk you through an example integration of PostHog using React and the posthog-js library.
Alpha: integration via LLM

Try our prompt-based integration for React using Cursor, Bolt, and other agent-like tools that can run terminal commands. Paste this into your chat:
agent

Let's add PostHog to this project. We'll use the PostHog wizard to ensure the integration is handled correctly. Use this command:

npx --yes @posthog/wizard@latest --default --region us

Do not generate any file changes yourself. This CLI command will do all the work. Wait for it to finish and test the setup once the wizard is complete.

Or, to integrate manually, continue with the rest of this guide.
Installation

    For Next.js, we recommend following the Next.js integration guide instead.

    Install posthog-js using your package manager:

Terminal

yarn add posthog-js
# or
npm install --save posthog-js

    Add your environment variables to your .env.local file and to your hosting provider (e.g. Vercel, Netlify, AWS). You can find your project API key and host in your project settings. Including VITE_PUBLIC_ in their names ensures they are accessible in the frontend.

.env.local

VITE_PUBLIC_POSTHOG_KEY=<ph_project_api_key>
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

    Integrate PostHog at the root of your app (such as main.jsx if you are using Vite).

React

// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PostHogProvider } from 'posthog-js/react'

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY} options={options}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)

Usage
PostHog Provider

The React context provider makes it easy to access the posthog-js library in your app.

The provider can either take an initialized client instance OR an API key and an optional options object.

With an initialized client instance:
React

// src/index.js
import posthog from 'posthog-js';
import { PostHogProvider} from 'posthog-js/react'

posthog.init(
  process.env.REACT_APP_PUBLIC_POSTHOG_KEY,
  {
    api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </React.StrictMode>
);

or with an API key and optional options object:
React

// src/index.js
import { PostHogProvider} from 'posthog-js/react'

const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <PostHogProvider 
      apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <App />
    </PostHogProvider>
  </React.StrictMode>
);

Using posthog-js functions

By default, the posthog-js library automatically captures pageviews, element clicks, inputs, and more. Autocapture can be tuned in with the configuration options.

If you want to use the library to identify users, capture events, use feature flags, or use other features, you can access the initialized posthog-js library using the usePostHog hook.

Do not directly import posthog apart from installation as shown above. This will likely cause errors as the library might not be initialized yet. Initialization is handled automatically when you use the PostHogProvider and hook.

All the methods of the library are available and can be used as described in the posthog-js documentation.
React

import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { useUser, useLogin } from '../lib/user'

function App() {
    const posthog = usePostHog()
    const login = useLogin()
    const user = useUser()

    useEffect(() => {
        if (user) {
            // Identify sends an event, so you may want to limit how often you call it
            posthog?.identify(user.id, {
                email: user.email,
            })
            posthog?.group('company', user.company_id)
        }
    }, [posthog, user.id, user.email, user.company_id])

    const loginClicked = () => {
        posthog?.capture('clicked_log_in')
        login()
    }

    return (
        <div className="App">
            {/* Fire a custom event when the button is clicked */}
            <button onClick={() => posthog?.capture('button_clicked')}>Click me</button>
            {/* This button click event is autocaptured by default */}
            <button data-attr="autocapture-button">Autocapture buttons</button>
            {/* This button click event is not autocaptured */}
            <button className="ph-no-capture">Ignore certain elements</button>
            <button onClick={loginClicked}>Login</button>
        </div>
    )
}

export default App

TypeError: Cannot read properties of undefined

If you see the error TypeError: Cannot read properties of undefined (reading '...') this is likely because you tried to call a posthog function when posthog was not initialized (such as during the initial render). On purpose, we still render the children even if PostHog is not initialized so that your app still loads even if PostHog can't load.

To fix this error, add a check that posthog has been initialized such as:
React

useEffect(() => {
  posthog?.capture('test') // using optional chaining (recommended)

  if (posthog) {
    posthog.capture('test') // using an if statement
  }
}, [posthog])

Typescript helps protect against these errors.
Feature Flags

PostHog's feature flags enable you to safely deploy and roll back new features as well as target specific users and groups with them.

There are two ways to implement feature flags in React:

    Using hooks.
    Using the <PostHogFeature> component.

Method 1: Using hooks

PostHog provides several hooks to make it easy to use feature flags in your React app.
Hook	Description
useFeatureFlagEnabled	Returns a boolean indicating whether the feature flag is enabled.
useFeatureFlagPayload	Returns the payload of the feature flag.
useFeatureFlagVariantKey	Returns the variant key of the feature flag.
useActiveFeatureFlags	Returns an array of active feature flags.
Example 1: Using a boolean feature flag
React

import { useFeatureFlagEnabled } from 'posthog-js/react'

function App() {
  const showWelcomeMessage = useFeatureFlagEnabled('flag-key')

  return (
    <div className="App">
      {
        showWelcomeMessage ? (
          <div>
            <h1>Welcome!</h1>
            <p>Thanks for trying out our feature flags.</p>
          </div>
        ) : (
          <div>
            <h2>No welcome message</h2>
            <p>Because the feature flag evaluated to false.</p>
          </div>
        )
      }
    </div>
  );
}

export default App;

Example 2: Using a multivariate feature flag
React

import { useFeatureFlagVariantKey } from 'posthog-js/react'

function App() {
  const variantKey = useFeatureFlagVariantKey('show-welcome-message')
  let welcomeMessage = '' 
  if (variantKey === 'variant-a') {
    welcomeMessage = 'Welcome to the Alpha!'
  } else if (variantKey === 'variant-b') {
    welcomeMessage = 'Welcome to the Beta!'
  }  

  return (
    <div className="App">
      {
        welcomeMessage ? (
          <div>
            <h1>{welcomeMessage}</h1>
            <p>Thanks for trying out our feature flags.</p>
          </div>
        ) : (
          <div>
            <h2>No welcome message</h2>
            <p>Because the feature flag evaluated to false.</p>
          </div>
        )
      }
    </div>
  );
}

export default App;

Example 3: Using a flag payload
React

import { useFeatureFlagPayload } from 'posthog-js/react'

function App() {
  const payload = useFeatureFlagPayload('show-welcome-message')

    return (
                <>
                {
                    payload?.welcomeMessage ? (
                        <div className="welcome-message">
                            <h2>{payload?.welcomeTitle}</h2>
                            <p>{payload.welcomeMessage}</p>
                        </div>
                    ) : <div>
                        <h2>No welcome message</h2>
                        <p>Because the feature flag evaluated to false.</p>
                    </div>
                }
        </>
    )
}

Method 2: Using the PostHogFeature component

The PostHogFeature component simplifies code by handling feature flag related logic.

It also automatically captures metrics, like how many times a user interacts with this feature.

    Note: You still need the PostHogProvider at the top level for this to work.

Here is an example:
React

import { PostHogFeature } from 'posthog-js/react'

function App() {

    return (
        <PostHogFeature flag='show-welcome-message' match={true}>
            <div>
                <h1>Hello</h1>
                <p>Thanks for trying out our feature flags.</p>
            </div>
        </PostHogFeature>
    )
}

    The match on the component can be either true, or the variant key, to match on a specific variant.

    If you also want to show a default message, you can pass these in the fallback attribute.

If you wish to customise logic around when the component is considered visible, you can pass in visibilityObserverOptions to the feature. These take the same options as the IntersectionObserver API. By default, we use a threshold of 0.1.
Payloads

If your flag has a payload, you can pass a function to children whose first argument is the payload. For example:
React

import { PostHogFeature } from 'posthog-js/react'

function App() {

    return (
        <PostHogFeature flag='show-welcome-message' match={true}>
           {(payload) => {
                return (
                    <div>
                        <h1>{payload.welcomeMessage}</h1>
                        <p>Thanks for trying out our feature flags.</p>
                    </div>
                )
           }}
        </PostHogFeature>
    )
}

Request timeout

You can configure the feature_flag_request_timeout_ms parameter when initializing your PostHog client to set a flag request timeout. This helps prevent your code from being blocked in the case when PostHog's servers are too slow to respond. By default, this is set at 3 seconds.
JavaScript

posthog.init('<ph_project_api_key>', { 
        api_host: 'https://us.i.posthog.com',
        feature_flag_request_timeout_ms: 3000 // Time in milliseconds. Default is 3000 (3 seconds).
    }
)

Error handling

When using the PostHog SDK, it's important to handle potential errors that may occur during feature flag operations. Here's an example of how to wrap PostHog SDK methods in an error handler:
JavaScript

function handleFeatureFlag(client, flagKey, distinctId) {
    try {
        const isEnabled = client.isFeatureEnabled(flagKey, distinctId);
        console.log(`Feature flag '${flagKey}' for user '${distinctId}' is ${isEnabled ? 'enabled' : 'disabled'}`);
        return isEnabled;
    } catch (error) {
        console.error(`Error fetching feature flag '${flagKey}': ${error.message}`);
        // Optionally, you can return a default value or throw the error
        // return false; // Default to disabled
        throw error;
    }
}

// Usage example
try {
    const flagEnabled = handleFeatureFlag(client, 'new-feature', 'user-123');
    if (flagEnabled) {  
        // Implement new feature logic
    } else {
        // Implement old feature logic
    }
} catch (error) {
    // Handle the error at a higher level
    console.error('Feature flag check failed, using default behavior');
    // Implement fallback logic
}

Bootstrapping Flags

Since there is a delay between initializing PostHog and fetching feature flags, feature flags are not always available immediately. This makes them unusable if you want to do something like redirecting a user to a different page based on a feature flag.

To have your feature flags available immediately, you can initialize PostHog with precomputed values until it has had a chance to fetch them. This is called bootstrapping. After the SDK fetches feature flags from PostHog, it will use those flag values instead of bootstrapped ones.

For details on how to implement bootstrapping, see our bootstrapping guide.
Experiments (A/B tests)

Since experiments use feature flags, the code for running an experiment is very similar to the feature flags code:
React

// You can either use the `useFeatureFlagVariantKey` hook,
// or you can use the feature flags component - /docs/libraries/react#feature-flags-react-component

// Method one: using the useFeatureFlagVariantKey hook
import { useFeatureFlagVariantKey } from 'posthog-js/react'

function App() {
    const variant = useFeatureFlagVariantKey('experiment-feature-flag-key')
    if (variant == 'variant-name') {
        // do something
    }
}

// Method two: using the feature flags component
import { PostHogFeature } from 'posthog-js/react'

function App() {
    return (
        <PostHogFeature flag='experiment-feature-flag-key' match={'variant-name'}>
            <!-- the component to show -->
        </PostHogFeature>
    )
}

// You can also test your code by overriding the feature flag:
// e.g., posthog.featureFlags.overrideFeatureFlags({ flags: {'experiment-feature-flag-key': 'test'}})

It's also possible to run experiments without using feature flags.
Questions? Ask Max AI.

It's easier than reading through 635 docs articles.
Community questions

Jack
19 days ago
Disabling sending data in development

Is there a nice way to disable the Posthog client from sending data to Posthog in development?

H
18 days ago

Hey, I am not a Posthog member. But I think I know how you can tackle this.

I am guessing that you don't want to send data from your dev environment, i.e., localhost:3000 or some localhost URL. There can be a few ways to do this:

    Remove localhost:3000 or dev URL from the authorized URLs list in the Posthog dashboard
    You can remove the Posthog env variables in the dev mode.

Aleksei
3 months ago
Typescript does not account for posthog being not initialised

The docs mention that usePosthog() hook can return an undefined value if posthog wasn't yet initialised. Then there's a phrase saying "typescript protects against this".

The return type of usePosthog() is PostHog rather than PostHog | undefined. This looks like a mistake and for typescript to actually protect against this, the return type of the hook should be changed

Aleksei
Author3 months ago

same seems to apply to import posthog from 'posthog-js'; as docs mention that you should do posthog?.smth() even for this. Which confuses me quite a bit tbh
Max AI
3 months ago
This answer was marked as unhelpful.

You raise a valid point. The documentation shows that optional chaining is indeed recommended when using PostHog methods. For example:

useEffect(() => {
      posthog?.capture('test') // using optional chaining (recommended)    

      if (posthog) {
        posthog.capture('test') // using an if statement
      }
}, [posthog])

(1)

The documentation explicitly states that if you see the error TypeError: Cannot read properties of undefined (reading '...') it's likely because you tried to call a posthog function when posthog was not initialized (such as during the initial render)(1).

There's currently an open feature request specifically about improving TypeScript support for PostHog packages(2). This suggests that the current TypeScript definitions might not fully reflect the runtime behavior of the library.

The inconsistency you've noticed between the recommended usage (with optional chaining) and the TypeScript types appears to be a valid observation, and it might be worth contributing to the existing discussions about improving TypeScript support.
Doug
5 months ago
No $pageleave events have been received

Hello, we are using posthog (1.194.3) with React (17.0.2) and react-router-dom (5.3.0). Everything is working fine for recording "$pageview" events, but we are seeing this message on our Web Analytics screen

"No $pageleave events have been received, this means that Bounce rate and Session duration might be inaccurate."

I've had trouble finding documentation on how to fix this and wondered if someone could point me in the right direction. FWIW, we have another React app with a similar setup (using tanstack router though) and I do NOT see this message for that project.

Appreciate the help, thanks!

Clément
Edited 4 months ago

There's a fix in the documentation. Update the hook in your provider like so:

useEffect(() => {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
+       capture_pageleave: true, // Enable pageleave capture
      })
    }, [])

Doug
Author4 months ago

Thanks Clément! I'll read through those and update 👍
BigS
5 months ago
Cookies and Consent

It's not mentioned nowhere that we should ask for consent. This has to be done, right? Is there any recommended way/example you have for it?

Mathias
5 months ago

Hooks can only be called inside hooks or in a functional component. In this case the reducer is neither a hook nor a .tsx component. You can reference the posthog instance directly from:

import posthog from "posthog-js"

If you are inside a hook or a JSX/TSX component use instead:

import { usePostHog } from "posthog-js/react"

Ben
10 months ago
How to use posthog-js with redux actions

I have a SPA and want to be able to track pageviews but the documentation tells me to implement the React provider and make use of the usePostHog hook however my identify code happens in a redux action. I want to be able to call posthog.identify here instead of inside a component with a hook. Is this possible?

The documentation tells me not to do this but I'm wondering if that's just because it might not have been initialised yet?

Any ideas on best practice for this kind of implementation?
Daniel
10 months ago
Can we do batch capture

I see batch options via API do we also support it for React? It will help reduce the number of frontend requests.

Marcus
10 months ago

Yes, all our SDKs will send the events in batches to the Cloud.
Alberto
a year ago
Feature Flag Via API

Good morning!

Is it possible to set feature flag payload values via API?

Thank you in advance!
Sana
a year ago
posthog API_KEY/token appearing in events

why my posthog api key shows up as token in all the events. I am not passing it anywhere explicitly and doing the initialization just like the documentation. Here is my initialization snippet. if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) { posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com", // Enable debug mode in development loaded: (posthog) => { if (process.env.NODE_ENV === "development") posthog.debug(); }, }); }
Georgii
a year ago
REACT_APP_PUBLIC_POSTHOG_HOST

What is REACT_APP_PUBLIC_POSTHOG_HOST and where to take it? Looks like it is completely missed in the docs.

Marcus
a year agoSolution

Hey Georgii, you can retrieve your API Host on the settings page. 2024-05-22 at 20.49.38@2x.png
Harjas
a year ago
Posthog React with React-router

Does the Posthog provider capture react-router-dom redirections?

Marcus
a year agoSolution

Not by default, but you can follow our simple guide for tracking pageviews in single page apps, to start tracking them properly.
David
2 years ago
How to use posthog in a class component?

Hi,

How can I use the posthog library in a class component?

Ben
2 years agoSolution

There is no special case for a class component.

You can simple use posthog-js directly like you would anywhere else. The only thing that needs to have happened somewhere is a call to posthog.init(). If you use the React component PostHogProvider this takes care of it but you don't have to. You can simply call posthog.init() somewhere in your application code.
Jeremy
2 years ago

Does posthog know not to re-initialize if posthog.init() has been called previously??
