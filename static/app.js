document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'http://127.0.0.1:5001';
    let authToken = localStorage.getItem('authToken');

    // Если нет токена - перенаправляем на страницу входа
    if (!authToken) {
        window.location.href = '/login.html';
    }

    // Инициализация Chart.js
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const categoryChart = new Chart(ctx, {
        type: 'pie',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
        options: { responsive: true }
    });

    // Загрузка данных при старте
    loadExpenses();
    loadStats();

    // Обработчик формы
    document.getElementById('expenseForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const expense = {
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            description: document.getElementById('description').value
        };

        try {
            const response = await fetch(`${apiUrl}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(expense)
            });

            if (response.ok) {
                loadExpenses();
                loadStats();
                this.reset();
            } else {
                alert('Ошибка при добавлении расхода');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Загрузка списка расходов
    async function loadExpenses() {
        try {
            const response = await fetch(`${apiUrl}/expenses`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const expenses = await response.json();
            renderExpenses(expenses);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Загрузка статистики
    async function loadStats() {
        try {
            const response = await fetch(`${apiUrl}/stats`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const stats = await response.json();
            updateChart(stats);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Обновление таблицы расходов
    function renderExpenses(expenses) {
        const tbody = document.querySelector('#expensesTable tbody');
        tbody.innerHTML = expenses.map(expense => `
            <tr>
                <td>${expense.amount}</td>
                <td>${expense.category}</td>
                <td>${expense.date}</td>
                <td>${expense.description || ''}</td>
            </tr>
        `).join('');
    }

    // Обновление графика
    function updateChart(stats) {
        const labels = Object.keys(stats);
        const data = Object.values(stats);
        const colors = labels.map((_, i) => `hsl(${i * 360 / labels.length}, 70%, 50%)`);

        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = data;
        categoryChart.data.datasets[0].backgroundColor = colors;
        categoryChart.update();
    }
});