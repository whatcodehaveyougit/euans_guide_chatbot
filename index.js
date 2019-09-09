"use strict";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// Imports dependencies and set up http server
const request = require("request"),
express = require("express"),
body_parser = require("body-parser"),
fs = require("fs"),
app = express().use(body_parser.json()); // creates express http server

const nodemailer = require("nodemailer");

let botInstances = [];

const ratings = [
  {
    content_type: "text",
    title: "1",
    payload: "one"
  },
  {
    content_type: "text",
    title: "2",
    payload: "two"
  },
  {
    content_type: "text",
    title: "3",
    payload: "three"
  },
  {
    content_type: "text",
    title: "4",
    payload: "four"
  },
  {
    content_type: "text",
    title: "5",
    payload: "five"
  }
];

class chatBot {
  constructor (userId) {
    this.userId = userId;
    this.userAnswers = {};
    this.currentQuestion = "";
    this.currentQuestionData = null;
    this.place = "";
    this.overallRating = "";
    this.images = [];
  }

  handleMessage(received_message){
    if (received_message.is_echo === true) {
      return null;
    } else if (received_message.text.toLowerCase() === "stop") {
      this.currentQuestion = "user-stop";
    }

    let attachment_url = null;
    let attachment_response = null;

    switch (this.currentQuestion){
      case "hello":
        if (received_message.text === "Review!")
          this.currentQuestion="visited";
        break;
      case "visited":
        this.place = received_message.text;
        this.currentQuestion = "city";
        break;
      case "city": this.currentQuestion = "image";
        break;
      case "image":
      case "image2":
        if (received_message.text === "Yes!" )
          this.currentQuestion = "upload-image";
        else
          this.currentQuestion = "title";
        break;
      case "upload-image":
        if (received_message.attachments){
          attachment_response = this.handleAttachment(received_message)
        }
        break;
      case "title": this.currentQuestion = "disabled-rating";
        break;
      case "disabled-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.overallRating = received_message.text;
          this.currentQuestion = "disabled-summary";
        }
        break;
      case "disabled-summary": this.currentQuestion = "continue-or-finish";
        break;
      case "continue-or-finish":
        if (received_message.text === "Continue")
          this.currentQuestion = "transport";
        else {
          this.currentQuestion = "end";
          // finish(this.userId);
          this.sendEmail(this.userAnswers);
        }
        break;
      case "transport":
        if (received_message.text === "Skip")
          this.currentQuestion = "access";
        else
          this.currentQuestion = "transport-rating";
        break;
      case "transport-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.currentQuestion = "transport-summary";
        }
        break;
      case "transport-summary": this.currentQuestion = "access";
        break;
      case "access":
        if (received_message.text === "Skip")
          this.currentQuestion = "toilet";
        else
          this.currentQuestion = "access-rating";
        break;
      case "access-rating": this.currentQuestion="view";
        break;
      case "view": this.currentQuestion="toilet";
        break;
      case "toilet":
        if (received_message.text === "Skip")
          this.currentQuestion = "staff";
        else
          this.currentQuestion = "toilet-rating";
        break;
      case "toilet-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.currentQuestion = "toilet-summary";
        }
        break;
      case "toilet-summary": this.currentQuestion="staff";
        break;
      case "staff":
        if (received_message.text === "Skip"){
          this.currentQuestion="end";
          // finish(this.userId);
          this.sendEmail(this.userAnswers);
        }
        else
          this.currentQuestion = "staff-rating";
        break;
      case "staff-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.currentQuestion = "staff-summary";
        }
        break;
      case "staff-summary":
        this.currentQuestion = "end";
        // finish(this.userId);
        this.sendEmail(this.userAnswers);
        this.userAnswers = {};
        this.images = [];
        break;
      case "end":
        this.currentQuestion = "visited";
        break;
      case "user-stop":
        this.currentQuestion = "stop";
        break;
      case "stop":
        this.currentQuestion = "visited";
        break;

        ///disabled summary needs overallRating = received_message.text;
    }

    if (attachment_response!=null)
      this.currentQuestionData = attachment_response;
    else
      this.currentQuestionData = getQuestionData(this.currentQuestion,this.place,this.overallRating);

    console.log("currentQuestion:",this.currentQuestion, "currentQuestionData:", this.currentQuestionData,"attachment_url:",attachment_url);
    this.callSendAPI(this.currentQuestionData);
  }

  handlePostback(received_postback) {
    let response;
    let payload = received_postback.payload;
    console.log("Postback payload:", payload);

    if (payload === "Get Started") {
      response = {
        text: `Hello! Thanks for clicking get started. Would you like to leave a review or chat to us?`,
        quick_replies: [
          {
            content_type: "text",
            title: "Review!",
            payload: "review"
          },
          {
            content_type: "text",
            title: "Chat!",
            payload: "chat"
          }
        ]
      };
      this.currentQuestion = "hello";
    } else if (payload === "yes") {
      response = getQuestionData("image2");
      this.currentQuestion = "image2";
      console.log("response:",response)
    } else if (payload === "no") {
      response = { text: "Oops, try sending another image." };
    }
    // Send the message to acknowledge the postback
    // setCurrentQuestion(response);
    this.callSendAPI(response);
  }

  callSendAPI(response) {
    if (
        this.currentQuestion ===
        `Uh oh. Something's went wrong. Try deleting the chat and starting again. Sorry!`
    ) {
      return null;
    }
    // Construct the message body
    let request_body = {
      recipient: {
        id: this.userId
      },
      message: response
    };

    // Send the HTTP request to the Messenger Platform
    request(
        {
          uri: `https://graph.facebook.com/v4.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
          // qs: { access_token: PAGE_ACCESS_TOKEN },
          method: "POST",
          body: JSON.stringify(request_body),
          headers: { 'Content-Type': 'application/json'}
        },
        (err, res, body) => {
          if (err) {
            console.error("Unable to send message:" + err);
          } else if (body.includes("recipient_id")) {
            console.log("message sent!", body);
          }
        }
    );
  }

  sendEmail(reviewObject) {
    let reviewAsString = JSON.stringify(reviewObject);
    reviewAsString = reviewAsString.replace(/",/g, "\n");
    reviewAsString = reviewAsString.replace(/"/g, " ");
    reviewAsString = reviewAsString.replace(/{|}|\?/g, "");

    const review = this.formatBody(reviewAsString);

    const title = reviewObject["title"];

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_ACCOUNT,
      to: process.env.EMAIL_RECIPIENT,
      subject: 'Facebook review title: ' + title,
      text: review,
      attachments: this.images
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }

  handleAttachment(received_message){
    let attachment_url = received_message.attachments[0].payload.url;
    this.images.push({path: attachment_url});
    return {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Is this the right picture?",
              subtitle: "Tap a button to answer.",
              image_url: attachment_url,
              buttons: [
                {
                  type: "postback",
                  title: "Yes!",
                  payload: "yes"
                },
                {
                  type: "postback",
                  title: "No!",
                  payload: "no"
                }
              ]
            }
          ]
        }
      }
    };
  }

  isARatingNumber(text){
    return (!isNaN(text))&&(text >= 0)&&(text <= 5)
  }

  formatBody(string) {
    let formattedString = string.split("\n");
    formattedString.shift();

    formattedString = formattedString.filter(str => !(str.includes("image :") || str.includes("image2 :") || str.includes("continue-or-finish :") || str.includes("transport :") || str.includes("access :") || str.includes("toilet :") || str.includes("staff :") || str.includes("end :")));

    formattedString = formattedString.join("\n");

    return formattedString;
  }
}

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    body.entry.forEach(function(entry) {
      // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      let currentBot = botInstances.find(bot => bot.userId === sender_psid);

      if (!currentBot) {
        currentBot = new chatBot(sender_psid);
        botInstances.push(currentBot)
      }

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message || webhook_event.attachments) {
        currentBot.userAnswers[currentBot.currentQuestion] = webhook_event.message.text;
        currentBot.handleMessage(webhook_event.message);
      } else if (webhook_event.postback) {
        currentBot.userAnswers[currentBot.currentQuestion] = webhook_event.postback.text;
        currentBot.handlePostback(webhook_event.postback);
      }
    });
    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFICATION_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

function finish(sender_psid) {
  console.log("Users answers: ", userAnswers);
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();
  let hour = String(today.getHours()).padStart(2, '0');
  let minute = String(today.getMinutes()).padStart(2, '0');
  let date = dd + "-" + mm + "-" + yyyy + "-" + hour + ":" + minute;

  fs.writeFile(`${sender_psid}_${date}.JSON`, userAnswers, err => {console.error()});
}
