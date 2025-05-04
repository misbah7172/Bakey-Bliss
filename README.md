# BakeryBliss - Full-Featured Bakery Website

A comprehensive e-commerce platform for a bakery business with user roles, product catalog, custom cake/chocolate builders, order management, and internal messaging.

## Features

- 🍞 **Comprehensive product catalog** with categories and filtering
- 🎂 **Custom cake and chocolate builders** with real-time preview
- 🛒 **Advanced shopping cart system** with quantity management
- 💳 **Multiple payment options** including Cash on Delivery
- 🧾 **Downloadable receipts** for completed orders
- 📊 **Order tracking panel** with visual progress indicators
- 💬 **Role-based messaging system** between customers and bakers
- 👥 **Multi-role user system** (Customer, Junior Baker, Main Baker, Admin)
- 📱 **Responsive design** for all devices
- 🔔 **Real-time notifications** for order status changes and messages
- 🔒 **Secure authentication** with password hashing
- 💻 **Role-specific dashboards** with tailored functionality

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

### Detailed Setup Instructions

1. **Start XAMPP**
   - Launch XAMPP Control Panel
   - Start Apache and MySQL services
   - Make sure MySQL is running on the default port (3306)

2. **Clone and Prepare the Project**
   - Download/clone this repository to your local machine
   - Navigate to the project directory in your terminal or command prompt
   - Install all dependencies:
   ```
   npm install
   ```

3. **Database Setup**
   - The application will automatically:
     - Check if the 'bakerybliss' database exists in your MySQL
     - Create the database if it doesn't exist
     - Set up all necessary tables
     - Populate the database with initial categories and sample products
   - No manual database setup is required!

4. **Start the Application**
   - Run the development server:
   ```
   npm run dev
   ```
   - The server will start on port 5000
   - You'll see database setup logs in the console

5. **Access the Website**
   - Open your browser and go to:
   ```
   http://localhost:5000
   ```

### Default Admin Account

Once the application is running, you can log in using the default admin account:
- **Username:** admin
- **Password:** admin123

### Troubleshooting

- **MySQL Connection Issues**
  - Ensure MySQL is running on port 3306
  - Check that the MySQL username is 'root' with an empty password (XAMPP default)
  - If you've set a different MySQL password, update it in server/database.mjs

- **Port Conflicts**
  - If port 5000 is already in use, you can change it in server/index.ts
  - Remember to restart the server after changing the port

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