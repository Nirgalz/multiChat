"use strict"


//
//easyRTC stuff
//
var selfEasyrtcid = "";

var room = "default";
var firstConnect = true;

//At connection, sets up RTC listeners and connects
function connect() {


    var username = document.getElementById("userNameField").value;
    var password = document.getElementById("passwordField").value;
    if (username) {
        easyrtc.setUsername(username);
    }
    if (password) {
        easyrtc.setCredential({password: password});
    }


    connectToRoom(room);
    easyrtc.setPeerListener(dispatchIncomingData);// set callback function on reception of message
    easyrtc.setRoomOccupantListener(generateRoomOccupants);


    if (room === "default" && firstConnect === true) {
        easyrtc.connect("multichat", loginSuccess, loginFailure);
        firstConnect = false;
    }
    //console.log(easyrtc.username);

    //pouchDB
    updateRoomListIndex();
    connectToDb(room);
    //vis.js
    generateGraph(room);

    const $sendStuff = $("#sendStuff");
    $sendStuff.on("click", sendMessage);// FIXME some things can be moved outside this function to avoid being called several times unnecessarily
    $sendStuff.html("Send to room: " + room);

    //experimental stuff :
    if (experimental) {
        showRooms();
    }
}

//will send to functions depending on data type
function dispatchIncomingData(id, msgType, dataString) {

    var data = JSON.parse(dataString);
    if (data.type === "message" || data.type === "icon") {
        //saves message to db
        addMessagetoDB(data);
        //updates graph
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
        parentMessageId: getSelectedNodeId(),//getParentMessageId(),// makes it dynamic.
        content: text
    };

    //sends data to server
    sendData("message", data);

    //will generate message node on client
    addToRoom("message", JSON.stringify(data));

    //saves message to db
    addMessagetoDB(data);

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
    //console.log("successfully left room");
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}
