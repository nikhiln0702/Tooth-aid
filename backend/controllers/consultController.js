import axios from "axios";
import Analysis from "../models/Analysis.js";

const CAL_API_BASE = "https://api.cal.com/v1";
const CAL_API_KEY = process.env.CAL_API_KEY;
const CAL_USERNAME = "sajin-satheesh-nukuov";

// ─────────────────────────────────────────────────────────────────
// GET /api/consult/event-types
// Returns the list of event types from Cal.com
// The frontend uses this to get the eventTypeId for booking
// ─────────────────────────────────────────────────────────────────
export const getEventTypes = async (req, res) => {
    try {
        const response = await axios.get(`${CAL_API_BASE}/event-types`, {
            params: { apiKey: CAL_API_KEY }
        });

        const eventTypes = response.data.event_types || [];

        res.json({
            eventTypes: eventTypes.map(e => ({
                id: e.id,
                title: e.title,
                slug: e.slug,
                duration: e.length,
                url: `https://cal.com/${CAL_USERNAME}/${e.slug}`
            }))
        });

    } catch (err) {
        console.error("Cal.com getEventTypes error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch event types" });
    }
};


// ─────────────────────────────────────────────────────────────────
// GET /api/consult/slots?eventTypeId=X&date=YYYY-MM-DD
// Returns available time slots for a given event type and date
// ─────────────────────────────────────────────────────────────────
export const getAvailableSlots = async (req, res) => {
    try {
        const { eventTypeId, date } = req.query;

        if (!eventTypeId || !date) {
            return res.status(400).json({ error: "eventTypeId and date are required" });
        }

        // Cal.com slots API needs startTime and endTime as ISO strings
        const startTime = new Date(`${date}T00:00:00.000Z`).toISOString();
        const endTime = new Date(`${date}T23:59:59.000Z`).toISOString();

        const response = await axios.get(`${CAL_API_BASE}/slots`, {
            params: {
                apiKey: CAL_API_KEY,
                eventTypeId: parseInt(eventTypeId),
                startTime,
                endTime,
                timeZone: "Asia/Kolkata"
            }
        });

        // Slots come back as { slots: { "2026-03-20": [ {time: "..."}, ... ] } }
        const slotsForDate = response.data.slots?.[date] || [];

        res.json({
            date,
            slots: slotsForDate.map(s => ({
                time: s.time,
                // Format for display e.g. "10:30 AM"
                display: new Date(s.time).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata"
                })
            }))
        });

    } catch (err) {
        console.error("Cal.com getSlots error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch available slots" });
    }
};


// ─────────────────────────────────────────────────────────────────
// POST /api/consult/book
// Books an appointment on Cal.com
// Body: { eventTypeId, start, name, email, analysisId, notes }
// ─────────────────────────────────────────────────────────────────
export const bookAppointment = async (req, res) => {
    try {
        const { eventTypeId, start, name, email, analysisId, notes } = req.body;

        if (!eventTypeId || !start || !name || !email) {
            return res.status(400).json({
                error: "eventTypeId, start, name, and email are required"
            });
        }

        // Build the booking payload for Cal.com
        const bookingPayload = {
            eventTypeId: parseInt(eventTypeId),
            start,
            responses: {
                name,
                email,
                notes: notes || "Booked via ToothAid dental screening app"
            },
            timeZone: "Asia/Kolkata",
            language: "en",
            metadata: {
                source: "ToothAid",
                analysisId: analysisId || ""
            }
        };

        const response = await axios.post(
            `${CAL_API_BASE}/bookings?apiKey=${CAL_API_KEY}`,
            bookingPayload
        );

        const booking = response.data;
        console.log("Cal.com booking created:", booking.uid);

        // If analysisId provided, update the Analysis document
        // so the history screen can show the appointment details
        if (analysisId) {
            try {
                await Analysis.findByIdAndUpdate(analysisId, {
                    "appointment.booked": true,
                    "appointment.bookingUid": booking.uid,
                    "appointment.scheduledAt": new Date(start),
                    "appointment.meetLink": booking.meetingUrl || ""
                });
                console.log("Analysis updated with appointment details.");
            } catch (dbErr) {
                // Don't fail the booking if DB update fails
                console.error("Failed to update analysis with appointment:", dbErr.message);
            }
        }

        res.json({
            msg: "Appointment booked successfully",
            bookingUid: booking.uid,
            start: booking.startTime,
            end: booking.endTime,
            meetLink: booking.meetingUrl || null,
            status: booking.status
        });

    } catch (err) {
        console.error("Cal.com booking error:", err.response?.data || err.message);
        res.status(500).json({
            error: err.response?.data?.message || "Failed to book appointment"
        });
    }
};