const room = require('../models/roomModel');

const roomsController = {};

roomsController.getAllRooms = async (req, res, next) => {
    let roomslist;
    let { subject } = req.params;
    try {
        roomslist = await room.find({ subject: subject }).where('active').equals(true);
        res.locals.rooms = roomslist;

    } catch (e) {
        console.log(e.message)
    }

    if (roomslist.length === 0) {
        return res.status(404).json({ message: 'There are no active rooms for this subject' });
    }
    next();

}

roomsController.openNewRoom = async (req, res, next) => {
    const { subject, host, restricted, allowedUsers, pendingUsers, active } = req.body;
    let newRoom
    try {
        newRoom = await room.create({
            host: host, subject: subject, restricted: restricted, active: active,
            allowedUsers: allowedUsers, pendingUsers: pendingUsers
        });

        res.locals.newRoom = newRoom;

    } catch (e) {
        console.log(e.message)
    }

    if (!newRoom) {
        return res.status(404).json({ message: 'No new room was created' });
    }
    next();

}

roomsController.getUserRooms = async (req, res, next) => {
    const { id } = req.params;
    let rooms;
    try {
        rooms = await room.find({ host: id })
        res.locals.userRooms = rooms
    } catch (e) {
        console.log(e.message)
    }

    if (rooms.length === 0) {
        return res.status(404).json({ message: 'There are no rooms associated to this user ID' })
    }
    next()

}

roomsController.deleteRoom = async (req, res, next) => {
    const { subject, host } = req.params;

    let roomDelete;
    try {
        roomDelete = await room.findOneAndDelete({ subject: subject, host: host })
        res.locals.deletedRoom = roomDelete;

    } catch (e) {
        console.log(e.message)
    }

    if (!roomDelete) {
        return res.status(404).json({ message: 'Unable to find the room to delete' });
    }
    return next();
}

module.exports = roomsController;