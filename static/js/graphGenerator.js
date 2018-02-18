"use strict"


//
// Graph generation
//


//vis.js instance and config
var nodes;
var edges;
var network;
function generateGraph() {
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
    network.on('click', retrieveClickedNode);

    // right-click listener to add custom icon node
    network.on('oncontext', function(properties) {
        const domCursor = properties.pointer.DOM;
        const targetNodeId = network.getNodeAt(domCursor);
        if(targetNodeId) {// if a node was clicked on
            properties.event.preventDefault();
            const targetNode = network.findNode(targetNodeId);

            network.setSelection({// select clicked node
                nodes: [targetNode]
            });

            ContextMenu.displayMenu("ADD_REACTION", domCursor, {
                targetNodeId: targetNodeId
            });
        }
    });

    function retrieveClickedNode(properties) {
        var ids = properties.nodes;
        var clickedNodes = nodes.get(ids);
        if (clickedNodes[0] !== undefined) {
            parentMessageId = clickedNodes[0].id;
        }
    }

    drawFromLocalDB();
}



//generates room occupants
function generateRoomOccupants(roomName, occupants, isPrimary) {
    //generates client's user nodes
    addUserNode(easyrtc.idToName(selfEasyrtcid), "Me");

    //generates other clients' nodes
    var id;
    var easyrtcid;
    for (easyrtcid in occupants) {
        id = easyrtc.idToName(easyrtcid);
        addUserNode(id, id);
    }
}
/**
 * Adds an 'icon' node formatted to represent an existing user.
 * @param id
 * @param label
 */
function addUserNode(id, label) {
    addIconNode(id, label, '\uf007');
}

/**
 * Adds an 'icon' node.
 * @param id
 * @param label
 * @param unicode
 * @param color - optional, if unspecified generated from id
 */
function addIconNode(id, label, unicode, color) {
    if(nodes._data[id] === undefined) {// if node id does not already exist

        color = color ? color : stringToColor(id);// if unspecified

        try {
            nodes.add({
                id: id,
                label: label,
                shape: "icon",
                icon: {
                    face: 'FontAwesome',
                    code: unicode,
                    size: 50,
                    color: color
                }
            });
        } catch (err) {
            alert(err);
        }
    }
}




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
    var nodeColor = stringToColor(data.author);

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
            var nodeColor = stringToColor(data.author);

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

