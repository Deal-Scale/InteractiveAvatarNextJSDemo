Blogger API: Getting Started

This document explains how to get started using the Blogger API.
Before you start
Get a Google Account

Make sure that you have a Google Account set up. We recommend that you use a separate Google Account for development and testing purposes to protect yourself from accidental data loss. If you already have a test account, then you're all set; you can visit the Blogger user interface to set up, edit, or view your test data.
Get familiar with Blogger

If you're unfamiliar with Blogger concepts, read this document and experiment with the user interface before starting to code. This document assumes that you're familiar with Blogger, with web programming concepts, and with web data formats.
Learn about authorizing requests and identifying your application

When your application requests private data, the request must be authorized by an authenticated user who has access to that data.

When your application requests public data, the request doesn't need to be authorized, but does need to be accompanied by an identifier, such as an API key.

For information about how to authorize requests and use API keys, see Authorizing requests and identifying your application in the Using the API document.
Blogger API background
Blogger concepts

Blogger is built on five basic concepts:

    Blogs: The root concept of the API. A blog has posts and pages. This is the container for blog meta-information like blog name and Description.
    Posts: A blog post is the publishable item that the blog author has created. This information is meant to be timely, reflecting what the authors want to publish to the world now. It is understood that as time passes, blog posts content ages and becomes less relevent.
    Comments: A comment is the place where people other than the blog post author react to what the author has written. Everything from bricks to bouquets.
    Pages: A page is a place for static content, such as biographical information, or the ways to contact the user. This is generally timeless information that doesn't change very often.
    Users: A user is someone who interacts with Blogger, be they acting as an Author, an Administrator, or just a Reader. For public blogs, readers may be anonymous, but on private blogs a reader must be identified by Blogger.

Blogger API data model

A resource is an individual data entity with a unique identifier. The Blogger JSON API operates on five types of resources:

    Blogs resource: Represents a blog.
    Posts resource: Represents a post; each posts resource is a child of a blogs resource.
    Comments resource: Represents a comment on a specific post; each comments resource is a child of a posts resource.
    Pages resource: Represents a static page; each pages resource is a child of a blogs resource.
    Users resource: Represents a non-anonymous user. This is used to identify the Author of a page, post, or comment.

The blogs resource has two children resource types, pages and posts. A posts resource may have comments resource children.
Overview of the relationships between resources

The Blogger API data model is based on groups of resources, called collections:

Blogs collection
    A blogs collection consists of all the blogs a user has access rights to. You can list blogs by user, or retrieve a single blog by ID.
Posts collection
    A Posts collection consists of all the posts resources within a specific blogs resource.
Comments collection
    A comments collection consists of all the comments resources within a specific posts resource.
Pages collection
    A pages collection consists of all the pages resources within a specific blogs resource.
