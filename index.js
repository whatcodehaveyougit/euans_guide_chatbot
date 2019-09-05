"use strict";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  fs = require("fs"),
  app = express().use(body_parser.json()); // creates express http server

const nodemailer = require('nodemailer');

let currentQuestion = "";
let currentQuestionData = null;
let place;
let overallRating;
let userAnswers = {};
let images = [];

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

function getQuestionData(questionKey, place, overallRating) {
    const questionsData = {
        "hello": {text: `Hello! Thanks for clicking get started. Would you like to leave a review or chat to us?`,
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
                ]},
        "visited": {text: "Can you confirm the name of the place you visited?"},
        "city": {text: "Ok, great! Can you confirm which town or city " + place + " is in?"},
		"image": {text: "Do you have any photos or images you'd like to upload?",
		quick_replies: [
                    {
                        content_type: "text",
                        title: "Yes!",
                        payload: "yes"
                    },
                    {
                        content_type: "text",
                        title: "No!",
                        payload: "no"
                    }
                ]},
		"image2": {text: "Do you have any more photos or images you'd like to upload?",
		quick_replies: [
                    {
                        content_type: "text",
                        title: "Yes!",
                        payload: "yes"
                    },
                    {
                        content_type: "text",
                        title: "No!",
                        payload: "no"
                    }
                ]},
		"upload-image": {text: "Great, to select an image to attach, click on the picture icon in the bottom left corner of the messenger and send it."
		},
        "title": {text: "Great! Now, what would you like to title your review?"},
		"disabled-rating": {text: "Great Title! Now for a rating, how would you rate the disabled access overall?", 
		quick_replies: ratings},
		"disabled-summary": {text: "You've given a rating of " + overallRating + ". Could you summarize your experience at " + place + "?"},
		"continue-or-finish": {text:"Thank you very much, your review is nearly complete!",			quick_replies: [
			{
			  content_type: "text",
			  title: "Continue",
			  payload: "continue_option_question"
			},
			{
			  content_type: "text",
			  title: "Finish",
			  payload: "finish_option_question"
			}
		  ]},
		"transport": {text: "We'll start with Getting There. Would you like to add any information on parking or transport?",       
		quick_replies: [
			{
			  content_type: "text",
			  title: "Yes",
			  payload: "yes_get_there"
			},
			{
			  content_type: "text",
			  title: "Skip",
			  payload: "skip_get_there"
			}
		  ]},
		"transport-rating": {text:"Ok, great! Let's start with a rating, again out of 5.", 
		quick_replies: ratings},
		"transport-summary": {text: "Awesome! Could you give us some more information?"},
		"access": {text: "Thank You! Now onto getting in and around " + place + ". Is there anything specific about Disabled Access you would like to add?",
		quick_replies: [
			{
			  content_type: "text",
			  title: "Yes",
			  payload: "yes_disabled_access"
			},
			{
			  content_type: "text",
			  title: "Skip",
			  payload: "skip_disabled_access"
			}
		  ]},
		"access-rating": {text: "Ok, great! Let's start with a rating, again out of 5 for getting in and around.", 
		quick_replies: ratings},
        "view": {text: "Great! Could you give us some more information on what you noticed about " + place + "?"}, 
		"toilet": {text: "Now, onto toilets. Our users consistently tell us how important both accessible toilets and information about toilets is. Are you able to tell us anything about the toilets at" + place + "?",
		quick_replies: [
			{
			  content_type: "text",
			  title: "Yes",
			  payload: "yes_disabled_access"
			},
			{
			  content_type: "text",
			  title: "Skip",
			  payload: "skip_disabled_access"
			}
		  ]},
		"toilet-rating": {text: "Ok, great! Let's start with a rating, again out of 5 for toilet accessibility.",
		quick_replies: ratings},
        "toilet-summary": {text: "Would you be able to provide some more details about the toilets?"},
        "staff": {text: "Now we come to staff. " +
				"Would you like to add any further information about the people you came across at" + place + "?",       
				quick_replies: [
					{
					  content_type: "text",
					  title: "Yes",
					  payload: "yes_disabled_access"
					},
					{
					  content_type: "text",
					  title: "Skip",
					  payload: "skip_disabled_access"
					}
				  ]},
		"staff-rating":  {text: "Ok, great! Let's start with a rating, again out of 5 for staff.", quick_replies: ratings},
		"staff-summary": {text: "Would you be able to provide some more details about the staff?"},
		"end": {text:"Thank you for your review - it's great. We'll send you a message when it has gone live! :)"}
		
    };
    return questionsData[questionKey];
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

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message || webhook_event.attachments) {
        userAnswers[currentQuestion] = webhook_event.message.text;
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        userAnswers[currentQuestion] = webhook_event.postback.text;
        handlePostback(sender_psid, webhook_event.postback);
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

function handleMessage(sender_psid,received_message){
	if (received_message.is_echo===true)
		return null;
	
	let attachment_url = null
	let attachment_response = null

	switch (currentQuestion){
		case "hello":
			if (received_message.text===`Review!`)
				currentQuestion="visited" 
			break;
		case "visited":
			place = received_message.text;
			currentQuestion="city"
			break;
		case "city": currentQuestion="image"
			break;
		case "image":
		case "image2":
			if (received_message.text === "Yes!" )
				currentQuestion="upload-image"
			else 
				currentQuestion="title"
		break;
		case "upload-image":
			if (received_message.attachments){
				handleAttachment()
			}
			break;
		case "title": currentQuestion="disabled-rating"
			break;
		case "disabled-rating":	
			overallRating = received_message.text;	
			currentQuestion="disabled-summary"	
			break;
		case "disabled-summary": currentQuestion="continue-or-finish"
			break;
		case "continue-or-finish": 
			if (received_message.text === "Continue")
				currentQuestion="transport"
			else
				currentQuestion="end";
			break;
		case "transport": 
			if (received_message.text === "Skip")
				currentQuestion="access"
			else
				currentQuestion="transport-rating"
			break;
		case "transport-rating": currentQuestion="transport-summary"
			break;
		case "transport-summary": currentQuestion="access"
			break;
		case "access":
			if (received_message.text === "Skip")
				currentQuestion="toilet"
			else
				currentQuestion="access-rating"
			break;
		case "access-rating": currentQuestion="view"
			break;
		case "toilet":	currentQuestion="toilet-rating"
			break;
		case "toilet-rating": currentQuestion="toilet-summary"
			break;
		case "toilet-summary": currentQuestion="staff"
			break;
		case "staff": 
			if (received_message.text === "Skip")
				currentQuestion="end"
			else
				currentQuestion="staff-rating"
			break;
		case "staff-rating": currentQuestion="staff-summary"
			break;
		case "staff-summary":
			currentQuestion="end"
			finish(sender_psid)
			sendEmail(userAnswers);
		break;

	///disabled summary needs overallRating = received_message.text;
		}

	if (attachment_response!=null)
		currentQuestionData=attachment_response
	else
		currentQuestionData=getQuestionData(currentQuestion,place,overallRating);

	console.log("currentQuestion:",currentQuestion,"currentQuestionData:",currentQuestionData,"attachment_url:",attachment_url);
	callSendAPI(sender_psid, currentQuestionData);
}

function handleMessageOld(sender_psid, received_message) {
  if (
    received_message.text !== currentQuestion &&
    currentQuestion === questions(0, place, overallRating) &&
    received_message.text === `Review!`
  ) {
    handleResponse = {
      text: questions(1, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text !== currentQuestion &&
    currentQuestion === questions(1, place, overallRating)
  ) {
    place = received_message.text;
    handleResponse = {
      text: questions(2, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text !== currentQuestion &&
    currentQuestion === questions(2, place, overallRating)
  ) {
    handleResponse = {
      text: questions(3, place, overallRating),
      quick_replies: [
        {
          content_type: "text",
          title: "Yes!",
          payload: "yes"
        },
        {
          content_type: "text",
          title: "No!",
          payload: "no"
        }
      ]
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text === "No!" &&
    received_message.text !== currentQuestion &&
    (currentQuestion === questions(3, place, overallRating) ||
      currentQuestion === questions(4, place, overallRating))
  ) {
    handleResponse = {
      text: questions(6, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text === "Yes!" &&
    received_message.text !== currentQuestion &&
    (currentQuestion === questions(3, place, overallRating) ||
      currentQuestion === questions(4, place, overallRating))
  ) {
    handleResponse = {
      text: questions(5, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.attachments &&
    currentQuestion === questions(5, place, overallRating) &&
    received_message.text !== currentQuestion
  ) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    images.push({path: attachment_url});
    handleResponse = {
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
  } else if (
    received_message.text !== currentQuestion &&
    currentQuestion === questions(6, place, overallRating)
  ) {
    handleResponse = {
      text: questions(7, place, overallRating),
      quick_replies: ratings
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text === "1" || "2" || "3" || "4" || "5") &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(7, place, overallRating)
  ) {
    overallRating = received_message.text;
    handleResponse = {
      text: questions(8, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text !== currentQuestion &&
    currentQuestion === questions(8, place, overallRating)
  ) {
    handleResponse = {
      text: `Thank you very much your review is nearly complete!`,
      quick_replies: [
        {
          content_type: "text",
          title: "Continue",
          payload: "continue_option_question"
        },
        {
          content_type: "text",
          title: "Finish",
          payload: "finish_option_question"
        }
      ]
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text === "Finish" &&
    received_message.text !== currentQuestion &&
    currentQuestion === `Thank you very much your review is nearly complete!`
  ) {
    handleResponse = {
      text: `Thank you for your review - it's great. We'll send you a message when it has gone live! :)`
    };
    currentQuestion = handleResponse["text"];
    finish(sender_psid)
    sendEmail(userAnswers);
  } else if (
    received_message.text === "Continue" &&
    received_message.text !== currentQuestion &&
    currentQuestion === `Thank you very much your review is nearly complete!`
  ) {
    handleResponse = {
      text: questions(9, place, overallRating),
      quick_replies: [
        {
          content_type: "text",
          title: "Yes",
          payload: "yes_get_there"
        },
        {
          content_type: "text",
          title: "Skip",
          payload: "skip_get_there"
        }
      ]
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text === "Yes" &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(9, place, overallRating)
  ) {
    handleResponse = {
      text: questions(10, place, overallRating),
      quick_replies: ratings
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text === "1" || "2" || "3" || "4" || "5") &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(10, place, overallRating)
  ) {
    handleResponse = {
      text: questions(11, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text || received_message.text === "Skip") &&
    received_message.text !== currentQuestion &&
    (currentQuestion === questions(11, place, overallRating) ||
      currentQuestion === questions(9, place, overallRating))
  ) {
    handleResponse = {
      text: questions(12, place, overallRating),
      quick_replies: [
        {
          content_type: "text",
          title: "Yes",
          payload: "yes_disabled_access"
        },
        {
          content_type: "text",
          title: "Skip",
          payload: "skip_disabled_access"
        }
      ]
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text === "Yes" &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(12, place, overallRating)
  ) {
    handleResponse = {
      text: questions(13, place, overallRating),
      quick_replies: ratings
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text === "1" || "2" || "3" || "4" || "5") &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(13, place, overallRating)
  ) {
    handleResponse = {
      text: questions(14, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text || received_message.text === "Skip") &&
    received_message.text !== currentQuestion &&
    (currentQuestion === questions(14, place, overallRating) ||
      currentQuestion === questions(12, place, overallRating))
  ) {
    {
      handleResponse = {
        text: questions(15, place, overallRating),
        quick_replies: [
          {
            content_type: "text",
            title: "Yes",
            payload: "yes_disabled_access"
          },
          {
            content_type: "text",
            title: "Skip",
            payload: "skip_disabled_access"
          }
        ]
      };
      currentQuestion = handleResponse["text"];
    }
  } else if (
    received_message.text === "Yes" &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(15, place, overallRating)
  ) {
    handleResponse = {
      text: questions(16, place, overallRating),
      quick_replies: ratings
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text === "1" || "2" || "3" || "4" || "5") &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(16, place, overallRating)
  ) {
    handleResponse = {
      text: questions(17, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text || received_message.text === "Skip") &&
    received_message.text !== currentQuestion &&
    (currentQuestion === questions(15, place, overallRating) ||
      currentQuestion === questions(17, place, overallRating))
  ) {
    handleResponse = {
      text: questions(18, place, overallRating),
      quick_replies: [
        {
          content_type: "text",
          title: "Yes",
          payload: "yes_disabled_access"
        },
        {
          content_type: "text",
          title: "Skip",
          payload: "skip_disabled_access"
        }
      ]
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text === "Yes" &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(18, place, overallRating)
  ) {
    handleResponse = {
      text: questions(19, place, overallRating),
      quick_replies: ratings
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text === "1" || "2" || "3" || "4" || "5") &&
    received_message.text !== currentQuestion &&
    currentQuestion === questions(19, place, overallRating)
  ) {
    handleResponse = {
      text: questions(20, place, overallRating)
    };
    currentQuestion = handleResponse["text"];
  } else if (
    (received_message.text || received_message.text === "Skip") &&
    received_message.text !== currentQuestion &&
    (currentQuestion === questions(18, place, overallRating) ||
      currentQuestion === questions(20, place, overallRating))
  ) {
    handleResponse = {
      text: `Thank you for your review - it's great. We'll send you a message when it has gone live! :)`
    };
    currentQuestion = handleResponse["text"];
    finish(sender_psid)
    sendEmail(userAnswers);
  } else if (
    received_message.text !== currentQuestion &&
    currentQuestion === questions(0, place, overallRating) &&
    received_message.text === "Chat!"
  ) {
    handleResponse = {
      text: `No problem! Leave us a message and we will get back to you as soon as possible!`
    };
    currentQuestion = handleResponse["text"];
  } else if (
    received_message.text !== currentQuestion &&
    (currentQuestion ===
      `Thank you for your review - it's great. We'll send you a message when it has gone live! :)` ||
      currentQuestion ===
        `No problem! Leave us a message and we will get back to you as soon as possible!`)
  ) {
    handleResponse = {
      text: `Uh oh. Something's went wrong. Try deleting the chat and starting again. Sorry!`
    };
    currentQuestion = handleResponse["text"];
  }

  // Send the response message
  callSendAPI(sender_psid, handleResponse);
}

function handlePostback(sender_psid, received_postback) {
  let response;
  let payload = received_postback.payload;
  console.log("Postback payload:",payload)

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
    currentQuestion = "hello";
  } else if (payload === "yes") {
    response = getQuestionData("image2")
	currentQuestion = "image2"
	console.log("response:",response)
  } else if (payload === "no") {
    response = { text: "Oops, try sending another image." };
  }
  // Send the message to acknowledge the postback
  // setCurrentQuestion(response);
  callSendAPI(sender_psid, response);
}

function handleAttachment(){
	attachment_url = received_message.attachments[0].payload.url;
	images.push({path: attachment_url});
	attachment_response = {   
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

function callSendAPI(sender_psid, response) {
  if (
    currentQuestion ===
    `Uh oh. Something's went wrong. Try deleting the chat and starting again. Sorry!`
  ) {
    return null;
  }
  // Construct the message body
  let request_body = {
    recipient: {
      id: sender_psid
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

function sendEmail(review) {
  let reviewAsString = JSON.stringify(review);
  reviewAsString = reviewAsString.replace(/",/gi, "\n");
  reviewAsString = reviewAsString.replace(/"/gi, " ");
  reviewAsString = reviewAsString.replace(/{|}/gi, "");

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
    subject: 'Sending Review from Facebook bot',
    text: reviewAsString,
    attachments: images
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

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
