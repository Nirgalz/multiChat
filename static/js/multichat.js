

//
//easyRTC stuff
//
var selfEasyrtcid = "";

function addToConversation(who, msgType, dataString) {

    var data = JSON.parse(dataString);
    var content = data.content;
    var edge;

    console.log(data);
    // Escape html special characters, then add linefeeds.
    content = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    content = content.replace(/\n/g, '<br />');
    document.getElementById('conversation').innerHTML +=
        "<b>" + who + ":</b>&nbsp;" + content + "<br />";

    //adds message node connected to author
    elements.push(
        {group: "nodes", data: {id: data.messageId, label: content}},
        {group: "edges", data: {id: data.author + data.messageId, source: data.messageId, target: data.author}}
    );

    //links to parents message if not null
    if (data.parentMessageId !== null) {
        elements.push(
            {group: "edges", data: {id: who + data.parentMessageId, source: data.messageId, target: data.parentMessageId}},
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


function convertListToButtons(roomName, occupants, isPrimary) {


    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }


    for (var easyrtcid in occupants) {


        elements.push(
            {group: "nodes", data: {id: easyrtc.idToName(selfEasyrtcid), label: easyrtc.idToName(selfEasyrtcid)}},
            {group: "nodes", data: {id: easyrtc.idToName(easyrtcid), label: easyrtc.idToName(selfEasyrtcid)}}
        )

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
        otherClientDiv.innerHTML = "<em>Nobody else logged in to talk to...</em>";
    }
}


function sendStuffWS(otherEasyrtcid) {
    var text = document.getElementById('sendMessageText').value;
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
        return;
    }

    var data = {
        messageId : generateMessageId(selfEasyrtcid, text),
        author: selfEasyrtcid,
        date: new Date(),
        parentMessageId: null,
        content: text
    };

    easyrtc.sendDataWS(otherEasyrtcid, "message", JSON.stringify(data));
    addToConversation(otherEasyrtcid, "message", JSON.stringify(data));
    document.getElementById('sendMessageText').value = "";
}


function loginSuccess(easyrtcid) {
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " + easyrtcid;
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}

//
// Tools
//

 function generateMessageId(author, message) {
    return author + "_" +  message.substr(2,5) + "_" + Math.random().toString(36).substr(2, 9);
 }




//
// Graph generation
//

var elements = [ // list of graph elements to start with

]


function generateGraph(elements) {
    var cy = cytoscape({
        container: document.getElementById('cy'), // container to render in

        elements: elements,

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': '#666',
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


    });


    cy.on('click', 'node', function (evt) {
        var node = evt.target;


        sendStuffWS(node.id());


    });

}


  