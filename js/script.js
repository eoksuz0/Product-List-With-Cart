const products = [
  { id: "waffle", name: "Waffle with Berries", category: "Waffle", price: 6.5 },
  { id: "creme-brulee", name: "Vanilla Bean Crème Brûlée", category: "Crème Brûlée", price: 7 },
  { id: "macaron", name: "Macaron Mix of Five", category: "Macaron", price: 8 },
  { id: "tiramisu", name: "Classic Tiramisu", category: "Tiramisu", price: 5.5 },
  { id: "baklava", name: "Pistachio Baklava", category: "Baklava", price: 4 },
  { id: "meringue", name: "Lemon Meringue Pie", category: "Pie", price: 5 },
  { id: "cake", name: "Red Velvet Cake", category: "Cake", price: 4.5 },
  { id: "brownie", name: "Salted Caramel Brownie", category: "Brownie", price: 5.5 },
  { id: "panna-cotta", name: "Vanilla Panna Cotta", category: "Panna Cotta", price: 6.5 }
];

const productList = document.querySelector("#product-list");
const productTemplate = document.querySelector("#product-template");
const cartTitle = document.querySelector("#cart-title");
const cartCount = document.querySelector("#cart-count");
const cartEmpty = document.querySelector("#cart-empty");
const cartContent = document.querySelector("#cart-content");
const cartList = document.querySelector("#cart-list");
const cartTotal = document.querySelector("#cart-total");
const cartItemTemplate = document.querySelector("#cart-item-template");
const confirmButton = document.querySelector("#confirm-button");
const orderModal = document.querySelector("#order-modal");
const modalList = document.querySelector("#modal-list");
const modalTotal = document.querySelector("#modal-total");
const modalItemTemplate = document.querySelector("#modal-item-template");

let cart = [];

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function findProduct(id) {
  return products.find((product) => product.id === id);
}

function findCartItem(id) {
  return cart.find((item) => item.id === id);
}

function getTotalPrice() {
  return cart.reduce((total, item) => total + findProduct(item.id).price * item.quantity, 0);
}

function getTotalQuantity() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function createProductCard(product) {
  const copy = productTemplate.content.cloneNode(true);
  const imagePath = `assets/images/${product.id}`;

  copy.querySelector(".product").dataset.id = product.id;
  copy.querySelector(".product__source-desktop").srcset = `${imagePath}-desktop.jpg`;
  copy.querySelector(".product__source-tablet").srcset = `${imagePath}-tablet.jpg`;
  copy.querySelector(".product__image").src = `${imagePath}-mobile.jpg`;
  copy.querySelector(".product__image").alt = product.name;
  copy.querySelector(".product__category").textContent = product.category;
  copy.querySelector(".product__name").textContent = product.name;
  copy.querySelector(".product__price").textContent = formatPrice(product.price);
  copy.querySelector(".quantity__button--decrease").setAttribute("aria-label", `Decrease quantity of ${product.name}`);
  copy.querySelector(".quantity__button--increase").setAttribute("aria-label", `Increase quantity of ${product.name}`);

  return copy;
}

function renderProducts() {
  productList.replaceChildren();

  for (const product of products) {
    productList.append(createProductCard(product));
  }
}

function updateProductCards() {
  const cards = productList.querySelectorAll(".product");

  for (const card of cards) {
    const item = findCartItem(card.dataset.id);
    const inCart = item !== undefined;

    card.classList.toggle("product--selected", inCart);
    card.querySelector(".add-button").classList.toggle("hidden", inCart);
    card.querySelector(".quantity").classList.toggle("hidden", !inCart);

    if (inCart) {
      card.querySelector(".quantity__value").textContent = item.quantity;
    }
  }
}

function renderCart() {
  const isEmpty = cart.length === 0;

  cartCount.textContent = getTotalQuantity();
  cartEmpty.classList.toggle("hidden", !isEmpty);
  cartContent.classList.toggle("hidden", isEmpty);
  cartList.replaceChildren();

  for (const item of cart) {
    const product = findProduct(item.id);
    const copy = cartItemTemplate.content.cloneNode(true);

    copy.querySelector(".cart-item").dataset.id = item.id;
    copy.querySelector(".cart-item__name").textContent = product.name;
    copy.querySelector(".cart-item__quantity").textContent = `${item.quantity}x`;
    copy.querySelector(".cart-item__price").textContent = `@ ${formatPrice(product.price)}`;
    copy.querySelector(".cart-item__total").textContent = formatPrice(product.price * item.quantity);
    copy.querySelector(".remove-button").setAttribute("aria-label", `Remove ${product.name} from cart`);

    cartList.append(copy);
  }

  cartTotal.textContent = formatPrice(getTotalPrice());
}

function update() {
  updateProductCards();
  renderCart();
}

function addToCart(id) {
  cart.push({ id: id, quantity: 1 });
  update();
}

function changeQuantity(id, amount) {
  const item = findCartItem(id);
  item.quantity = item.quantity + amount;

  if (item.quantity === 0) {
    removeFromCart(id);
    return;
  }

  update();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  update();
}

productList.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const card = button.closest(".product");
  const id = card.dataset.id;

  if (button.classList.contains("add-button")) {
    addToCart(id);
    card.querySelector(".quantity__button--increase").focus();
  } else if (button.classList.contains("quantity__button--increase")) {
    changeQuantity(id, 1);
  } else if (button.classList.contains("quantity__button--decrease")) {
    changeQuantity(id, -1);

    if (findCartItem(id) === undefined) {
      card.querySelector(".add-button").focus();
    }
  }
});

cartList.addEventListener("click", (event) => {
  const button = event.target.closest(".remove-button");

  if (!button) {
    return;
  }

  removeFromCart(button.closest(".cart-item").dataset.id);
  cartTitle.focus();
});

confirmButton.addEventListener("click", () => {
  modalList.replaceChildren();

  for (const item of cart) {
    const product = findProduct(item.id);
    const copy = modalItemTemplate.content.cloneNode(true);

    copy.querySelector(".modal-item__image").src = `assets/images/${product.id}-thumbnail.jpg`;
    copy.querySelector(".cart-item__name").textContent = product.name;
    copy.querySelector(".cart-item__quantity").textContent = `${item.quantity}x`;
    copy.querySelector(".cart-item__price").textContent = `@ ${formatPrice(product.price)}`;
    copy.querySelector(".modal-item__total").textContent = formatPrice(product.price * item.quantity);

    modalList.append(copy);
  }

  modalTotal.textContent = formatPrice(getTotalPrice());
  orderModal.returnValue = "";
  orderModal.showModal();
});

orderModal.addEventListener("close", () => {
  if (orderModal.returnValue === "new") {
    cart = [];
    update();
    productList.querySelector(".add-button").focus();
  }
});

renderProducts();
update();