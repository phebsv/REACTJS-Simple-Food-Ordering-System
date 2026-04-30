# Admin Panel Documentation

## Overview

The Admin Panel is a comprehensive management system for the NomNom Food Ordering application. It provides administrators with tools to manage orders, menu items, inventory, and customer reviews.

---

## Features

### 1. **Dashboard**
- **Stat Cards**: Real-time overview of:
  - Total Orders Today
  - Total Revenue Today
  - Order Status Breakdown (Pending, Preparing, Ready, Delivered, Cancelled)
- **Popular Items**: Top 5 best-selling items with order counts
- **Recent Orders**: Last 10 orders in a table format
- **Low/Out of Stock Items**: Alert for items needing restocking
- All sections have action buttons to navigate to detailed management pages

### 2. **Orders Management**
- **Search & Filter**: Find orders by Order ID or Customer Name
- **Status Tabs**: Filter by All, Pending, Preparing, Ready, Delivered, or Cancelled
- **Order Table**: Displays Order ID, Customer, Items Count, Total, Status, and Date/Time
- **Order Details Modal**: 
  - Full customer information
  - Itemized list with prices
  - Payment and delivery information
  - Status update buttons (Pending → Preparing → Ready → Delivered)
  - Cancel order option (allowed only for Pending/Preparing)
- **Confirmation Dialogs**: All destructive actions require confirmation

### 3. **Menu Management**
- **Add/Edit/Delete Items**: Full CRUD operations on menu items
- **Search & Filter**: Search by item name and filter by category (Meals, Drinks, Snacks, Desserts)
- **Item Cards**: Display name, category, price, description, availability status, and image
- **Availability Toggle**: Mark items as available or unavailable for ordering
- **Form Validation**: Required fields, price must be > 0
- **Image Support**: Optional image URLs for menu items

### 4. **Inventory Management**
- **Stock Tracking**: Monitor stock levels for all items
- **Status Filter**: View items by status (Available, Low Stock, Out of Stock, Unavailable)
- **Quick Restock**: Modal form to update stock quantities
- **Status Management**: Manually set item status
- **Auto Status Update**: Stock < 10 = Low Stock, Stock = 0 = Out of Stock
- **Last Updated Tracking**: See when each item was last modified

### 5. **Reviews Management**
- **Search Reviews**: Find by customer name, food item name, or Order ID
- **Rating Filter**: Filter by star rating (5⭐ to 1⭐)
- **Review Cards**: Display customer name, rating, food item, and comment
- **Review Details Modal**: Full review information with date
- **Hide/Delete Reviews**: Manage inappropriate reviews
- **Hidden Count Alert**: Shows number of hidden reviews

### 6. **Navigation & Access Control**
- **Sidebar Navigation**: Quick access to all admin pages
- **Protected Routes**: Only authenticated admins can access admin pages
- **Auto Redirect**: Non-authenticated users redirected to login
- **Logout Confirmation**: Confirmation dialog before logout

---

## How to Use

### Accessing the Admin Panel

1. **Login**: Navigate to `/admin/login`
   - Default credentials:
     - Username: `admin`
     - Password: `1234`

2. **Dashboard**: After login, you'll be redirected to `/admin/dashboard`

### Managing Orders

1. Go to **Orders** page
2. Use the search bar to find specific orders
3. Click status tabs to filter by status
4. Click **View** to open order details
5. Update status by clicking status update buttons
6. Cancel orders (only Pending/Preparing status)
7. Confirm all actions in the dialog

### Managing Menu

1. Go to **Menu** page
2. Click **+ Add New Item** to create items
3. Search and filter items by category
4. Click **Edit** to modify items
5. Click **Delete** to remove items
6. Click **Available/Unavailable** to toggle availability
7. Fill form with: Name, Category, Price, Description, Image URL

### Managing Inventory

1. Go to **Inventory** page
2. Search by item name
3. Filter by status (Available, Low Stock, Out of Stock, Unavailable)
4. Click **Restock** to update stock quantity
5. Change status from the dropdown select
6. Stock levels auto-update status:
   - 0 items = Out of Stock
   - 1-9 items = Low Stock
   - 10+ items = Available

### Managing Reviews

1. Go to **Reviews** page
2. Search by customer name, food item, or Order ID
3. Filter by rating (5⭐ to 1⭐)
4. Click **View** to see full review details
5. Click **Hide** to hide from public (soft delete)
6. Click **Delete** to remove permanently

---

## Technical Architecture

### File Structure

