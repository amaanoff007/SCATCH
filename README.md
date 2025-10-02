# Scatch - E-commerce Application

A full-stack e-commerce application built with Node.js, Express, MongoDB, and EJS.

## Features

- User authentication (registration/login)
- Owner/admin authentication
- Product management (create, view products)
- Shopping cart functionality
- Image upload for products
- Responsive design with Tailwind CSS

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with:
   ```
   JWT_KEY=your_jwt_secret_key_here
   EXPRESS_SESSION_SECRET=your_session_secret_here
   NODE_ENV=development
   ```

3. **Database Setup**
   - Make sure MongoDB is running on your system
   - The application will connect to `mongodb://127.0.0.1:27017/scatch`

4. **Run the Application**
   ```bash
   node app.js
   ```

5. **Access the Application**
   - Main application: http://localhost:4000
   - Owner login: http://localhost:4000/owners/login

## Usage

### For Users
1. Register/Login at the home page
2. Browse products in the shop
3. Add products to cart
4. View cart and manage items

### For Owners
1. Go to Owner Login page
2. Register as an owner (first time only)
3. Login and create products
4. Manage your product catalog

## Project Structure

- `app.js` - Main application file
- `config/` - Configuration files (database, multer, keys)
- `controllers/` - Authentication controllers
- `models/` - MongoDB schemas
- `routes/` - Express routes
- `views/` - EJS templates
- `public/` - Static assets

## Fixed Issues

- Added missing dependencies (express, ejs)
- Fixed syntax errors in configuration files
- Corrected typos in model schemas
- Implemented proper image upload handling
- Added complete cart functionality
- Created owner authentication system
- Fixed form action routes
- Added proper error handling and flash messages



