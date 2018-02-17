"use strict"


//pouchDB

//connect to DB
var db;
function connectToDb(DBname) {
    db = new PouchDB(DBname);
}


//adds message to local db
function addMessagetoDB(data) {

    var message = {
        _id: data.messageId,
        data: data
    };

    db.put(message, function callback(err, result) {

        //for debugging purposes
        // db.info().then(function (info) {
        //     console.log(info);
        // });

        // getLocalHistory();
        if (err) {
            console.log(err);
        }
    });
}