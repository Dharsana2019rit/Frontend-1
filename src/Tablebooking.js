import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TableBooking.css'; // Import CSS file for styling
import AdminPanel from './AdminPanel';

const TableBooking = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Fetch booked tables data from the server
    const fetchBookings = async () => {
      try {
        const response = await axios.get('https://localhost:44384/api/TableBookings');
        setBookings(response.data.$values); // Update to access the values array
      } catch (error) {
        console.error('Error fetching table bookings:', error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div>
      <AdminPanel />
      <div className="table-bookings-container-admin">
        <h2>Table Bookings</h2>
        <div className="table-card-container-admin">
          {bookings.map((booking, index) => (
            <div className="table-card-admin" key={index}>
              <h3>Table Number: {booking.tableNumber}</h3>
              <p><strong>Booking Date:</strong> {booking.bookingDateTime}</p>
              <p><strong>Number of Guests:</strong> {booking.numberOfGuests}</p>
              {/* Remove the customer name */}
              {/* Add other properties here */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableBooking;
