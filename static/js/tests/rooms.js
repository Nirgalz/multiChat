


//rooms interface tests

var presentRoom = null;

function showRooms() {

    var mynetwork = document.getElementById('cy');
    var x = - mynetwork.clientWidth / 2 + 50;
    var y = - mynetwork.clientHeight / 2 + 50;


    personalDb.get('rooms').then(function (doc) {

        for (var i = 0 ; i < doc.list.length ; i++) {

            if (doc.list[i] !== presentRoom) {
                var color = stringToColor(doc.list[i]);

                nodes.add({
                    id: doc.list[i],
                    x: (x + (i * 70) ),
                    y: y,
                    label: doc.list[i],
                    value: 1,
                    fixed: true,
                    //physics:false,
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
        }

        if (presentRoom !== null) {
            nodes.add({
                id: presentRoom,
                label: presentRoom,
                shape: "icon",
                icon: {
                    face: 'FontAwesome',
                    code: '\uf086',
                    size: 50,
                    color: stringToColor(presentRoom)
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
            presentRoom = clickedNodes[0].id;
            showRooms();
            changeRoom(clickedNodes[0].groups);


        }


    });


}
