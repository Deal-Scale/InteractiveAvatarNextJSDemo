Lazy Load Lottie animation in React
Alon Mizrahi
Alon Mizrahi
2 min read
·
Jan 11, 2024

I was about to add Lottie to my React +Next.js side project, and I saw that it was huge in bundle size. (82kb minified+gzipped)
https://bundlephobia.com/package/react-lottie@1.2.4

Wait, this is only one part of the story. What about the animation JSONs? They are quite large as well. Some of them reach up to 1.3 MB in my case.
Huge animations

The straw that broke the camel’s back was that I was using lotte-web in Next.js App, and someday it started to raise exceptions, complaining that ReferenceError: document is not defined. meaning it was trying to access some Browser API in Server Side Rendering.

node_modules/lottie-web/build/player/lottie.js (30:4) @ createTag
ReferenceError: document is not defined

After some investigation, I’ve found a thread about that exact issue and someone mentioned the root cause when using node > 18.

    Read more here: https://github.com/Gamote/lottie-react/issues/101#issuecomment-1840516520

A workaround suggested by the thread opener to load Lottie lazily, and I thought, well, that’s something I wanted anyway, let’s save two birds with one stone.

Let’s dive into the actual code…
LazyLottie (Optimized for SSR)

import { Skeleton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { type LottieComponentProps } from 'lottie-react';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';

const LazyLottieComponent = lazy(() => import('lottie-react'));

interface LottieProps<T extends Record<string, unknown>> {
getAnimationData: () => Promise<T>;
id: string;
}

export function LazyLottie<T extends Record<string, unknown>>({
getAnimationData,
id,
ref,
...props
}: LottieProps<T> & Omit<LottieComponentProps, 'animationData'>) {
const { data } = useQuery({
queryKey: [id],
queryFn: async () => {
void import('lottie-react'); // Trigger the library lazy load even if the animationData is not ready
return getAnimationData();
},
enabled: typeof window !== 'undefined',
});

if (!data) return <Skeleton height={props.height} width={props.width} />;

return (
<Suspense fallback={<Skeleton height={props.height} width={props.width} />}>
<LazyLottieComponent animationData={data} {...props} />
</Suspense>
);
}

Usage

import { LazyLottie } from '~/components/LazyLottie';

export const EmptyState: React.FC = () => {
return (
<LazyLottie
getAnimationData={() => import('~/assets/lottie/empty-box.json')}
loop
id="empty-box"
width={120}
height={120}
/>
);
};

Notes

I’m using the Mantine component library, and it provides a simple <Skeleton />component that shows gentle animation while loading, this can be replaced by any other animation of your liking.
Nextjs
React
Lazy Loading
Front End Development