```
src/
├── context/
│   └── AdminContext.tsx          # Admin state management
├── components/admin/
│   ├── AdminSidebar.tsx          # Navigation sidebar
│   ├── AdminModal.tsx            # Reusable modal component
│   ├── ConfirmDialog.tsx         # Confirmation dialogs
│   ├── LoadingSpinner.tsx        # Loading indicator
│   ├── ProtectedAdminRoute.tsx   # Route protection HOC
│   └── *.css                     # Component styles
├── pages/admin/
│   ├── AdminLogin.tsx            # Login page
│   ├── AdminDashboard.tsx        # Dashboard
│   ├── AdminOrders.tsx           # Orders management
│   ├── AdminMenu.tsx             # Menu management
│   ├── AdminInventory.tsx        # Inventory management
│   ├── AdminReviews.tsx          # Reviews management
│   └── *.css                     # Page styles
└── services/
    └── db.json                   # Database with sample data

App.tsx                           # Updated with admin routes
```

### State Management

**AdminContext** provides:
- Authentication (login/logout)
- Orders management (fetch, update status, cancel)
- Menu management (CRUD operations)
- Inventory management (stock updates, status changes)
- Reviews management (hide/delete)
- Loading and error states

### API Endpoints

All requests go to `http://localhost:4001`:

- `GET/POST /admins` - Admin authentication
- `GET/PATCH/DELETE /orders` - Order management
- `GET/POST/PATCH/DELETE /menu` - Menu management
- `GET/PATCH /inventory` - Inventory management
- `GET/PATCH/DELETE /reviews` - Reviews management

---

## Data Models

### Order
```typescript
{
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<FoodItem & { quantity: number }>;
  subtotal: number;
  total: number;
  status: "Pending" | "Preparing" | "Ready" | "Delivered" | "Cancelled";
  paymentMethod: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### FoodItem
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available?: boolean;
  stock?: number;
}
```

### InventoryItem
```typescript
{
  id: string;
  name: string;
  category: string;
  stock: number;
  status: "Available" | "Low Stock" | "Out of Stock" | "Unavailable";
  lastUpdated: string;
}
```

### Review
```typescript
{
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  foodItemId: string;
  foodItemName: string;
  rating: number;
  comment: string;
  createdAt: string;
  hidden: boolean;
}
```

---

## Key Features Explained

### 1. Reactive Updates
- All data updates reactively across the application
- Changes in menu affect inventory and orders
- Changes in orders update dashboard statistics

### 2. Validation
- Form validation for menu items (price > 0)
- Search and filter operations are case-insensitive
- Confirmation dialogs prevent accidental actions

### 3. Loading States
- Loading spinners for all async operations
- Disabled buttons during operations
- Error messages displayed for failed operations

### 4. Role-Based Access
- Only authenticated admins can access admin pages
- Customers automatically redirected to customer dashboard
- Protected routes prevent unauthorized access

### 5. Responsive Design
- Fully responsive layouts for mobile, tablet, desktop
- Mobile-optimized navigation and modals
- Flexible grid layouts

---

## Styling

All admin components use:
- **Color Scheme**: 
  - Primary: `#ff6b6b` (Red)
  - Secondary: `#1a1a2e` (Dark)
  - Accent: `#4caf50` (Green)
- **CSS Variables**: Consistent spacing, typography, shadows
- **BEM Methodology**: Clear class naming conventions
- **Flexbox/Grid**: Modern layout techniques

---

## Troubleshooting

### Login Issues
- Ensure db.json has admins array
- Check username/password credentials
- Clear browser localStorage

### Data Not Updating
- Ensure json-server is running on port 4001
- Check network tab in browser DevTools
- Verify database structure in db.json

### Modal/Dialog Not Showing
- Check z-index values in CSS
- Ensure onClick handlers are properly bound
- Verify modal state is being set

### Missing Features
- Regenerate admin context if methods missing
- Check all imports are correct
- Verify page components are registered in App.tsx

---

## Future Enhancements

- [ ] Export orders/reviews to CSV
- [ ] Advanced analytics and charts
- [ ] Scheduled orders/delivery times
- [ ] Admin settings and preferences
- [ ] Audit logs for admin actions
- [ ] Multi-admin support with roles
- [ ] Discount codes and promotions
- [ ] Real-time notifications
- [ ] Email notifications to customers
- [ ] Payment processing integration

---

## Support

For issues or questions about the admin panel, please refer to:
- Component source files for implementation details
- Type definitions in `types.ts`
- Sample data in `db.json`
