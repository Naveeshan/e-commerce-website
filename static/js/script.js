document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();
});

function fetchProducts() {
    fetch("http://127.0.0.1:5000/products") 
        .then(response => response.json())
        .then(products => {
            let productContainer = document.querySelector(".product-container");
            productContainer.innerHTML = ""; // Clear previous products

            products.forEach(product => {
                let productCard = document.createElement("div");
                productCard.classList.add("product-card");

                productCard.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">$${product.price}</p>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">➕ Add to Cart</button>
                    <button class="delete-product" onclick="deleteProduct(${product.id})">❌ Delete</button>
                `;

                productContainer.appendChild(productCard);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
}


function addToCart(productId) {
    fetch(`http://localhost:5000/add-to-cart/${productId}`, { method: "POST" })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error("Error adding to cart:", error));
}
document.getElementById("addProductForm").addEventListener("submit", function (event) {
    event.preventDefault(); // ❗ Stop form from reloading the page

    let name = document.getElementById("productName").value.trim();
    let price = document.getElementById("productPrice").value.trim();
    let image = document.getElementById("productImage").value.trim();

    // ✅ Validate inputs
    if (!name || !price || !image) {
        alert("❌ All fields are required!");
        return;
    }

    if (isNaN(price) || price <= 0) {
        alert("❌ Price must be a positive number!");
        return;
    }

    // ✅ Send product data to Flask backend
    fetch("/add_product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, price: parseFloat(price), image: image }) // Convert price to number
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("❌ Error: " + data.error);
        } else {
            alert("✅ " + data.success);
            fetchProducts(); // ✅ Refresh product list after adding
            document.getElementById("addProductForm").reset(); // ✅ Clear input fields
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("❌ Something went wrong. Try again.");
    });
});

function addToCart(productId) {
    fetch("/add_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);  // Show success message
        loadCart();  // Refresh cart
    })
    .catch(error => console.error("Error:", error));
}
function loadCart() {
    fetch('/cart')
    .then(response => response.json())
    .then(cartItems => {
        console.log("Cart items fetched:", cartItems); // Debugging step

        let cartContainer = document.getElementById("cart-container");
        cartContainer.innerHTML = "";  

        if (cartItems.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }

        cartItems.forEach(item => {
            if (!item.name || item.price === undefined) {
                console.error("Error: Missing product data", item);
                return;
            }

            let cartItemDiv = document.createElement("div");
            cartItemDiv.classList.add("cart-item");

            cartItemDiv.innerHTML = `
                <p>${item.name} - $${item.price}</p>
                <button class="remove-from-cart" onclick="removeFromCart(${item.cart_id})">❌ Remove</button>
            `;
            cartContainer.appendChild(cartItemDiv);
        });
    })
    .catch(error => console.error("Error loading cart:", error));
}

function removeFromCart(cart_id) {
    console.log("Removing item with cart_id:", cart_id); 

    fetch(`/cart/${cart_id}`, { method: "DELETE" })  
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to remove item from cart.");
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
        loadCart();  // Reload cart to update UI
    })
    .catch(error => console.error("Error removing from cart:", error));
}
document.getElementById("addProductForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    let name = document.getElementById("productName").value;
    let price = document.getElementById("productPrice").value;
    let image = document.getElementById("productImage").value;

    if (!name || !price || !image) {
        alert("All fields are required!");
        return;
    }

    let productData = { 
        name: name, 
        price: parseFloat(price), 
        image_url: image  
    };

    console.log("Sending product data:", productData); 
    try {
        let response = await fetch("http://127.0.0.1:5000/add_product", {  
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });

        let result = await response.json();

        if (response.ok) {
            alert("Product added successfully!");
            fetchProducts();  
        } else {
            alert(result.error || "Failed to add product.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong.");
    }
});
function deleteProduct(productId) {
    fetch(`/products/${productId}`, { method: "DELETE" })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert(" " + data.message);
            fetchProducts(); 
        }
    })
    .catch(error => console.error("Error:", error));
}
document.addEventListener("DOMContentLoaded", function () {
    fetchProducts();
    loadCartFromStorage(); // Load cart from local storage
});

function fetchProducts() {
    fetch("/products")
        .then(response => response.json())
        .then(products => {
            let productContainer = document.querySelector(".product-container");
            productContainer.innerHTML = "";

            products.forEach(product => {
                let productCard = document.createElement("div");
                productCard.classList.add("product-card");

                productCard.innerHTML = `
                    <img src="${product.image.startsWith('http') ? product.image : '/static/images/' + product.image}" alt="${product.name}">
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">$${product.price}</p>
                    <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price}, '${product.image}')">➕ Add to Cart</button>
                    <button class="delete-product" onclick="deleteProduct(${product.id})">❌ Delete</button>
                `;

                productContainer.appendChild(productCard);
            });
        })
        .catch(error => console.error("Error fetching products:", error));
}

function addToCart(id, name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ id, name, price, image });
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartFromStorage();
}

function loadCartFromStorage() {
    let cartContainer = document.getElementById("cart-container");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
    }

    cart.forEach((item, index) => {
        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <p>${item.name} - $${item.price}</p>
            <button class="remove-from-cart" onclick="removeFromCart(${index})">❌ Remove</button>
        `;

        cartContainer.appendChild(cartItem);
    });
}

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    loadCartFromStorage();
}

function deleteProduct(productId) {
    fetch(`/products/${productId}`, { method: "DELETE" })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            fetchProducts();
        })
        .catch(error => console.error("Error deleting product:", error));
}
