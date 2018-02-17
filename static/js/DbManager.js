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

//updates rooms' list
function updateRoomList(roomName) {
    PouchDB.debug.enable('*');
    var personalDb = new PouchDB("personalDb");

    personalDb.get('rooms').then(function(doc) {

        if (!doc.list.includes(roomName)) {
            var list = doc.list;
            list.push(roomName);

            return db.put({
                _id: 'rooms',
                _rev: doc._rev,
                list: list
            });
        }

    }).then(function(response) {
        personalDb.get('rooms').then(function (doc) {
            console.log(doc);
        }).catch(function (err) {
            console.log(err);
        });
    }).catch(function (err) {
        db.put({
            _id: 'rooms',
            title: 'Rooms List',
            list: [roomName]
        }).then(function (response) {
            // handle response
        }).catch(function (err) {
            console.log(err);
        });
        //console.log(err);
    });
}