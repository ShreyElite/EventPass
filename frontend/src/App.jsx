import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [eventName, setEventName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [event, setEvent] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ticketId, setTicketId] = useState("");

  const [checkTicket, setCheckTicket] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Unable to load events");
        }

        const events = await response.json();
        if (events.length > 0) {
          setEvent(events[events.length - 1]);
        }
      } catch {
        showMessage("Unable to connect to the EventPass backend.", "error");
      }
    };

    loadEvents();
  }, []);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const createEvent = async () => {
    if (!eventName || !capacity) {
      showMessage("Please enter event name and capacity.", "error");
      return;
    }

    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: eventName,
        capacity: capacity,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setEvent(data);
      showMessage("Event created successfully!");
      setEventName("");
      setCapacity("");
    } else {
      showMessage(data.message, "error");
    }
  };

  const register = async () => {
    if (!event) {
      showMessage("Create an event first.", "error");
      return;
    }

    if (!name || !email) {
      showMessage("Please enter attendee details.", "error");
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        name,
        email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setTicketId(data.ticketId);

      setEvent({
        ...event,
        registered: event.registered + 1,
      });

      setName("");
      setEmail("");

      showMessage("Registration successful!");
    } else {
      showMessage(data.message, "error");
    }
  };

  const checkIn = async () => {
    if (!checkTicket) {
      showMessage("Enter a Ticket ID.", "error");
      return;
    }

    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticketId: checkTicket,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setEvent({
        ...event,
        checkedIn: event.checkedIn + 1,
      });

      setCheckTicket("");
      showMessage("✓ Check-in successful!");
    } else {
      showMessage(data.message, "error");
    }
  };

  return (
    <div className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <span className="brand-icon">🎟️</span>
          <span>EventPass</span>
        </div>

        <div className="nav-status">
          <span className="status-dot"></span>
          System Online
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div>
          <div className="badge">SMART EVENT MANAGEMENT</div>

          <h1>
            Manage Events.
            <br />
            <span>Check In Smarter.</span>
          </h1>

          <p>
            A simple platform for event registration, capacity management
            and secure attendee check-in.
          </p>
        </div>

        <div className="hero-icon">
          🎫
        </div>
      </section>

      {/* Alert */}
      {message && (
        <div className={`alert ${messageType}`}>
          {message}
        </div>
      )}

      <main className="container">

        {/* Dashboard */}
        {event && (
          <section className="dashboard">

            <div className="section-heading">
              <div>
                <span className="eyebrow">LIVE EVENT</span>
                <h2>{event.name}</h2>
              </div>

              <span className="live-badge">
                ● LIVE
              </span>
            </div>

            <div className="stats">

              <div className="stat-card">
                <div className="stat-icon blue">👥</div>
                <div>
                  <span>Registered</span>
                  <strong>{event.registered}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">🎟️</div>
                <div>
                  <span>Capacity</span>
                  <strong>{event.capacity}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">✓</div>
                <div>
                  <span>Checked In</span>
                  <strong>{event.checkedIn}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">📈</div>
                <div>
                  <span>Available</span>
                  <strong>{event.capacity - event.registered}</strong>
                </div>
              </div>

            </div>
          </section>
        )}

        <div className="grid">

          {/* Create Event */}
          <section className="card">
            <div className="card-header">
              <div className="card-icon blue-bg">＋</div>
              <div>
                <h2>Create Event</h2>
                <p>Set up your event and capacity</p>
              </div>
            </div>

            <label>EVENT NAME</label>

            <input
              type="text"
              placeholder="e.g. Tech Fest 2026"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />

            <label>MAXIMUM CAPACITY</label>

            <input
              type="number"
              placeholder="e.g. 100"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />

            <button onClick={createEvent}>
              Create Event →
            </button>
          </section>

          {/* Registration */}
          <section className="card">
            <div className="card-header">
              <div className="card-icon purple-bg">✎</div>
              <div>
                <h2>Register Attendee</h2>
                <p>Generate a unique event ticket</p>
              </div>
            </div>

            <label>ATTENDEE NAME</label>

            <input
              type="text"
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>EMAIL ADDRESS</label>

            <input
              type="email"
              placeholder="attendee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button className="purple-button" onClick={register}>
              Register & Generate Ticket →
            </button>

            {ticketId && (
              <div className="ticket">
                <span>YOUR TICKET ID</span>
                <strong>{ticketId}</strong>
                <small>Keep this ID safe for check-in</small>
              </div>
            )}
          </section>

          {/* Check-in */}
          <section className="card checkin-card">
            <div className="card-header">
              <div className="card-icon green-bg">✓</div>
              <div>
                <h2>Volunteer Check-in</h2>
                <p>Verify and consume attendee tickets</p>
              </div>
            </div>

            <label>TICKET ID</label>

            <input
              type="text"
              placeholder="e.g. TKT-175..."
              value={checkTicket}
              onChange={(e) => setCheckTicket(e.target.value)}
            />

            <button className="green-button" onClick={checkIn}>
              ✓ Verify & Check-in
            </button>

            <div className="security-note">
              🔒 Each ticket can only be checked in once.
            </div>
          </section>

        </div>

        <footer>
          <span>EventPass</span>
          <span>Smart Event Registration & Check-in System</span>
          <span>Built for Domain Verse 1.0</span>
        </footer>

      </main>
    </div>
  );
}

export default App;