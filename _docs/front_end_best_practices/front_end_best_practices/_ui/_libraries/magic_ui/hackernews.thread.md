	230 points by achristmascarl 11 months ago | hide | past | favorite | 92 comments


	
	
abeppu 11 months ago | unvote | next [–]

Setting aside the slowness, tho I am not a designer, these all strike me as just visual noise. I think animated borders, animated shiny text, animated meteor backgrounds today are no better than an early 2000s page with animated elements. It doesn't help communicate, it just attracts the eye until one learns to tune it out. And it kinda tells me that we're not really learning to build better stuff over the decades.

What is the difference between the animated Border Beam in this library and the animated hr in the vintage example of an archived geocities page?

https://magicui.design/docs/components/border-beam

https://blog.geocities.institute/archives/3879

	
	
thomascgalvin 11 months ago | unvote | parent | next [–]

I agree that a lot of these components are more distracting than useful. I do like the animated border around buttons, though; that would be very useful to draw the eye towards the "default" option on a page, as long as it was the only one.

	
	
cchance 11 months ago | root | parent | next [–]

This is the thing many of these shouldn't be used just willy nilly, things like the chaser around the border of a container, is awesome as a notification of a change for instance, or the button effect same thing, i'd hate a site that used these nonstop running, but something thats triggered by an event happening is much nicer.

That said, WTF is with all these "libraries" thats basically just collections of shit from codepen stacked in 1 place that they thought was cool, shit most of these don't even have cohesion from one to the other really besides... "cool motion"

	
	
dvaun 11 months ago | parent | prev | next [–]

If this were splashed across technical docs then I’d agree. That said, we’re not the target audience for this aesthetic.

	
	
rmdashrfv 11 months ago | prev | next [–]

I very much dislike the tweet that OP uses on the Magic UI site that's directed at Linear:

"Companies spend $30,000 and several weeks to get designs like this"

Yes. Because being a first or early mover is expensive. You commoditizing their style after they've put in all the brain work to create or build it isn't the same thing.

Also, isn't the point of design engineering to be capable of coming up with relatively original and innovative UI?

	
	
verse 11 months ago | parent | next [–]

> isn't the point of design engineering to be capable of coming up with relatively original and innovative UI?

that's definitely why I got into it years ago, but it seems like it has lost it's meaning and been simplified into "engineer that likes design" or "engineer that wants to be good at design"

	
	
rmdashrfv 11 months ago | root | parent | next [–]

It definitely is sad to see people not want to deviate even a little bit. I've seen at least 3 instances on Twitter where someone launched a product and they had the same landing page as another popular app even where certain components don't make sense.

A classic example is the rotating globe that you can click and drag. That was usually meant for showing sales happening across the world, but now people are just throwing it in a card with the header: "Innovative new features".

Like there's just no thought put into anything and what bothers me is how popular low-effort is becoming in tech. Startling.

	
	
101008 11 months ago | parent | prev | next [–]

Wow, honestly, I never visited Linear landing but after doing so I see how they copied a lot of ideas / components from them.

	
	
swyx 11 months ago | root | parent | next [–]

https://www.linears.art/

	
	
drbig 11 months ago | prev | next [–]

I wish that were this MUI: http://www.sasg.com/mui/

Oh, the nostalgia: http://www.sasg.com/mui/preview.gif

	
	
Alifatisk 11 months ago | parent | next [–]

I almost forgot how it feels like when a website loads instantly

	
	
blooalien 11 months ago | parent | prev | next [–]

"Oh, the nostalgia" indeed! One of the best things I ever installed on my Commodore Amiga.

	
	
blurb4969 11 months ago | parent | prev | next [–]

THIS is beauty.

	
	
keithnz 11 months ago | prev | next [–]

this feels more like something for NON design engineers, ie, highly opinionated cosmetics and animations that you can just drop in. It's not a UI library such that you could design UIs with, wouldn't fit well if you have your own design systems, you actually need a UI library that this would then layer over the top of... but the perf impacts of this makes it feel more "gimmick" than a good tool for someones design toolbelt.

	
	
