Screeny
===

A Telegram Bot that generates screenshots of given URLs.

Features
===
 - Saves the screenshots with the md5 of the url as name
 - Checks if a screenshot already exists for given url. If it does, returns the existing screenshot. Delete the screenshots from the `screeny` directory to regenerate screenshots.

Dependencies
===

System level
---
 - NodeJS
 - PhantomJS

NodeJS level
---
 - node-telegram-bot
 - webshot
 - md5
 - valid-url
 - pg

PostgreSQL Table schema
===

    CREATE TABLE log (
        id serial PRIMARY KEY,
        url varchar(1000) NOT NULL,
        hash varchar(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

How to Run
===
 - Install all above dependencies by running `npm install`
 - Make sure your OS user has write access to the bot's directory
 - Then run the bot like -

        $ SCREENYBOT_TOKEN='Your Token' node app.js

 - If you'd like to log the urls to a postgresql db, use this -

        $ SCREENYBOT_TOKEN='Your Token' PG_USERNAME='username' PG_PASS='password' PG_DBNAME='databasename' node app.js

