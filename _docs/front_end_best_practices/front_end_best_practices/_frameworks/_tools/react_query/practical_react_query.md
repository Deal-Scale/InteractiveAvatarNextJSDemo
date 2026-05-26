Practical React Query

16.11.2020 — ReactJs, React Query — 8 min read
a wall full of old tools
Photo by Lachlan Donald

Last Update: 2023-10-21

    #1: Practical React Query
    #2: React Query Data Transformations
    #3: React Query Render Optimizations
    #4: Status Checks in React Query
    #5: Testing React Query
    #6: React Query and TypeScript
    #7: Using WebSockets with React Query
    #8: Effective React Query Keys
    #8a: Leveraging the Query Function Context
    #9: Placeholder and Initial Data in React Query
    #10: React Query as a State Manager
    #11: React Query Error Handling
    #12: Mastering Mutations in React Query
    #13: Offline React Query
    #14: React Query and Forms
    #15: React Query FAQs
    #16: React Query meets React Router
    #17: Seeding the Query Cache
    #18: Inside React Query
    #19: Type-safe React Query
    #20: You Might Not Need React Query
    #21: Thinking in React Query
    #22: React Query and React Context
    #23: Why You Want React Query
    #24: The Query Options API
    #25: Automatic Query Invalidation after Mutations
    #26: How Infinite Queries work
    #27: React Query API Design - Lessons Learned
    #28: React Query - The Bad Parts
    #29: Concurrent Optimistic Updates in React Query

    한국어
    正體中文
    Português
    日本語
    Español
    简体中文
    Русский
    Polski
    Add translation

When GraphQL and especially Apollo Client became popular in ca. 2018, there was a lot of fuss about it completely replacing redux, and the question Is Redux dead yet? has been asked a lot.

I distinctly remember not understanding what this was all about. Why would some data fetching library replace your global state manager? What does one even have to do with the other?

I was under the impression that GraphQL clients like Apollo would only fetch the data for you, similar to what e.g. axios does for REST, and that you would still obviously need some way of making that data accessible to your application.

I couldn't have been more wrong.
Client State vs. Server State

What Apollo gives you is not just the ability to describe which data you want and to fetch that data, it also comes with a cache for that server data. This means that you can just use the same useQuery hook in multiple components, and it will only fetch data once and then subsequently return it from the cache.

This sounds very familiar with what we, and probably many other teams as well, have mainly been using redux for: Fetch data from the server and make it available everywhere.

So it seems that we have always been treating this server state like any other client state. Except that when it comes to server state (think: A list of articles that you fetch, the details of a User you want to display, ...), your app does not own it. We have only borrowed it to display the most recent version of it on the screen for the user. It is the server who owns the data.

To me, that introduced a paradigm shift in how to think about data. If we can leverage the cache to display data that we do not own, there isn't really much left that is real client state that also needs to be made available to the whole app. That made me understand why many think that Apollo can replace redux in lots of instances.
React Query

I have never had the chance to use GraphQL. We have an existing REST API, don't really experience problems with over-fetching, it just works, etc. Clearly, there aren't enough pain points for us to warrant a switch, especially given that you'd also have to adapt the backend, which isn't quite so simple.

Yet I still envied the simplicity of how data fetching can look like on the frontend, including the handling of loading and error states. If only there were something similar in React for REST APIs...

Enter React Query.

Made by the open sourcerer Tanner Linsley in late 2019, React Query takes the good parts of Apollo and brings them to REST. It works with any function that returns a Promise and embraces the stale-while-revalidate caching strategy. The library operates on sane defaults that try to keep your data as fresh as possible while at the same time showing data to the user as early as possible, making it feel near instant at times and thus providing a great UX. On top of that, it is also very flexible and lets you customize various settings for when the defaults are not enough.

This article is not going to be an introduction to React Query though.

I think the docs are great at explaining Guides & Concepts, there are Videos from various Talks that you can watch, and Tanner has a React Query Essentials Course you can take if you want to get familiar with the library.
Update

I've been working on a brand new course together with ui.dev. If you enjoy the content I've been creating so far, you'll love query.gg.
Query.gg - The official React Query course

I want to focus more on some practical tips that go beyond the docs, which might be useful when you are already working with the library. These are things I have picked up over the last couple of months when I was not only actively using the library at work, but also got involved in the React Query community, answering questions on Discord and in GitHub Discussions.
The Defaults explained

I believe the React Query Defaults are very well-chosen, but they can catch you off guard from time to time, especially at the beginning.

First of all: React Query does not invoke the queryFn on every re-render, even with the default staleTime of zero. Your app can re-render for various reasons at any time, so fetching every time would be insane!

    Always code for re-renders, and a lot of them. I like to call it render resiliency.

— Tanner Linsley

If you see a refetch that you are not expecting, it is likely because you just focused the window and React Query is doing a refetchOnWindowFocus, which is a great feature for production: If the user goes to a different browser tab, and then comes back to your app, a background refetch will be triggered automatically, and data on the screen will be updated if something has changed on the server in the meantime. All of this happens without a loading spinner being shown, and your component will not re-render if the data is the same as you currently have in the cache.

During development, this will probably be triggered more frequently, especially because focusing between the Browser DevTools and your app will also cause a fetch, so be aware of that.
Update

Since React Query v5, refetchOnWindowFocus no longer listens to the focus event - the visibilitychange event is used exclusively. This means you'll get fewer unwanted re-fetches in development mode, while still retaining the trigger for most production cases. It also fixes a bunch of issues as shown here.