troupo 11 months ago | prev | next [–]

How is this a "library for design engineers"? It's a collection of one-of Dribbble designs. Bento Grid? Tweet Card? Animated Backgrounds? These are showcases/cookbook/examples, not a library for design.

	
	
nprateem 11 months ago | prev | next [–]

Under construction page template doesn't have an animated gif of a workman digging a hole. No flashing lights either. Hard pass.

	
	
hasanas 11 months ago | prev | next [–]

Extremely slow and sluggish. Ironic to have UI library's website not entice you with itself...

	
	
whstl 11 months ago | parent | next [–]

It is even more ironic than that, this library is seems to be a framework for building websites that showcase other UI libraries.

Due to how slow it is, it feels more like an attempt at sabotage.

	
	
salmonfamine 11 months ago | prev | next [–]

It's okay to just say, "designer."

	
	
yu3zhou4 11 months ago | prev | next [–]

Looks great. The website is sluggish on Firefox tho

	
	
noname120 11 months ago | parent | next [–]

Sluggish and laggy on Chrome here as well: macOS Sonoma 14.5, Apple M2 Max, 32 GB of RAM.

	
	
jerriep 11 months ago | parent | prev | next [–]

Yeah, I found it unusable on Firefox. It would not respond to clicks on any of the links in the sidebar navigation. Works without an issue on Chrome

	
	
darepublic 11 months ago | prev | next [–]

Good idea. Laggy on my android Firefox browser tho

	
	
detritus 11 months ago | parent | next [–]

It's slow as shit on Firefox on PC here. Not a good sign... .

	
	
toddmoy 11 months ago | prev | next [–]

Interesting how the Border Beam component uses the exact same inbox example as ShadCN/ui.

- https://magicui.design/docs/components/border-beam - https://ui.shadcn.com/

	
	
datavirtue 11 months ago | prev | next [–]

Literally crashed the DDG browser on my phone. Never seen anything like it.

	
	
SebastianKra 11 months ago | prev | next [–]

These look very specific.

I'd be interested in an analysis of common patterns in marketing pages. We have a pretty good standardized set of components for productive interfaces (buttons, fields, tabs etc.)

But looking at this makes me wonder if there really is a common set of abstractions for marketing pages beyond just throwing out 200 templates and calling them blocks.

	
	
habosa 11 months ago | prev | next [–]

Some of these are very nice and not simple for most people to implement (animated button border, for example). But some others are so trivial I wonder why they bothered. For example Linear Gradient: https://magicui.design/docs/components/linear-gradient

It's just passing JS properties to the `linear-gradient()` css function which is already well documented on MDN. I can't see what value Magic UI is providing there ... https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/li...

	
	
ushakov 11 months ago | prev | next [–]

The reason your website is lagging so much is because of the globe. I have reported this a while ago: https://github.com/shuding/cobe/issues/78

	
	
p_l 11 months ago | parent | next [–]

Looking at performance recording in Chrome, it's not cobe.

Cobe does not seem to trigger huge time spent in Layerizing and Style recalculations, which are the main areas the web page spends time for me.

Curiously it's not as bad on corporate windows laptop that has worse specs, and which was outputting to 30fps-locked display (personal laptop was rendering to 165Hz screen...)

	
	
farzd 11 months ago | prev | next [–]

Love this. I tried my hand at reverse engineering some of these components on linear and similar websites but did not get good results. I love the fact these are configurable and free. Something I definitely would have paid for.

The rise of bento box designs [at least for now] is very visually appealing. Glad to be moving away from illustrations. Some of the designs animated with Rive are mind blowing: https://x.com/alex_barashkov/status/1790748157141213237

	
	
uptown 11 months ago | prev | next [–]

So basically a ShadCN/UI rip-off?

	
	
