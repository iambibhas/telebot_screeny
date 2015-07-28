var Bot = require('node-telegram-bot'),
    webshot = require('webshot'),
    url = require('valid-url'),
    md5 = require('md5'),
    fs = require('fs');
    pg = require('pg');

var conn_string = ["postgres://", process.env.PG_USERNAME, ":", process.env.PG_PASS, "@localhost/", process.env.PG_DBNAME].join('');
console.log(conn_string);

var user_agents = [
    // Chrome
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2224.3 Safari/537.36',

    // Firefox
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0',
    'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0',

    // Chromium
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/43.0.2357.130 Chrome/43.0.2357.130 Safari/537.36',
];

var send_message = function(bot, message, text) {
    // sends a text message
    bot.sendMessage({
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        text: text
    });
}

var send_photo = function(bot, message, file_location) {
    // sends a photo, with the chat action "Sending photo >>>"
    bot.sendChatAction({
        chat_id: message.chat.id,
        action: 'upload_photo'
    });

    bot.sendPhoto({
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id,
        files: {
            photo: file_location
        }
    }, function (err, msg) {
        console.log(err);
        console.log(msg);
    });
}

var webshot_options = {
    // pick a random user agent
    user_agent: user_agents[Math.floor(Math.random()*user_agents.length)],
    // we don't need high quality photos
    quality: 50,
    phantomConfig: {
        'ssl-protocol': 'any',
        'ignore-ssl-errors': 'yes',
        'web-security': 'false'
    }
}

var bot = new Bot({
    token: process.env.SCREENYBOT_TOKEN
})
.on('message', function (message) {
    console.log(message);

    if (message.text === undefined) {
        return;
    }
    var message_text = message.text.toLowerCase();

    // if the message starts with /screeny command, ignore it
    if (message_text.lastIndexOf('/screeny', 0) === 0) {
        message_text = message_text.replace('/screeny', '').trim()
    }
    // if the message starts with @screenybot, ignore it
    if (message_text.lastIndexOf('@screenybot', 0) === 0) {
        message_text = message_text.replace('@screenybot', '').trim()
    }

    if (!message_text) {
        // if the message was only "/screeny"
        return;
    }

    if (message_text.lastIndexOf('http', 0) < 0) {
        // if the url doesn't have a protocol, assume http
        message_text = 'http://' + message_text;
    }

    console.log(message_text);

    // check if the url was actually a valid url
    if (!url.isWebUri(message_text)) {
        send_message(bot, message, 'Sorry, That does not look like a valid url.');
        return;
    }

    // generate file name and location
    var hash = md5(message_text);
    var file_location = './screenies/' + hash + '.jpg';

    pg.connect(conn_string, function(err, client, done) {
        if(err) {
            return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO log(url, hash) values($1, $2)', [message_text, hash], function(err, result) {
            //call `done()` to release the client back to the pool
            done();

            if(err) {
                return console.error('error running query', err);
            }

            console.log('result', result);
        });
    });

    // If a screenshot already exists for the given url's hash, return it
    if (fs.existsSync(file_location)) {
        send_photo(bot, message, file_location);

        console.log('Not Calling Webshot!!');
        return;
    }

    // fetch screenshot, save it and return
    webshot(message_text, file_location, webshot_options, function(err) {
        console.log(err);
        if (err !== null) {
            // there was an error
            send_message(bot, message, 'Sorry, could not take a screenshot of that. :(');
        } else {
            send_photo(bot, message, file_location);
        }
    });
})
.start();
