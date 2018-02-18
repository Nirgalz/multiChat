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
    var personalDb = new PouchDB("personalDb");

    personalDb.get('rooms').then(function(doc) {
        console.log(doc);
        if (!doc.list.includes(roomName)) {
            var list = doc.list;
            list.push(roomName);

            updateRoomListIndex();
            return personalDb.put({
                _id: 'rooms',
                title: 'Rooms List',
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
        personalDb.put({
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

//updates room list links
//TODO: make it using nodes
function updateRoomListIndex() {
    var personalDb = new PouchDB("personalDb");
    personalDb.get('rooms').then(function (doc) {

        $("#roomList").empty();
        for (var i = 0 ; i < doc.list.length ; i++) {
            var string = '"' + doc.list[i] + '"';
            $("#roomList")
                .append("<li><button class='roomListButtons' onclick='changeRoom(" +string + ")'>" + doc.list[i]+ " ></button></li>")
        }

    }).catch(function (err) {
        console.log(err);
    });

}

//gets room's history from db
function getRoomHistory(roomName) {
    var roomDb = new PouchDB(roomName);

    roomDb.allDocs({
        include_docs: true,
        attachments: true
    }, function (err, docs) {
        if (err) {
            return console.log(err);
        }
        return docs;

    });
}