titipoco 11 months ago | prev | next [–]

Looks sleek, but resource-hungry to the point of absurdity.

	
	
gsanderson 11 months ago | prev | next [–]

Pretty ... but using it my CPU fan sounds like a jet about to take off.

	
	
Alifatisk 11 months ago | prev | next [–]

Love the design, I don’t know if Vercel (Zeit) pioneered this or if they even took inspiration themselves but it’s beautiful and minimal. The rendering has some issues though.

	
	
troupo 11 months ago | parent | next [–]

> it’s beautiful and minimal.

What's minimal about it? Washed out colors, everything white, and grey font do not make something minimal.

Come on, even the too lines in their call out slide in with unnecessary animations. Everything on the page is moving, bouncing, animating. If it's .minimalism, it's Michael Bay of minimalisms

	
	
Alifatisk 11 months ago | root | parent | next [–]

The simple layout with barely anything to look at except black and white text and a couple of figures is what I’ve been calling minimalism? But you’re right, it doesn’t actually qualify for the definition of minimalism, Idk what to call this type of design, but I enjoy these a lot!

	
	
mantesso 11 months ago | prev | next [–]

looks good but made my gpu fans spin

	
	
jzig 11 months ago | prev | next [–]

It saddens me nobody builds similar libraries for Angular.

	
	
turnsout 11 months ago | parent | next [–]

Yeah, for better or worse, the era of framework diversity is over. The industry has almost 100% converged on React.

	
	
LASR 11 months ago | root | parent | next [–]

Agreed. It's just so much easier to hire for React. It has become the lingua franca of client frameworks.

There are still many teams that choose to use something else. But experience in React is most easily transferrable. Even if I had a project in Vue, I would still look for React expertise.

	
	
digging 11 months ago | root | parent | prev | next [–]

That sounds false to me. When was this era and what exactly did it look like? React has been dominant for around a decade, but Angular and Vue still see wide usage and Svelte is somewhat on the rise. (Although retention/interest in Angular has been going down.)[1]

Highly anticipating State of JS 2023 data though...

[1] https://2022.stateofjs.com/en-US/libraries/front-end-framewo...

	
	
turnsout 11 months ago | root | parent | next [–]

I'm judging by what I see teams choosing for new projects—both dev shops and corporate/internal devs. Even 5 years ago they might have debated Vue vs React, but there's not even a discussion anymore.

	
	
digging 11 months ago | root | parent | next [–]

Sure, but how many teams are you observing? My company is split between Vue and React for different projects, and while greenfield new ones are getting React, Vue is not being deprecated here.

	
	
KronisLV 11 months ago | root | parent | next [–]

I'm building the front ends for a few projects in Vue right now, it's quite pleasant!

It's easy to work with, there's nice router and internationalization packages, ready made components with PrimeVue (though PrimeReact and PrimeNG are nice too; as well as other component libraries), PrimeFlex and Pinia for state management is wonderfully simple and scales pretty far. There's devtools for most browsers, the toolchain isn't super complex and while the ecosystem could be bigger, it's not inadequate either.

	
	
turnsout 11 months ago | root | parent | prev | next [–]

Just a few teams per year—extremely anecdotal. But it sounds like your company is in the same boat, with new projects going to React.

	
	
sureIy 11 months ago | parent | prev | next [–]

What’s an angular?

	
	
vaylian 11 months ago | root | parent | next [–]

A JavaScript library

	
	
sureIy 11 months ago | root | parent | next [–]

Never heard of it

	
	
Waterluvian 11 months ago | prev | next [–]

The root breadcrumb isn’t a link which was weird. And trying to browse components brought me to just one. I couldn’t find a list of them easily enough.

	
	
sunshinerag 11 months ago | prev | next [–]

Broken on Safari. https://snipboard.io/wM5smG.jpg

	
	
croes 11 months ago | prev | next [–]

Sorry but to me most of them are useless animations that create distractions from the content.

