"use strict"

//toggle console on click
$("#toggleRoomTools").on("click", function() {
    $("#roomTools").toggle();
});

//empty local db
$("#emptyLocalDb").on("click", function () {

    db.destroy().then(function (response) {
        console.log("local db deleted")
    }).catch(function (err) {
        console.log(err);
    });
});

$("#sendChangeRoomText").on("click", function () {
    changeRoom($("#changeRoomText").val());
    $("#changeRoomText").val("");
});


$("#graphDemo").on("click", function () {
    launchDemo();
});