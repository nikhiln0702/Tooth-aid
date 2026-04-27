// Stores the authorized Raspberry Pi socket
let piSocket = null;

// Stores the Socket.io server instance
// Set once when the server starts in index.js
// Used by controllers to emit events back to connected clients
let ioInstance = null;

export const setPiSocket = (socket) => {
    piSocket = socket;
};

export const getPiSocket = () => {
    return piSocket;
};

export const setIo = (io) => {
    ioInstance = io;
};

export const getIo = () => {
    return ioInstance;
};