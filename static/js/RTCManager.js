"use strict"


//
//easyRTC stuff
//
var selfEasyrtcid = "";

var room = "default";
var firstConnect = true;

//At connection, sets up RTC listeners and connects
function connect() {
    connectToRoom(room);
    easyrtc.setPeerListener(dispatchIncomingData);
    easyrtc.setRoomOccupantListener(generateRoomOccupants);
    if (room === "default" && firstConnect === true) {
        easyrtc.connect("multichat", loginSuccess, loginFailure);
        firstConnect = false;
    }
    //pouchDB
    updateRoomListIndex();
    connectToDb(room);
    //vis.js
    generateGraph(room);

    $("#sendStuff")
        .on("click", function () {
            sendMessage();
        })
        .html("Send to room: " + room);


}

//will send to functions depending on data type
function dispatchIncomingData(id, msgType, dataString) {

    var data = JSON.parse(dataString);
    if (data.type === "message" || data.type === "icon") {
        addToRoom(msgType, dataString);
    } else if (data.type === "syncDb") {
        console.log(data);
        syncRoomDb(msgType, dataString)
    }


}



//joins a room
function connectToRoom(roomName) {
    easyrtc.joinRoom(roomName, null,
        function () {
            updateRoomList(roomName);
            syncRoomDb();
        },
        function (errorCode, errorText, roomName) {
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
function sendMessage() {
    //message content listener
    var text = document.getElementById('sendMessageText').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }

    //data to send
    var data = {
        type: "message",
        id: generateMessageId(getUserId(), text),
        author: selfEasyrtcid,
        date: getDate(),
        parentMessageId: getParentMessageId(),
        content: text
    };

    //sends data to server
    sendData("message", data);

    //will generate message node on client
    addToRoom("message", JSON.stringify(data));

    //empties text field
    document.getElementById('sendMessageText').value = "";
}

//different treatment for vairous outcoming data
function sendData(type, data) {

    var dest = {
        targetRoom: room
    };

    //sends data to server
    easyrtc.sendDataWS(dest, type, JSON.stringify(data));


}

function getUserId() {
    return easyrtc.idToName(selfEasyrtcid);
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
