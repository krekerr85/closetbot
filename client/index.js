const doorTypes = {
    '0-2':'2-Зер.',
    '1-1':'1-ДСП,1-Зер.',
    '2-0':'2-ДСП',
    '2-1':'2-ДСП,1-Зер.',
    '2-2':'2-ДСП,2-Зер.',
    '3-0':'3-ДСП',
    '0-3':'3-Зер.',

} 

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
    if (orderNum > 10){
        notification_error.style.visibility = 'visible';

    // Скрыть уведомление через 2 секунды (2000 миллисекунд)
    setTimeout(() => {
        notification_error.style.visibility = 'hidden';
    }, 1000);
        return;
    }
    const orderNumElement = document.querySelector('.container_head_order_num');
    const closetSizeSelect = document.querySelector('.closet-size-select');
    const commentInput = document.querySelector('.comment-input');
    const selectedColor = document.querySelector('.color-item.selected').textContent;
    const selectedImage = document.querySelector('.container_bottom_images img.selected');

    const orderInfo = `${orderNumElement.textContent} (${closetSizeSelect.value})(${selectedColor})(${doorTypes[selectedImage.alt]})(${commentInput.value})`;

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
    orderNumElement.textContent = `№${orderNum}`;

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


const closetSizeSelect = document.querySelector('.closet-size-select');
const containerColors = document.querySelector('.container_colors');
const bottomImages = document.querySelectorAll('.container_bottom_images img');
const bodyImages = document.querySelector('.container_body_image img');

const imageDir = {
    '1100': "1.1-1.9",
    '1200': "1.1-1.9",
    '1300': "1.1-1.9",
    '1400': "1.1-1.9",
    '1500': "1.1-1.9",
    '1600': "1.1-1.9",
    '1700': "1.1-1.9",
    '1800': "1.1-1.9",
    '1900': "1.1-1.9",
    '2000': "2.0-2.2",
    '2100': "2.0-2.2",
    '2200': "2.0-2.2",
    '2300': "2.3-2.5",
    '2400': "2.3-2.5",
    '2500': "2.3-2.5",
    '2600': "2.6-2.7",
    '2700': "2.6-2.7",
    '2800': "2.8",
    '2900': "2.9-3.0",
    '3000': "2.9-3.0",
    '3100': "3.1-3.3",
    '3200': "3.1-3.3",
    '3300': "3.1-3.3",

} 


closetSizeSelect.addEventListener('change', updateImages);
containerColors.addEventListener('click', updateImages);

async function updateImages() {
    const selectedSize = closetSizeSelect.value;
    const selectedColor = containerColors.querySelector('.selected').textContent;

    // Отправить запрос на сервер для получения фотографий в зависимости от выбранных параметров
    try {
        const response = await fetch(`/api/images/get_images?size=${selectedSize}&color=${selectedColor}`);
        const data = await response.json();
        
        // Обновить src атрибуты изображений в container_bottom_images
        bottomImages.forEach((image, index) => {
            const imageName = data.images[index]; // предполагается, что сервер возвращает массив имен файлов
            image.src = `/images/${imageDir[selectedSize.slice(5)]}/${selectedColor}/${imageName}`;
            image.alt = `${imageName.slice(0,-4)}`;
        });
        const imageName = data.images[3]
        bodyImages.src = `/images/${imageDir[selectedSize.slice(5)]}/${selectedColor}/${imageName}`;
        bodyImages.alt = `${imageName}`;
    } catch (error) {
        console.error('Ошибка при получении данных с сервера:', error);
    }
}
