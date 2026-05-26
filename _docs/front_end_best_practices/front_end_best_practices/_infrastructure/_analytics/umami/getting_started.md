https://umami.is/docs

Overview
Welcome to the Umami documentation!
What is Umami?

Umami is an open-source, privacy-focused web analytics tool that serves as an alternative to Google Analytics. It provides essential insights into website traffic, user behavior, and performance, all while prioritizing data privacy.

Unlike many traditional analytics platforms, Umami does not collect or store personal data, avoiding the need for cookies, and is GDPR and PECR compliant.

Designed to be lightweight and easy to set up, Umami can be self-hosted, giving users full control over their data.
Quickstart

To get Umami up and running you will need to:

    Install the application
    Log into the application
    Add a website
    Add the tracking code into your website HTML

Hosting

If you are unfamiliar with running your own servers, check out the Hosting section to get a quick overview.

There are also many services that will run Umami. See the Guides section.
Community

Need help getting started? Come join our community!

    GitHub
    Discord
    X

Frequently asked questions

1. Is Umami GDPR compliant?

Yes, Umami does not collect any personally identifiable information and anonymizes all data collected. Users cannot be identified and are never tracked across websites.

2. Do I need to display a cookie notice to users?

No, Umami does not use any cookies in the tracking code.

3. Does Umami work on a single page application (SPA)?

Yes, Umami works seamlessly between SPAs and normal websites.

4. Can Umami record events such as button clicks?

Yes, please see Track Events.


Installation

There are several different ways to install Umami.

    Installing from source: Get the code from GitHub and build the application yourself.
    Using Docker compose: Build your own Docker container using docker compose.
    Using a Docker image: Download a pre-built Docker image.

Installing from source
Requirements

    A server with Node.js version 18.18 or newer.
    A database. Umami supports MySQL (minimum v8.0) and PostgreSQL (minimum v12.14) databases.

Install Yarn

npm install -g yarn

Get the source code and install packages

git clone https://github.com/umami-software/umami.git
cd umami
yarn install

Configure Umami

Create an .env file with the following

DATABASE_URL={connection url}

The connection url is in the following format:

DATABASE_URL=postgresql://username:mypassword@localhost:5432/mydb

DATABASE_URL=mysql://username:mypassword@localhost:3306/mydb

Build the application

yarn build

The first time the build is run, it will create all the required database tables in your database. It will also create a login account with username admin and password umami.
Start the application

yarn start

By default this will launch the application on http://localhost:3000. You will need to either proxy requests from your web server or change the port to serve the application directly.
Running Umami

You can simply run yarn start to start Umami, but it's highly recommended you use a process manager like PM2 which will handle restarts for you.

To run with PM2:

yarn global add pm2
cd umami
pm2 start yarn --name umami -- start
pm2 startup
pm2 save

Installing with Docker

Umami ships with a docker compose that contains the application and a PostgreSQL database.

To build the Docker container and start up with a Postgres database, run:

docker-compose up -d

Alternatively, if you want to use prebuilt images, you can pull the Umami Docker image with PostgreSQL support:

docker pull docker.umami.is/umami-software/umami:postgresql-latest

Or with MySQL support:

docker pull docker.umami.is/umami-software/umami:mysql-latest

Getting started
Getting updates
Source code

In order to get the latest updates, first pull the changes from the Git repository:

git pull

Then install any new or updated dependencies:

yarn install

Rebuild the project:

yarn build

Finally, start the application:

yarn start

Docker

For Docker, simply pull the latest image for your database configuration.

PostgreSQL:

docker pull docker.umami.is/umami-software/umami:postgresql-latest

or MySQL:

docker pull docker.umami.is/umami-software/umami:mysql-latest