Like the blink or marquee tag of Internet Explore reloaded.

	
	
flemhans 11 months ago | prev | next [–]

What files are they talking about?

	
	
gregolo 11 months ago | prev | next [–]

Nice, but your site is buggish

	
	
andreygrehov 11 months ago | prev | next [–]

These days, every self-respecting library must provide Figma components.

	
	
colonelspace 11 months ago | parent | next [–]

I'm tending to think that Figma components should not be maintained in a serious way... design artefacts should be ephemeral and I think it's less effort overall if designers reuse or create whatever they need when they need it.

Keeping a huge Figma component library in sync with a component library / design system feels more and more like busy work.

	
	
mikhael28 11 months ago | parent | prev | next [–]

This is a bad generalization - developers should be obligated to provide design artifacts? Then, why can’t I generalize that self respecting designers must provide React code?

	
	
ilrwbwrkhv 11 months ago | prev | next [–]

So so sluggish

	
	
jslaby 11 months ago | prev | next [–]

Another JS UI, yay! How about we get some UI libraries for native built apps?

	
	
lghh 11 months ago | parent | next [–]

Great idea! Do you have any ideas for how you'd like to build it?

	
	
eirikbakke 11 months ago | root | parent | next [–]

FlatLAF is a great one https://www.formdev.com/flatlaf/

	
	
dankobgd 11 months ago | prev | next [–]

horrible

	
	
karpovv-boris 11 months ago | prev | next [–]

lagging af

	
	
pastamania 11 months ago | prev | next [–]

What the fuck did you do to my CPU

	
	
p_l 11 months ago | prev | next [–]

This page is IMPRESSIVELY BAD.

I don't even care what it shows due to just how audibly resource heavy it is while showing pretty much nothing other than some simple copy.

There's no way in hell opening the main page should cause so much load my computer sounds like I just opened Cyberpunk 2077 or Doom Eternal at max details, especially given the amount actually rendered (I just opened the page, didn't even scroll anywhere!).

Looking into Chrome's performance metrics it's as if there's constant, ridiculous re-rendering of everything, with just calculating the layering causing CPU fans to go to 80%.

	
	
djeastm 11 months ago | parent | next [–]

You are not kidding. I can't remember the last time a website has made my scroll stutter so much.

	
	
JackFr 11 months ago | root | parent | next [–]

Trying to type in search box causes screen covering popup with a ton of latency, and typing in that box has crazy bad keyboard lag.

Not a persuasive demo.

	
	
datavirtue 11 months ago | root | parent | prev | next [–]

Memory corrupted my browser. Required me to kill the task.

	
	
itslennysfault 11 months ago | parent | prev | next [–]

I'm assuming this is platform specific. It's totally smooth for me on a M1 MacBook Pro. Thats with a bunch of tabs open while on a zoom call (gotta do something to pass the time during standup). I find it annoying for other reasons, but I'm not seeing any perf issues on the page.

edit... reading through the other comments I see LOTS of people are having this issue. Not sure why I'm the lucky one, but I went back and clicked through all the pages, still no perceivable lag at all.

	
	
jerieljan 11 months ago | root | parent | next [–]

I have an M1 MBP too, and while it appeared stable, I saw the GPU usage skyrocket while that page was running in Chrome, around 75% in Activity Monitor (View -> GPU Processes), and reaching close to 100% in iStat Menus.

	
	
p_l 11 months ago | root | parent | prev | next [–]

It does not lag on my computer, no.

But it's audibly resource hungry, because it puts so much load my computer immediately jumped to high power cooling due to how much load it puts.

So yes, it's smooth, but that's more because I actually can run both the aforementioned titles at max detail at 4k, not because there's something secret breaking the site for some but not all.

	
	
v3ss0n 11 months ago | parent | prev | next [–]

Same here, I can't believe how a UI show case site could be this annoying

	
	
quaintdev 11 months ago | parent | prev | next [–]

