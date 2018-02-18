"use strict"

//launches simulated 
function launchDemo() {
    var botsNumber = 10;
    var bots = [];
    var messages = [];
    var botName;
    var nodeColor;

    for (var i = 0; i < botsNumber; i++) {
        botName = randomName();
        nodeColor = stringToColor(botName);
        if (nodes._data[botName] === undefined) {
            try {
                nodes.add({
                    id: botName,
                    label: botName,
                    shape: "icon",
                    icon: {
                        face: 'FontAwesome',
                        code: '\uf007',
                        size: 50,
                        color: nodeColor
                    }
                });
                bots.push(botName);
            }
            catch (err) {
                alert(err);
            }
        }
    }


        //will populate messages
    var j = 0;
        printMessage(bots, messages, j);


}


function randomName() {
    return Math.random().toString(36).substring(7);
}

function randomMessage() {
    return Math.random().toString(36).substring(15);
}

function randomTime() {
    return Math.floor((Math.random() * 500) + 1);
}

function randomBot(bots) {
    return bots[Math.floor(Math.random() * bots.length)];
}

function randomParentMessage(messages) {
    if (messages.length !== 0) {
        return messages[Math.floor(Math.random() * messages.length)];
    } else return null;
}


function printMessage(bots, messages, j) {
    var bot;
    var message;
    var data;
    var nodeColor;
    setTimeout(function () {
        bot = randomBot(bots);
        message = randomName();
        data = {
            messageId: message,
            author: bot,
            date: getDate(),
            parentMessageId: randomParentMessage(messages),
            content: message
        };

        //color depending on the id string
        nodeColor = stringToColor(data.author);

        //animations when adding a message
        setTimeout(function () {
            //adds message edge connected to author
            var edge1 = addEdge(data.author + data.messageId, data.parentMessageId, data.author);
            setTimeout(function () {
                //adds message
                addNode(data.messageId, data.content, nodeColor, true);
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
                        messages.push(message);
                    }, 200);
                }, 200);
            }, 200);
        }, 200);

        j++;
        if (j <1000) {
            printMessage(bots, messages, j);
        }

    },
        randomTime()
    )
}