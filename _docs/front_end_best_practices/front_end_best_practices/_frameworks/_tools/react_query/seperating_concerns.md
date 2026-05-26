React-Query Best Practices: Separating Concerns with Custom Hooks
Majid Lotfinia
Majid Lotfinia
5 min read
·
Mar 19, 2023

Are you using React Query in your application? If so, have you considered isolating your API calls into a separate, reusable layer? This approach can offer a number of benefits, such as improved code organization, increased code reusability, and better handling of request/response types.

React Query is a powerful library that makes it easy to manage asynchronous data fetching in your React and React Native applications. In this article, I’ll share the way I use React Query in my TypeScript applications to separate all API calls with related types into a separate concerns.

In almost every front-end or mobile application, we need to connect the app with the server that we assume uses a RESTful API. With React Query, we can easily define and manage these API calls. Here’s how I approach it:

For each API call, I create a specific file that exports a hook with some partial exports. These partial exports define the types that are related to the API call, such as the request parameters, the response data, and the error message.

By separating each API call into its own file, we can keep our code organized and make it easier to maintain. For example, if we need to change the request parameters for a particular API call, we can do so in just one place without affecting the rest of the application.

Here’s an example of what one of these API files might look like:

import { useQuery } from 'react-query';
import { apiClient } from './apiClient';

type User = {
  id: string;
  name: string;
  email: string;
}

type GetUserQueryParams = {
  userId: string;
}

const QUERY_KEY = ['User'];

const fetchUser = async (params: GetUserQueryParams): Promise<User> => {
  const { data } = await apiClient.get(`/users/${params.userId}`);
  return data;
};

export const useGetUser = (params: GetUserQueryParams) => {
  return useQuery<User, Error>(QUERY_KEY, () => fetchUser(params));
};

You can use this hook in your component like:

import { useGetUser, GetUserQueryParams } from './useGetUser';

type Props = {
  userId: string;
}

const UserComponent = ({ userId }: Props) => {
  const { data: user, isLoading: isUserLoading, isError: isUserError } = useGetUser({ userId } as GetUserQueryParams);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (isUserError) {
    return <div>Error fetching user</div>;
  }

  return (
    <div>
      <h1>{user?.name}</h1>
      <p>Email: {user?.email}</p>
    </div>
  );
};

export default UserComponent;

you can create a similar hook for making a POST request to an API to create a new book. Here’s an example:

import { useMutation } from 'react-query';
import { apiClient } from './apiClient';
import {BOOK_LIST_QUERY_KEY} from './use-book-list' // a simular file for fetching list of book by calling GET: /books

type Book = {
  title: string;
  author: string;
}

const createBook = async (bookData: Book) => {
  const { data } = await apiClient.post('/books', bookData);
  return data;
};

const CREATE_BOOK_QUERY_KEY = 'createBook';

export const useCreateBook = () => {
  return useMutation<Book, Error, Book>(createBook, {
    onSuccess: (bookData) => {
      // invalidate the query cache for 'books'
      queryClient.invalidateQueries(BOOK_LIST_QUERY_KEY);
    },
    onError: (error) => {
      // handle error
    },
  });
};

This hook uses the useMutation hook from react-query to make a POST request to the /books endpoint of the API. The hook takes no parameters, but returns a MutationFunction that you can use to create a new book by passing in the title and author as parameters.

import { useState } from 'react';
import { useCreateBook } from './useCreateBook';

const CreateBookForm = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const { mutate, isLoading: isCreateBookLoading, isError: isCreateBookError } = useCreateBook();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    mutate({ title, author });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="title">Title:</label>
      <input type="text" id="title" value={title} onChange={(event) => setTitle(event.target.value)} />

      <label htmlFor="author">Author:</label>
      <input type="text" id="author" value={author} onChange={(event) => setAuthor(event.target.value)} />

      <button type="submit" disabled={isCreateBookLoading}>
        {isCreateBookLoading ? 'Creating...' : 'Create Book'}
      </button>

      {isCreateBookError && <div>Error creating book: {isCreateBookError.message}</div>}
    </form>
  );
};

export default CreateBookForm;

There are several benefits to isolating react-query in a custom hook like useGetUser and useCreateBook:

    Reusable code: By encapsulating the react-query logic in a custom hook, we can reuse it throughout our application without repeating the same code. This makes our code more modular and easier to maintain.
    Separation of concerns: By separating our data fetching logic from our presentation components, we can more easily reason about and test each part of our application. This improves the overall maintainability of our codebase.
    Abstraction: The react-query library provides a powerful set of features for handling data fetching and caching. By abstracting this logic into a custom hook, we can make our code more concise and easier to reason about. This can also make it easier to switch to a different data fetching library in the future if needed.
    Error handling: By handling errors in the custom hook, we can provide a consistent and centralized way of handling errors throughout our application. This can help improve the user experience by providing clear and consistent error messages.
    Consistent request/response handling: By isolating react-query logic in a custom hook, we can ensure that request/response handling is consistent across the entire application. This can be particularly useful when working on large codebases with many developers. By using a consistent set of custom hooks, all developers will be able to follow the same patterns and conventions, which can make it easier to write, test, and maintain code.

For example, if a team decides to use a specific custom hook to handle data fetching in their application, all developers can use that same hook when they need to fetch data. This ensures that all data fetching requests are handled consistently, with the same error handling, caching, and other features provided by the hook. This can save developers time and reduce the likelihood of bugs and inconsistencies in the code.
Conclusion:

React Query is a powerful library for managing data fetching and caching in React applications. By isolating react-query logic in custom hooks, we can create a reusable layer that makes it easier to handle API calls consistently throughout an application. This can result in cleaner, more maintainable code, and can help reduce the likelihood of bugs and inconsistencies.

If you’re using React Query in your application, consider taking the time to refactor your code and move your API calls into custom hooks. While this may require some additional upfront work, it can pay off in the long run by making your code more modular, easier to test, and more scalable. With a little bit of effort, you can create a more robust and maintainable application that is easier to work with and extend over time.