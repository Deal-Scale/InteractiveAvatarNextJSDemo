Add component classes to your HTML

How to use daisyUI classes to style your page?
Once you installed daisyUI, you can use component classes like btn, card, etc.

So instead of making a button using only utility classes

<button
  class="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">
  Button
</button>

You can just use a component class like this

<button class="btn">Button</button>

Then you can modify the component with daisyUI additional utility classes

<button class="btn btn-primary">Button</button>

Or you can modify the component with Tailwind CSS utility classes

<button class="btn w-64 rounded-full">Button</button>

