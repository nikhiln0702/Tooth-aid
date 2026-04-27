import axios from "axios";
import Analysis from "../models/Analysis.js";

// Update the base URL to v2
const CAL_API_BASE = "https://api.cal.com/v2";
const CAL_API_KEY = process.env.CAL_API_KEY;
const CAL_USERNAME = "sajin-satheesh-nukuov";

// Cal.com v2 requires this specific header for all API calls
const CAL_API_VERSION = "2024-08-13"; 

// Helper for the required v2 Auth and Version headers
const getCalHeaders = () => ({
    "Authorization": `Bearer ${CAL_API_KEY}`,
    "cal-api-version": CAL_API_VERSION
});

// ─────────────────────────────────────────────────────────────────
// GET /api/consult/event-types
// Returns the list of event types from Cal.com
// ─────────────────────────────────────────────────────────────────
export const getEventTypes = async (req, res) => {
    try {
        const response = await axios.get(`${CAL_API_BASE}/event-types`, {
            headers: getCalHeaders()
        });

        // API v2 wraps the payload in response.data.data
        const eventTypes = response.data.data || [];

        res.json({
            eventTypes: eventTypes.map(e => ({
                id: e.id,
                title: e.title,
                slug: e.slug,
                duration: e.lengthInMinutes || e.length,
                url: `https://cal.com/${CAL_USERNAME}/${e.slug}`
            }))
        });

    } catch (err) {
        console.error("Cal.com v2 getEventTypes error:", err.response?.data || err.message);
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

        // Cal.com v2 slots API needs start and end as ISO strings
        const start = new Date(`${date}T00:00:00.000Z`).toISOString();
        const end = new Date(`${date}T23:59:59.000Z`).toISOString();

        const response = await axios.get(`${CAL_API_BASE}/slots`, {
            headers: getCalHeaders(),
            params: {
                eventTypeId: parseInt(eventTypeId),
                start: start,
                end: end,
                timeZone: "Asia/Kolkata"
            }
        });

        // Slots come back inside the data wrapper as: { data: { "2026-03-20": [ {time: "..."}, ... ] } }
        const slotsForDate = response.data.data?.[date] || [];

        res.json({
            date,
            slots: slotsForDate.map(s => ({
                time: s.time,
                display: new Date(s.time).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata"
                })
            }))
        });

    } catch (err) {
        console.error("Cal.com v2 getSlots error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch available slots" });
    }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/consult/book
// Books an appointment on Cal.com
// ─────────────────────────────────────────────────────────────────
export const bookAppointment = async (req, res) => {
    try {
        const { eventTypeId, start, name, email, analysisId, notes } = req.body;

        if (!eventTypeId || !start || !name || !email) {
            return res.status(400).json({
                error: "eventTypeId, start, name, and email are required"
            });
        }

        // Build the v2 booking payload
        const bookingPayload = {
            eventTypeId: parseInt(eventTypeId),
            start: start,
            // 'responses' was removed in v2 in favor of the 'attendee' object
            attendee: {
                name: name,
                email: email,
                timeZone: "Asia/Kolkata",
                language: "en"
            },
            // Custom notes/metadata can be passed safely here
            metadata: {
                source: "ToothAid",
                analysisId: analysisId || "",
                notes: notes || "Booked via ToothAid dental screening app"
            }
        };

        const response = await axios.post(
            `${CAL_API_BASE}/bookings`,
            bookingPayload,
            { headers: getCalHeaders() }
        );

        // V2 wraps the booked entity in the data object
        const booking = response.data.data;
        console.log("Cal.com v2 booking created:", booking.uid);

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
                console.error("Failed to update analysis with appointment:", dbErr.message);
            }
        }

        res.json({
            msg: "Appointment booked successfully",
            bookingUid: booking.uid,
            start: booking.start || start, // v2 returns .start instead of .startTime
            end: booking.end,             // v2 returns .end instead of .endTime
            meetLink: booking.meetingUrl || null,
            status: booking.status
        });

    } catch (err) {
        console.error("Cal.com v2 booking error:", err.response?.data || err.message);
        res.status(500).json({
            error: err.response?.data?.error?.message || err.response?.data?.message || "Failed to book appointment"
        });
    }
};