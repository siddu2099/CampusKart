

# 🚀 CampusKart – Full-Stack E-Commerce Marketplace (MERN)

CampusKart is a full-stack multi-role e-commerce platform built using the MERN stack. It allows users to buy and sell products securely with real-time inventory management and transactional order processing.

---

## 🛠 Tech Stack

### 🔹 Frontend

* React.js (Vite)
* React Router DOM
* Axios (with JWT interceptor)
* Context API

### 🔹 Backend

* Node.js
* Express.js
* MongoDB (Atlas)
* Mongoose ODM

### 🔹 Authentication & Security

* JSON Web Tokens (JWT)
* bcrypt password hashing
* Role-Based Access Control (RBAC)

### 🔹 Deployment

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

---

## ✨ Features

### 👤 User Roles

* **Buyer**

  * Browse products
  * Add/remove items from cart
  * Place orders
* **Seller**

  * Manage own products (CRUD)
  * Track inventory
* **Admin**

  * View platform analytics
  * Seeded automatically on server start

---

### 🛒 Core Functionalities

* Secure user registration & login
* JWT-based stateless authentication
* Database-backed shopping cart
* MongoDB transaction-based checkout
* Automatic stock deduction
* Order confirmation email (Nodemailer)
* Protected routes on frontend & backend
* Admin analytics dashboard

---

## 📂 Project Structure

```
CampusKart/
├── .gitignore
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── vite.svg
    ├── src/
    │   ├── api/
    │   │   └── axios.js
    │   ├── assets/
    │   │   └── react.svg
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── AdminDashboard.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Login.jsx
    │   │   ├── OrderSuccess.jsx
    │   │   ├── ProductListing.jsx
    │   │   ├── Register.jsx
    │   │   └── SellerDashboard.jsx
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── build_error.txt
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── vercel.json
    └── vite.config.js


```

---

## 🔄 System Architecture

Frontend (React SPA)
⬇
Axios HTTP Requests
⬇
Express REST API
⬇
Controllers
⬇
MongoDB Atlas

Authentication Flow:

1. User logs in
2. Server generates JWT
3. Frontend stores token in localStorage
4. Axios attaches token to protected requests
5. Middleware verifies token & role

---

## 🔐 Authentication & Authorization

* Passwords hashed using bcrypt
* JWT tokens valid for 1 day
* Role-based middleware protects routes
* Admin registration disabled (auto-seeded only)

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/campuskart.git
cd campuskart
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_EMAIL=admin@campuskart.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm start
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌱 Default Admin Account

Admin account is automatically created on server start using:

```
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

## 🧠 What This Project Demonstrates

* REST API Design
* JWT Authentication
* Role-Based Access Control
* MongoDB Transactions
* Full-Stack Integration
* Cloud Deployment
* Production-Level Architecture

---

## 🚀 Future Improvements

* Payment gateway integration (Stripe/Razorpay)
* Refresh tokens
* Redis caching
* Docker containerization
* CI/CD pipeline
* Advanced analytics dashboard

---

## 📄 License

This project is for educational purposes.

---


