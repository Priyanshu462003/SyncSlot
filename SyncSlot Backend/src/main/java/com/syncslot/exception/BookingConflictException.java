package com.syncslot.exception;

/**
 * Thrown when the pessimistic-lock overlap check finds an existing BOOKED
 * appointment that conflicts with the requested time window. Mapped to 409 Conflict.
 */
public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
}
