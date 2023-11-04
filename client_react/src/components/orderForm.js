import React, { useState } from 'react';
import axios from 'axios';
import '../style.css'; // Подключаем стили для формы

const OrderForm = ({ onOrderAdded }) => {
  const [order, setOrder] = useState({
    size: 'Шкаф 1800',
    color: '110SM',
    doorType: '2-Зер.',
    comment: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/orders', order);
      onOrderAdded(response.data);
    } catch (error) {
      console.error('Error adding order:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });
  };

  return (
    <form className="order-form container" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="size">Размер шкафа:</label>
        <select
          id="size"
          name="size"
          value={order.size}
          onChange={handleInputChange}
        >
          {/* Опции для выбора размера */}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="color">Цвет:</label>
        <select
          id="color"
          name="color"
          value={order.color}
          onChange={handleInputChange}
        >
          {/* Опции для выбора цвета */}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="doorType">Тип дверей:</label>
        <select
          id="doorType"
          name="doorType"
          value={order.doorType}
          onChange={handleInputChange}
        >
          {/* Опции для выбора типа дверей */}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="comment">Комментарий:</label>
        <input
          type="text"
          id="comment"
          name="comment"
          value={order.comment}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" className="form-button">
        Добавить в список
      </button>
    </form>
  );
};

export default OrderForm;