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

How to Run
===
 - Install all above dependencies
 - Make sure your OS user has write access to the bot's directory
 - Then run the bot like -

        $ SCREENYBOT_TOKEN='Your Token' node app.js


