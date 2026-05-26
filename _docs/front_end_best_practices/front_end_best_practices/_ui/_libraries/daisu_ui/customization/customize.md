Customize daisyUI components

How to customize daisyUI?

daisyUI components come with many variants necessary for design systems and you won't usually need to customize anything.

But you can still customize components in many ways.

    Let's say, you want to customize this button:

<button class="btn">Button</button>

    You can use daisyUI utility classes:

<button class="btn btn-primary">One</button>
<button class="btn btn-secondary">Two</button>
<button class="btn btn-accent btn-outline">Three</button>

    You can use Tailwind's utility classes:

<button class="btn rounded-full">One</button>
<button class="btn rounded-none px-16">Two</button>

    You can customize components on your CSS file, using Tailwind's @apply directive:

@utility btn {
  @apply rounded-full;
}