const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN,
request = require("request"),
nodemailer = require("nodemailer"),
questions = require("../questions");

class chatBot {
  constructor (userId) {
    this.userId = userId;
    this.userAnswers = {};
    this.currentQuestion = "";
    this.currentQuestionData = null;
    this.place = "";
    this.rating = "";
    this.images = [];
    this.submitAllowed = false;
    this.photosLater = false;
    this.stop_question = "";
    this.tempAnswer = {};
  }

  isEmpty(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key))
      return false;
    }
    return true;
  }

  reset() {
    if (this.userAnswers["username"])
      this.tempAnswer["username"] = this.userAnswers["username"];
    else if (this.userAnswers["new-user"])
      this.tempAnswer["new-user"] = this.userAnswers["new-user"];
    this.userAnswers = this.tempAnswer;
    this.tempAnswer = {};
    this.images = [];
    this.submitAllowed = false;
    this.photosLater = false;
    this.stop_question = "";
  }

  endReview() {
    this.currentQuestion = "end";
    this.sendEmail(this.userAnswers);
    this.reset();
  }

  setStartPoint() {
    console.log("start point",this.userAnswers);
    if (this.isEmpty(this.userAnswers))
      this.currentQuestion = "account";
    else
      this.currentQuestion = "visited";
  }

  checkSkip(message) {
    return message.text.slice(0, 4) === "Skip";
  }

  isARatingNumber(text) {
    return (!isNaN(text))&&(text >= 0)&&(text <= 5);
  }

  handleMessage(received_message){
    if (received_message.is_echo === true) {
      return null;
    } else if (received_message.text && received_message.text.toLowerCase() === "stop") {
      this.stop_question = this.currentQuestion;
      this.currentQuestion = "user-stop";
    } else if (received_message.text && received_message.text.toLowerCase() === "submit" && this.submitAllowed) {
      this.currentQuestion = "user-submit";
    }

    let attachment_url = null;
    let attachment_response = null;

    switch (this.currentQuestion){
      case "hello":
        if (received_message.text === "Review!")
          this.currentQuestion = "account";
        else if (received_message.text === "Chat!")
          this.currentQuestion = "chat";
        break;
      case "chat":
        if (received_message.text === "Start a new review") {
          this.reset();
          this.currentQuestion = "account";
        } else {
          this.currentQuestion = "stop-end";
        }
        break;
      case "account":
        if (received_message.text.includes("No"))
          this.currentQuestion = "new-user";
        else
          this.currentQuestion = "username";
        break;
      case "username":
      case "new-user": this.currentQuestion = "visited";
        break;
      case "visited":
        this.place = received_message.text;
        this.currentQuestion = "city";
        break;
      case "city": this.currentQuestion = "image";
        break;
      case "image":
      case "image2":
        if (["Upload photos now", "Yes!"].includes(received_message.text))
          this.currentQuestion = "upload-image";
        else if (this.photosLater) {
          this.endReview();
          this.currentQuestion = "end";
        }
        else {
          if (received_message.text.includes("later")) {
            this.photosLater = true;
            questions.changeShowUpload();
          }
          this.currentQuestion = "title";
        }
        break;
      case "upload-image":
        if (received_message.attachments) {
          attachment_response = this.handleAttachment(received_message);
        }
        break;
      case "title": this.currentQuestion = "overall-rating";
        break;
      case "overall-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "overall-summary";
        }
        break;
      case "overall-summary": this.currentQuestion = "continue-or-finish";
        break;
      case "continue-or-finish":
        this.submitAllowed = true;
        if (received_message.text === "Add more information")
          this.currentQuestion = "transport";
        else
          this.endReview();
        break;
      case "transport":
        if (this.checkSkip(received_message))
          this.currentQuestion = "access";
        else
          this.currentQuestion = "transport-rating";
        break;
      case "transport-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "transport-summary";
        }
        break;
      case "transport-summary": this.currentQuestion = "access";
        break;
      case "access":
        if (this.checkSkip(received_message))
          this.currentQuestion = "toilet";
        else
          this.currentQuestion = "access-rating";
        break;
      case "access-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "access-summary";
        }
        break;
      case "access-summary": this.currentQuestion = "toilet";
        break;
      case "toilet":
        if (this.checkSkip(received_message))
          this.currentQuestion = "staff";
        else
          this.currentQuestion = "toilet-rating";
        break;
      case "toilet-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "toilet-summary";
        }
        break;
      case "toilet-summary": this.currentQuestion = "staff";
        break;
      case "staff":
        if (this.checkSkip(received_message))
          this.currentQuestion = "anything-else";
        else
          this.currentQuestion = "staff-rating";
        break;
      case "staff-rating":
        if (this.isARatingNumber(received_message.text)) {
          this.rating = received_message.text;
          this.currentQuestion = "staff-summary";
        }
        break;
      case "staff-summary": this.currentQuestion = "anything-else";
        break;
      case "anything-else":
        if (this.photosLater)
          this.currentQuestion = "image-last";
        else
          this.endReview();
        break;
      case "image-last":
        if (received_message.text.slice(0, 6) === "Submit")
          this.endReview();
        else
          this.currentQuestion = "upload-image";
        break;
      case "user-stop": this.currentQuestion = "stop";
        break;
      case "stop":
        if (received_message.text === "Continue my review") {
          this.currentQuestion = this.stop_question;
        }
        else if (received_message.text === "Submit my review") {
          if (this.submitAllowed) {
            this.endReview()
          }
          else {
            this.currentQuestion = "stop-end";
          }
        }
        else if (received_message.text === "Abandon my review") {
          this.currentQuestion = "stop-end";
        }
        break;
      case "end":
      case "stop-end":
        if (received_message.text === "Chat to us") {
          this.reset();
          this.currentQuestion = "chat";
        } else {
          this.reset();
          this.setStartPoint();
        }
        break;
      case "user-submit": this.endReview();
        break;
    }

    if (attachment_response != null)
      this.currentQuestionData = attachment_response;
    else
      this.currentQuestionData = questions.getQuestionData(this.currentQuestion, this.place, this.rating);

    console.log("currentQuestion:", this.currentQuestion, "currentQuestionData:", this.currentQuestionData, "attachment_url:", attachment_url);
    this.callSendAPI(this.currentQuestionData);
  }

  handlePostback(received_postback) {
    let response;
    let payload = received_postback.payload;
    console.log("Postback payload:", payload);

    if (payload === "Get Started") {
      response = questions.getQuestionData("hello");
      this.currentQuestion = "hello";
    } else if (payload === "yes") {
      response = questions.getQuestionData("image2");
      this.currentQuestion = "image2";
      console.log("response:",response);
    } else if (payload === "no") {
      this.images.pop();
      response = {text: "Please try to submit the image again."};
    }
    // Send the message to acknowledge the postback
    // setCurrentQuestion(response);
    this.callSendAPI(response);
  }

  callSendAPI(response) {
    if (this.currentQuestion === "delete") {
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
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ACCOUNT,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_ACCOUNT,
      to: process.env.EMAIL_RECIPIENT,
      subject: "Facebook review title: " + title,
      text: review,
      attachments: this.images
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

  handleAttachment(received_message) {
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

  formatBody(string) {
    const filterArray = ["hello :", "image :", "image2 :", "image-last :", "continue-or-finish :", "transport :", "access :", "toilet :", "staff :", "end :", "stop: ", ": Skip"];
    let formattedString = string.split("\n");

    formattedString = formattedString.filter(str => !filterArray.some(substring => str.includes(substring)));

    formattedString = formattedString.join("\n");

    return formattedString;
  }
}

module.exports = chatBot;
