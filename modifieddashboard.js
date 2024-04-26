import React, { useState, useEffect } from 'react';
import { createTableBooking } from './api/tableApi';
import Modal from './Modal';
import './Dashboard.css';
import SidePanel from './SidePannel';
import axios from 'axios';

const Dashboard = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [error, ] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfGuests: '',
    tableNumber: 0
  });

  useEffect(() => {
    const initialTables = Array.from({ length: 10 }, (_, index) => ({
      tableNumber: index + 1,
      isBooked: false
    }));
    setTables(initialTables);
  }, []);
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('https://localhost:44384/api/TableBookings');
        console.log('new',response.data);
        setBookings(response.data.$values || []); // Ensure orders is initialized as an array
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Failed to fetch orders. Please try again later.');
      }
    };

    fetchBookings();
  }, []);
  const handleTableSelect = async (table) => {
    try {
      // Check if the bookings array is initialized and has at least one element
  
  
      // Check if the selected table is already booked
      const selectedTableBooking = table.tableNumber;
      console.log('selectedTableBooking', selectedTableBooking);
  
      const regtableNumbers = bookings.map(booking => booking.tableNumber);
      console.log('regtableNumbers', regtableNumbers);
  
      if (selectedTableBooking && regtableNumbers.includes(selectedTableBooking)) {
        alert('Sorry, this table is already booked.');
        return { ...table, isBooked: true };
      }

      
      // If the table is not already booked, proceed with showing the modal
      setSelectedTable(table);
      setShowModal(true);
      setBookingDetails({ ...bookingDetails, tableNumber: table.tableNumber });
  
      // Clear any previous error messages

    } catch (error) {
      console.error('Error fetching booked tables:', error);
      alert('Failed to check table booking status');
    }
  };
  
  

  const handleSubmitBooking = async () => {
    try {
      const bookingData = {
        bookingDateTime: new Date().toISOString(),
        numberOfGuests: parseInt(bookingDetails.numberOfGuests),
        customerId: 0,
        tableNumber: bookingDetails.tableNumber,
        isBooked: true,
        customer: {
          name: bookingDetails.name,
          email: bookingDetails.email,
          phone: bookingDetails.phone,
          tableBookings: []
        }
      };

      await createTableBooking(bookingData);

      const updatedTables = tables.map(table => {
        if (table.tableNumber === bookingDetails.tableNumber) {
          return { ...table, isBooked: true };
        }
        return table;
      });

      setTables(updatedTables);
      setSelectedTable(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  return (
    <div>
      <SidePanel />
      <h2>Book tables</h2>
      <div className="dashboard-container">
        <div className="tables-container">
          <div className="table-grid">
            {tables.map((table, index) => (
              <div key={index} className={`table-card ${table.isBooked ? 'booked' : ''}`} onClick={() => handleTableSelect(table)}>
                <p className="table-number">{`Table ${table.tableNumber}`}</p>
                {table.isBooked && <p className="status">Booked</p>}
              </div>
            ))}
          </div>
        </div>
        {showModal && (
          <Modal
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmitBooking}
            onChange={(e) => setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value })}
            bookingDetails={bookingDetails}
          />
        )}
        <div>{error && <div>{error}</div>}</div>
      </div>
    </div>
  );
};

export default Dashboard;
