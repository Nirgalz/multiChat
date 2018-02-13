"use strict"

//
//easyRTC stuff
//
var selfEasyrtcid = "";

var socketIo = io();

function addToConversation(who, msgType, dataString) {


    var data = JSON.parse(dataString);
    var content = data.content;
    var nodeColor;

    addMessagetoDB(data);


    // Escape html special characters, then add linefeeds.
    content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    content = content.replace(/\n/g, '<br />');

    //TODO use DOM elements directly, avoid using strings to construct this
    //TODO use scrollback terminal with fixed limit lines
    document.getElementById('conversation').innerHTML +=
        "<b>" + who + ":</b>&nbsp;" + content + "<br />";


    //TODO add colors for more variations and more users
    //color depending on the author
    if (data.author === selfEasyrtcid) {
        nodeColor = "#FF5733";
    } else {
        nodeColor = "#abebc6";
    }

    //vis.js
    addNode(data.messageId, content, nodeColor, true);


    //adds message node connected to author
    addEdge(data.author + data.messageId, data.messageId, data.author)

    //links to parents message if not null
    if (data.parentMessageId !== null) {
        addEdge(getDate() + '_' + who + '_' + data.parentMessageId, data.messageId, data.parentMessageId)
    }
}


function connect() {
    easyrtc.setPeerListener(addToConversation);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);
}

//TODO refactor this
function convertListToButtons(roomName, occupants, isPrimary) {

    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }

    //adds self node
    addNode(easyrtc.idToName(selfEasyrtcid), "Me", '#C70039', false)


    for (var easyrtcid in occupants) {

        //add all other users in users var
        addNode(easyrtc.idToName(easyrtcid), easyrtc.idToName(easyrtcid), '#2ecc71', false);


        var button = document.createElement('button');
        button.onclick = function (easyrtcid) {
            return function () {
                sendStuffWS(easyrtcid);
            };
        }(easyrtcid);
        var label = document.createTextNode("Send to " + easyrtc.idToName(easyrtcid));
        button.appendChild(label);

        otherClientDiv.appendChild(button);
    }
    if (!otherClientDiv.hasChildNodes()) {
        otherClientDiv.innerHTML = "<em>ALONE</em>";
    }
}


function sendStuffWS(otherEasyrtcid) {
    var text = document.getElementById('sendMessageText').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }

    var data = {
        messageId: generateMessageId(easyrtc.idToName(selfEasyrtcid), text),
        author: selfEasyrtcid,
        date: getDate(),
        parentMessageId: getParentMessageId(),
        content: text
    };

    easyrtc.sendDataWS(otherEasyrtcid, "message", JSON.stringify(data));
    addToConversation(otherEasyrtcid, "message", JSON.stringify(data));
    document.getElementById('sendMessageText').value = "";
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    document.getElementById("conversation").innerHTML = "I am " + easyrtcid;
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}

//
// Tools
//

function getDate() {
    return new Date().getTime();
}

function generateMessageId(author, message) {
    //TODO real UUID
    return getDate() + "_" + author + "_" + message.substr(2, 5) + "_" + Math.random().toString(36).substr(2, 9);
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


//Tests with vis.js
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
    var options = {};
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
function addNode(id, label, style, physics) {
    try {
        // will not try to make an already existing node :
        if (nodes._data[id] === undefined) {
            nodes.add({
                id: id,
                label: label,
                color: style,
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


//pouchDB tests
//adds message to local db
function  addMessagetoDB(data) {

    var message = {
        _id: data.messageId,
        data:data
    };

    db.put(message, function callback(err, result) {
        db.info().then(function (info) {
            console.log(info);
        });

        // getLocalHistory();
        if (err) {
            console.log(err);
        }
    });
}


function getLocalHistory() {

    db.find('all').then(function (value) { return value; })
}

function drawFromLocalDB() {
    var nodes = getLocalHistory();
    console.log(nodes);
    for (var i = 0 ; i < nodes.rows.length ; i ++) {
        var data = nodes.rows[i].data;
        var nodeColor = "";
        if (data.author === selfEasyrtcid) {
            nodeColor = "#FF5733";
        } else {
            nodeColor = "#abebc6";
        }
        addNode(data.messageId, data.content, nodeColor, true);

    }
}