const colorItems = document.querySelectorAll(".color-item");

colorItems.forEach((item) => {
  item.addEventListener("click", function () {
    colorItems.forEach((item) => {
      item.classList.remove("selected");
    });
    this.classList.add("selected");
  });
});

const images = document.querySelectorAll(".container_bottom_images img");

images.forEach((image) => {
  image.addEventListener("click", () => {
    // Убираем класс selected со всех изображений
    images.forEach((img) => img.classList.remove("selected"));
    // Добавляем класс selected только к выбранному изображению
    image.classList.add("selected");
  });
});

let orderNum = 1; // начальное значение для container_head_order_num
const addButton = document.querySelector('.add-button');
const sendButton = document.querySelector('.send-button');
const notification_add = document.getElementById('notification_add');
const orderList = [];

addButton.addEventListener('click', () => {
    const orderNumElement = document.querySelector('.container_head_order_num');
    const closetSizeSelect = document.querySelector('.closet-size-select');
    const commentInput = document.querySelector('.comment-input');
    const selectedColor = document.querySelector('.color-item.selected').textContent;
    const selectedImage = document.querySelector('.container_bottom_images img.selected');

    const orderInfo = `${orderNumElement.textContent}(${closetSizeSelect.value})(${selectedColor})(${selectedImage.alt})(${commentInput.value})`;

    // Создать новый элемент с информацией о заказе и добавить класс order_item
    const orderElement = document.createElement('div');
    orderElement.textContent = orderInfo;
    orderElement.classList.add('order_item'); // Добавляем класс order_item

    // Вставить элемент с информацией о заказе под кнопку
    addButton.insertAdjacentElement('afterend', orderElement);

    // Добавить новый заказ в массив объектов
    const newOrder = {
        order_num: orderNumElement.textContent.slice(2),
        size: closetSizeSelect.value.slice(5),
        color: selectedColor,
        door_type: selectedImage.alt,
        comment: commentInput.value,
    };
  
    
    orderList.push(newOrder);
    const orderListElement = document.querySelector('.order_list');
    orderListElement.appendChild(orderElement);
    // Увеличить значение container_head_order_num на 1
    orderNum++;
    orderNumElement.textContent = `№ ${orderNum}`;

    // Показать уведомление
    notification_add.style.visibility = 'visible';

    // Скрыть уведомление через 2 секунды (2000 миллисекунд)
    setTimeout(() => {
        notification_add.style.visibility = 'hidden';
    }, 1000);
});

sendButton.addEventListener('click', () => {
    // Отправить массив orderList на сервер (пример использования fetch)
    const orderItems = document.querySelectorAll(".order_item");
    fetch("http://localhost:3001/create-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderList),
    })
        .then((response) => response.json())
        .then((data) => {
            // Обработка ответа от сервера (если необходимо)
            console.log(data);
            // Очистить массив orderList после успешной отправки на сервер
            orderList.length = 0;

            // Удаляем каждый элемент order_item
            orderItems.forEach((item) => {
                item.remove();
            });

            notification_send.style.visibility = 'visible';

            // Скрыть уведомление через 2 секунды (2000 миллисекунд)
            setTimeout(() => {
                notification_send.style.visibility = 'hidden';
                // После скрытия уведомления перезагружаем страницу
                window.location.reload();
            }, 0);
        })
        .catch((error) => {
            // Обработка ошибок (если необходимо)
            console.error("Error:", error);
        });
});