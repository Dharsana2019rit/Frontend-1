import React, { useState, useEffect } from 'react';
import { getMenuItems, createOrder } from './api/orderApi';
import './OrderPage.css';
import SidePanel from './SidePannel';
import Cookies from 'js-cookie';

const OrderPage = () => {
  const userEmail = Cookies.get('email') || '';
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await getMenuItems();
        let items = [];
        console.log(response.$values);
        console.log('value',Array.isArray(response.$values));
        if (response.$values && Array.isArray(response.$values)) {
          items = response.$values;
        } else {
          console.error('Expected an array of menu items, but received:', response);
        }
        setMenuItems(items);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    const categories = [...new Set(menuItems.map(item => item.menu.category.toLowerCase()))]; // Get unique categories
    const filteredItems = menuItems.filter(item => {
      const itemName = item.name.toLowerCase();
      const category = item.menu.category.toLowerCase();
      const search = searchQuery.toLowerCase();
  
      // If the search query matches a category, only show items of that category
      if (categories.includes(search)) {
        return category === search;
      }
  
      // Otherwise, show items where the name or category matches the search query
      return itemName.includes(search) || category.includes(search);
    });
  
    setFilteredMenuItems(filteredItems);
  }, [searchQuery, menuItems]);
  
  
  
  
  

  const handleQuantityChange = (itemName, quantity) => {
    setSelectedItems({ ...selectedItems, [itemName]: quantity });
  };

  const handleIncrement = (itemName) => {
    const currentQuantity = selectedItems[itemName] || 0;
    setSelectedItems({ ...selectedItems, [itemName]: currentQuantity + 1 });
  };

  const handleDecrement = (itemName) => {
    const currentQuantity = selectedItems[itemName] || 0;
    if (currentQuantity > 0) {
      setSelectedItems({ ...selectedItems, [itemName]: currentQuantity - 1 });
    }
  };

  const handleSubmitOrder = async () => {
    try {
      const ordersToCreate = Object.entries(selectedItems)
        .filter(([itemName, quantity]) => quantity > 0)
        .map(([itemName, quantity]) => {
          const menuItem = menuItems.find(item => item.name === itemName);
          return createOrderData(menuItem);
        });

      await Promise.all(ordersToCreate.map(orderData => createOrder(orderData)));
      console.log('orderTocreate',ordersToCreate);
      alert('Orders placed successfully!');
      setSelectedItems({});
    } catch (error) {
      console.error('Error placing orders:', error);
      alert('Failed to place orders.');
    }
  };

  const createOrderData = (item) => {
    const orderData = {
      orderEmail: userEmail,
      orderDate: new Date().toISOString(),
      itemName: item.name,
      OrderCategory: item.menu.category,
      price: item.price,
      quantity: selectedItems[item.name] || 0
    };
    return orderData;
  };

  // Calculate total amount
  const totalAmount = Object.entries(selectedItems).reduce((total, [itemName, quantity]) => {
    const menuItem = menuItems.find(item => item.name === itemName);
    return total + (menuItem ? menuItem.price * quantity : 0);
  }, 0);

  return (
    <div>
      <SidePanel />
      <div className="order-page">
        <h2>Place Your Order</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by item name or category"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="menu-items">
          {filteredMenuItems.map(item => (
            <div key={item.menuItemId} className="menu-item">
              <div className="menu-item-info">
                <h3>{item.name}</h3>
                <p>Category: {item.menu.category}</p>
                <p>Price: ₹{item.price}</p>
              </div>
              <div className="quantity-selector">
                <button onClick={() => handleDecrement(item.name)}>-</button>
                <input
                  type="number"
                  min="0"
                  value={selectedItems[item.name] || 0}
                  onChange={(e) => handleQuantityChange(item.name, parseInt(e.target.value))}
                />
                <button onClick={() => handleIncrement(item.name)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <button className='orderbutton' onClick={handleSubmitOrder}>Place Order</button>
        <div className="total-amount">Total: ₹{totalAmount.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default OrderPage;
