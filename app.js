var Bot = require('node-telegram-bot'),
    webshot = require('webshot'),
    md5 = require('md5'),
    url = require('valid-url'),
    fs = require('fs');

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

var webshot_options = {
    user_agent: user_agents[Math.floor(Math.random()*user_agents.length)],
    quality: 50
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

    if (message_text.lastIndexOf('/screeny', 0) === 0) {
        message_text = message_text.replace('/screeny', '').trim()

        if (!message_text) {
            return;
        }
    }

    if (message_text.lastIndexOf('http', 0) < 0) {
        message_text = 'http://' + message_text;
    }

    if (!url.isWebUri(message_text)) {
        console.log(message_text);
        bot.sendMessage({
            chat_id: message.chat.id,
            reply_to_message_id: message.message_id,
            text: 'Sorry, That does not look like a valid url.'
        });
        return;
    }

    var hash = md5(message_text);
    var file_location = './screenies/' + hash + '.jpg';

    // If a screenshot already exists for the given url, return it
    if (fs.existsSync(file_location)) {
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

        console.log('Not Calling Webshot!!');
        return;
    }

    webshot(message_text, file_location, webshot_options, function(err) {
        console.log(err);
        if (err !== null) {
            bot.sendMessage({
                chat_id: message.chat.id,
                reply_to_message_id: message.message_id,
                text: 'Sorry, could not take a screenshot of that. :('
            });
        } else {
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
    });
})
.start();
