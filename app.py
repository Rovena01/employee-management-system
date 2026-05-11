from flask import Flask, render_template, request, jsonify, redirect, url_for, session, Response
import sqlite3

app = Flask(__name__)
app.secret_key = "employee_secret_key"

# Create database table
def init_db():
    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            salary INTEGER NOT NULL
        )
    ''')

    conn.commit()
    conn.close()


# FRONTEND PAGE
@app.route('/')
def home():

    if not session.get('admin_logged_in'):
        return redirect(url_for('login'))

    return render_template('index.html')

# LOGIN
@app.route('/login', methods=['GET', 'POST'])
def login():

    if request.method == 'POST':

        username = request.form['username']
        password = request.form['password']

        if username == 'admin' and password == 'admin123':

            session['admin_logged_in'] = True
            return redirect(url_for('home'))

        return render_template(
            'login.html',
            error='Invalid username or password'
        )

    return render_template('login.html')


# GET all employees
@app.route('/employees', methods=['GET'])
def get_employees():

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM employees")
    employees = cursor.fetchall()

    conn.close()

    employee_list = []

    for emp in employees:
        employee_list.append({
            "id": emp[0],
            "name": emp[1],
            "department": emp[2],
            "salary": emp[3]
        })

    return jsonify(employee_list)


# ADD employee
@app.route('/employees', methods=['POST'])
def add_employee():

    data = request.get_json()

    name = data['name']
    department = data['department']
    salary = data['salary']

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO employees (name, department, salary) VALUES (?, ?, ?)",
        (name, department, salary)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Employee added successfully!"})


# DELETE employee
@app.route('/employees/<int:id>', methods=['DELETE'])
def delete_employee(id):

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("DELETE FROM employees WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Employee deleted successfully!"})

# UPDATE employee
@app.route('/employees/<int:id>', methods=['PUT'])
def update_employee(id):

    data = request.get_json()

    name = data['name']
    department = data['department']
    salary = data['salary']

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE employees SET name = ?, department = ?, salary = ? WHERE id = ?",
        (name, department, salary, id)
    )

    conn.commit()
    conn.close()

    return jsonify({"message": "Employee updated successfully!"})

# DATABASE PAGE
@app.route('/database')
def database():

    if not session.get('admin_logged_in'):
        return redirect(url_for('login'))

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM employees")
    total_records = cursor.fetchone()[0]
    cursor.execute("SELECT * FROM employees")
    employees = cursor.fetchall()

    conn.close()

    return render_template(
    'database.html',
    total_records=total_records,
    employees=employees
)

# EXPORT CSV
@app.route('/export')
def export_csv():

    if not session.get('admin_logged_in'):
        return redirect(url_for('login'))

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM employees")
    employees = cursor.fetchall()

    conn.close()

    csv_data = "ID,Name,Department,Salary\n"

    for employee in employees:
        csv_data += f"{employee[0]},{employee[1]},{employee[2]},{employee[3]}\n"

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={
            "Content-disposition":
            "attachment; filename=employees.csv"
        }
    )

# LOGOUT
@app.route('/logout')
def logout():

    session.pop('admin_logged_in', None)

    return redirect(url_for('login'))

if __name__ == '__main__':
    init_db()
    app.run(debug=True)