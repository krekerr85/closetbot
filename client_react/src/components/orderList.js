import React from 'react';

const OrderList = ({ orders }) => {
  // Рендеринг списка заказов
  return (
    <div className="order-list">
      {orders.map((order) => (
        <div key={order.id}>
          {/* Отображение данных заказа */}
        </div>
      ))}
    </div>
  );
};

export default OrderList;