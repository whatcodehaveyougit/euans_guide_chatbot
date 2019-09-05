function questions(questionKey, place, overallRating) {
    const questionsArray = {
        "hello": {question: `Hello! Thanks for clicking get started. Would you like to leave a review or chat to us?`,
            response: {quick_replies: [
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
                ]}},
        "visited": {question: "Can you confirm the name of the place you visited?"},
        "city": {question: "Ok, great! Can you confirm which town or city " + place + "is in?"},
		"image": {question: "Do you have any photos or images you'd like to upload?",
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
		"image2": {question: "Do you have any more photos or images you'd like to upload?",
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
		"upload-image": {question: "Great, to select an image to attach, click on the picture icon in the bottom left corner of the messenger and send it.",
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
	
		},
        "title": {question: "Great! Now, what would you like to title your review?"},
        "disabled-rating": {question: "Great Title! Now for a rating, how would you rate the disabled access overall?", quick_replies: ratings},
		"disabled-summary": {question: "You've given a rating of ` + overallRating + `. Could you summarize your experience at" + place + "?"
		,quick_replies: [
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
		"transport": {question: "We'll start with Getting There. Would you like to add any information on parking or transport?",       
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
		"transport-rating": {question:"Ok, great! Let's start with a rating, again out of 5.", 
		quick_replies: ratings},
		"transport-summary": {question: "Awesome! Could you give us some more information?"},
        "access": {question: "Thank You! Now onto getting in and around` + place + `. Is there anything specific about Disabled Access you would like to add?", quick_replies: [
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
		"access-rating": {question: "Ok, great! Let's start with a rating, again out of 5 for getting in and around.", 
		quick_replies: ratings},
        "view": {question: "Great! Could you give us some more information on what you noticed about" + place + "?"}, 
        "toilet": {question: "Now, onto toilets. Our users consistently tell us how important both accessible toilets and information about toilets is. Are you able to tell us anything about the toilets at" + place + "?", quick_replies: [
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
        "toilet-rating": {question: "Ok, great! Let's start with a rating, again out of 5 for toilet accessibility.", quick_replies: ratings},
        "toilet-summary": {question: "Would you be able to provide some more details about the toilets?"},
        "staff": {question: "Now we come to staff. " +
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
            "staff-rating":  {question: "Ok, great! Let's start with a rating, again out of 5 for staff.", quick_replies: ratings},
        "staff-summary": {question: "Would you be able to provide some more details about the staff?"}
    };
    return questionsArray[questionKey];
}

function handleMessage (sender_psid, received_message) {

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
        finish(sender_psid);
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