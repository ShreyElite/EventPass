const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary data storage
let events = [];
let registrations = [];

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "EventPass Backend is Running 🚀"
    });
});

// Create Event
app.post("/api/events", (req, res) => {
    const { name, capacity } = req.body;

    if (!name || !capacity) {
        return res.status(400).json({
            message: "Event name and capacity are required"
        });
    }

    const event = {
        id: Date.now().toString(),
        name,
        capacity: Number(capacity),
        registered: 0,
        checkedIn: 0
    };

    events.push(event);

    res.status(201).json(event);
});

// Get all Events
app.get("/api/events", (req, res) => {
    res.json(events);
});

// Register Attendee
app.post("/api/register", (req, res) => {
    const { eventId, name, email } = req.body;

    const event = events.find(e => e.id === eventId);

    if (!event) {
        return res.status(404).json({
            message: "Event not found"
        });
    }

    if (event.registered >= event.capacity) {
        return res.status(400).json({
            message: "Registration closed. Event is full."
        });
    }

    const ticketId = "TKT-" + Date.now();

    const registration = {
        id: Date.now().toString(),
        ticketId,
        eventId,
        name,
        email,
        checkedIn: false
    };

    registrations.push(registration);
    event.registered++;

    res.status(201).json({
        message: "Registration successful",
        ticketId,
        registration
    });
});

// Check-in Ticket
app.post("/api/checkin", (req, res) => {
    const { ticketId } = req.body;

    const registration = registrations.find(
        r => r.ticketId === ticketId
    );

    if (!registration) {
        return res.status(404).json({
            message: "Invalid Ticket ID"
        });
    }

    if (registration.checkedIn) {
        return res.status(400).json({
            message: "Ticket already checked in"
        });
    }

    registration.checkedIn = true;

    const event = events.find(e => e.id === registration.eventId);

    if (event) {
        event.checkedIn++;
    }

    res.json({
        message: "Check-in successful",
        registration
    });
});

// Dashboard
app.get("/api/dashboard/:eventId", (req, res) => {
    const event = events.find(e => e.id === req.params.eventId);

    if (!event) {
        return res.status(404).json({
            message: "Event not found"
        });
    }

    res.json({
        eventName: event.name,
        capacity: event.capacity,
        totalRegistered: event.registered,
        totalCheckedIn: event.checkedIn
    });
});

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`EventPass server running on http://localhost:${PORT}`);
});