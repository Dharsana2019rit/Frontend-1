import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './TableBooking.css'; // Import CSS file for styling
import SidePanel from './SidePannel';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const userEmail = Cookies.get('email') || ''; // Fetch the email ID from cookies

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Fetch all bookings with the provided email ID
        const bookingsResponse = await axios.get(`https://localhost:44384/api/TableBookings`);
        const bookingsData = bookingsResponse.data.$values;

        // Fetch customer data for each booking
        const bookingsWithCustomers = await Promise.all(bookingsData.map(async (booking) => {
          // Fetch customer details for the current booking
          const customerResponse = await axios.get(`https://localhost:44384/api/Customers/${booking.customerId}`);
          const customer = customerResponse.data; // Assuming the customer data is returned as an object

          // Format bookingDateTime to display only the date part
          const formattedBooking = {
            ...booking,
            bookingDateTime: new Date(booking.bookingDateTime).toLocaleDateString(),
            customerEmail: customer.email ,
            customerName: customer.name
          };

          return formattedBooking;
        }));

        // Filter out the bookings that match the email ID stored in the cookie
        const matchedBookings = bookingsWithCustomers.filter(booking => booking.customerEmail === userEmail);
        setBookings(matchedBookings);
      } catch (error) {
        console.error('Error fetching table bookings:', error);
      }
    };

    fetchBookings();
  }, [userEmail]); // Trigger useEffect when userEmail changes

  return (
    <div>
      <SidePanel />
      <div className="table-bookings-container-admin">
        <h2>Table Bookings</h2>
        <div className="table-card-container-admin">
          {bookings.length === 0 ? (
            <p>No bookings found for the logged-in user.</p>
          ) : (
            bookings.map((booking, index) => (
              <div className="table-card-admin" key={index}>
                <h3>Table Number: {booking.tableNumber}</h3>
                <p><strong>Booking Date:</strong> {booking.bookingDateTime}</p>
                <p><strong>Number of Guests:</strong> {booking.numberOfGuests}</p>
                <p><strong>Customer Name:</strong> {booking.customerName}</p> {/* Display customer name */}
                {/* Add other properties here */}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;
