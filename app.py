from flask import Flask, render_template
from flask import Flask, render_template, url_for
from datetime import datetime

from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from models import db, Expense, User
from auth import register, login


app = Flask(__name__, static_folder='static', template_folder='templates')
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # В продакшене заменить!
db.init_app(app)
jwt = JWTManager(app)

# Регистрация и вход
app.add_url_rule('/register', 'register', register, methods=['POST'])
app.add_url_rule('/login', 'login', login, methods=['POST'])

# Добавление расхода
@app.route('/expenses', methods=['POST'])
@jwt_required()
def add_expense():
    try:
        data = request.get_json()

        # Проверка обязательных полей
        if not all(k in data for k in ['amount', 'category', 'date']):
            return jsonify({"error": "Missing required fields"}), 422

        # Проверка типа amount
        if not isinstance(data['amount'], (int, float)):
            return jsonify({"error": "Amount must be a number"}), 422

        # Проверка даты
        try:
            datetime.strptime(data['date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Date must be in YYYY-MM-DD format"}), 422

        # Остальная логика обработки
        new_expense = Expense(
            user_id=get_jwt_identity(),
            amount=data['amount'],
            category=data['category'],
            date=data['date'],
            description=data.get('description', '')
        )
        db.session.add(new_expense)
        db.session.commit()

        return jsonify({"message": "Expense added!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Получение всех расходов
@app.route('/expenses', methods=['GET'])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": e.id,
        "amount": e.amount,
        "category": e.category,
        "date": e.date,
        "description": e.description
    } for e in expenses]), 200

# Простая аналитика (сумма по категориям)
@app.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = get_jwt_identity()
    expenses = Expense.query.filter_by(user_id=user_id).all()
    stats = {}
    for e in expenses:
        stats[e.category] = stats.get(e.category, 0) + e.amount
    return jsonify(stats), 200

@app.route('/test')
def test():
    return "Сервер работает! Этот маршрут корректен.", 200
# Добавляем новый маршрут для главной страницы

@app.route('/')
def home():
    return """
    <h1>Сервер работает!</h1>
    <p>Тестовый маршрут работает. Теперь проверьте:</p>
    <ul>
        <li><a href="/register">Регистрация</a></li>
        <li><a href="/login">Вход</a></li>
    </ul>
    """

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')  # Важно: файл должен существовать

if __name__ == '__main__':
    app.run(debug=True)