"I created animations. I gotta use them somewhere"

	
	
virtualritz 11 months ago | prev | next [–]

This website is unusable on my mobile, a motoG42. Not the fastest phone but everything web I use it on is smooth.

Magic UI.design lags and stutters even when just scrolling up and down.

That tells me everything I need to know.

	
	
kuro_neko 11 months ago | parent | next [–]

The page loaded fully, I waited patiently, but it ran at a very low FPS on my Surface Laptop 5 with an i7 and 16GB RAM.

It's very difficult to navigate.

	
	
knallfrosch 11 months ago | parent | prev | next [–]

My Thinkpad T14s/Firefox combo can't handle it.

	
	
pcdevils 11 months ago | parent | prev | next [–]

Scrolled down on my pixel 3a XL and the webview crashed

	
	
nness 11 months ago | root | parent | next [–]

It's pretty awful on a M1 Pro too, at least until the page has fully loaded. I'm assuming all of the inline styles are forcing a few seconds of re-layouts and that kills the initial performance.

	
	
datavirtue 11 months ago | root | parent | prev | next [–]

Same here. Browser went haywire and was displaying mangled fonts. Had to kill it.

	
	
Elfener 11 months ago | prev | next [–]

Someone took the advice of not trying to hit 100 on all the lighthouse scores too seriously. This page would probably have a score of 0.

	
	
martypitt 11 months ago | parent | next [–]

I was curious, given the feedback on this page, so I ran the lighthouse test:

Performance: 81 / Accesssibility: 93 / Best Practices: 96 / SEO: 100

Performance is on the lower side, but the others are all tracking pretty well!

	
	
pentagrama 11 months ago | prev | next [–]

Wow I always want to analyze the products and highlight the positives that I found, but at least on Firefox mobile this site was unbearable slow to the point that I have to quit. And being a site build with the product it promotes, it speaks volumes, sorry.

	
	
4gotunameagain 11 months ago | prev [–]

So, front end devs are also engineers now ?

Like, my friend who took a 3 month js / react bootcamp and is working as a front end dev for our local pizza place, she's an engineer now ?

Cool.

	
	
art0rz 11 months ago | parent | next [–]

What is the definition of an engineer in your eyes? In some countries there is a legal definition, so developers are not allowed to call themselves engineers unless they have an engineering degree (and not the software kind).

	
	
4gotunameagain 11 months ago | root | parent | next [–]

It is not about my personal definition, there are even laws as you said.

I just find it silly to use a definition that you typically need 4-6 years of maths heavy formal education for front end javascript that you can learn on youtube in a month.

	
	
whstl 11 months ago | root | parent | next [–]

I'm one of those "real engineers" that studied 4-6 years of maths, and this gatekeeping feels very silly to me.

Some frontend developers are doing more actual engineering than I did when I was working as an actual electrical engineer, and I was working on buildings and shit.

Not all frontend devs, though, and certainly not the ones straight out of a bootcamp, but a lot are.

But the people building foundations for others to work on (like the target audience for this library) definitely are doing some sort of engineering.

	
	
Alifatisk 11 months ago | root | parent | prev | next [–]

In some regions, the title engineer is not a protected title, so you could call yourself a css engineer or whatever and it’s perfectly fine.

	
	
onion2k 11 months ago | root | parent | prev | next [–]

there are even laws as you said

Not in my country..

	
	
agos 11 months ago | parent | prev | next [–]

I expect better from the HN than gatekeeping against front end developers

	
	
pavlov 11 months ago | parent | prev [–]

1997 called, they want their prejudice back.

“Web designers are not even programmers”

	
	
4gotunameagain 11 months ago | root | parent [–]

haha. Semantics are important. Words carry meaning, we use them to convey information.

	
	
geraldwhen 11 months ago | root | parent [–]

Anyone can build a bridge much like anyone can make an HTML page render.

Building a half mile suspension bridge supporting millions of cars per day will require a different depth of understanding.