React Native

Last updated: Apr 14, 2025
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
Not availableError tracking
Installation

Our React Native enables you to integrate PostHog with your React Native project. For React Native projects built with Expo, there are no mobile native dependencies outside of supported Expo packages.

To install, add the posthog-react-native package to your project as well as the required peer dependencies.
Expo apps
Terminal

npx expo install posthog-react-native expo-file-system expo-application expo-device expo-localization

React Native apps
Terminal

yarn add posthog-react-native @react-native-async-storage/async-storage react-native-device-info react-native-localize
# or
npm i -s posthog-react-native @react-native-async-storage/async-storage react-native-device-info react-native-localize

React Native Web and macOS

If you're using React Native Web or React Native macOS, do not use the expo-file-system package since the Web and macOS targets aren't supported, use the @react-native-async-storage/async-storage package instead.
Configuration
With the PosthogProvider

The recommended way to set up PostHog for React Native is to use the PostHogProvider. This utilizes the Context API to pass the PostHog client around, enable autocapture, and ensure that the queue is flushed at the right time.

To set up PostHogProvider, add it to your App.js or App.ts file:
App.js

// App.(js|ts)
import { usePostHog, PostHogProvider } from 'posthog-react-native'
...

export function MyApp() {
    return (
        <PostHogProvider apiKey="<ph_project_api_key>" options={{
            // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'
            host: 'https://us.i.posthog.com', 
        }}>
            <MyComponent />
        </PostHogProvider>
    )
}

Then you can access PostHog using the usePostHog() hook:
React Native

const MyComponent = () => {
    const posthog = usePostHog()

    useEffect(() => {
        posthog.capture("event_name")
    }, [posthog])
}

Without the PosthogProvider

If you prefer not to use the provider, you can initialize PostHog in its own file and import the instance from there:
posthog.ts

import PostHog from 'posthog-react-native'

export const posthog = new PostHog('<ph_project_api_key>', {
  // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'  
  host: 'https://us.i.posthog.com' 
})

Then you can access PostHog by importing your instance:
React Native

import { posthog } from './posthog'

export function MyApp1() {
    useEffect(async () => {
        posthog.capture('event_name')
    }, [posthog])

    return <View>Your app code</View>
}

You can even use this instance with the PostHogProvider:
React Native

import { posthog } from './posthog'

export function MyApp() {
  return <PostHogProvider client={posthog}>{/* Your app code */}</PostHogProvider>
}

Configuration options

You can further customize how PostHog works through its configuration on initialization.
Attribute	Description
host

Type: String
Default: https://us.i.posthog.com	PostHog API host (usually https://us.i.posthog.com by default or https://eu.i.posthog.com). Host is optional if you use https://us.i.posthog.com.
flushAt

Type: Number
Default: 20	The number of events to queue before sending to PostHog (flushing).
flushInterval

Type: Number
Default: 10000	The interval in milliseconds between periodic flushes.
maxBatchSize

Type: Number
Default: 100	The maximum number of queued messages to be flushed as part of a single batch (must be higher than flushAt).
maxQueueSize

Type: Number
Default: 1000	The maximum number of cached messages either in memory or on the local storage (must be higher than flushAt).
disabled

