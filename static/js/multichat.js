"use strict"

//
//easyRTC stuff
//
var selfEasyrtcid = "";

function addToRoom(msgType, dataString) {

    //parses data
    var data = JSON.parse(dataString);
    var content = data.content;

    //saves message to db
    addMessagetoDB(data);

    // Escape html special characters, then add linefeeds.
    content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    content = content.replace(/\n/g, '<br />');

    //color depending on the id string
    var nodeColor = "#" + intToRGB(hashCode(data.author));

    //animations when adding a message
    setTimeout(function () {
        //adds message edge connected to author
        var edge1 = addEdge(data.author + data.messageId, data.parentMessageId, data.author);
        setTimeout(function () {
            //adds message
            addNode(data.messageId, content, nodeColor, true);
            //links to parents message if not null
            if (data.parentMessageId !== null) {
                addEdge(getDate() + '_' + data.parentMessageId, data.messageId, data.parentMessageId);
            }
            var edge2 = addEdge(getDate() + '_' + data.messageId, data.messageId, data.author);
            setTimeout(function () {
                //remove edge to author
                removeEdge(edge1);
                setTimeout(function () {
                    //remove edge to author
                    removeEdge(edge2);
                }, 200);
            }, 200);
        }, 200);
    }, 200);
}

//At connection, sets up RTC listeners and connects
function connect() {
    connectToRoom("room");
    easyrtc.setPeerListener(addToRoom);
    easyrtc.setRoomOccupantListener(generateRoomOccupants);
    easyrtc.connect("multichat", loginSuccess, loginFailure);

    $("#sendStuff").on("click", function () {
        sendStuffWS();
    });

}

//generates room occupants
function generateRoomOccupants(roomName, occupants, isPrimary) {

    //node color
    var nodeColor = "#" + intToRGB(hashCode(easyrtc.idToName(selfEasyrtcid)));

    //generates client's user nodes
    if (nodes._data[easyrtc.idToName(selfEasyrtcid)] === undefined) {
        try {
            nodes.add({
                id: easyrtc.idToName(selfEasyrtcid),
                label: "Me",
                shape: "icon",
                icon: {
                    face: 'FontAwesome',
                    code: '\uf007',
                    size: 50,
                    color: nodeColor
                }
            });
        }
        catch (err) {
            alert(err);
        }
    }

    //generates other clients' nodes
    for (var easyrtcid in occupants) {
        nodeColor = "#" + intToRGB(hashCode(easyrtc.idToName(easyrtcid)));
        if (nodes._data[easyrtc.idToName(easyrtcid)] === undefined) {
            try {
                nodes.add({
                    id: easyrtc.idToName(easyrtcid),
                    label: easyrtc.idToName(easyrtcid),
                    shape: "icon",
                    icon: {
                        face: 'FontAwesome',
                        code: '\uf007',
                        size: 50,
                        color: nodeColor
                    }
                });
            }
            catch (err) {
                alert(err);
            }
        }
    }
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
        messageId: generateMessageId(easyrtc.idToName(selfEasyrtcid), text),
        author: selfEasyrtcid,
        date: getDate(),
        parentMessageId: getParentMessageId(),
        content: text
    };

    //will be used for chosing between rooms or sending to another peer
    var dest = {
        targetRoom: "room"
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
    document.getElementById("conversation").innerHTML = "I am " + easyrtcid;
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}


//temporary parent message management
var parentMessageId = null;

function getParentMessageId() {
    if (parentMessageId !== null) {
        var result = parentMessageId;
        parentMessageId = null;
        return result;
    } else {
        return null;
    }
}


//
// Graph generation
//


//vis.js instance and config
var nodes;
var edges;
var network;
var db;
$(function () {
    nodes = new vis.DataSet([]);

    // create an array with edges
    edges = new vis.DataSet([]);

    // create a network
    var container = document.getElementById('cy');
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
        edges: {
            arrows: {
                to: {enabled: true, scaleFactor: 1, type: 'arrow'}

            }
        }
    };
    network = new vis.Network(container, data, options);

    // adds event listener on nodes to get answered message's id
    network.on('click', function (properties) {
        var ids = properties.nodes;
        var clickedNodes = nodes.get(ids);
        if (clickedNodes[0] !== undefined) {
            parentMessageId = clickedNodes[0].id;
        }
    });

    //pouchDB integration tests
    db = new PouchDB('local_history');
    drawFromLocalDB();

});

//functions
//adds a node
function addNode(id, label, style, physics, group) {
    try {
        // will not try to make an already existing node :
        if (nodes._data[id] === undefined) {
            nodes.add({
                id: id,
                label: label,
                color: style,
                group: group,
                physics: true
            });
        }

    }
    catch (err) {
        alert(err);
    }
}

function updateNode(id, label) {
    try {
        nodes.update({
            id: id,
            label: label
        });
    }
    catch (err) {
        alert(err);
    }
}

function removeNode(id) {
    try {
        nodes.remove({id: id});
    }
    catch (err) {
        alert(err);
    }
}

function addEdge(id, from, to) {
    try {
        edges.add({
            id: id,
            from: from,
            to: to
        });

        return id;
    }
    catch (err) {
        alert(err);
    }
}

function updateEdge(id, from, to) {
    try {
        edges.update({
            id: id,
            from: from,
            to: to
        });
    }
    catch (err) {
        alert(err);
    }
}

function removeEdge(id) {
    try {
        edges.remove({id: id});
    }
    catch (err) {
        alert(err);
    }
}


//pouchDB
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

//draws graph from DB
//TODO refactoring : get one function for both real time and DB generated graph
function drawFromLocalDB() {

    //loads docs
    db.allDocs({
        include_docs: true,
        attachments: true
    }, function (err, nodesFromDb) {
        if (err) {
            return console.log(err);
        }

        //draws history from db
        var authors = [];
        for (var i = 0; i < nodesFromDb.rows.length; i++) {
            var data = nodesFromDb.rows[i].doc.data;
            var nodeColor = "#" + intToRGB(hashCode(data.author));

            //adds message
            addNode(data.messageId, data.content, nodeColor, true);

            // will create a node for the author connected to the first message
            if (!authors.includes(data.author)) {
                if (nodes._data[data.author] === undefined) {
                    try {
                        nodes.add({
                            id: data.author,
                            label: data.author,
                            shape: "icon",
                            icon: {
                                face: 'FontAwesome',
                                code: '\uf007',
                                size: 50,
                                color: nodeColor
                            }
                        });
                    }

                    catch (err) {
                        alert(err);
                    }
                }
            }

            //links to parents message if not null
            if (data.parentMessageId !== null) {
                addEdge(getDate() + '_' + data.author + '_' + data.parentMessageId, data.parentMessageId, data.messageId)
            }

        }
    });
}


//
// Tools
//


//return UNIX date
function getDate() {
    return new Date().getTime();
}

//generates unique UUID
function generateMessageId(author, message) {
    //TODO better UUID
    return getDate() + "_" + author + "_" + message.substr(2, 5) + "_" + Math.random().toString(36).substr(2, 9);
}


//gives a random color for each user
function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToRGB(i) {
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    var result = "00000".substring(0, 6 - c.length) + c;
    result.replace("F", "D")
        .replace("E", "C")
        .replace("0", "2")
        .replace("1", "3");
    return result;
}