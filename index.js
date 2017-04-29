const Cr = require("cr-api");
const Fiora = require("fiora-api");
const God=require("blackmiaoolgod-api");
const argv = require('optimist').argv;

const rooms = {
    cr: new Cr({}),
    fiora: new Fiora({}),
    god:new God({}),
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
function handleMessage(message){
    if(message.avatar==="https://ooo.0o0.ooo/2017/03/08/58bf60266acc3.gif"){
        message.avatar="http://cdn.suisuijiang.com/message_1492395396308.png";
    }
}
eachRoom(function (room) {
    function onMessage(message) {
        handleMessage(message);
        eachOtherRoom(room, function (r) {
            const msg = clone(message);
            msg.source = room.name;
            if(msg.name==='robot10'){
                return;
            }
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
