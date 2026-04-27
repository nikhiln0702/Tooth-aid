import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
    getEventTypes,
    getAvailableSlots,
    bookAppointment
} from "../controllers/consultController.js";

const router = express.Router();

// GET /api/consult/event-types
// Returns Cal.com event types (e.g. "Dental Consultation - 30 min")
router.get("/event-types", auth, getEventTypes);

// GET /api/consult/slots?eventTypeId=X&date=YYYY-MM-DD
// Returns available time slots for a date
router.get("/slots", auth, getAvailableSlots);

// POST /api/consult/book
// Books an appointment
router.post("/book", auth, bookAppointment);

export default router;