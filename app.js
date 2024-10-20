// Проверка, зарегистрирован ли пользователь
function checkRegistration() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        // Если нет данных о пользователе, показать форму регистрации
        document.getElementById('registrationForm').style.display = 'block';
        document.getElementById('submitBtn').disabled = true; // Блокируем запись до регистрации
    } else {
        document.getElementById('registrationForm').style.display = 'none';
        document.getElementById('submitBtn').disabled = false; // Разблокируем запись
    }
}

// Обработка регистрации
document.getElementById('registerBtn').addEventListener('click', () => {
    const phone = document.getElementById('phoneInput').value;
    
    if (phone) {
        const user = {
            phone: phone,
            registrationDate: new Date().toLocaleDateString()
        };
        localStorage.setItem('user', JSON.stringify(user));
        alert('Регистрация успешна!');
        checkRegistration();
        sendTelegramNotification(`Новый пользователь зарегистрировался с номером телефона: ${phone}`);
    } else {
        alert('Введите номер телефона');
    }
});

// Функция для добавления записи
document.getElementById('submitBtn').addEventListener('click', () => {
    const service = document.getElementById('serviceSelect').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;

    if (date && time) {
        const user = JSON.parse(localStorage.getItem('user'));
        const appointment = {
            service: service,
            date: date,
            time: time,
            user: user.phone
        };

        // Получаем текущие записи из LocalStorage
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

        // Добавляем новую запись
        appointments.push(appointment);

        // Сохраняем обновленный список записей в LocalStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Отправляем уведомление в Telegram
        const message = `Новая запись:\nУслуга: ${service}\nДата: ${date}\nВремя: ${time}\nТелефон клиента: ${user.phone}`;
        sendTelegramNotification(message);

        // Обновляем список на странице
        displayAppointments();
    } else {
        alert('Пожалуйста, выберите дату и время.');
    }
});

// Функция для отображения записей на странице
function displayAppointments() {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = ''; // Очищаем список

    // Получаем записи из LocalStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    // Добавляем каждую запись в список
    appointments.forEach((appointment, index) => {
        const li = document.createElement('li');
        li.textContent = `${appointment.service} - ${appointment.date} в ${appointment.time} (Телефон: ${appointment.user})`;
        
        // Добавляем кнопку для удаления записи
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => {
            removeAppointment(index);
        });

        li.appendChild(deleteBtn);
        appointmentsList.appendChild(li);
    });
}

// Функция для удаления записи
function removeAppointment(index) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.splice(index, 1);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    displayAppointments();
}

// Функция отправки уведомления в Telegram
function sendTelegramNotification(message) {
    const telegramBotToken = '7757328586:AAEgOXTFQqNBUOgBQR_jyBH7OAl55vVKYwU'; // Замените на свой токен бота
    const chatId = '425804880'; // Замените на ID чата мастера
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message
        })
    }).then(response => {
        return response.json();
    }).then(data => {
        if (!data.ok) {
            console.error("Ошибка:", data.description);
            alert('Ошибка отправки уведомления в Telegram: ' + data.description);
        } else {
            console.log("Уведомление отправлено успешно");
        }
    }).catch(error => {
        console.error('Ошибка соединения с Telegram API:', error);
    });
}

// Проверяем регистрацию при загрузке страницы
window.onload = () => {
    checkRegistration();
    displayAppointments();
};
