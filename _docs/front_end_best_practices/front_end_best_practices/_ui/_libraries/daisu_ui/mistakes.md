The most common mistake when using Tailwind CSS (and how to fix it)

While working on daisyUI, I see a lot of people making this mistake when using Tailwind CSS.

As a maintainer of daisyUI, I help people on GitHub issues and GitHub discussions every day. I see a lot of people making this mistake when using Tailwind CSS. It's so simple to avoid but I find it so common among developers.
The mistake

Here's how we simply use Tailwind CSS class names in HTML:

<div class="bg-red-500"></div>
<div class="bg-green-500"></div>
<div class="bg-blue-500"></div>

However it would be cool if we do some totally necessary engineering and make it more dynamic. So we do something like this:

<div class="bg-{{ color }}-500"></div>

You might even want to do the same thing with daisyUI class names:

<div class="btn btn-{{ type }}"></div>
instead of
<div class="btn-primary"></div>

It's cool, right? It even works in dev environment.

Everything is fine... 😠 until we build our app for production and you realize the color is not working anymore
Why it doesn't work?

Tailwind CSS scans your HTML files and looks for class names. Then it generates a CSS file based on the class names it finds. It's that simple. Because the stringbg-red-500does not exist inbg-{{ color }}-500, it simply won't generate the CSS for it.

Read more aboutusing dynamic class names with Tailwind CSS.
But it was working in dev environment!

Yes, it was working because you probably first hadbg-red-500in your file, you saved the file and.bg-red-500class name got added to your CSS. Then you changed it tobg-{{ color }}-500and saved the file again.bg-red-500is not in your HTML anymore, but it's still in your CSS file. So it works in dev environment, but not in production.
But some class names work and some don't!

Probably because you used those class names the correct way (as a string likebg-red-500) in another file.
Solutions

How to fix it?

Simplydo notuse dynamic class names likebg-{{ color }}-500. Make sure the whole class name as a string exists in your file.

let color = 'bg-red-500'
<div class="{{ color }}"></div>

If you really have to do that, You have 3 ways:
Solution 1: Add the class names somewhere in the file

Map the required class names somewhere in your file. It can be an object, a comment or anything.
Solution 2: A safelist file

List all the required class names in a safelist file and add it to yourtailwind.config.jsfile ascontent

module.exports = {
  content: ["./path/safelist.txt"],
  // ...
}

./path/safelist.txtfile can be simply like this:

bg-red-500
bg-green-500
bg-blue-500

Solution 3: Safelist config

Safelist all the required class names in yourtailwind.config.jsfile.

module.exports = {
  content: ["./pages/**/*.{html,js}", "./components/**/*.{html,js}"],
  // ...
  safelist: ["bg-red-500", "bg-green-500", "bg-blue-500"],
  // ...
}

You can also use regex patterns in safelist:

module.exports = {
  content: ["./pages/**/*.{html,js}", "./components/**/*.{html,js}"],
  // ...
  safelist: [
    "bg-teal-700",
    {
      pattern: /bg-(red|green|blue)-(400|500|600)/,
    },
  ],
  // ...
}

Read more aboutTailwind CSS safelist.