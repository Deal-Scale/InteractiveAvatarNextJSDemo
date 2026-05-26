daisyUI base style

daisyUI adds a few base styles to your page.

These are the tiny base styles that daisyUI adds to your page. These styles are less than a kilobyte in total, so you don't need to worry about the size
Name	Description
properties	For necessary at-rules, like variable type for--radialprogress
rootcolor	For:rootand[data-theme]it sets background-color tobase-100and text color tobase-content
scrollbar	Sets scrollbar-color for:root
rootscrolllock	Sets:roottooverflow: hiddenwhen modal or drawer is open
rootscrollgutter	Adds ascrollbar-gutterto:rootwhen modal or drawer is open, to avoid layout shift
svg	Contains small SVG images for noise filter, chat bubble tail mask, and tooltip tail mask. Can be disabled to use custom images.

If you want to opt out of each part, you can do it by setting theexclude config.
For example, to opt out of the scrollbar-gutter and style, scrollbar-color, you can exclude it like this:

@plugin "daisyui" {
  exclude: rootscrollgutter, rootcolor;
}

Or if you're using CDN, you can disable it from yourcustomized CDN fileif you need to.
Source code

    properties
    rootcolor
    scrollbar
    rootscrolllock
    rootscrollgutter
    svg

