function getQuestionData(questionKey, place, overallRating) {
    const questionsData = {
        "hello": {
            text: "Hello! Thanks for clicking get started. Would you like to leave a review or chat to us?",
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
        },
        "visited": {text: "\n" +
                "You can abandon the review at any time by typing STOP. \n" +
                "Typing SUBMIT at any time will submit your review.\n" +
                "Please can start by telling us the name of place that you visited?"},
        "city": {text: "Ok, great! Can you confirm which town or city " + place + " is in?"},
        "image": {
            text: "Do you have any photos or images you'd like to upload with your review?\n" +
                "By uploading images you agree that you are the creator and owner of the content you upload and that you are happy for the images to be used by Euan’s Guide.",
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
        },
        "image2": {
            text: "Do you have any more photos or images you'd like to upload?",
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
        },
        "upload-image": {text: "Great, to select an image to attach, click on the picture icon in the bottom left corner of the messenger and send it."},
        "title": {text: "Thanks! Now, what would you like to title your review? This will be the first thing people will see. \n " +
                "An example might be \"Accessible Museum in the heart of London\" or \"Great accessible cafe with delicious cakes!\""},
        "disabled-rating": {
            text: "Great title! \n" +
                "\n" +
                "Now for a rating... Out of 5, where 5 is great and 1 is bad, how would you rate the disabled access overall?",
            quick_replies: ratings
        },
        "disabled-summary": {text: "People are going to love reading about  " + place + "?"},
        "continue-or-finish": {
            text: "Thank you very much, your review is nearly complete!",
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
        },
        "transport": {
            text: "We'll start with Getting There. Would you like to add any information on parking or transport?",
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
        },
        "transport-rating": {
            text: "Ok, great! Let's start with a rating, again out of 5.",
            quick_replies: ratings
        },
        "transport-summary": {text: "Awesome! Could you give us some more information?"},
        "access": {
            text: "Thank You! Now onto getting in and around " + place + ". Is there anything specific about Disabled Access you would like to add?",
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
        },
        "access-rating": {
            text: "Ok, great! Let's start with a rating, again out of 5 for getting in and around.",
            quick_replies: ratings
        },
        "view": {text: "Great! Could you give us some more information on what you noticed about " + place + "?"},
        "toilet": {
            text: "Now, onto toilets. Our users consistently tell us how important both accessible toilets and information about toilets is. Are you able to tell us anything about the toilets at " + place + "?",
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
        },
        "toilet-rating": {
            text: "Ok, great! Let's start with a rating, again out of 5 for toilet accessibility.",
            quick_replies: ratings
        },
        "toilet-summary": {text: "Would you be able to provide some more details about the toilets?"},
        "staff": {
            text: "Now we come to staff. " + "Would you like to add any further information about the people you came across at " + place + "?",
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
        },
        "staff-rating":  {
            text: "Ok, great! Let's start with a rating, again out of 5 for staff.",
            quick_replies: ratings
        },
        "staff-summary": {text: "Would you be able to provide some more details about the staff?"},
        "end": {
            text: "Thank you for your review - it's great. We'll send you a message when it has gone live! :)",
            quick_replies: [
                {
                    content_type: "text",
                    title: "Start another review",
                    payload: "review"
                }
            ]
        },
        "stop": {
            text: "Review stopped",
            quick_replies: [
                {
                    content_type: "text",
                    title: "Start another review",
                    payload: "review"
                }
            ]
        }
    };
    return questionsData[questionKey];
}