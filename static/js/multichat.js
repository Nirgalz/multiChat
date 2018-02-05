//
//easyRTC stuff
//
var selfEasyrtcid = "";

var socketIo = io();

function addToConversation(who, msgType, dataString) {

    var data = JSON.parse(dataString);
    var content = data.content;
    var nodeColor;

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

    //adds message node connected to author
    elements.push(
        {
            group: "nodes", data: {id: data.messageId, label: content},
            style: {
                'background-color': nodeColor
            }
        },
        {group: "edges", data: {id: data.author + data.messageId, source: data.messageId, target: data.author}}
    );

    //links to parents message if not null
    if (data.parentMessageId !== null) {
        elements.push(
            {
                group: "edges",
                data: {id: who + '_' + data.parentMessageId, source: data.messageId, target: data.parentMessageId}
            }
        )
    }

    //resets graph
    generateGraph(elements);

}


function connect() {
    easyrtc.setPeerListener(addToConversation);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.connect("easyrtc.instantMessaging", loginSuccess, loginFailure);
}

//TODO refactor this
function convertListToButtons(roomName, occupants, isPrimary) {

    //resets users var each time the room is updated
    users = [];

    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }

    //adds self node
    users.push(
        {
            group: "nodes", data: {id: easyrtc.idToName(selfEasyrtcid), label: easyrtc.idToName(selfEasyrtcid)},
            style: {
                'background-color': '#C70039',
                'color': '#888'

            }
        });

    for (var easyrtcid in occupants) {

        //add all other users in users var
        users.push(
            {
                group: "nodes", data: {
                id: easyrtc.idToName(easyrtcid),
                label: easyrtc.idToName(easyrtcid)
            },
                style: {
                    'background-color': '#2ecc71',
                    'color': '#888'

                }
            }
        );

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
//attempt to manage UUIDs through sockets
    socketIo.emit('reqID', {message: 'ble'});

    socketIo.on('UUID', function (data) {
        console.log(data.UUID);
    });
    var data = {
        messageId: generateMessageId(easyrtc.idToName(selfEasyrtcid), text),
        author: selfEasyrtcid,
        date: new Date(),
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

function generateMessageId(author, message) {
    //TODO real UUID
    return author + "_" + message.substr(2, 5) + "_" + Math.random().toString(36).substr(2, 9);
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

//list of users
var users = [];
// list of graph elements
var elements = [];


function generateGraph() {
    var cy = cytoscape({
        container: document.getElementById('cy'), // container to render in

        elements: elements.concat(users),

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
                    'color': '#888',
                    'label': 'data(label)'

                }
            },

            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            },

            {
                selector: '.clickedNode',
                style: {
                    'background-color': 'brown',
                    'shape': 'rectangle'
                }

            }
        ],

        layout: {
            name: 'cose',

            // Called on `layoutready`
            ready: function () {
            },

            // Called on `layoutstop`
            stop: function () {
            },

            // Whether to animate while running the layout
            // true : Animate continuously as the layout is running
            // false : Just show the end result
            // 'end' : Animate with the end result, from the initial positions to the end positions
            animate: true,

            // Easing of the animation for animate:'end'
            animationEasing: undefined,

            // The duration of the animation for animate:'end'
            animationDuration: undefined,

            // A function that determines whether the node should be animated
            // All nodes animated by default on animate enabled
            // Non-animated nodes are positioned immediately when the layout starts
            animateFilter: function (node, i) {
                return true;
            },


            // The layout animates only after this many milliseconds for animate:true
            // (prevents flashing on fast runs)
            animationThreshold: 250,

            // Number of iterations between consecutive screen positions update
            // (0 -> only updated on the end)
            refresh: 20,

            // Whether to fit the network view after when done
            fit: true,

            // Padding on fit
            padding: 30,

            // Constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
            boundingBox: undefined,

            // Excludes the label when calculating node bounding boxes for the layout algorithm
            nodeDimensionsIncludeLabels: false,

            // Randomize the initial positions of the nodes (true) or use existing positions (false)
            randomize: false,

            // Extra spacing between components in non-compound graphs
            componentSpacing: 40,

            // Node repulsion (non overlapping) multiplier
            nodeRepulsion: function (node) {
                return 2048;
            },

            // Node repulsion (overlapping) multiplier
            nodeOverlap: 4,

            // Ideal edge (non nested) length
            idealEdgeLength: function (edge) {
                return 32;
            },

            // Divisor to compute edge forces
            edgeElasticity: function (edge) {
                return 32;
            },

            // Nesting factor (multiplier) to compute ideal edge length for nested edges
            nestingFactor: 1.2,

            // Gravity force (constant)
            gravity: 1,

            // Maximum number of iterations to perform
            numIter: 1000,

            // Initial temperature (maximum node displacement)
            initialTemp: 1000,

            // Cooling factor (how the temperature is reduced between consecutive iterations
            coolingFactor: 0.99,

            // Lower temperature threshold (below this point the layout will end)
            minTemp: 1.0,

            // Pass a reference to weaver to use threads for calculations
            weaver: false
        }


    })
    // .style().selector(":active")
    // .css({
    //     "overlay-color": "black",
    //     "overlay-padding": 10,
    //     "overlay-opacity": 0.25 // and others… if the dev wants
    // });


    cy.on('click', 'node', function (evt) {
        var node = evt.target;

        cy.$('.' + node.id()).addClass('.clickedNode');

        parentMessageId = node.id();


        // sendStuffWS(node.id());


    });

}


  