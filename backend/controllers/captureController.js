import { getPiSocket } from "../config/socket.js";
export const triggerPiCapture = async (req, res) => {
    const piSocket = getPiSocket();

    if (!piSocket) {
        return res.status(500).json({ error: "Raspberry Pi is currently offline." });
    }

    // Send the command and the user's token (so the Pi can upload back)
    piSocket.emit("COMMAND_CAPTURE", {
        userId: req.user.id,
        token: req.headers.authorization 
    });

    res.status(200).json({ msg: "Capture command sent to Pi." });
};