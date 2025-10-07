How To Use Lottie Animations in a React App

LottieFiles

•

05 May 2020

•

4 min read
How To Use Lottie Animations in a React App
What is a Lottie?

A Lottie is a high-quality JSON-encoded animation compatible with Android, iOS, web browsers, React, and more. You can learn more about what a Lottie is here.

The best way to get to know how to use a Lottie is to embed one. Follow along with this walkthrough to learn how to embed your favorite Lottie into a React App.

1. Choose your Lottie

Choose an animation, either one of your own or you can select one from the wide range of free animations on LottieFiles. Make sure you have your animation in Lottie format (.json).

For this walkthrough we are going to use this animation:
Kiss of the Heart

2. Set up React Development Environment

Are you a Windows fan, addicted to your Mac, do you run Ubuntu on a laptop? Well it doesn't really matter, this walkthrough will use CodeSandbox as the online development environment so that anyone can follow along from any computer that runs a browser. This particular sandbox will render our App so that we can see the HTML output, i.e. our Lottie in action.
2.1 Go start up a new React project at CodeSandbox

This gets you a boilerplate React project created with the official create-react-app starter.
A boilerplate React project in CodeSandbox

Now you have a shiny new React app to start building on.
2.2 Add the Lottie player React component

We will begin by giving your React App the ability to render your Lottie by adding a React component for rendering Lottie animations. Find the "Dependencies" area in the left pane, use "Add dependency" and search for react-lottie, select this from the results.
List of React dependencies
2.3 Add the prop-types dependency

We'll also need a second dependency. Search for the prop-types dependency, then click Add dependency.
List of React dependencies, with prop-types included 3. Apply your Lottie

Now you are ready to add your Lottie and edit your React App to include a call to your Lottie.
3.1 Create a directory to store Lottie assets

Hover over "src" in codesandbox, choose "New Directory", and name this lotties. Within this folder, make a new file called kiss-of-the-heart.json.

Your sandbox should look like this:
View of folder structure

The middle pane of CodeSandbox displays this (empty) file.
3.2 Open up your local copy of the downloaded Lottie and paste in the Lottie JSON that codes your Lottie into the middle pane that displays this file.

NB shortcuts are awesome, and 3 assist you here:

    CTRL + A (selects all)
    CTRL + C (copies all)
    CTRL + V (pastes all)

Your file should look like this:
View of the Lottie animation JSON code 4. Use your Lottie

Final step. Your React App now needs to use your Lottie file using the Lottie player component. To make this happen, we edit the App.js file.
4.1 Import the react-lottie player component and the Lottie JSON file:

Add the following to the start of your App.js file.

import React from 'react';
import './styles.css';
import Lottie from 'react-lottie';
import animationData from './lotties/kiss-of-the-heart';

        copy

Your import list will now look like this:
Import list in React
4.2 Replace the code:
Code block in React

with:

export default function App() {
const defaultOptions = {
loop: true,
autoplay: true,
animationData: animationData,
rendererSettings: {
preserveAspectRatio: "xMidYMid slice"
}
};

return (
<div>
<Lottie 
	    options={defaultOptions}
        height={400}
        width={400}
      />
</div>
);
}

        copy

Optimize Lottie animations in React with dotLottie

Boost your React app’s performance with dotLottie, an evolution of the Lottie format that bundles multiple animations and assets into a single, compressed file. It ensures faster loading times, improved storage efficiency, and easy asset management.

With built-in theming and interactivity via state machines, dotLottie enables smooth transitions and engaging user experiences. Developers benefit from simplified workflows and reduced complexity, ensuring seamless animation rendering across platforms. The best part is because dotLottie uses ZIP tech for compression, it can reduce your file size up to 80% more than a standard Lottie.
You try it

It is this simple to make use of a Lottie animation, and we have a huge animation library on LottieFiles with creations by some of the best animators around, and they are yours to use for free. Browse world-class animations and make your pages look better without sacrificing loading time.
Want more?

Would you like to be able to give the user control over the behavior of the Lottie? If so, check out the article control your Lottie in a React App.

Share

Tags

Developing with Lottie Animations

Developers
