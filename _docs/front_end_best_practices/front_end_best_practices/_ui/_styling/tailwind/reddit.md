https://www.reddit.com/r/tailwindcss/comments/1evdkx8/best_practice_using_tailwind/

Skip to main content
Best practice using tailwind : r/tailwindcss

Create
Create post
Open inbox
Go to tailwindcss
r/tailwindcss
•
9 mo. ago
katana*-*
Best practice using tailwind

Hi everyone,

I’m working on a web front-end project using Tailwind CSS, and I have a lot of buttons and colors that will be used extensively across the project. I want to define these as variables to maintain consistency and ease of updates.

What’s the best practice for defining and managing these design tokens (like colors, spacing, etc.) in Tailwind CSS? Should I use the tailwind.config.js file, or is there a better approach? Any tips or examples would be greatly appreciated!

Thanks in advance!
u/AteraRMM avatar AteraRMM
•
Promoted
See why more IT pros are moving to Atera—the all-in-one, AI-powered IT management platform built for pros. Start your free 30-day trial now!
Sign Up
atera.com
Thumbnail image: See why more IT pros are moving to Atera—the all-in-one, AI-powered IT management platform built for pros. Start your free 30-day trial now!
Sort by:
Raziel_LOK
•
9mo ago

I usually do it with custom properties. But putting it in config also works. But custom props will be way more flexible approach. So my suggestion is that use both, and in your config point to the custom prop.

This is really useful in projects that imports tokens from other teams. Since the tokens come as some parseble format and the config is nodejs, you can import and parse it on one step to the config, not only it will give autocomplete but makes it basically automatic.
u/AmuliteTV avatar
AmuliteTV
•
9mo ago

Can you explain more or point me in the right direction to research more on this? Would defining the class in the config but be the same as custom props? Thanks.
Raziel_LOK
•
9mo ago

Raziel_LOK
•
8mo ago

as promised:

if you for example have a config like this:

    /** @type {import('tailwindcss').Config} */

    // var tokens = require('./tokens');
    //this can be a file or a 3rdparty module like above
    //token files usually follow this convention but you can even parse it however you want, I had parsed other stylesheets with an ast before.
    var tokens = {
      colors: {
        $type: 'color',
        my_custom_prop: {
          $value: 'var(--color, cyan)',
        },
        my_cp_value: {
          $value: '--color: '
        }
        my_black: {
          $value: '#000000',
        },
        my_white: {
          $value: '#000000',
        },
        my_orange: {
          '100': {
            $value: '#fffaf0',
          },
          '200': {
            $value: '#feebc8',
          },
          '300': {
            $value: '#fbd38d',
          },
          '400': {
            $value: '#f6ad55',
          },
          '500': {
            $value: '#ed8936',
          },
          '600': {
            $value: '#dd6b20',
          },
          '700': {
            $value: '#c05621',
          },
          '800': {
            $value: '#9c4221',
          },
          '900': {
            $value: '#7b341e',
          },
        },
      },
    };


    function isObject(obj) {
      return obj === Object(obj);
    }

    //do not use this, it is just to ilustrate how to extract the tokens.
    tokensToTwConfig = (acc, [k, v]) => {
      if ('$value' in v) {
        return { ...acc, [`${k}`]: v['$value'] };
      } else if (isObject(v)) {
        return {
          ...acc,
          [`${k}`]: Object.entries(v).slice(1).reduce(tokensToTwConfig, {}),
        };
      } else {
        return { ...acc, [`${k}`]: v };
      }
    };

    module.exports = {
      content: ['./src/**/*.{html,js}'],
      theme: {
        extend: {
          colors: Object.entries(tokens.colors)
            .slice(1)
            .reduce(tokensToTwConfig, {}),
        },
      },
      plugins: [],
    };

now you can go to your files and if you have the extension you will be able to see it like below:
https://imgur.com/enkxu2a

The default values for you custom props can be set in the :root directly from css, or you can just leave it with the fallback from tailwind. you can even pull it from the theme if you want.
Customizing Colors - Tailwind CSS
u/amine23 avatar
amine23
•
9mo ago

This should help https://www.youtube.com/watch?v=cZc4Jn5nK3k
katana*-*
•
9mo ago

i used to have a component library like bootstrap or shadcn-ui but in this project i don't want to use any library
andercode
•
9mo ago

https://tailwindcss.com/docs/reusing-styles#extracting-classes-with-apply
andercode
•
9mo ago

Just define your css and use the `@apply` syntax

https://tailwindcss.com/docs/reusing-styles#extracting-classes-with-apply
Brilla-Bose
•
9mo ago

nope @apply was a mistake. and adam promised he'll remove it in future versions of tailwind
ppalisade
•
9mo ago

Is there a different way to extract classes then? If we should not use apply?
lordlors
•
8mo ago

I’ve read tailwind.config.js is also not gonna be important in v4 anymore so how are we going to make custom classes with a combination of tailwind classes? Just go back to writing standard css by reverting each tailwind class to raw css? Because now it’s either use @apply in css or write it on config.js which is a pain.
Top 4%
Rank by size
Created Nov 2, 2017
Public
Moderators
Message Mods

u/rap2h
u/AutoModerator avatar u/AutoModerator

    u/LeoPantero

View all moderators
Reddit Rules Privacy Policy User Agreement Reddit, Inc. © 2025. All rights reserved.

    
