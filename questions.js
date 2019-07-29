var place = require('./index')
console.log("hello", place)

let questionData = [
    "Can you confirm the name of the place you visited?",
    `Ok, great! Can you confirm which town or city ` + place + ` is in?`

]

module.exports = questionData;