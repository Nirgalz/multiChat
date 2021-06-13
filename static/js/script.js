"use strict"

var experimental = false;

//activates/deactivates experimental stuff
$("#experimental").on("click", function () {
    experimental = !experimental;
    connect();
});

$(document).on('mousemove', function (e) {
    var canvasPosition = network.DOMtoCanvas({x: e.clientX, y: e.clientY})
    nodes.update({id: getUserId(), x: canvasPosition.x + 30, y: canvasPosition.y + 30})
});


//toggle console on click
$("#toggleRoomTools").on("click", function() {
    $("#roomTools").toggle();
});

//empty local  room db
$("#emptyRoomDb").on("click", function () {

    db.destroy().then(function (response) {
        console.log("local db deleted")
    }).catch(function (err) {
        console.log(err);
    });
});

//empty local db
//todo: make work without having to f5
$("#emptyLocalDb").on("click", function () {
    db.close();
    personalDb.get('rooms').then(function (doc) {

        for (var i = 0 ; i < doc.list.length ; i++) {
            var deleteDb = new PouchDB(doc.list[i]);
            deleteDb.destroy()
            //     .then(function (response) {
            //     console.log("local db deleted")
            // }).catch(function (err) {
            //     console.log(err);
            // });

        }
        personalDb.destroy();
        connect();

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