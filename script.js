//handle the navigation menu toggle for mobile view
const menuToggle = document.getElementById("menu-toggle");
const navItems = document.querySelector(".nav-items");

menuToggle.addEventListener("change", () => {
  if (menuToggle.checked) {
    navItems.style.display = "flex";
  } else {
    navItems.style.display = "none";
  }
});

// This script handles adding items to the order, updating quantities, and submitting payment
let cart = {};

function addToOrder(name, price, image) {
  if (!cart[name]) {
    cart[name] = { price, quantity: 1, image };
  } else {
    cart[name].quantity += 1;
  }
  renderCart();
  localStorage.setItem("cartItems", JSON.stringify(cart)); // Save order to localStorage
}

// Change quantity of items in the cart
// This function updates the quantity of an item in the cart, or removes it if the quantity goes to zero
// It also re-renders the cart and updates the localStorage
function changeQuantity(name, amount) {
  if (cart[name]) {
    cart[name].quantity += amount;
    if (cart[name].quantity <= 0) {
      delete cart[name];
    }
    renderCart();
    localStorage.setItem("cartItems", JSON.stringify(cart)); // Update order in localStorage
  }
}

function renderCart() {
  const checkout = document.getElementById("checkout");
  const checkoutContainer = document.querySelector(".c-container");
  checkout.innerHTML = "";

  const itemNames = Object.keys(cart);

  if (itemNames.length === 0) {
    checkoutContainer.style.display = "none";
    return;
  } else {
    checkoutContainer.style.display = "block";
  }

  let subtotal = 0;

  for (let item of itemNames) {
    const { price, quantity, image } = cart[item];
    const itemTotal = price * quantity;
    subtotal += itemTotal;

    const div = document.createElement("div");
    div.className = "checkout-item";
    div.innerHTML = `
      <img src="${image}" alt="${item}">
      <div class="item-details">
        <strong>${item}</strong><br>
        ₦${price.toFixed(2)} x ${quantity} = ₦${itemTotal.toFixed(2)}
        <div class="quantity-controls">
          <button onclick="changeQuantity('${item}', -1)">−</button>
          <span>${quantity}</span>
          <button onclick="changeQuantity('${item}', 1)">+</button>
        </div>
      </div>
    `;
    checkout.appendChild(div);
  }

  // Conditional Discount
  let discount = 0;
  if (subtotal >= 50) {
    discount = subtotal * 0.1;
  }

  const total = subtotal - discount;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("discount").textContent = discount.toFixed(2);
  document.getElementById("total").textContent = total.toFixed(2);
}

function toggleCardFields() {
  const method = document.getElementById("payment-method").value;
  const cardSection = document.getElementById("card-fields");
  cardSection.style.display = method === "card" ? "block" : "none";
}

