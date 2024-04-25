import React, { useState, useEffect } from 'react';
import { createTableBooking } from './api/tableApi';
import Modal from './Modal';
import './Dashboard.css';
import SidePanel from './SidePannel';

const Dashboard = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  const handleTableSelect = (table) => {
    if (table.isBooked) {
      setError('Sorry, this table is already booked.');
      return;
    }

    setSelectedTable(table);
    setShowModal(true);
    setBookingDetails({ ...bookingDetails, tableNumber: table.tableNumber });
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
      setError('Failed to create booking');
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
