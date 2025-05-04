# BakeryBliss - Full-Featured Bakery Website

A comprehensive e-commerce platform for a bakery business with user roles, product catalog, custom cake/chocolate builders, order management, and internal messaging.

## Features

- 🍞 Comprehensive product catalog with categories
- 🎂 Custom cake and chocolate builders
- 🛒 Shopping cart and checkout system
- 💬 Internal communication between customers and bakers
- 👥 Role-based user system (Customer, Junior Baker, Main Baker, Admin)
- 📊 Role-specific dashboards
- 📱 Responsive design

## Technology Stack

- **Frontend**: React.js with Context API
- **Backend**: Node.js + Express
- **Database**: MySQL (via XAMPP)
- **Authentication**: Session-based with Passport.js
- **Styling**: Tailwind CSS + shadcn/ui components

## Running Locally

### Prerequisites

- Node.js (v14+)
- XAMPP (for MySQL)

### Setup

1. Start your XAMPP server and ensure MySQL is running
2. Clone this repository
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

The application will automatically:
- Check if the bakerybliss database exists in your MySQL
- Create the database if it doesn't exist
- Set up all necessary tables
- Populate with initial categories and sample products

### Access the Application

Once running, you can access the application at:
```
http://localhost:5000
```

### Default Admin Account

Username: admin
Password: admin123

## Project Structure

- `/client`: Frontend React application
- `/server`: Backend Express server
- `/shared`: Shared types and schemas
- `/attached_assets`: Images and assets

## User Roles and Workflows

### Customer
- Browse and order products
- Customize cakes/chocolates
- Track order status
- Chat with assigned bakers
- Apply to become a Junior Baker

### Junior Baker
- View assigned orders
- Update order status
- Communicate with customers
- Apply for promotion to Main Baker

### Main Baker
- Assign orders to Junior Bakers
- Monitor overall production
- Communicate with Junior Bakers
- Mark orders as ready for delivery

### Admin
- Manage user accounts and roles
- Approve/reject baker applications
- Add/edit product catalog
- View analytics and reports

## License

This project is licensed under the MIT License.