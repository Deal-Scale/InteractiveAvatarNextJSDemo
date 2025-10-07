Colors

How to use daisyUI colors?
Introduction
daisyUI is fully themeable and colorable, So instead of using constant color utility classes like:

    bg-green-500
    bg-orange-600
    bg-blue-700
    etc.

It's suggested to use semantic color utility classes like:

    bg-primary
    bg-secondary
    bg-accent
    etc.

Each color name contains CSS variables and each daisyUI theme applies color values to the utility classes when it is applied.
Benefits
Semantic color names make more sense because when we design interfaces, we don't just use any random color. We define a specific color palette with names like primary, secondary, etc. and we only use those specific colors in our interfaces. Also, using semantic color names makes theming easier. You wouldn't have to define dark-mode colors for every single element and you wouldn't be limited to only light/dark themes. you can have multiple themes available and each theme is just a few lines of CSS variables.

Example of theming a div with hardcoded color values

Using hardcoded color names
This is a hardcoded dark text on a light background, it needs double the amount of class names to support dark mode.

<div class="bg-zinc-100">
  <div class="bg-zinc-50 border-zinc-200 text-zinc-800">
    This is a hardcoded dark text on a light background,
    it needs double the amount of class names to support dark mode.
  </div>
</div>

    🪦 Fixed color names, hardcoded based on the value
    🚫 No automatic dark mode
    😵‍💫 You have to add dark-mode colors for every element
    💸 high maintenance cost
    🐢 slow development
    😩 hard to change a theme
    ⛓️‍💥 high chance of inconsistency
    😰 You are limited to 2 themes only: light and dark

Using semantic color names
This is dark text on a light background, which switches to light text on a dark background in dark mode.

<div class="bg-base-200">
  <div class="bg-base-100 border-base-300 text-base-content">
    This is dark text on a light background,
    which switches to light text on a dark background in dark mode.
  </div>
</div>

    🎯 Semantic names, based on the purpose of the color
    ✨ Automatic dark mode
    🌓 No need to add any dark-mode class names
    🤑 Zero maintenance cost to add a theme
    🚀 Fast development
    ⚡️ Easy to change themes
    📘 All colors are consistent based on the design system
    ♾️ Unlimited themes, easy to switch

List of all daisyUI color names
You can use these color names in your theme or in utility classes.
	Color name	CSS variable	Where to use
	primary	--color-primary	Primary brand color, The main color of your brand
	primary-content	--color-primary-content	Foreground content color to use onprimarycolor

	secondary	--color-secondary	Secondary brand color, The optional, secondary color of your brand
	secondary-content	--color-secondary-content	Foreground content color to use onsecondarycolor

	accent	--color-accent	Accent brand color, The optional, accent color of your brand
	accent-content	--color-accent-content	Foreground content color to use onaccentcolor

	neutral	--color-neutral	Neutral dark color, For not-saturated parts of UI
	neutral-content	--color-neutral-content	Foreground content color to use on neutral color

	base-100	--color-base-100	Base surface color of page, used for blank backgrounds
	base-200	--color-base-200	Base color, darker shade, to create elevations
	base-300	--color-base-300	Base color, even more darker shade, to create elevations
	base-content	--color-base-content	Foreground content color to use onbasecolor

	info	--color-info	Info color, For informative/helpful messages
	info-content	--color-info-content	Foreground content color to use oninfocolor
	success	--color-success	Success color, For success/safe messages
	success-content	--color-success-content	Foreground content color to use onsuccesscolor
	warning	--color-warning	Warning color, For warning/caution messages
	warning-content	--color-warning-content	Foreground content color to use onwarningcolor
	error	--color-error	Error color, For error/danger/destructive messages
	error-content	--color-error-content	Foreground content color to use onerrorcolor
How to use
Some daisyUI components come with modifier class names and that modifier class name will apply a color. For example:

<button class="btn btn-primary">Button</button>

Or:

<input type="checkbox" class="checkbox checkbox-secondary" />

These components automatically set the correct background color, text color, border color, etc as needed so you don't need to set those colors manually. For examplebtn-primarysetsprimarycolor for background and border, and setsprimary-contentcolor for the text automatically as default. You can customize them using utility classes if you want to change the color.
You can also use color names in utility classes just like Tailwind's original color names. These are utility classes that can be used with a color name:
CSS Class	
bg-{COLOR_NAME}	Also available on CDN/colors/properties.css
text-{COLOR_NAME}	Also available on CDN/colors/properties.css
border-{COLOR_NAME}	Also available on CDN/colors/properties.css
from-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
via-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
to-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
ring-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
fill-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
stroke-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
shadow-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
outline-{COLOR_NAME}	Also available on CDN/colors/properties-extended.css
divide-{COLOR_NAME}	
accent-{COLOR_NAME}	
caret-{COLOR_NAME}	
decoration-{COLOR_NAME}	
placeholder-{COLOR_NAME}	
ring-offset-{COLOR_NAME}	

So you can usebg-primary,border-secondary, etc. Read more aboutdaisyUI color utility classes.
Color opacity and muted colors

base-contentis the text color of the page by default. It's a dark color on light themes and it's a light color on dark themes.
nord theme
text-base-content
dracula theme
text-base-content

Sometimes we need a muted text. something with less contrast. The best way to do this is using Tailwind CSS color opacity modifier by adding a/50(or any other value) to the end of color name. Liketext-base-content/50
nord theme
text-base-content
text-base-content/70
text-base-content/50
text-base-content/30
dracula theme
text-base-content
text-base-content/70
text-base-content/50
text-base-content/30

The advantage of using opacity is that it gives a constant result on all themes, for all colors.
You can use it with any opacity value, you can use it for any color. For example primary-content:
nord theme
text-primary-content
text-primary-content/50
dracula theme
text-primary-content
text-primary-content/50
