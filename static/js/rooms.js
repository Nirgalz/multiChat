"use strict"




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
