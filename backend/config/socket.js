let piSocket = null;

export const setPiSocket = (socket) => {
    piSocket = socket;
};

export const getPiSocket = () => {
    return piSocket;
};