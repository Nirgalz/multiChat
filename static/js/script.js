"use strict"

//toggle console on click
$("#toggleConsole").on("click", function() {
    $("#receiveMessageArea").toggle();
});


//empty local db
$("#emptyLocalDb").on("click", function () {

    db.destroy().then(function (response) {
        console.log("local db deleted")
    }).catch(function (err) {
        console.log(err);
    });
});

$("#connectRoomTest").on("click", function () {
    connectToRoom("test");
});