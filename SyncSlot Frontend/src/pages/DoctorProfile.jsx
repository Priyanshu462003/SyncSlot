import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Stethoscope,
} from "lucide-react";

import { getAvailability, getDoctor } from "../services/doctorService";
import { bookAppointment } from "../services/appointmentService";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import { money, formatTime } from "../utils/format";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);

  // Always initialize with YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  });

  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Today's date in YYYY-MM-DD format
  const getToday = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Load doctor
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError("");

    getDoctor(id)
      .then((r) => {
        setDoctor(r.data);
      })
      .catch((e) => {
        setError(
          e.response?.data?.message || "Doctor not found."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Load availability
  useEffect(() => {
    // Don't make API request if doctor ID or date is missing
    if (!id || !date) {
      return;
    }

    // Make sure date is YYYY-MM-DD
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

    if (!validDate) {
      setError("Please select a valid date.");
      return;
    }

    setSelected(null);
    setSlots([]);
    setSlotsLoading(true);
    setError("");
    setMessage("");

    getAvailability(id, date)
      .then((r) => {
        setSlots(r.data?.openSlots || []);
      })
      .catch((e) => {
        setSlots([]);

        setError(
          e.response?.data?.message ||
            "Could not load availability."
        );
      })
      .finally(() => {
        setSlotsLoading(false);
      });
  }, [id, date]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    setSelected(null);
    setSlots([]);
    setError("");
    setMessage("");

    if (!selectedDate) {
      setDate("");
      return;
    }

    setDate(selectedDate);
  };

  const book = async () => {
    if (!selected) {
      setError("Please select an available time.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (!user) {
      navigate("/login", {
        state: {
          from: `/doctors/${id}`,
        },
      });

      return;
    }

    if (user.role !== "PATIENT") {
      setError("Only patient accounts can book appointments.");
      return;
    }

    setError("");
    setMessage("");

    const start = selected;

    // Calculate end time
    const endDate = new Date(`1970-01-01T${start}`);

    endDate.setMinutes(
      endDate.getMinutes() +
        (doctor?.consultationDuration || 30)
    );

    const end = endDate.toTimeString().slice(0, 8);

    try {
      await bookAppointment({
        doctorId: Number(id),
        appointmentDate: date,
        startTime: start,
        endTime: end,
      });

      setMessage("Appointment booked successfully.");

      setTimeout(() => {
        navigate("/patient");
      }, 900);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          "Booking failed. The slot may have just been taken."
      );

      // Refresh availability after failed booking
      try {
        const r = await getAvailability(id, date);

        setSlots(r.data?.openSlots || []);
        setSelected(null);
      } catch (availabilityError) {
        console.error(
          "Could not refresh availability:",
          availabilityError
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="center-loader">
        <Spinner />
      </div>
    );
  }

  if (!doctor) {
    return (
      <section className="page">
        <div className="alert alert-error">
          {error || "Doctor not found."}
        </div>
      </section>
    );
  }

  return (
    <section className="page">

      {/* Back */}
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="profile-layout">

        {/* Doctor information */}
        <div className="profile-main">

          <div className="profile-header">

            <div className="profile-avatar">
              <Stethoscope size={34} />
            </div>

            <div>

              <span className="verified">
                <CheckCircle2 size={14} />
                Verified doctor
              </span>

              <h1>Dr. {doctor.name}</h1>

              <p className="specialty">
                {doctor.specialization ||
                  "General Medicine"}
              </p>

            </div>

          </div>

          <div className="profile-section">

            <h3>About</h3>

            <p>
              {doctor.bio ||
                "Professional healthcare provider available for appointments through SyncSlot."}
            </p>

          </div>

          <div className="profile-section fee-box">

            <div>
              <span className="muted">
                Consultation fee
              </span>

              <strong>
                {money(doctor.consultationFee)}
              </strong>
            </div>

            <div>
              <Clock3 size={20} />

              <span>
                Choose an available time
              </span>
            </div>

          </div>

        </div>

        {/* Booking */}
        <aside className="booking-panel">

          <div className="booking-head">

            <CalendarDays size={19} />

            <div>
              <h3>Book appointment</h3>

              <p>
                Select a date and time
              </p>
            </div>

          </div>

          {/* Date */}
          <label>
            Date

            <input
              type="date"
              min={getToday()}
              value={date}
              onChange={handleDateChange}
            />

          </label>

          {/* Slots */}
          {slotsLoading ? (

            <div className="slot-loader">
              <Spinner small />
            </div>

          ) : (

            <div className="slots">

              {!slots.length && (
                <p className="muted">
                  No open slots for this date.
                </p>
              )}

              {slots.map((slot) => (

                <button
                  key={slot}
                  type="button"
                  className={`slot ${
                    selected === slot
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    setSelected(slot);
                    setError("");
                    setMessage("");
                  }}
                >
                  {formatTime(slot)}
                </button>

              ))}

            </div>

          )}

          {/* Error */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {/* Success */}
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {/* Book */}
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!selected || !date}
            onClick={book}
          >
            {user?.role === "PATIENT"
              ? "Confirm appointment"
              : "Sign in to book"}
          </button>

          <small className="booking-note">
            Appointments are protected against
            double-booking.
          </small>

        </aside>

      </div>

    </section>
  );
}