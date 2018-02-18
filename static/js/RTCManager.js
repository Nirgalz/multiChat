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
            sendStuffWS();
        })
        .html("Send to room: " + room);


}

//will send to functions depending on data type
function dispatchIncomingData(id, msgType, dataString) {

    var data = JSON.parse(dataString);

    if (data.type === "message") {
        addToRoom(msgType, dataString);
    } else if (data.type === "syncDb") {
        syncRoomDb(msgType, dataString)
    }


}


//sends hidden data between clients
function syncRoomDb(msgType, dataString) {

    //recovers personal history from db
    var roomDb = getRoomHistory(room);

    //data to send
    var dataToSend = {
        type: "syncDb",
        author: selfEasyrtcid,
        room: room,
        roomHistory: roomdb,
        action: action
    };

    //will be used for chosing between rooms or sending to another peer
    var dest = {
        targetRoom: room
    };

    //will send if called at first join
    //and if client's db length is higher than received one
    //todo: optimize it
    if (dataString !== undefined) {
        var data = JSON.parse(dataString);

        if (roomDb.length > data.roomHistory.length) {
            //sends data to server
            easyrtc.sendDataWS(dest, "syncDb", JSON.stringify(dataToSend));
        } else {
            //do nothing
        }
    } else {
        //sends data to server
        easyrtc.sendDataWS(dest, "syncDb", JSON.stringify(dataToSend));
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
function sendStuffWS() {
    //message content listener
    var text = document.getElementById('sendMessageText').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }

    //data to send
    var data = {
        type: "message",
        messageId: generateMessageId(easyrtc.idToName(selfEasyrtcid), text),
        author: selfEasyrtcid,
        date: getDate(),
        parentMessageId: getParentMessageId(),
        content: text
    };

    //will be used for chosing between rooms or sending to another peer
    var dest = {
        targetRoom: room
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
