from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pymysql

app = Flask(__name__)
CORS(app)

product_list = []
# Connect to MySQL
db = pymysql.connect(host="localhost", user="root", password="navee2003", database="ecommerce")
cursor = db.cursor()

# Home Page
# Fetch Products Correctly
@app.route("/")
def index():
    cursor.execute("SELECT id, name, price, image FROM products")
    products = cursor.fetchall()

    # Convert tuple results to dictionary (if using MySQL)
    products = [{"id": p[0], "name": p[1], "price": p[2], "image": p[3]} for p in products]
    
    return render_template("index.html", products=products)


# Fetch All Products
@app.route("/products", methods=["GET"])
def get_products():
    cursor.execute("SELECT id, name, price, image FROM products")
    products = cursor.fetchall()
    product_list = [{"id": p[0], "name": p[1], "price": p[2], "image": p[3]} for p in products]
    return jsonify(product_list)

# Add Product
@app.route('/add_product', methods=['POST'])
def add_product():
    data = request.get_json()
    
    # Debugging: Print received data
    print("🔍 Received Data:", data)

    if not data:
        return jsonify({"error": "No data received!"}), 400

    name = data.get('name', '').strip()
    price = data.get('price')
    image = data.get('image_url', '').strip()  # ✅ Fix: Accept image_url

    print(f"✔️ Name: {name}, Price: {price}, Image: {image}")  # Debugging

    if not name or not price or not image:
        return jsonify({"error": "All fields are required!"}), 400

    try:
        price = float(price)  # Ensure price is a number
    except ValueError:
        return jsonify({"error": "Price must be a number!"}), 400

    # Insert into database
    cursor.execute("INSERT INTO products (name, price, image) VALUES (%s, %s, %s)", (name, price, image))
    db.commit()

    return jsonify({"success": "Product added successfully!"}), 201


# Delete Product
@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "❌ Product not found!"}), 404

    return jsonify({"message": "✅ Product deleted successfully!"}), 200


# Add to Cart
@app.route("/add_cart", methods=["POST"])
def add_to_cart():
    data = request.json
    cursor.execute("INSERT INTO cart (product_id) VALUES (%s)", (data["product_id"],))
    db.commit()
    return jsonify({"message": "Added to cart!"})

#get cart
@app.route('/cart', methods=['GET'])
def get_cart():
    cursor.execute("""
        SELECT c.id as cart_id, p.name, p.price 
        FROM cart c 
        JOIN products p ON c.product_id = p.id
    """)
    cart_items = cursor.fetchall()

    # Ensure dictionary format
    formatted_items = [{"cart_id": item[0], "name": item[1], "price": item[2]} for item in cart_items]

    return jsonify(formatted_items)


# ✅ API to Remove Item from Cart
@app.route('/cart/<int:cart_id>', methods=['DELETE'])
def remove_from_cart(cart_id):
    cursor.execute("DELETE FROM cart WHERE id = %s", (cart_id,))
    db.commit()
    return jsonify({"message": "Removed from cart!"})

if __name__ == "__main__":
    app.run(debug=True)