// Payment form handling
// This function handles the payment form submission, validates input, and displays a receipt
function submitPayment(event) {
  event.preventDefault();

  document.getElementById("loading-spinner").style.display = "flex";

  const name = document.getElementById("customer-name").value;
  const method = document.getElementById("payment-method").value;

  if (!name || !method) {
    alert("Please fill out all required fields.");
    document.getElementById("loading-spinner").style.display = "none";
    return false;
  }

  // Simulate a delay for payment processing
  // This simulates a delay for payment processing, allowing the loading spinner to be visible
  setTimeout(() => {
    alert(`Thank you, ${name}! Your payment via ${method} was submitted.`);
    document.getElementById("loading-spinner").style.display = "none";
    // Prepare receipt HTML
    // This function generates a receipt based on the current cart items and payment method
    // It displays the receipt in the checkout content area and allows printing or starting a new order
    const now = new Date();
    const receiptTime = now.toLocaleString();
    const estimatedDelivery = new Date(now.getTime() + 45 * 60000); // 45 minutes from now
    const deliveryTime = estimatedDelivery.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    let subtotal = 0;
    let receiptItems = "";

    for (let item in cart) {
      const { price, quantity } = cart[item];
      const itemTotal = price * quantity;
      subtotal += itemTotal;
      receiptItems += `
        <tr>
          <td>${item}</td>
          <td>${quantity}</td>
          <td>₦${price.toFixed(2)}</td>
          <td>₦${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }

    const discount = subtotal >= 50 ? subtotal * 0.1 : 0;
    const total = subtotal - discount;

    const receiptHtml = `
      <h3>Receipt</h3>
      <p><strong>Customer:</strong> ${name}</p>
      <p><strong>Payment Method:</strong> ${method}</p>
      <p><strong>Date:</strong> ${receiptTime}</p>
      <p><strong>Delivery Time:</strong> ${deliveryTime}</p>
      <table style="width: 100%; border-collapse: collapse;" border="1">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
        </thead>
        <tbody>${receiptItems}</tbody>
      </table>
      <p><strong>Subtotal:</strong> ₦${subtotal.toFixed(2)}</p>
      <p><strong>Discount:</strong> ₦${discount.toFixed(2)}</p>
      <p><strong>Total Paid:</strong> ₦${total.toFixed(2)}</p>
    `;

    document.getElementById("receipt-preview").innerHTML = receiptHtml;
    showModal();

    // Optionally clear form or redirect
    // This resets the payment form and cart, allowing the user to start a new order
    document.getElementById("payment-form").reset();
    toggleCardFields();
    cart = {};
    renderCart();
    localStorage.removeItem("cartItems");
  }, 1000);
}

function showModal() {
  document.getElementById("receipt-modal").style.display = "block";
}

function closeModal() {
  document.getElementById("receipt-modal").style.display = "none";
}

function printReceipt() {
  window.print();
}

//category filtering
function showCategory(category, event) {
  const dishes = document.querySelectorAll(".dish");
  const buttons = document.querySelectorAll(".category-nav button");

  dishes.forEach((dish) => {
    dish.style.display =
      category === "all" || dish.getAttribute("data-category") === category
        ? "block"
        : "none";
  });

  buttons.forEach((btn) => btn.classList.remove("active"));

  if (event && event.target) {
    event.target.classList.add("active");
  }
}

window.onload = function () {
  const saved = localStorage.getItem("cartItems");
  if (saved) {
    cart = JSON.parse(saved);
    renderCart();
  }
};

// Filter dishes by category
function filterDishes() {
  const selectedCategory = document.getElementById("category-select").value;
  const dishes = document.querySelectorAll(".dish");
  dishes.forEach((dish) => {
    const category = dish.getAttribute("data-category");
    dish.style.display =
      selectedCategory === "all" || category === selectedCategory
        ? "block"
        : "none";
  });
}
// Setup responsive filter for small screens
function setupResponsiveFilter() {
  const categorySelect = document.getElementById("category-select");
  if (!categorySelect) return; // Exit if no select element found

  const mediaQuery = window.matchMedia("(max-width: 768px)");

  function handleScreenChange(e) {
    if (e.matches) {
      // Small screen: attach filter on change event
      categorySelect.addEventListener("change", filterDishes);
      filterDishes(); // Run once on load for initial filtering
    } else {
      // Large screen: remove event listener and show all dishes
      categorySelect.removeEventListener("change", filterDishes);
      const dishes = document.querySelectorAll(".dish");
      dishes.forEach((dish) => (dish.style.display = "block"));
    }
  }

  // Initial check
  handleScreenChange(mediaQuery);

  // Listen for screen size changes dynamically
  mediaQuery.addEventListener("change", handleScreenChange);
}

function setupResponsiveCategoryButtons() {
  const buttons = document.querySelectorAll(".category-nav button");
  if (buttons.length === 0) return;

  // Always attach click listeners
  buttons.forEach((button) => {
    if (!button.dataset.listenerAttached) {
      button.addEventListener("click", function (event) {
        const category =
          button.getAttribute("data-category") ||
          button.textContent.toLowerCase();
        showCategory(category, event);
      });
      button.dataset.listenerAttached = "true"; // Prevent double-binding
    }
  });

  // Still respond to screen size changes for layout/visibility
  const mediaQuery = window.matchMedia("(max-width: 768px)");
  function handleScreenChange(e) {
    // Optional: reset view when switching between views
    showCategory("all");
  }

  handleScreenChange(mediaQuery);
  mediaQuery.addEventListener("change", handleScreenChange);
}

window.addEventListener("DOMContentLoaded", () => {
  setupResponsiveFilter(); // your existing setup for <select> (can stay if you want)
  setupResponsiveCategoryButtons(); // add this new one
});
