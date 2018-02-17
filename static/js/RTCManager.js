"use strict"


//
//easyRTC stuff
//
var selfEasyrtcid = "";

var room = "default";


//At connection, sets up RTC listeners and connects
function connect() {
    connectToRoom(room);
    easyrtc.setPeerListener(addToRoom);
    easyrtc.setRoomOccupantListener(generateRoomOccupants);
    if (room === "default") {
        easyrtc.connect("multichat", loginSuccess, loginFailure);
    }

    $("#sendStuff")
        .on("click", function () {
        sendStuffWS();
    })
        .html("Send to room: " + room);


}


//joins a room
function connectToRoom(roomName) {

    easyrtc.joinRoom(roomName, null,
        function() {
            console.log(roomName);
        },
        function(errorCode, errorText, roomName) {
            easyrtc.showError(errorCode, errorText + ": room name was(" + roomName + ")");
        });
}

//change room
function changeRoom(roomName) {
    easyrtc.leaveRoom(room, changeroomSuccess, loginFailure);
    room = roomName;
    connect();
}




//gets data from listeners and sends to the room
function sendStuffWS() {
    //message content listener
    var text = document.getElementById('sendMessageText').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }

    //data to send
    var data = {
        messageId: generateMessageId(easyrtc.idToName(selfEasyrtcid), text),
        author: selfEasyrtcid,
        date: getDate(),
        parentMessageId: getParentMessageId(),
        content: text
    };

    //will be used for chosing between rooms or sending to another peer
    var dest = {
        targetRoom: "room"
    };

    //sends data to server
    easyrtc.sendDataWS(dest, "message", JSON.stringify(data));

    //will generate message node on client
    addToRoom("message", JSON.stringify(data));

    //empties text field
    document.getElementById('sendMessageText').value = "";
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    //document.getElementById("conversation").innerHTML = "I am " + easyrtcid;
}

function changeroomSuccess() {
    console.log("successfully left room");
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
