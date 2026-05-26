Animating the Web with Lottie: Best Practices for Optimization
YOKESH KS
YOKESH KS
7 min read
·
Feb 26, 2023

lottie-web is a library that allows you to easily use Lottie animations in a web application. Lottie is a library that parses Adobe After Effects animations and renders them natively on mobile and web platforms. By using lottie-web, you can include Lottie animations in your web app with just a few lines of code.

Install lottie-web in your project by running the following command in your terminal:

npm install lottie-web

Once lottie-web is installed, you can import it into your JavaScript code and use the loadAnimation function to load an animation. Here’s an example of how you might use lottie-web in a web application:

import lottie from 'lottie-web';

lottie.loadAnimation({
  container: document.getElementById('animation-container'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/path/to/animation.json',
});

In this example, the loadAnimation function is being passed an options object with a container property that specifies the DOM element where the animation will be rendered, a renderer property that specifies the renderer to use (either svg or canvas), and a path property that points to a JSON file containing the animation data. The loop and autoplay properties control the playback of the animation.

If you were previously using the Lottie component from lottie-react, you will need to replace it with the DOM element that will contain the animation. For example, you might use a div element like this:

import React from 'react';

const MyComponent = () => {
  return (
    <div id="animation-container" />
  );
};

You can then use the lottie.loadAnimation function to load the animation in the component’s lifecycle methods, such as componentDidMount or useEffect. Here’s an example of how you might do this:

import React, { useEffect } from 'react';
import lottie from 'lottie-web';

const MyComponent = () => {
  useEffect(() => {
    lottie.loadAnimation({
      container: document.getElementById('animation-container'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/path/to/animation.json',
    });
  }, []);

  return (
    <div id="animation-container" />
  );
};

Optimization of lottie-react

Here are a few tips for optimizing the use of lottie-react in a Next.js application:

    Use the useEffect hook to control the rendering of the animation: You can use the useEffect hook to control when the animation is rendered and when it is destroyed. This can help to reduce the amount of unnecessary rendering that occurs.
    Use the useMemo hook to optimize the rendering of the animation: You can use the useMemo hook to optimize the rendering of the animation by only re-rendering it when the animation data or options change.
    Use the useLazyLottie hook: The useLazyLottie hook allows you to lazy-load a Lottie animation and control its rendering with a simple hook API. This can be a convenient way to optimize the performance of your Lottie animations in a Next.js application.

useEffect hook to control the rendering of the animation

The useEffect hook is a feature of the React library that allows you to perform side effects in a functional component. You can use the useEffect hook to control the rendering of a Lottie animation by using it to load and unload the animation as needed.

To use the useEffect hook to control the rendering of a Lottie animation, you will need to import the useEffect hook from React and use it to define a function that loads and unloads the animation. Here’s an example of how you might do this in a lottie-web component:

import React, { useRef, useEffect } from 'react';
import lottie from 'lottie-web';

const MyComponent = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: document.getElementById('animation-container'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/path/to/animation.json',
    });

    return () => {
      animation.destroy();
    };
  }, []);

  return (
    <div id="animation-container" />
  );
};

In this example, the useEffect hook is used to define a function that loads the Lottie animation when the component mounts. The function returns a cleanup function that is called when the component unmounts, which destroys the animation. This ensures that the animation is only loaded and rendered when it is needed, which can help to improve the performance of your application.
useMutable reference to container

To use a ref to reference the container element for a Lottie animation in the lottie-web library, you will need to create a ref using the useRef hook and pass it as the container option to the loadAnimation function. Here’s an example of how you might do this in a React component:

import React, { useRef, useEffect } from 'react';
import lottie from 'lottie-web';

const MyComponent = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/path/to/animation.json',
    });

    return () => {
      animation.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} />
  );
};

In this example, the useRef hook is used to create a mutable reference to the container element, which is stored in the containerRef variable. The ref is passed as the ref prop to the div element, which allows it to be referenced in the component’s code. The useEffect hook is used to define a function that loads the Lottie animation when the component mounts. The function uses the containerRef variable as the container option for the loadAnimation function, which specifies the DOM element where the animation will be rendered.
useMemo hook to optimize the rendering of the animation

The useMemo hook is a feature of the React library that allows you to optimize the rendering of a component by memoizing the result of an expensive computation. You can use the useMemo hook to optimize the rendering of a Lottie animation in the lottie-web library by memoizing the options object passed to the loadAnimation function.

To use the useMemo hook to optimize the rendering of a Lottie animation in the lottie-web library, you will need to import the useMemo and useEffect hooks from React and use them to define a function that loads the animation. Here’s an example of how you might do this in a React component:

import React, { useMemo, useEffect } from 'react';
import lottie from 'lottie-web';

const MyComponent = () => {
  const containerRef = useRef(null);
  const options = useMemo(() => {
    return {
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/path/to/animation.json',
    };
  }, []);

  useEffect(() => {
    const animation = lottie.loadAnimation(options);

    return () => {
      animation.destroy();
    };
  }, [options]);

  return (
    <div ref={containerRef} />
  );
};

Create a custom — useLazyLottie hook

The useLazyLottie hook is a custom hook that you can use to implement lazy loading of a Lottie animation in a functional component. The useLazyLottie hook is not a built-in feature of either the lottie-react or lottie-web libraries, but it could be implemented as a custom hook that combines the useEffect and useRef hooks to implement lazy loading of a Lottie animation.

Here’s an example of how the useLazyLottie hook might be implemented using the lottie-web library:

import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

const useLazyLottie = (options) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const animation = lottie.loadAnimation({
          ...options,
          container: containerRef.current,
        });
        animationRef.current = animation;
        observer.disconnect();
      }
    });
    observer.observe(containerRef.current);

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
      observer.disconnect();
    };
  }, [options]);

  return { containerRef, animationRef };
};

In this example, the useLazyLottie hook uses the IntersectionObserver API to detect when the animation becomes visible in the viewport. When the animation becomes visible, the hook uses the lottie-web library to load the animation and stores a reference to the animation instance in the animationRef variable. The hook also returns the containerRef and animationRef variables, which can be used to reference the container element and the animation instance in the component’s code.

To pass options to the useLazyLottie hook, you can pass an options object as an argument to the hook. The options object should include all of the options that you want to pass to the lottie-web library’s loadAnimation function.

Here’s an example of how you might use the useLazyLottie hook and pass options to it:

import React from 'react';
import { useLazyLottie } from './useLazyLottie';

const MyComponent = () => {
  const { containerRef, animationRef } = useLazyLottie({
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: '/path/to/animation.json',
  });

  return (
    <div ref={containerRef} />
  );
};

In this example, the useLazyLottie hook is called with an options object that includes the renderer, loop, autoplay, and path options for the loadAnimation function. These options will be passed to the loadAnimation function when the animation becomes visible in the viewport.
Code Splitting — Dynamic import package

To use code-splitting with the lottie-web library in a Next.js application, you can use the dynamic import function provided by Next.js to lazy-load the lottie-web library and the animation data.

Here’s an example of how you might use code-splitting with the lottie-web library and Next.js:

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-web'), { ssr: false });

const MyComponent = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/path/to/animation.json',
    });

    return () => {
      animation.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} />
  );
};

export default MyComponent;

In this example, the dynamic import function is used to lazy-load the lottie-web library and the animation data. The ssr option is set to false to prevent the library from being loaded on the server-side during server-side rendering. The useEffect hook is then used to load the animation when the component mounts, and the containerRef variable is used to reference the container element for the animation.
Animation
React
Lottie
Adobe After Effects
Optimization