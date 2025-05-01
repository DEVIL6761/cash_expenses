from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from models import db, Expense, User
from auth import register, login

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
    user_id = get_jwt_identity()
    data = request.get_json()
    new_expense = Expense(
        user_id=user_id,
        amount=data['amount'],
        category=data['category'],
        date=data['date'],
        description=data.get('description', '')
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify({"message": "Expense added!"}), 201

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

if __name__ == '__main__':
    app.run(port=5001)  # Теперь сервер на порту 5001