https://docs.spline.design/doc/how-to-optimize-your-scene/doczPMIye7Ko

Skip to main content
Spline Docs

    Docs
    Tutorials ↗
    Open app ↗
    Community ↗

Skip navigation

👉 Getting started
🌳 Basics

What is Spline?

How is Spline different?

Creating your first scene

Understanding Spline's UI

FAQ

Keyboard shortcuts

Play Mode

Community Platform

Download Spline for Desktop

Watch intro tutorials

Pricing

Spline for Enterprise
🗂 Sharing, Collaboration, and Teams

Files View

Teams

File Sharing

Real-time Collaboration in 3D

Comments & Feedback in 3D

Team Libraries
🍭 Designing in 3D

Working with 2D and 3D objects

Extruding 2D objects in 3D

Working with Parametric Objects

Moving the Object Pivot

Boolean Operations

Cloner Motion

Working with Text

Pen Tool

Shape Blend

3D Modeling Tools

3D Sculpting

UI Scenes

Particles

3D Gaussian Splatting

3D Library

Components

Physics

3D Paths

Version History

Multi-Scenes
🌸 Hana - a canvas for interactivity

What is Hana?

Designing in Hana

Interactivity in Hana

Effects in Hana

Exporting in Hana
✨ Spline AI

Spell AI 3D Worlds

AI 3D Generation

AI Textures

AI Style Transfer
🕹️ Interaction (States, Events, and Actions)

How state-based animation works

Events & Interactivity

Animatable Properties

Mouse & Key Toggle Property

Variables

Real-time API

Webhooks

AI Text OpenAI API

AI Voice Assistant API

Input

Start Event

Mouse Up Event

Mouse Down Event

Mouse Press Event

Mouse Hover Event

Key Up Event

Key Down Event

Key Press Event

Scroll Event

Look At Event

Follow Event

Game Controls Event

Distance Event

State Change Event

Variable Change Event

Collision Event

Drag and Drop Event

Trigger Area Event

Screen Resize Event

API Updated Event

Webhook Called Event

AI Assistant Listener Event

AI Assistant Trigger Event

Transition Action

Sound Action

Video Action

Open Link Action

Reset Scene Action

Switch Camera Action

Create Object Action

Destroy Object Action

Scene Transition Action

Animation Action

Particles Control Action

Variable Control Action

Conditional Action

Set Variable Action

Clear Local Storage Action

API Request Action
🎞 Exporting your scene

How to optimize your scene

Play Settings

Exporting as Public URLs

Exporting as Spline Viewer

Exporting as Code

Code API for Web

Native 3D Embeds for iOS

iOS App Generation

Spline Mirror for visionOS

Code API for SwiftUI

Native 3D Embeds for Android

Android Package (APK)

Android App Bundles (AAB)

Code API for Kotlin

Exporting as an Image

Exporting as Video Recording

Exporting Animated GIFs

Exporting Image Sequences

Exporting as GTLF/GLB

Exporting as USDZ

Exporting as STL (3D Printing)
💻 Importing Content

How to Import Content

Import Animated Objects

Morph Targets
🌈 Materials & Shading

Material Library

Creating Material Layers

Material, Color, and Image Assets

Lighting Layer

Color Layer

Image Layer

Video Layer

Depth Layer / 3D Gradient

Normal Layer

Gradient Layer

Noise Layer

Fresnel Layer

Rainbow Layer

Toon Layer

Outline Layer

Glass Layer

Matcap Layer

Displace Layer

Pattern Layer

Layer Masking

Bump Map & Roughness Map
💡 Lighting

Working with Lights

Directional Light

Point Light

Spot Light

Soft Shadows
📸 Cameras

Working with Cameras

Camera parameters

Effects (Post-Processing)

Depth of Field (DoF)

Working with Fog
🧶 Integrations

Integrating with Figma

Integrating with Framer

Integrating with Webflow

Integrating with Notion

Integrating with Shopify

Integrating with Play

Integrating with Wix

Integrating with Wix Studio

Integrating with Typedream

Integrating with Tome

Integrating with Toddle

Integrating with Instant.so
🥳 Fun Facts

The Bunny and Teapot Objects
Policies

Subscriptions and Renewal
🎞 Exporting your scene
How to optimize your scene
How to optimize your scene

Note: Spline is constantly improving and many optimizations are made over time. It is likely that some of the suggestions here won't be needed in the future.
Performance Panel

To help with optimization, the Performance Panel offers some key metrics and opportunities for improvement to keep the load times and performance of the scene fast and efficient. 
You can access the Performance Panel from the Export Panel.
You can access the Performance Panel from the Export Panel.

The performance panel provides the following metrics to help you identify optimization opportunities in your scenes:

    Export Size Estimation.

    Loading Time Score.

    Number of Objects.

    Number of Clones.

    Number of Booleans.

    Number of Total Polygons.

    Number of Object Polygons.

    Number of Cloned Polygons.

    Number of Materials (Non-Assets)

    Number of Materials (Assets)

    Number of Audio Assets.

    Number of Lights.

    Number of Post-processing Effects.

    Number of Textures.