Type: Boolean
Default: false	If set to true, the SDK is essentially disabled (useful for local environments where you don't want to track anything).
defaultOptIn

Type: Boolean
Default: true	If set to false, the SDK will not track until the optIn() function is called.
sendFeatureFlagEvent

Type: Boolean
Default: true	Whether to track that getFeatureFlag was called (used by experiments).
preloadFeatureFlags

Type: Boolean
Default: true	Whether to load feature flags when initialized or not.
bootstrap

Type: Object
Default: {}	An object containing the distinctId, isIdentifiedId, featureFlags, and featureFlagPayloads keys. distinctId is a string, and featureFlags and featureFlagPayloads are objects of key-value pairs. Used to ensure data is available as soon as the SDK loads.
fetchRetryCount

Type: Number
Default: 3	How many times HTTP requests will be retried.
fetchRetryDelay

Type: Number
Default: 3000	The delay between HTTP request retries.
requestTimeout

Type: Number
Default: 10000	Timeout in milliseconds for any calls.
featureFlagsRequestTimeoutMs

Type: Number
Default: 10000	Timeout in milliseconds for feature flag calls.
sessionExpirationTimeSeconds

Type: Number
Default: 1800	For session analysis, how long before a session expires (defaults to 30 minutes).
captureMode

Type: String
Default: form	Whether to post events to PostHog in JSON or compressed format.
persistence

Type: String
Default: file	Allows you to provide the storage type. file will try to load the best available storage, the provided customStorage, customAsyncStorage, or in-memory storage.
customAppProperties

Type: Object or Function
Default: null	Allows you to provide your own implementation of the common information about your App or a function to modify the default App properties generated.
customStorage

Type: Object
Default: null	Allows you to provide a custom asynchronous storage such as async-storage, expo-file-system, or a synchronous storage such as mmkv. If not provided, PostHog will attempt to use the best available storage via optional peer dependencies. If persistence is set to memory, this option is ignored.
captureNativeAppLifecycleEvents

Type: Boolean
Default: false	Captures native app lifecycle events such as Application Installed, Application Updated, Application Opened, Application Became Active, and Application Backgrounded. By default, this is false. If you're already using the captureLifecycleEvents options with initReactNativeNavigation or PostHogProvider you should keep this as false, otherwise you may see duplicated events.
disableGeoip

Type: Boolean
Default: false	When true, disables automatic GeoIP resolution for events and feature flags.
enableSessionReplay

Type: Boolean
Default: false	Enable Recording of Session replay for Android and iOS.
sessionReplayConfig

Type: Object
Default: null	Session Replay configuration.
enablePersistSessionIdAcrossRestart

Type: Boolean
Default: false	When true, persists the $session_id across app restarts. If false, $session_id always resets on app restart.
Capturing events

You can send custom events using capture:
React Native

posthog.capture('user_signed_up')

    Tip: We recommend using a [object] [verb] format for your event names, where [object] is the entity that the behavior relates to, and [verb] is the behavior itself. For example, project created, user signed up, or invite sent.

Setting event properties

Optionally, you can include additional information with the event by including a properties object:
React Native

posthog.capture('user_signed_up', {
    login_type: "email",
    is_free_trial: true
})

Capturing screen views
With @react-navigation/native and autocapture:

When using @react-navigation/native, screen tracking is automatically captured if the autocapture property is used in the PostHogProvider:

It is important that the PostHogProvider is configured as a child of the NavigationContainer:
React Native

// App.(js|ts)

import { PostHogProvider } from 'posthog-react-native'
import { NavigationContainer } from '@react-navigation/native'

export function App() {
    return (
        <NavigationContainer>
            <PostHogProvider apiKey="<ph_project_api_key>" autocapture>
                {/* Rest of app */}
            </PostHogProvider>
        </NavigationContainer>
    )
}

With react-native-navigation and autocapture:

First, simplify the wrapping of your screens with a shared PostHogProvider:
React Native

import PostHog, { PostHogProvider } from 'posthog-react-native'
import { Navigation } from 'react-native-navigation';

export const posthog = new PostHog('<ph_project_api_key>');

export const SharedPostHogProvider = (props: any) => {
  return (
    <PostHogProvider client={posthog} autocapture={{
      captureScreens: false, // Screen events are handled differently for react-native-navigation
      captureLifecycleEvents: false, // Lifecycle events are handled differently for react-native-navigation
      captureTouches: true,
    }}>
      {props.children}
    </PostHogProvider>
  );
};

Then, every screen needs to be wrapped with this provider if you want to capture touches or use the usePostHog() hook
React Native

export const MyScreen = () => {
  return (
    <SharedPostHogProvider>
      <View>
        ...
      </View>
    </SharedPostHogProvider>
  );
};

Navigation.registerComponent('Screen', () => MyScreen);

Navigation.events().registerAppLaunchedListener(async () => {
  posthog.initReactNativeNavigation({
    navigation: {
      // (Optional) Set the name based on the route. Defaults to the route name.
      routeToName: (name, properties) => name,
      // (Optional) Tracks all passProps as properties. Defaults to undefined
      routeToProperties: (name, properties) => properties,
    },
    captureScreens: true,
    captureLifecycleEvents: true,
  });
});

Manually capturing screen capture events

If you prefer not to use autocapture, you can manually capture screen views by calling posthog.screen(). This function requires a name. You may also pass in an optional properties object.
JavaScript

posthog.screen('dashboard', {
    background: 'blue',
    hero: 'superhog',
})

Autocapture

PostHog autocapture can automatically track the following events for you:

    Application Opened - when the app is opened from a closed state
    Application Became Active - when the app comes to the foreground (e.g. from the app switcher)
    Application Backgrounded - when the app is sent to the background by the user
    Application Installed - when the app is installed.
    Application Updated - when the app is updated.
    $screen - when the user navigates (if using @react-navigation/native or react-native-navigation)
    $autocapture - touch events when the user interacts with the screen

With autocapture, all touch events for children of PosthogProvider are tracked, capturing a snapshot of the view hierarchy at that point. This enables you to create insights in PostHog without having to add custom events.

PostHog will try to generate a sensible name for the touched element based on the React component displayName or name. If you prefer, you can set your own name using the ph-label prop:
React Native

<View ph-label="my-special-label"></View>

Autocapture configuration

You can tweak how autocapture works by passing custom options.
React Native

<PostHogProvider apiKey="<ph_project_api_key>" autocapture={{
    captureTouches: true,
    captureLifecycleEvents: true,
    captureScreens: true, 
    ignoreLabels: [], // Any labels here will be ignored from the stack in touch events
    customLabelProp: "ph-label",
    noCaptureProp: "ph-no-capture",
    propsToCapture: ["testID"], // Limit which props are captured. By default, identifiers and text content are captured.

    navigation: {
        // By default, only the screen name is tracked but it is possible to track the
        // params or modify the name by intercepting the autocapture like so
        routeToName: (name, params) => {
            if (params.id) return `${name}/${params.id}`
            return name
        },
        routeToProperties: (name, params) => {
            if (name === "SensitiveScreen") return undefined
            return params
        },
    }
}}>
    ...
</PostHogProvider>

Preventing sensitive data capture

If there are elements you don't want to be captured, you can add the ph-no-capture property. If this property is found anywhere in the view hierarchy, the entire touch event is ignored:
React Native

<View ph-no-capture>Sensitive view here</View>

Identifying users

    We highly recommend reading our section on Identifying users to better understand how to correctly use this method.

Using identify, you can associate events with specific users. This enables you to gain full insights as to how they're using your product across different sessions, devices, and platforms.

An identify call has the following arguments:

    distinctId: Required. A unique identifier for your user. Typically either their email or database ID.
    properties: Optional. A dictionary with key:value pairs to set the person properties

React Native

posthog.identify('distinctID', 
  { // ($set):
      email: 'user@posthog.com',
      name: 'My Name'
  }
)

$set_once works just like $set, except that it will only set the property if the user doesn't already have that property set. See the difference between $set and $set_once
React Native

posthog.identify('distinctID',
  {
    $set: {
        email: 'user@posthog.com',
        name: 'My Name'
    },
    $set_once: {
        date_of_first_log_in: '2024-03-01'
    }
  }
)

You should call identify as soon as you're able to. Typically, this is every time your app loads for the first time as well as directly after your user logs in. This ensures that events sent during your user's sessions are correctly associated with them.

When you call identify, all previously tracked anonymous events will be linked to the user.
Get the current user's distinct ID

You may find it helpful to get the current user's distinct ID. For example, to check whether you've already called identify for a user or not.

To do this, call posthog.get_distinct_id(). This returns either the ID automatically generated by PostHog or the ID that has been passed by a call to identify().
Alias

Sometimes, you want to assign multiple distinct IDs to a single user. This is helpful when your primary distinct ID is inaccessible. For example, if a distinct ID used on the frontend is not available in your backend.

In this case, you can use alias to assign another distinct ID to the same user.
React Native

// Sets alias for current user
posthog.alias('distinct_id')

We strongly recommend reading our docs on alias to best understand how to correctly use this method.
Setting person properties

Person properties enable you to capture, manage, and analyze specific data about a user. You can use them to create filters or cohorts, which can then be used in insights, feature flags, and more.

To set a user's properties, include the $set or $set_once property when capturing any event:
$set
JavaScript

posthog.capture('some_event', { $set: { userProperty: 'value' } })

$set_once

$set_once works just like $set, except it only sets the property if the user doesn't already have that property set.
JavaScript

posthog.capture('some_event', { $set_once: { userProperty: 'value' } })

Super properties

Super properties are properties associated with events that are set once and then sent with every capture call, be it a $screen, an autocaptured touch, or anything else.

They are set using posthog.register, which takes a properties object as a parameter, and they persist across sessions.

For example:
JavaScript

posthog.register({
    'icecream pref': 'vanilla',
    team_id: 22,
})

The call above ensures that every event sent by the user will include "icecream pref": "vanilla" and "team_id": 22. This way, if you filtered events by property using icecream_pref = vanilla, it would display all events captured on that user after the posthog.register call, since they all include the specified Super Property.

This does not set the user's properties. This only sets the properties for their events. To store person properties, see the setting person properties section.
Removing stored super properties

Super Properties are persisted across sessions so you have to explicitly remove them if they are no longer relevant. In order to stop sending a Super Property with events, you can use posthog.unregister, like so:
JavaScript

posthog.unregister('icecream pref'),

This will remove the super property and subsequent events will not include it.

If you are doing this as part of a user logging out you can instead simply posthog.reset() which takes care of clearing all stored Super Properties and more.
Opt out of data capture

You can completely opt-out users from data capture. To do this, there are two options:

    Opt users out by default by setting opt_out_capturing_by_default to true in your PostHog config:

JavaScript

posthog.init('<ph_project_api_key>', {
    opt_out_capturing_by_default: true,
});

    Opt users out on a per-person basis by calling opt_out_capturing():

JavaScript

posthog.opt_out_capturing()

Similarly, you can opt users in:
JavaScript

posthog.opt_in_capturing()

To check if a user is opted out:
JavaScript

posthog.has_opted_out_capturing()

Flush

You can set the number of events in the configuration that should queue before flushing. Setting this to 1 will send events immediately and will use more battery. This is set to 20 by default.

You can also configure the flush interval. By default we flush all events after 30 seconds, no matter how many events have gathered.

You can also manually flush the queue. If a flush is already in progress it returns a promise for the existing flush.
JavaScript

await posthog.flush()

Reset after logout

To reset the user's ID and anonymous ID, call reset. Usually you would do this right after the user logs out.
JavaScript

posthog.reset()

Opt in/out

By default, PostHog has tracking enabled unless it is forcefully disabled by default using the option { defaultOptIn: false }.

You can give your users the option to opt in or out by calling the relevant methods. Once these have been called they are persisted and will be respected until optIn/Out is called again or the reset function is called.

To opt in/out of tracking, use the following calls.
JavaScript

posthog.optedOut // See if a user has opted out
posthog.optIn() // opt in
posthog.optOut() // opt out

If you still wish capture these events but want to create a distinction between users and team in PostHog, you should look into Cohorts.
Feature Flags

PostHog's feature flags enable you to safely deploy and roll back new features as well as target specific users and groups with them.

There are two ways to implement feature flags in React Native:

    Using hooks.
    Loading the flag directly.

Method 1: Using hooks
Example 1: Boolean feature flags
React Native

import { useFeatureFlag } from 'posthog-react-native'

const MyComponent = () => {
    const booleanFlag = useFeatureFlag('key-for-your-boolean-flag')

    if (booleanFlag === undefined) {
        // the response is undefined if the flags are being loaded
        return null
    }

    // Optional use the 'useFeatureFlagWithPayload' hook for fetching the feature flag payload

    return booleanFlag ? <Text>Testing feature 😄</Text> : <Text>Not Testing feature 😢</Text>
}

Example 2: Multivariate feature flags
React Native

import { useFeatureFlag } from 'posthog-react-native'

const MyComponent = () => {
    const multiVariantFeature = useFeatureFlag('key-for-your-multivariate-flag')

    if (multiVariantFeature === undefined) {
        // the response is undefined if the flags are being loaded
        return null
    } else if (multiVariantFeature === 'variant-name') { // replace 'variant-name' with the name of your variant
      // Do something
    }

    // Optional use the 'useFeatureFlagWithPayload' hook for fetching the feature flag payload

    return <div/>
}

Method 2: Loading the flag directly
React Native

// Defaults to undefined if not loaded yet or if there was a problem loading
posthog.isFeatureEnabled('key-for-your-boolean-flag')

// Defaults to undefined if not loaded yet or if there was a problem loading
posthog.getFeatureFlag('key-for-your-boolean-flag')

// Multivariant feature flags are returned as a string
posthog.getFeatureFlag('key-for-your-multivariate-flag')

// Optional fetch the payload returns 'JsonType' or undefined if not loaded yet or if there was a problem loading
posthog.getFeatureFlagPayload('key-for-your-multivariate-flag')

Reloading flags

PostHog loads feature flags when instantiated and refreshes whenever methods are called that affect the flag.

If want to manually trigger a refresh, you can call reloadFeatureFlagsAsync():
React Native

posthog.reloadFeatureFlagsAsync().then((refreshedFlags) => console.log(refreshedFlags))

Or when you want to trigger the reload, but don't care about the result:
React Native

posthog.reloadFeatureFlags()

Request timeout

You can configure the featureFlagsRequestTimeoutMs parameter when initializing your PostHog client to set a flag request timeout. This helps prevent your code from being blocked in the case when PostHog's servers are too slow to respond. By default, this is set at 10 seconds.
React Native

export const posthog = new PostHog('<ph_project_api_key>', {
  // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'  
  host: 'https://us.i.posthog.com',
  featureFlagsRequestTimeoutMs: 10000 // Time in milliseconds. Default is 10000 (10 seconds).
})

Error handling

When using the PostHog SDK, it's important to handle potential errors that may occur during feature flag operations. Here's an example of how to wrap PostHog SDK methods in an error handler:
React Native

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

Overriding server properties

Sometimes, you might want to evaluate feature flags using properties that haven't been ingested yet, or were set incorrectly earlier. You can do so by setting properties the flag depends on with these calls:
React Native

posthog.setPersonPropertiesForFlags({'property1': 'value', property2: 'value2'})

Note that these are set for the entire session. Successive calls are additive: all properties you set are combined together and sent for flag evaluation.

Whenever you set these properties, we also trigger a reload of feature flags to ensure we have the latest values. You can disable this by passing in the optional parameter for reloading:
React Native

posthog.setPersonPropertiesForFlags({'property1': 'value', property2: 'value2'}, false)

At any point, you can reset these properties by calling resetPersonPropertiesForFlags:
React Native

posthog.resetPersonPropertiesForFlags()

The same holds for group properties:
React Native

// set properties for a group
posthog.setGroupPropertiesForFlags({'company': {'property1': 'value', property2: 'value2'}})

// reset properties for all groups:
posthog.resetGroupPropertiesForFlags()

    Note: You don't need to add the group names here, since these properties are automatically attached to the current group (set via posthog.group()). When you change the group, these properties are reset.

Automatic overrides

Whenever you call posthog.identify with person properties, we automatically add these properties to flag evaluation calls to help determine the correct flag values. The same is true for when you call posthog.group().

Default overridden properties

By default, we always override some properties based on the user IP address.

The list of properties that this overrides:

    $geoip_city_name
    $geoip_country_name
    $geoip_country_code
    $geoip_continent_name
    $geoip_continent_code
    $geoip_postal_code
    $geoip_time_zone

This enables any geolocation-based flags to work without manually setting these properties.
Bootstrapping Flags

Since there is a delay between initializing PostHog and fetching feature flags, feature flags are not always available immediately. This makes them unusable if you want to do something like redirecting a user to a different page based on a feature flag.

To have your feature flags available immediately, you can initialize PostHog with precomputed values until it has had a chance to fetch them. This is called bootstrapping. After the SDK fetches feature flags from PostHog, it will use those flag values instead of bootstrapped ones.

For details on how to implement bootstrapping, see our bootstrapping guide.
Experiments (A/B tests)

Since experiments use feature flags, the code for running an experiment is very similar to the feature flags code:
React Native

// With the useFeatureFlag hook
import { useFeatureFlag } from 'posthog-react-native'

const MyComponent = () => {
    const variant = useFeatureFlag('experiment-feature-flag-key')

    if (variant === undefined) {
        // the response is undefined if the flags are being loaded
        return null
    }

    if (variant == 'variant-name') {
        // do something
    }
}

It's also possible to run experiments without using feature flags.
Group analytics

Group analytics allows you to associate the events for that person's session with a group (e.g. teams, organizations, etc.). Read the Group Analytics guide for more information.

    Note: This is a paid feature and is not available on the open-source or free cloud plan. Learn more here.

    Associate the events for this session with a group

JavaScript

posthog.group('company', 'company_id_in_your_db')

posthog.capture('upgraded_plan') // this event is associated with company ID `company_id_in_your_db`

    Associate the events for this session with a group AND update the properties of that group

JavaScript

posthog.group('company', 'company_id_in_your_db', {
    name: 'Awesome Inc.',
    employees: 11,
})

The name is a special property which is used in the PostHog UI for the name of the group. If you don't specify a name property, the group ID will be used instead.
Session replay

To set up session replay in your project, all you need to do is install the React Native SDK and the Session replay plugin, enable "Record user sessions" in your project settings and enable the enableSessionReplay option.
Surveys

Surveys launched with popover presentation are automatically shown to users matching the display conditions you set up.
Disabling for local development

You may want to disable PostHog when working locally or in a test environment. You can do this by setting the disable option to true when initializing PostHog. Helpfully this allows you to continue using usePostHog and safely calling it without anything actually happening.
React Native

// App.(js|ts)
import { usePostHog, PostHogProvider } from 'posthog-react-native'
...

export function MyApp() {
    return (
        <PostHogProvider apiKey="<ph_project_api_key>" options={{
            // Disable PostHog in development (or whatever other logic you choose)
            disabled: __DEV__,
        }}>
            <MyComponent />
        </PostHogProvider>
    )
}

const MyComponent = () => {
    const posthog = usePostHog()

    useEffect(() => {
        // Safe to call even when disabled!
        posthog.capture("mycomponent_loaded", { foo: "bar" })
    }, [])
}

Upgrading from V1 or V2 to V3

V1 of this library utilised the underlying posthog-ios and posthog-android SDKs to do most of the work. Since the new version is written entirely in JS, using only Expo supported libraries, there are some changes to the way PostHog is configured as well as actually calling PostHog.

For iOS, the new React Native SDK will attempt to migrate the previously persisted data (such as distinctId and anonymousId) which should result in no unexpected changes to tracked data.

For Android, it is unfortunately not possible for persisted Android data to be loaded which means stored information such as the randomly generated anonymousId or the distinctId set by posthog.identify will not be present. For identified users, the simple workaround is to ensure that identify is called at least once when the app loads. For anonymous users there is unfortunately no straightforward workaround they will show up as new anonymous users in PostHog.

Events such as Application Installed and Application Updated that require previously persisted data were unable to be migrated, the side effect being that you may see much higher numbers for Application Installed events. This is due to the fact that there is no native way of detecting a real "install" and as such, we store a marker the first time the SDK loads and treat that as an install.
JSX

// DEPRECATED V1 Setup

import PostHog from 'posthog-react-native'

await PostHog.setup('<ph_project_api_key>', {
    // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'
    host: 'https://us.i.posthog.com',
    captureApplicationLifecycleEvents: false, // Replaced by 'PostHogProvider'
    captureDeepLinks: false, // No longer supported
    recordScreenViews: false, // Replaced by 'PostHogProvider' supporting @react-navigation/native
    flushInterval: 30, // Stays the same
    flushAt: 20, // Stays the same
    android: {...}, // No longer needed
    iOS: {...}, // No longer needed
})

PostHog.capture("foo")


// V2 Setup difference
import PostHog from 'posthog-react-native'

const posthog = await Posthog.initAsync('<ph_project_api_key>', {
    // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'
    host: 'https://us.i.posthog.com', 
    // Add any other options here.
})

// Use created instance rather than the PostHog class
posthog.capture("foo")

// V3 Setup difference
import PostHog from 'posthog-react-native'

const posthog = new PostHog('<ph_project_api_key>', {
    // usually 'https://us.i.posthog.com' or 'https://eu.i.posthog.com'
    host: 'https://us.i.posthog.com',
    // Add any other options here.
})

// Use created instance rather than the PostHog class
posthog.capture("foo")

Questions? Ask Max AI.

It's easier than reading through 635 docs articles.
Community questions

Aditya
15 days ago
When I integrating postHog I get this error "Error: Couldn't find a navigation object. Is your component inside NavigationContainer?"

<PostHogProvider apiKey="phc_B05SlqcoiyjDzxtorx5JvuUexpawrdBSPnRYFUBGQr3" options={{ // host: "https://app.posthog.com", // captureApplicationLifecycleEvents: true, }} >
Aditya
15 days ago
When I integrating postHog I get this error "Error: Couldn't find a navigation object. Is your component inside NavigationContainer?"

<PostHogProvider apiKey="phc_B05SlqcoiyjDzxtorx5JvuUexpawrdBSPnRYFUBGQr3" options={{ // host: "https://app.posthog.com", // captureApplicationLifecycleEvents: true, }} > why
Andrei
3 months ago
Using PostHogProvider with React Navigation Static API

Hi,

We've recently upgraded our app to latest RN version and started using React Navigation Static API, which does not have a NavigationProvider to wrap the PostHogProvider. This breaks our functionality to autocapture events.

Is there a way to have the autocapture start in this case without manually tracking all the events? Thank you .

Manoel
(he/him)
3 months ago

Hello,

I see, I'm not a react-navigation expert, but I wonder if there's anything on this page you can do, like a mix of static and dynamic to allow wrapping the navigation with the provider? It's hard to figure out if there's a way around it without access to your codebase.

Please read it up and let us know. Otherwise, I will set up an empty sample using the static API and see if I can figure it out.

Thanks.

Best, Manoel
Rav
5 months ago
identified_only person profiles

Is there an equivalent configuration for RN that ensures person profiles are only created for identified users? This looks possible on web, ios and android but I can't see how to do it in RN :(

I'm collecting events from both web and RN, profiles are only created on web when a user is identified because person_profiles: "identified_only" is set when initialising the SDK, however on RN, profiles are always created even for anon users.

Many thanks in advance 🙏🏽

Ben
5 months ago

Follow along here to see when this is done! https://github.com/PostHog/posthog/issues/26634
Mike
3 months ago

Was this completed? I can't tell from the github and I still can't find this in the docs
Clark
5 months ago
React Native (Expo) on Web?

Does posthog-react-native work on the web version of a cross-platform Expo app? i.e. we shouldn't need to separately install Javascript Web (posthog-js)?

Manoel
(he/him)
5 months ago

Hello, yes, it works, but not all features are available for the Web target using the RN SDK eg Session replay, Web analytics, and Surveys, so if you just need feature flags, and/or prod analytics, that will be enough.
Abdelwahab
8 months ago
Difference between With the PosthogProvider and without the PosthogProvider method

Could i know what is the difference between the two ways of registering the SDKs? are they the same or one is preferred over the other?

    wrapping the whole app in PosthogProvider
    or initialize the SDK in another class file and use the instance in multiple classes?

Following is the way I use the SDK as it's the same facade I use for multiple analytics tool,

class PostHog {
  register(authenticationData: authenticationArgs) {
    if (!this.instance) {
      this.instance = new PostHog3rdParty(POSTHOG_API_KEY, {
        host: POSTHOG_HOST,
      });
      console.log('======= New POSTHOG INSTANCE =======', this.instance);
    }
    const userId = authenticationData?.id?.toString();
    if (userId) {
      console.log('======= IDENTIFY =======', userId);
      this.instance.identify(userId, {
        email: authenticationData?.email,
        name: authenticationData?.name,
        phone: authenticationData?.cellPhone,
        language: authenticationData?.language,
      });
    }
  }

  log(eventArgs: LogParams) {
    this.instance.capture(eventArgs?.name, eventArgs?.args);
  }
}

and calling just register at app open, so would that give the same functionality as using provider?

Manoel
(he/him)
6 months ago

Hello,

For using the autocapture feature, you need to use the Provider, which should have been explained here.

Best, Manoel
Niels
9 months ago
Crash Dump

Hey, is it possible to see crash logs?

Manoel
(he/him)
9 months ago

Hello,

Not yet, we're currently working on error monitoring for the Web, but no plans for React Native yet.

You could subscribe to this issue though, you can probably adapt the Sentry integration and make it work on React Native as well
Jesse
a year ago
Is routeToParams working?

I'm only getting console.log on routeToName. Not routeToParams. If a user views a product screen how would I know which product? The params are not visible in the dashboard screen view event.

Manoel
(he/him)
10 months ago

Hi, autocapture is only available when using the provider.

You can implement your auto capture logic and capture events manually.
Aleko
a year ago
Average Time on Screen

Hello, how can I calculate average time on screen?

Manoel
(he/him)
6 months ago

Hello,

The Mobile dashboard should have an insight into session average time already.

Best, Manoel
Maksim
a year ago
Posthog Always splits user in two separate users

Hi,

I have the problem that Posthog always splits one user in two users. It does not matter, whether these are anonymous users or identified users.

On the screenshot you can see several recent examples. In all these 3 cases the last event of the anonymous user has exactly the same timestamp as the first event of the identified user (but the same happens also when user does not identify himself). This way I lose the Application Installed event and some user properties, which I assign when user opens the app for the first time, like Ad Campaign.

I have a feeling, that there is some bug with catching Sentry exceptions. The first event of the second part of the user is almost always a Sentry exception.

Screenshot 2024-03-19 131741.png
Maksim
Authora year ago

Screenshot Concerning Sentry exceptionsScreenshot 2024-03-25 102536.png
Manoel
(he/him)
6 months ago

Hello Maksim,

What is this Sentry exception about? The RN SDK does not capture any Sentry exception automatically.

Can you share more details?

Thanks.

Best, Manoel
Maksim
a year ago
App/Play store testers break analytics

Hi,

We have this problem, since we are just starting and don't have many users. When the app is submitted to App/Play stores it gets automatically tested by multiple bots. And they distort the statistics.

Do you have an experience, how to define, whether the user is a test bot, or that the app is being tested at the moment?

BEst regards, Maksim

David
a year agoSolution

I think the filtering approach might be a best guess attempt. The nature of the app store review experiences is that they are intentionally opaque so it is not easy to discern an app store tester from a real user. Perhaps event properties like device_* could also be useful. If testers tend to use emulators that could be a good thing to filter out.

For the logged in users, I would take the opposite approach. I would set the email you provide the stores for testing as a member of your "internal users" group.

If you want to create a support ticket within PostHog and share some example events we can dig in a little deeper as to what might be a good signal
Maksim
a year ago
I do not see Application Installed and Application Updated events

Are they available for React Native?

Manoel
(he/him)
a year agoSolution

yes, its duplicated, if you are using initReactNativeNavigation or captureLifecycleEvents, or captureLifecycleEvents this will be duplicated since they are different integrations and maybe you would use one but not the other. You can disable captureLifecycleEvents for now.
John
a year ago
Offline usage

For React Native, while the app is being used but the device is offline (airplane mode). Is data collected and bundled to be sent over once an internet connection has resumed? If not, is that a possible feature or way to opt in to such a behavior?

Manoel
(he/him)
a year ago

Hi John, the short answer is not yet, see the issue.

Caching the queue in the device is storage is already implemented, but to be fully functional, we need to address an important issue described in the ticket above, stay tuned.

Best, Manoel.
Måns
2 years ago
Using posthog in e.g. a redux-thunk function

How would you recommend us make it possible to use the posthog client outside of a function component, e.g. in a thunk function? We can't use the usePosthog hook there, because hooks can only be used in function components.

I assume that we would follow the "Without the PosthogProvider" documentation for this, and define the posthog client at the top level of the app, and pass it down to the PostHogProvider, like so:

// src/utils/posthog.ts
import PostHog from 'posthog-react-native'

let posthog: PostHog | undefined = undefined

export const posthogAsync: Promise<PostHog> = PostHog.initAsync('<ph_project_api_key>', {
  // PostHog API host (https://app.posthog.com by default)
  host: 'https://app.posthog.com'
})

posthogAsync.then(client => {
  posthog = client
})


// src/App.tsx
import { posthogAsync } from './utils/posthog'


<PostHogProvider client={posthogAsync}>{/* Our app code */}</PostHogProvider> 

// src/store/actions/myActions.ts
import { posthogAsync } from '../../utils/posthog'

export function fetchTodoById(todoId) {
  return async function fetchTodoByIdThunk(dispatch, getState) {
    const response = await client.get(`/fakeApi/todo/${todoId}`)
    await posthogAsync.capture('foo')
    dispatch(todosLoaded(response.todos))
  }```

Does this sound correct?

Ben
2 years agoSolution

That's it - exactly as described 👍
