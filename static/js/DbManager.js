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


//sends hidden data between clients
function syncRoomDb(msgType, dataString) {
    //recovers personal history from db
    var roomDb = new PouchDB(room);

    roomDb.allDocs({
        include_docs: true,
        attachments: true
    }, function (err, docs) {
        if (err) {
            return console.log(err);
        }
        //data to send
        var dataToSend = {
            type: "syncDb",
            author: selfEasyrtcid,
            room: room,
            roomHistory: docs
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

            if (docs.rows.length > data.roomHistory.rows.length) {
                //sends data to server
                sendData("syncDb", dataToSend)
            } else if (docs.rows.length === data.roomHistory.rows.length) {
                //do nothing
            }
            else {

                //updates client's db based on received data
                //todo: better separation of concerns
                roomDb.destroy().then(function (response) {

                    roomDb = new PouchDB(room);

                    var history = [];

                    for (var row = 0 ; row < data.roomHistory.rows.length ; row++) {
                        delete data.roomHistory.rows[row].doc._rev;
                        history.push(data.roomHistory.rows[row].doc)
                    }
                    roomDb.bulkDocs(history).then(function (result) {
                        drawFromLocalDB();
                    }).catch(function (err) {
                        console.log(err);
                    });


                }).catch(function (err) {
                    console.log(err);
                });
            }
        } else {
            //sends data to server
            sendData("syncDb", dataToSend);
        }

    });



}