Users Collection
    A users collection consists of all the users resources on Blogger, and thus cannot be listed. A user can retrieve their own users resource (but nobody else's) by ID, or by using the identifier self.

Blogger API operations

You can invoke a number of different methods on collections and resources in the Blogger API, as described in the following table.
Operation 	Description 	REST HTTP mappings
list 	Lists all resources within a collection. 	GET on a collection URI.
get 	Gets a specific resource. 	GET on a resource URI.
getByUrl 	Gets a resource, looking it up by URL. 	GET with the URL passed in as a parameter.
getByPath 	Gets a resource by looking it up by its path. 	GET with the Path passed in as a parameter.
listByUser 	Lists resources owned by a User. 	GET on a user owned collection.
search 	Search for resources, based on a query parameter. 	GET on a Search URL, with the query passed in as a parameter.
insert 	Create a resource in a collection. 	POST on a collection URI.
delete 	Deletes a resource. 	DELETE on a resource URI.
patch 	Update a resource, using Patch semantics. 	PATCH on a resource URI.
update 	Update a resource. 	PUT on a resource URI.

The table below shows which methods are supported by each resource type. All list and get operations on private blogs require authentication.
Resource Type
	
Supported Methods
	list 	get 	getByUrl 	getByPath 	listByUser 	search 	insert 	delete 	patch 	update
Blogs 	no 	yes 	yes 	no 	yes 	no 	no 	no 	no 	no
Posts 	yes 	yes 	no 	yes 	no 	yes 	yes 	yes 	yes 	yes
Comments 	yes 	yes 	no 	no 	no 	no 	no 	no 	no 	no
Pages 	yes 	yes 	no 	no 	no 	no 	no 	no 	no 	no
Users 	no 	yes 	no 	no 	no 	no 	no 	no 	no 	no
Calling styles

There are several ways to invoke the API:

    Using REST directly or from JavaScript (no server-side code required)
    Using the client libraries.

REST

REST is a style of software architecture that provides a convenient and consistent approach to requesting and modifying data.

The term REST is short for "Representational State Transfer." In the context of Google APIs, it refers to using HTTP verbs to retrieve and modify representations of data stored by Google.

In a RESTful system, resources are stored in a data store; a client sends a request that the server perform a particular action (such as creating, retrieving, updating, or deleting a resource), and the server performs the action and sends a response, often in the form of a representation of the specified resource.

In Google's RESTful APIs, the client specifies an action using an HTTP verb such as POST, GET, PUT, or DELETE. It specifies a resource by a globally-unique URI of the following form:

https://www.googleapis.com/apiName/apiVersion/resourcePath?parameters

Because all API resources have unique HTTP-accessible URIs, REST enables data caching and is optimized to work with the web's distributed infrastructure.

You may find the method definitions in the HTTP 1.1 standards documentation useful; they include specifications for GET, POST, PUT, and DELETE.
REST in the Blogger API

The supported Blogger operations map directly to REST HTTP verbs, as described in Blogger API operations.

The specific format for Blogger API URIs are:

https://www.googleapis.com/blogger/v3/users/userId
https://www.googleapis.com/blogger/v3/users/self
https://www.googleapis.com/blogger/v3/users/userId/blogs
https://www.googleapis.com/blogger/v3/users/self/blogs
https://www.googleapis.com/blogger/v3/blogs/blogId
https://www.googleapis.com/blogger/v3/blogs/byurl
https://www.googleapis.com/blogger/v3/blogs/blogId/posts
https://www.googleapis.com/blogger/v3/blogs/blogId/posts/bypath
https://www.googleapis.com/blogger/v3/blogs/blogId/posts/search
https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId
https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId/comments
https://www.googleapis.com/blogger/v3/blogs/blogId/posts/postId/comments/commentId
https://www.googleapis.com/blogger/v3/blogs/blogId/pages
https://www.googleapis.com/blogger/v3/blogs/blogId/pages/pageId

The full explanation of URIs used and the results for each supported operation in the API is summarized in the Blogger API Reference document.
Examples

List the blogs that the authenticated user has access rights to:

GET https://www.googleapis.com/blogger/v3/users/self/blogs?key=YOUR-API-KEY

Get the posts on the code.blogger.com blog, which has blog ID 3213900:

GET https://www.googleapis.com/blogger/v3/blogs/3213900?key=YOUR-API-KEY

REST from JavaScript

You can invoke the Blogger API from JavaScript, using the callback query parameter and by providing a callback function. When the browser loads the script, the callback function is executed and the response is provided to the callback function. This approach allows you to write rich applications that display Blogger data without requiring server side code.

The following example retrieves a post from the code.blogger.com blog, after you replace YOUR-API-KEY with your API key.

<html>
  <head>
    <title>Blogger API Example</title>
  </head>
  <body>
    <div id="content"></div>
    <script>
      function handleResponse(response) {
        document.getElementById("content").innerHTML += "<h1>" + response.title + "</h1>" + response.content;
      }
    </script>
    <script
    src="https://www.googleapis.com/blogger/v3/blogs/3213900/posts/8398240586497962757?callback=handleResponse&key=YOUR-API-KEY

"></script>
  </body>
</html>

Data format
JSON

JSON (JavaScript Object Notation) is a common, language-independent data format that provides a simple text representation of arbitrary data structures. For more information, see json.org.

Was this helpful?