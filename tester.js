const request = require("request");

let PAGE_ACCESS_TOKEN = "EAAEZBxZBsDMYYBACP9Ad3JunylpiKVpm74ioDGHMTipjOZCtwgZBGYOiFz5bk4BTMT6eIToMZAzDWvFyf5OFVZAiD0egV2OmgSf9ZBaWZAPSnoE8nP78AA3OIz0fg45ei6HuXKQqZAnq7naf6BNdxbIBTilXpBCKqU2M5iFQ8UwFfV7urFQnOX8bnpkWhEUj6EK0ZD";

let request_body = {
    recipient: {
        id: 2380436998703241
    },
    message: { text: "Hello Apples." }
};

request(
    {
        uri: `https://graph.facebook.com/v4.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
        // qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        body: JSON.stringify(request_body),
        headers: { 'Content-Type': 'application/json'}
    },
    (err, res, body) => {
        if (!err) {
            console.log("message sent!", body);
        } else {
            console.error("Unable to send message:" + err);
        }
    }
);