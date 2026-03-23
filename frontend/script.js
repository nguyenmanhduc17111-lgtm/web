// ============================================================
//   HangCamShop - Frontend Script (Kết nối với Backend API)
// ============================================================

const API_URL = 'http://localhost:5000/api';

// Biến toàn cục
let cart = [];
let currentUser = null;
let currentFilter = 'all';
let searchTerm = '';
let allProducts = [];

// ===== KHỞI TẠO =====
document.addEventListener('DOMContentLoaded', async function () {
    await checkLoginStatus();
    await loadProducts();
    await loadCartCount();

    document.getElementById('searchInput').addEventListener('keyup', function (e) {
        searchTerm = e.target.value.toLowerCase();
        displayProducts();
    });

    document.getElementById('searchBtn').addEventListener('click', function () {
        searchTerm = document.getElementById('searchInput').value.toLowerCase();
        displayProducts();
    });
});

// ===== HÀM GỌI API =====
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        return await res.json();
    } catch (err) {
        console.error('Lỗi API:', err);
        return { success: false, message: 'Không thể kết nối server!' };
    }
}

// ===== FORMAT GIÁ =====
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// ===== HÀM XEM CHI TIẾT SẢN PHẨM =====
function viewProductDetail(productId) {
    window.location.href = `/product-detail.html?id=${productId}`;
}

// ===== SẢN PHẨM =====
async function loadProducts() {
    let url = '/products';
    const params = new URLSearchParams();
    if (currentFilter !== 'all') params.append('category', currentFilter);
    if (searchTerm) params.append('search', searchTerm);
    if (params.toString()) url += '?' + params.toString();

    const data = await apiCall(url);
    if (data.success) {
        allProducts = data.products;
        displayProducts();
    } else {
        document.getElementById('productGrid').innerHTML = '<div class="no-products">Không thể tải sản phẩm!</div>';
    }
}

function displayProducts() {
    const productGrid = document.getElementById('productGrid');
    let filtered = allProducts;

    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    if (filtered.length === 0) {
        productGrid.innerHTML = '<div class="no-products">Không tìm thấy sản phẩm</div>';
        return;
    }

    productGrid.innerHTML = filtered.map(product => `
        <div class="product-card" onclick="viewProductDetail(${product.id})" style="cursor: pointer;">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.tag ? `<span class="product-tag ${product.tag}">${product.tag === 'sale' ? 'GIẢM GIÁ' : 'MỚI'}</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">${formatPrice(product.price)}</span>
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span>(${product.sold} đã bán)</span>
                </div>
                <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                </button>
            </div>
        </div>
    `).join('');
}
async function loadProductDetail() {
    try {
        const response = await fetch(`/api/products/${productId}`);
        const data = await response.json();
        const product = data.product || data;

        // Xử lý ảnh chính và thumbnail
        const mainImage = document.getElementById('mainImage');
        const thumbnailList = document.getElementById('thumbnailList');
        
        mainImage.src = product.image || 'https://via.placeholder.com/500';
        
        // Gom tất cả ảnh (ảnh đại diện + ảnh phụ) và loại trùng
        const allImages = [product.image, ...(product.images || [])].filter(url => url && url.trim() !== '');
        const uniqueImages = [...new Set(allImages)];
        
        // Xóa thumbnail cũ
        thumbnailList.innerHTML = '';
        
        // Hiển thị tối đa 8 thumbnail
        uniqueImages.slice(0, 8).forEach((imgUrl, idx) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.style.width = '70px';
            thumb.style.height = '70px';
            thumb.style.objectFit = 'cover';
            thumb.style.borderRadius = '5px';
            thumb.style.cursor = 'pointer';
            thumb.style.border = idx === 0 ? '2px solid #e74c3c' : '1px solid #ddd';
            thumb.onclick = () => {
                mainImage.src = imgUrl;
                // Cập nhật viền thumbnail
                document.querySelectorAll('#thumbnailList img').forEach(img => img.style.border = '1px solid #ddd');
                thumb.style.border = '2px solid #e74c3c';
            };
            thumbnailList.appendChild(thumb);
        });

        // Cập nhật các thông tin khác của sản phẩm
        document.querySelector('.product-name').innerText = product.name;
        document.querySelector('.product-price').innerHTML = `
            ${product.price.toLocaleString('vi-VN')}đ
            ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString('vi-VN')}đ</span>` : ''}
        `;
        document.querySelector('.product-description').innerHTML = `
            <strong>📝 Mô tả sản phẩm:</strong><br>
            ${product.description || 'Chưa có mô tả cho sản phẩm này.'}
        `;
        
    } catch (error) {
        document.getElementById('productDetail').innerHTML = `<p style="color:red">Lỗi: ${error.message}</p>`;
    }
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) stars += '<i class="fas fa-star"></i>';
        else if (i - 0.5 <= rating) stars += '<i class="fas fa-star-half-alt"></i>';
        else stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

async function filterProducts(category) {
    currentFilter = category;
    document.querySelectorAll('.categories li').forEach(li => li.classList.remove('active'));
    event.currentTarget.classList.add('active');
    await loadProducts();
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

// ===== GIỎ HÀNG =====
async function loadCartCount() {
    if (!currentUser) {
        document.getElementById('cartCount').textContent = '0';
        return;
    }
    const data = await apiCall('/cart');
    if (data.success) {
        cart = data.cart;
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    }
}

async function addToCart(productId) {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để mua hàng!');
        openLoginModal();
        return;
    }

    const data = await apiCall('/cart/add', 'POST', { productId, quantity: 1 });
    showNotification(data.message);
    if (data.success) await loadCartCount();
}

