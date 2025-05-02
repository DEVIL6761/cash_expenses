document.addEventListener('DOMContentLoaded', function() {
    console.log('Приложение загружено!');
    const API_URL = 'http://127.0.0.1:5000/api';
    let expenses = [];

    // Инициализация приложения
    init();

    function init() {
        loadExpenses();
        setupEventListeners();
    }

    // Загрузка расходов с сервера
    async function loadExpenses() {
        try {
            const response = await fetch(`${API_URL}/expenses`);
            if (!response.ok) throw new Error('Ошибка загрузки');
            expenses = await response.json();
            renderExpenses();
            updateCharts();
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Не удалось загрузить данные', 'error');
        }
    }

    // Добавление нового расхода
    async function addExpense(expenseData) {
        try {
            const response = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) throw new Error('Ошибка сохранения');

            const newExpense = await response.json();
            expenses.push(newExpense);
            renderExpenses();
            updateCharts();
            showNotification('Расход успешно добавлен', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Не удалось добавить расход', 'error');
            return false;
        }
    }

    // Отображение списка расходов
    function renderExpenses() {
        const tableBody = document.querySelector('#expensesTable tbody');
        tableBody.innerHTML = expenses.map(expense => `
            <tr>
                <td>${expense.amount} руб.</td>
                <td>${expense.category}</td>
                <td>${new Date(expense.date).toLocaleDateString()}</td>
                <td>${expense.description || '-'}</td>
                <td>
                    <button class="delete-btn" data-id="${expense.id}">×</button>
                </td>
            </tr>
        `).join('');
    }

    // Обновление графиков
    function updateCharts() {
        // Анализ по категориям
        const byCategory = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        // Здесь можно добавить код для Chart.js
        console.log('Данные для графиков:', byCategory);
    }

    // Удаление расхода
    async function deleteExpense(id) {
        try {
            const response = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Ошибка удаления');

            expenses = expenses.filter(exp => exp.id !== id);
            renderExpenses();
            updateCharts();
            showNotification('Расход удален', 'success');
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('Не удалось удалить расход', 'error');
        }
    }

    // Уведомления
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Обработчики событий
    function setupEventListeners() {
        // Форма добавления расхода
        const expenseForm = document.getElementById('expenseForm');
        if (expenseForm) {
            expenseForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(expenseForm);
                const expense = {
                    amount: parseFloat(formData.get('amount')),
                    category: formData.get('category'),
                    date: formData.get('date'),
                    description: formData.get('description')
                };

                const success = await addExpense(expense);
                if (success) expenseForm.reset();
            });
        }

        // Форма входа
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(loginForm);
                const credentials = {
                    username: formData.get('username'),
                    password: formData.get('password')
                };

                try {
                    const response = await fetch(`${API_URL}/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials)
                    });

                    if (!response.ok) throw new Error('Ошибка авторизации');

                    const { token } = await response.json();
                    localStorage.setItem('authToken', token);
                    window.location.href = '/';
                } catch (error) {
                    console.error('Ошибка:', error);
                    showNotification('Неверные учетные данные', 'error');
                }
            });
        }

        // Кнопки удаления (делегирование событий)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                if (confirm('Удалить этот расход?')) {
                    const id = e.target.dataset.id;
                    deleteExpense(id);
                }
            }
        });
    }
});