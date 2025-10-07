https://nextjs.org/docs/app/deep-dive/caching
Next.js has become a preferred framework for building robust and complex React applications, thanks to features like server-side rendering (SSR) and static generation (SG). However, caching in Next.js remains one of the more controversial and misunderstood aspects, as it significantly affects application performance. For some developers, managing Next.js caching can be challenging, especially when it leads to tricky bugs and unexpected stale data.

Understanding caching mechanisms and best practices in Next.js can unlock the framework’s full potential, enabling developers to build faster and more reliable applications. In this article, we’ll break down the four main caching mechanisms in Next.js, show how to control and invalidate caches, and introduce tools and best practices to avoid common pitfalls.
What is Caching in Next.js?

Caching refers to storing fetched or computed data temporarily so that it can be quickly accessed in the future without the need for additional fetching or computation. Next.js aggressively caches various types of data to optimize performance, such as fetched data and visited routes.

Next.js provides four primary caching mechanisms to manage different stages of data handling in React applications:

    Request Memorization
    Data Cache
    Full Route Cache
    Router Cache

Let’s dive into each mechanism, learn how they work, and understand their use cases.

1. Request Memorization

Request memorization caches data on the server for the lifespan of a single user’s request. This is particularly helpful when the same data is fetched multiple times within the same component tree. With request memorization, only one network request is needed, and subsequent calls retrieve data from the cache instead.

Here’s how it works in action:

export const getProducts = async () => {
const res = await fetch('https://mystoreapi.com/products');
const data = await res.json();
return data;
};

import { getProducts } from '../../../lib/products';
import ProductList from '../productList/page';

const Product = async () => {
const products = await getProducts();
const totalProducts = products?.length;

return (
<div>
<div>{`There are ${totalProducts} products in my store.`}</div>
<ProductList />
</div>
);
};

export default Product;

import { getProducts } from '../../../lib/products';

const ProductList = async () => {
const products = await getProducts();
return (
<ul>
{products?.map(({id, title}) => (
<li key={id}>{title}</li>
))}
</ul>
);
};

export default ProductList;

In the code above, getProducts fetches data only once, caching the result. When getProducts is called in ProductList, it uses the cached data instead of fetching again, saving network requests.

Limitations: This cache is only active during one render and works only with fetch inside React components. 2. Data Cache

Data cache stores fetched data either for a specific route or a single fetch request, persisting across requests and even app redeployments. This cache operates similarly to static pages, providing consistent data for all users until it’s explicitly invalidated, making it a go-to for static content.

To ensure that data cache stays fresh, you can use Incremental Static Regeneration (ISR), which revalidates the cache at specified intervals.

import { getProducts } from '../../../lib/products';

const Page = async () => {
const revalidate = 3600;
const products = await getProducts();

return (
<div className='space-y-8'>
{products.map(({ id, title, description }) => (
<div key={id}>
<h2>{title}</h2>
<p>{description}</p>
</div>
))}
</div>
);
};

export default Page;

In this example, revalidate is set to 3,600 seconds (1 hour), meaning the data will refresh every hour, keeping the page updated. 3. Full Route Cache

The full route cache stores static pages as HTML at build time, serving them to users without additional computation. This method leverages static generation for quick access and reliable performance.

import Link from 'next/link';
import { getProducts } from '../../../lib/products';

const Product = async () => {
const products = await getProducts();
return (
<div>
<h1>Product List</h1>
<ul>
{products.map(({id, title}) => (
<li key={id}>
<Link href={`/product/${id}`} >
<a>{title}</a>
</Link>
</li>
))}
</ul>
</div>
);
};

export default Product;

Here, Product renders as a static HTML page. This cache is tied to the data cache and persists until the data is revalidated. 4. Router Cache

Router cache stores visited pages and prefetched pages in the user’s browser, ensuring faster transitions without reloading data. It works for both static and dynamic routes, but one drawback is that it can cause stale data unless the user reloads or reopens the page.
Cache Invalidation in Next.js

Cache invalidation purges outdated cache and fetches fresh data. Here are two strategies for cache invalidation:

    Time-Based Expiry: Sets cache to expire after a defined period.
    On-Demand Invalidation: Explicitly clears cache via revalidatePath or revalidateTag.

Example with revalidatePath:

'use server';
import { revalidatePath } from 'next/cache';

export const getUsers = async () => {
const res = await fetch('https://mystoreapi.com/users');
const data = await res.json();
revalidatePath('/users');
return data;
};

This function forces cache invalidation for the /users route, ensuring fresh data on the next load.
Tools for Managing Next.js Cache

    next-cache-toolbar

Useful in development, this tool displays cache information, showing whether pages are cached and when they expire. To add it:

npm install next-cache-toolbar

// app/toolbar.jsx
import { NextCacheToolbar } from "next-cache-toolbar";
import "next-cache-toolbar/style.css";
const Toolbar = () => <NextCacheToolbar />;
export default Toolbar;

    next-shared-cache

This API simplifies ISR and data caching in Next.js with customizable storage and revalidation support.

npm install @neshca/cache-handler

// cache-handler.js
import { CacheHandler } from '@neshca/cache-handler';
CacheHandler.onCreation(async () => {
const cacheStore = new MagicMap();
const handler = { /_ Cache get, set, and delete functions _/ };
return { handlers: [handler] };
});
export default CacheHandler;

Best Practices for Next.js Caching

    Protect Sensitive Data: Avoid caching personal data or tokens.
    Set Cache-Control Headers: Control cache behavior with Cache-Control headers.
    Monitor Cache Performance: Regularly check cache hits and misses using tools like next-cache-toolbar.
    Revalidate Frequently Updated Data: Configure appropriate revalidation times for dynamic content.