Secondly, there seems to be a bit of confusion between gcTime and staleTime, so let me try to clear that up:

    staleTime: The duration until a query transitions from fresh to stale. As long as the query is fresh, data will always be read from the cache only - no network request will happen! If the query is stale (which per default is: instantly), you will still get data from the cache, but a background refetch can happen under certain conditions.
    gcTime: The duration until inactive queries will be removed from the cache. This defaults to 5 minutes. Queries transition to the inactive state as soon as there are no observers registered, so when all components which use that query have unmounted.

Most of the time, if you want to change one of these settings, it's the staleTime that needs adjusting. I have rarely ever needed to tamper with the gcTime. There is a good explanation by example in the docs as well.
Update

gcTime was previously known as cacheTime, but it got renamed in v5 to better reflect what it's doing.
Use the React Query DevTools

This will help you immensely in understanding the state a query is in. The DevTools will also tell you what data is currently in the cache, so you'll have an easier time debugging. In addition to that, I have found that it helps to throttle your network connection in the browser DevTools if you want to better recognize background refetches, since dev-servers are usually pretty fast.
Treat the query key like a dependency array

I am referring to the dependency array of the useEffect hook here, which I assume you are familiar with.

Why are these two similar?

Because React Query will trigger a refetch whenever the query key changes. So when we pass a variable parameter to our queryFn, we almost always want to fetch data when that value changes. Instead of orchestrating complex effects to manually trigger a refetch, we can utilize the query key:
feature/todos/queries.ts

type State = 'all' | 'open' | 'done'

type Todo = {

  id: number

  state: State

}

type Todos = ReadonlyArray<Todo>


const fetchTodos = async (state: State): Promise<Todos> => {

  const response = await axios.get(`todos/${state}`)

  return response.data

}


export const useTodosQuery = (state: State) =>

  useQuery({

    queryKey: ['todos', state],

    queryFn: () => fetchTodos(state),

  })

Here, imagine that our UI displays a list of todos along with a filter option. We would have some local state to store that filtering, and as soon as the user changes their selection, we would update that local state, and React Query will automatically trigger the refetch for us, because the query key changes. We are thus keeping the user's filter selection in sync with the query function, which is very similar to what a dependency array represents for useEffect. I don't think I have ever passed a variable to the queryFn that was not part of the queryKey, too.
A new cache entry

Because the query key is used as a key for the cache, you will get a new cache entry when you switch from 'all' to 'done', and that will result in a hard loading state (probably showing a loading spinner) when you switch for the first time. This is certainly not ideal, so if possible, we can try to pre-fill the newly created cache entry with initialData. The above example is perfect for that, because we can do some client side pre-filtering on our todos:
pre-filtering

type State = 'all' | 'open' | 'done'

type Todo = {

  id: number

  state: State

}

type Todos = ReadonlyArray<Todo>


const fetchTodos = async (state: State): Promise<Todos> => {

  const response = await axios.get(`todos/${state}`)

  return response.data

}


export const useTodosQuery = (state: State) =>

  useQuery({

    queryKey: ['todos', state],

    queryFn: () => fetchTodos(state),

    initialData: () => {

      const allTodos = queryClient.getQueryData<Todos>([

        'todos',

        'all',

      ])

      const filteredData =

        allTodos?.filter((todo) => todo.state === state) ?? []


      return filteredData.length > 0 ? filteredData : undefined

    },

  })

Now, every time the user switches between states, if we don't have data yet, we try to show data from the 'all todos' cache. We can instantly show the 'done' todos that we have to the user, and they will still see the updated list once the background fetch finishes.

I think this is a great ux improvement for just a few lines of code.
Keep server and client state separate

This goes hand in hand with putting-props-to-use-state, an article I have written last month: If you get data from useQuery, try not to put that data into local state. The main reason is that you implicitly opt out of all background updates that React Query does for you, because the state "copy" will not update with it.

This is fine if you want to e.g. fetch some default values for a Form, and render your Form once you have data. Background updates are very unlikely to yield something new, and even if, your Form has already been initialized. So if you do that on purpose, make sure to not fire off unnecessary background refetches by setting staleTime:
initial-form-data

const App = () => {

  const { data } = useQuery({

    queryKey: ['key'],

    queryFn,

    staleTime: Infinity,

  })


  return data ? <MyForm initialData={data} /> : null

}


const MyForm = ({ initialData }) => {

  const [data, setData] = React.useState(initialData)

  ...

}

This concept will be a bit harder to follow through when you display data that you also want to allow the user to edit, but it has many advantages. I have prepared a little codesandbox example:

The important part of this demo is that we never put the value that we get from React Query into local state. This makes sure that we always see the latest data, because there is no local "copy" of it.
The enabled option is very powerful

The useQuery hook has many options that you can pass in to customize its behaviour, and the enabled option is a very powerful one that enables you to do many cool things (pun intended). Here is a short list of things that we were able to accomplish thanks to this option:

    Dependent Queries
    Fetch data in one query and have a second query only run once we have successfully obtained data from the first query.
    Turn queries on and off
    We have one query that polls data regularly thanks to refetchInterval, but we can temporarily pause it if a Modal is open to avoid updates in the back of the screen.
    Wait for user input
    Have some filter criteria in the query key, but disable it for as long as the user has not applied their filters.
    Disable a query after some user input
    e.g. if we then have a draft value that should take precedence over the server data. See the above example.

Don't use the queryCache as a local state manager

If you tamper with the queryCache (queryClient.setQueryData), it should only be for optimistic updates or for writing data that you receive from the backend after a mutation. Remember that every background refetch might override that data, so use something else for local state.
Create custom hooks

Even if it's only for wrapping one useQuery call, creating a custom hook usually pays off because:

    You can keep the actual data fetching out of the ui, but co-located with your useQuery call.
    You can keep all usages of one query key (and potentially type definitions) in one file.
    If you need to tweak some settings or add some data transformation, you can do that in one place.

You have already seen an example of that in the todos queries above.