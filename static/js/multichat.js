"use strict"

//temporary parent message management
var parentMessageId = null;

function getParentMessageId() {
    // retrieve value and set to null. If already null, returns null
    var result = parentMessageId;
    parentMessageId = null;
    return result;
}

//
// Tools
//


//return UNIX date
function getDate() {
    return new Date().getTime();
}

//generates unique UUID
function generateMessageId(author) {
    // date + author is enough to generate unique ID
    return getDate() + "_" + author;
}

//gives a random color for each user
function stringToColor(str) {
    return "#" + intToRGB(hashCode(str));
}
function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}
function intToRGB(i) {
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    var result = "00000".substring(0, 6 - c.length) + c;
    result.replace("F", "D")
        .replace("E", "C")
        .replace("0", "2")
        .replace("1", "3");
    return result;
}