async function openCartModal() {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để xem giỏ hàng!');
        openLoginModal();
        return;
    }

    const data = await apiCall('/cart');
    if (data.success) {
        cart = data.cart;
        displayCartItems();
        document.getElementById('cartModal').style.display = 'block';
    } else {
        showNotification('Không thể tải giỏ hàng!');
    }
}

function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

function displayCartItems() {
    const cartItemsEl = document.getElementById('cartItems');

    if (!cart || cart.length === 0) {
        cartItemsEl.innerHTML = '<div class="empty-cart">Giỏ hàng của bạn đang trống</div>';
        document.getElementById('subtotal').textContent = formatPrice(0);
        document.getElementById('total').textContent = formatPrice(0);
        return;
    }

    let subtotal = 0;
    cartItemsEl.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1"
                            onchange="updateQuantity(${item.id}, this.value)">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <div class="cart-item-total">${formatPrice(itemTotal)}</div>
                <i class="fas fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
            </div>
        `;
    }).join('');

    const shipping = subtotal > 0 ? 30000 : 0;
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('total').textContent = formatPrice(subtotal + shipping);
}

async function updateQuantity(productId, newQuantity) {
    const qty = parseInt(newQuantity);
    const data = await apiCall('/cart/update', 'PUT', { productId, quantity: qty });
    if (data.success) {
        await loadCartCount();
        const cartData = await apiCall('/cart');
        if (cartData.success) {
            cart = cartData.cart;
            displayCartItems();
        }
    }
}

async function removeFromCart(productId) {
    const data = await apiCall(`/cart/remove/${productId}`, 'DELETE');
    showNotification(data.message);
    if (data.success) {
        await loadCartCount();
        const cartData = await apiCall('/cart');
        if (cartData.success) {
            cart = cartData.cart;
            displayCartItems();
        }
    }
}

// ===== THANH TOÁN =====
async function openCheckoutModal() {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thanh toán!');
        openLoginModal();
        return;
    }
    if (!cart || cart.length === 0) {
        showNotification('Giỏ hàng của bạn đang trống!');
        return;
    }
    closeCartModal();
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

async function processPayment() {
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thanh toán!');
        return;
    }

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const paymentMethod = document.getElementById('paymentMethod').value;

    if (!fullName || !email || !phone || !address || !paymentMethod) {
        showNotification('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const data = await apiCall('/orders/create', 'POST', {
        fullName, email, phone, address, paymentMethod
    });

    showNotification(data.message);
    if (data.success) {
        cart = [];
        document.getElementById('cartCount').textContent = '0';
        closeCheckoutModal();
        document.getElementById('checkoutForm').reset();
    }
}

// ===== ĐĂNG NHẬP / ĐĂNG KÝ =====
function openLoginModal() {
    closeRegisterModal();
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function openRegisterModal() {
    closeLoginModal();
    document.getElementById('registerModal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerForm').reset();
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        showNotification('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    const data = await apiCall('/auth/login', 'POST', { username, password });
    showNotification(data.message);

    if (data.success) {
        localStorage.setItem('token', data.token);
        currentUser = data.user;
        closeLoginModal();
        updateUserUI();
        await loadCartCount();
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (!username || !email || !password || !confirmPassword) {
        showNotification('Vui lòng điền đầy đủ thông tin!');
        return;
    }
    if (password !== confirmPassword) {
        showNotification('Mật khẩu xác nhận không khớp!');
        return;
    }
    if (password.length < 6) {
        showNotification('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }

    const data = await apiCall('/auth/register', 'POST', { username, email, password });
    showNotification(data.message);

    if (data.success) {
        closeRegisterModal();
        openLoginModal();
    }
}

async function checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (!token) {
        currentUser = null;
        updateUserUI();
        return;
    }

    const data = await apiCall('/auth/me');
    if (data.success) {
        currentUser = data.user;
    } else {
        localStorage.removeItem('token');
        currentUser = null;
    }
    updateUserUI();
}

function updateUserUI() {
    if (currentUser) {
        document.querySelector('.auth-buttons').style.display = 'none';
        document.querySelector('.user-info').style.display = 'flex';
        document.getElementById('usernameDisplay').textContent = currentUser.username;
    } else {
        document.querySelector('.auth-buttons').style.display = 'flex';
        document.querySelector('.user-info').style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    cart = [];
    document.getElementById('cartCount').textContent = '0';
    updateUserUI();
    showNotification('Đã đăng xuất thành công!');
    closeCartModal();
    closeCheckoutModal();
}

// ===== THÔNG BÁO =====
function showNotification(message) {
    document.getElementById('notificationMessage').textContent = message;
    document.getElementById('notificationModal').style.display = 'block';
}

function closeNotificationModal() {
    document.getElementById('notificationModal').style.display = 'none';
}

// Đóng modal khi click bên ngoài
window.onclick = function (event) {
    ['cartModal', 'checkoutModal', 'notificationModal', 'loginModal', 'registerModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (event.target === modal) modal.style.display = 'none';
    });
};