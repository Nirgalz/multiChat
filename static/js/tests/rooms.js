


//rooms interface tests

function showRooms() {
    console.log(nodes);

    var mynetwork = document.getElementById('cy');
    var x = - mynetwork.clientWidth / 2 + 50;
    var y = - mynetwork.clientHeight / 2 + 50;


    personalDb.get('rooms').then(function (doc) {

        for (var i = 0 ; i < doc.list.length ; i++) {

            var color = stringToColor(doc.list[i]);

            nodes.add({
                id: doc.list[i],
                x: (x + (i * 70) ),
                y: y,
                label: doc.list[i],
                value: 1,
                fixed: true,
                physics:false,
                groups: 'rooms',
                shape: "icon",
                icon: {
                    face: 'FontAwesome',
                    code: '\uf086',
                    size: 50,
                    color: color
                }
            });


        }

    }).catch(function (err) {
        console.log(err);
    });

    network.on('click', function (properties) {
        var ids = properties.nodes;
        var clickedNodes = nodes.get(ids);

        if (clickedNodes[0].groups === 'rooms') {
            changeRoom(clickedNodes[0].groups);
        }


    });


}
