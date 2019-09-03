const request = require("request");

let PAGE_ACCESS_TOKEN = "EAAEZBxZBsDMYYBAJPLwYYBncuKhIZCnAVq9GrZAhkD9EwKbISZBS30D2xmmqMqKzMnFx6UE80KFFmnZAkWuy832RoWAOLCHJnivAjcggKZAO3JYmjg9Va4nng6mi0Coz8ZCyW0W8qWN4DrCFtgrjB1PxjdZC0nURiBnZBFcOcfwDOeJBvZAsqzEMFbFBWiE7MAuVP0ZD";

let request_body = {
    recipient: {
        id: 2380436998703241
    },
    message: { text: "Hello." }
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