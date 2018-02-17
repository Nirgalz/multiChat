"use strict"

//temporary parent message management
var parentMessageId = null;

function getParentMessageId() {
    if (parentMessageId !== null) {
        var result = parentMessageId;
        parentMessageId = null;
        return result;
    } else {
        return null;
    }
}

//
// Tools
//


//return UNIX date
function getDate() {
    return new Date().getTime();
}

//generates unique UUID
function generateMessageId(author, message) {
    //TODO better UUID
    return getDate() + "_" + author + "_" + message.substr(2, 5) + "_" + Math.random().toString(36).substr(2, 9);
}


//gives a random color for each user
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