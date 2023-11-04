import React, { useState, useEffect } from "react";
import axios from "axios";
import ColorOption from "./components/ColorOption";

const App = () => {
  const colors = [
    { name: "110SM", className: "container_colors_110SM" },
    { name: "U112", className: "container_colors_U112" },
    { name: "3025MX", className: "container_colors_3025MX" },
    { name: "U164", className: "container_colors_U164" },
  ];
  const doorTypes = {
    "0-2.jpg": "2-Зер.",
    "1-1.jpg": "1-ДСП,1-Зер.",
    "2-0.jpg": "2-ДСП",
    "2-1.jpg": "2-ДСП,1-Зер.",
    "2-2.jpg": "2-ДСП,2-Зер.",
    "3-0.jpg": "3-ДСП",
    "0-3.jpg": "3-Зер.",
    "0-4.jpg": "4-Зер.",
    "4-0.jpg": "4-ДСП",
  };
  const closetSizes = [
    1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900,
    3000, 3100, 3200, 3300,
  ];

  const [orderNum, setOrderNum] = useState(1);
  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [selectedSize, setSelectedSize] = useState(closetSizes[0]);
  const [previewImage, setPreviewImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [orderList, setOrderList] = useState([]);
  const [notification, setNotification] = useState("");
  const [notificationColor, setNotificationColor] = useState("");

  const addButtonHandler = () => {
    if (orderNum > 10) {
      setNotificationColor("red");
      setNotification("Нельзя добавить больше 10 элементов!");
      setTimeout(() => {
        setNotificationColor("");
        setNotification("");
      }, 2000);
      return;
    }

    const closetSizeSelect = document.querySelector(".closet-size-select");
    const selectedColor = document.querySelector(
      ".color-item.selected"
    ).textContent;
    const selectedImage = document.querySelector(
      ".container_bottom_images img.selected"
    );

    const newOrder = {
      order_num: orderNum,
      size: closetSizeSelect.value,
      color: selectedColor,
      door_type: selectedImage.alt,
      comment: document.querySelector(".comment-input").value,
    };

    setOrderList([...orderList, newOrder]);
    setOrderNum(orderNum + 1);
  };

  const sendButtonHandler = async () => {
    try {
      const loaderWrapper = document.querySelector(".loader-wrapper");
      loaderWrapper.style.display = "flex";

      const res = await axios.post(
        "http://localhost:3001/api/telegram/create-order",
        orderList
      );

      setOrderList([]);
      setOrderNum(1);

      loaderWrapper.style.display = "none";
      setNotification("Успешно отправлено!");

      setTimeout(() => {
        setNotification("");
      }, 2000);
    } catch (error) {
      console.error("Ошибка отправки заказа:", error);
      setNotification("Ошибка отправки заказа!");
      setTimeout(() => {
        setNotification("");
      }, 2000);
    }
  };

  const handleDeleteOrder = (orderNumEl) => {
    setOrderNum(orderNum - 1);
    setOrderList((prevOrderList) => {
      const updatedOrderList = prevOrderList.filter(
        (order) => order.order_num !== orderNumEl
      );
      const newOrderList = updateOrderNumbers(updatedOrderList);
      return newOrderList;
    });
  };
  const updateOrderNumbers = (newOrderList) => {
    const updatedOrderList = newOrderList.map((order, index) => {
      return { ...order, order_num: index + 1 };
    });
    return updatedOrderList;
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (e) => {
    setSelectedSize(parseInt(e.target.value, 10));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/images?color=${selectedColor}&size=${selectedSize}`
        );
        setPreviewImage(response.data.preview);
        setAdditionalImages(response.data.additional);
        setSelectedImage(response.data.additional[0]);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    };

    fetchData();
  }, [selectedColor, selectedSize]);

  return (
    <>
      <div className="container">
        <div className="container_head_order_num">№{orderNum}</div>
        <div className="container_head_closet_size">
          <select
            className="closet-size-select"
            value={selectedSize}
            onChange={handleSizeChange}
          >
            {closetSizes.map((size) => (
              <option key={size} value={size}>
                Шкаф {size}
              </option>
            ))}
          </select>
        </div>
        <div className="container_head_comment">
          <input
            type="text"
            placeholder="Комментарий"
            className="comment-input"
          />
        </div>
        <div className="container_body_image">
          <img src={previewImage} alt="preview" />
        </div>

        <div className="container_colors">
          {colors.map((color) => (
            <ColorOption
              key={color.name}
              color={color.name}
              selected={selectedColor === color.name}
              onClick={handleColorClick}
              colorClass={color.className}
            />
          ))}
        </div>

        <div className="container_bottom_images">
          {additionalImages.map((image, index) => {
            const imageName = image.split("/").pop();
            return (
              <img
                key={index}
                src={image}
                alt={`${doorTypes[imageName]}`}
                className={selectedImage === image ? "selected" : ""}
                onClick={() => setSelectedImage(image)}
              />
            );
          })}
        </div>

        <button className="add-button" onClick={addButtonHandler}>
          Добавить в список
        </button>
        <button className="send-button" onClick={sendButtonHandler}>
          Отправить
        </button>

        {notification && (
          <div
            className={`notification ${
              notificationColor && `notification-${notificationColor}`
            }`}
          >
            {notification}
          </div>
        )}
      </div>
      <div className="order_list">
        {orderList.map((order, index) => (
          <div className="order_item" key={index}>
            <div className="container_order_num">№{order.order_num}</div>
            <div className="order_item_info">
              {`Шкаф ${order.size} (${order.color}) (${order.door_type}) (${order.comment})`}
            </div>
            <button
              className="delete-button"
              onClick={() => handleDeleteOrder(order.order_num)}
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
      {
        <div className="loader-wrapper">
          <div className="loader"> </div>
        </div>
      }
    </>
  );
};

export default App;