Values for Export Size and Loading Time are measured with an average internet speed and are estimated. Actual values may vary.
image
Opportunities to optimize

Below Metrics, there are Opportunities, which are suggestions for improvement with actions inside them based on the state of the scene.
image

There are three types of Opportunities:

    Red: Most important to improve performance and the overall state of the scene.

    Yellow: Important for improvement, not critical.

    Gray: Suggestions to keep the scene clean and remove unused assets. Not directly related to performance.

To keep a good performance, follow these suggestions when exporting and embedding your designs:
🪛 Reduce the number of polygons

In Spline, all objects are geometries formed from triangular polygons. Two triangles form a square (quad). The fewer the number of polygons, the fastest it will be rendered/loaded on the screen.

    Usually, smoother objects have higher amounts of polygons which increases load time.

    On parametric objects (like the sphere, cube, cylinder, etc). You can control the number of ‘Sides’. You can reduce the sides to increase performance.

    When working with smooth subdivision objects.

        Avoid using more than 3 subdivision levels unless you really need them. Most objects look good with only 1 or 2 subdivision levels.

        Avoid increasing the base subdivisions unless you need to. This button will ‘bake’ or apply the subdivision and you won't be able to return to the original version.

        If you are importing objects from other software or libraries make sure you use an optimized and lower polygon version.


🗜️ Use geometry compression on export

You can use the Compression settings to improve the loading/performance of your exported scenes. Please be aware that higher levels of compression can also reduce precision or quality in the geometries.

    Click on “Export” on the top toolbar

    Under PublicURL, Viewer or Code Export (depending on your desired export type) switch to the “Play Settings” tab

    Scroll all the way down to find the “Compression” settings

    Turn it on with the switch

    From the “Geometry Quality” dropdown select “Performance” to optimize for improved performance.

    Control the image compression level. This can help you reduce the overall size of scenes that use textures substantially, in some cases making your file sizes 4x smaller.

image


✂️ Reduce the number of objects & keep materials simple

Having lots of objects will increase the loading times and also reduce the performance (more objects = more polygons, more materials, etc).

    Delete objects that aren’t visible (like inside another object, or behind other objects). If you think people won't be seeing these objects in the final experience, you can delete them.

    Avoid adding images/textures to your materials if possible (images, especially big ones, add more time to load).

    Use simple lighting. We recommend working with less than 3 lights per scene. Too many lights can reduce the performance of the scene.

    Try to keep the materials simple, don’t use too many layers if not necessary.

    Post-processing effects can reduce performance (especially if you activate many effects at the same time).


⛘ Booleans Performance

Boolean operations can end up becoming very expensive in terms of performance. Below are some suggestions of what to do to mitigate performance issues related to booleans.

    Reduce the sides of the objects involved in boolean operations. (Instead of using a Sphere with sides of 64, try reducing them. Usually, there won’t be a very noticeable difference)

    Baking the boolean object using the “Apply & Edit” option. (You can save a copy of your editable boolean object and hide it, so it doesn’t load in the scene)

    Instead of animating the Size property, animate the Scale instead, it is more performance efficient.

To learn more about booleans visit the 

Boolean Operations
️ doc.

When working on scenes with many repeated objects, you can use Components and instances to optimize your scene.

Components are reusable objects. They allow you to use a single object and create multiple instances of it. Each instance is a virtual copy of the original (instead of a duplicate).

This means that if you have 1 component and 100 instances, the scene will only store one geometry (instead of 101 geometries).


🧱 Use Material and Image assets to optimize performance

Similar to components, assets are reusable items. A single asset that can be assigned to multiple objects, while still maintaining a single origin.

Any new geometry on Spline by default contains a non-asset material. This means that if you have 10 objects, you will have 10 materials. This can be handy if you want each object to have different styles. But if all of them are meant to look the same, then it is not efficient.

Instead you can convert the material into an asset and reuse the asset in the 10 objects. This optimizes the amount of data and processing for your scene.


🔧 Optimizing your website performance when using 3d scenes

You can think about 3d scenes the same way you think about images or videos in regard to performance. If your website contains many images or videos and you add a very complex 3d scene on top of that, it is likely that the performance will be reduced.

Here are some tips on how to get best performance when adding 3d to your websites:

    If your website is already very complex (with a lot of content), consider optimizing it before adding a 3d scene from Spline, or make sure your 3d scene is simple enough.

    Reduce the amount of images/textures in your 3d scene and in your website to improve loading times.

    Follow the recommendations from the Performance panel to optimize your scene (reduce objects, materials, etc).


🌳 Avoid multiple embeds per web page

While it is possible to embed multiple Spline scenes on a single website page, we recommend keeping it simple and only use one or two embeds per page.

If your experience requires having multiple spline embeds per page, here are some considerations to keep in mind:

    Avoid multiple embeds of very complex 3d scenes (check the performance indicator on export settings).

    Avoid using more than 3 embeds per page.

    Use the Spline Viewer instead of the iFrame embeds. The spline-viewer allows lazy-loading, which offers better performance when using multiple embeds in a single page.

    Avoid using multiple embeds on full-screen (the bigger the canvas, the more pixels are needed to render).

 

Previous
API Request Action

Next
Play Settings
