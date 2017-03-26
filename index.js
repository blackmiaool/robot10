const Cr = require("cr-api");
const Fiora = require("fiora-api");
const argv = require('optimist').argv;

const rooms = {
    cr: new Cr({}),
    fiora: new Fiora({})
};

function eachRoom(cb) {
    Object.keys(rooms).forEach(function (name) {
        cb(rooms[name]);
    });
}

function eachOtherRoom(room, cb) {
    Object.keys(rooms).forEach(function (name) {
        if (rooms[name] !== room) {
            cb(rooms[name])
        }
    });
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
eachRoom(function (room) {
    function onMessage(message) {
        eachOtherRoom(room, function (r) {
            const msg = clone(message);
            msg.source = room.name;
            let name = msg.room;
            if (name === room.main) {
                name = room.name;
            }
            if (name === r.name) {
                name = r.main;
            }
            r.send(name, "text", JSON.stringify(msg));
        });
    }
    room.login("robot10", argv.pwd).then(function () {
        let promise = room.join(room.main);
        room.listen(room.main, onMessage);
        eachOtherRoom(room, function (r) {
            promise = promise.then(function () {
                return room.join(r.name)
            });
            room.listen(r.name, onMessage);
        });
        promise.then(function () {
            console.log(room.name + " ready");
            room.ready = true;
        }).catch(function (e) {
            console.log(room.name + " ready");
            room.ready = true;
        });
    });
});
