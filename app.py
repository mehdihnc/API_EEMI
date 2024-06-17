from flask import Flask, request, jsonify, g
import sqlite3
from sqlite3 import IntegrityError

app = Flask(__name__)

DATABASE = 'mydatabase.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    with app.app_context():
        db = get_db()
        with open('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

@app.teardown_appcontext
def close_db(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/users', methods=['POST'])
def create_user():
    try:
        db = get_db()
        db.execute('INSERT INTO users (name, email) VALUES (?, ?)',
                   [request.json['name'], request.json['email']])
        db.commit()
        return jsonify({"message": "User created successfully"}), 201
    except IntegrityError:
        return jsonify({"error": "Email already exists"}), 400

@app.route('/users', methods=['GET'])
def get_users():
    db = get_db()
    users = db.execute('SELECT * FROM users').fetchall()
    return jsonify([{"id": user['id'], "name": user['name'], "email": user['email']} for user in users])

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    db = get_db()
    db.execute('UPDATE users SET name = ?, email = ? WHERE id = ?',
               [request.json['name'], request.json['email'], user_id])
    db.commit()
    return jsonify({"message": "User updated successfully"}), 200

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    db = get_db()
    db.execute('DELETE FROM users WHERE id = ?', [user_id])
    db.commit()
    return jsonify({"message": "User deleted successfully"}), 200

if __name__ == '__main__':
    init_db()  # Initialize the database
    app.run(debug=True)
