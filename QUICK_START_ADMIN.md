# Admin Panel Quick Start Guide

## 🚀 Getting Started

### 1. Start the Database Server
```bash
npm run serve-db
```
This starts json-server on `http://localhost:4001`

### 2. Start the Development Server
```bash
npm run dev
```
This starts Vite on `http://localhost:5173`

### 3. Access Admin Panel
Navigate to: `http://localhost:5173/admin/login`

**Login Credentials:**
- Username: `admin`
- Password: `1234`

---

## 📋 Admin Panel Pages

| Page | URL | Purpose |
|------|-----|---------|
| Login | `/admin/login` | Admin authentication |
| Dashboard | `/admin/dashboard` | Overview & statistics |
| Orders | `/admin/orders` | Manage customer orders |
| Menu | `/admin/menu` | Add/edit menu items |
| Inventory | `/admin/inventory` | Track stock levels |
| Reviews | `/admin/reviews` | Moderate customer reviews |

---

## 🎯 Common Tasks

### View Orders
1. Click **Orders** in sidebar
2. Use search to find by Order ID or customer name
3. Use tabs to filter by status
4. Click **View** button to see order details

### Add Menu Item
1. Click **Menu** in sidebar
2. Click **+ Add New Item** button
3. Fill in form (Name*, Category*, Price*)
4. Click **Add Item**

### Update Stock
1. Click **Inventory** in sidebar
2. Click **Restock** button on item
3. Enter new quantity
4. Click **Update Stock**

### Change Order Status
1. Click **Orders** → **View** on order
2. Click status update button (e.g., "→ Start Preparing")
3. Confirm the action

### Manage Reviews
1. Click **Reviews** in sidebar
2. Search by customer or food item name
3. Click **View** to see details
4. Click **Hide** or **Delete** to manage

---

## 🔒 Security Features

✅ **Protected Routes**: Only logged-in admins access admin pages
✅ **Confirmation Dialogs**: Prevents accidental deletions
✅ **Auto-Redirect**: Sends to login if session expires
✅ **Session Storage**: Admin info stored in localStorage

---

## 📊 Dashboard Overview

The dashboard displays:
- 📦 **Orders Today**: Total orders placed today
- 💰 **Revenue Today**: Total revenue from today's orders
- ⏳ **Pending Orders**: Orders awaiting processing
- 👨‍🍳 **Preparing**: Orders being prepared
- ✅ **Ready**: Orders ready for pickup
- 🚚 **Delivered**: Completed orders
- ❌ **Cancelled**: Cancelled orders

---

## 🛠️ Features

### Orders Management
- Search by Order ID or customer name
- Filter by status
- View full order details
- Update order status (Pending → Preparing → Ready → Delivered)
- Cancel orders (only Pending/Preparing)
- See customer contact & delivery info

### Menu Management
- Add new items with image URLs
- Edit existing items
- Delete items
- Toggle availability
- Filter by category
- Search by name

### Inventory Management
- Track stock levels
- Restock items
- Auto status: Low Stock (<10), Out of Stock (0), Available (10+)
- Filter by status
- Manual status override

### Reviews Management
- Search reviews by customer, food item, order ID
- Filter by rating (5⭐ to 1⭐)
- View full review details
- Hide inappropriate reviews
- Delete reviews permanently

---

## 💡 Tips & Tricks

1. **Quick Navigation**: Use sidebar for fast page switching
2. **Search First**: Always search before scrolling through items
3. **Confirmation Required**: All destructive actions need confirmation
4. **Stock Alerts**: Low stock items show warning colors
5. **Responsive Design**: Works on mobile, tablet, and desktop
6. **Loading States**: Buttons show loading state during operations

---

## 🔄 Workflow Examples

### Processing a New Order
1. Check Dashboard for new **Pending** orders
2. Go to Orders page
3. Click **View** on the order
4. Review customer info and items
5. Click **→ Start Preparing**
6. When ready, click **→ Ready for Pickup**
7. When picked up, click **→ Mark Delivered**

### Adding New Menu Item
1. Go to Menu page
2. Click **+ Add New Item**
3. Enter:
   - Name: "Margherita Pizza"
   - Category: "Meals"
   - Price: "11.99"
   - Description: "Classic Italian pizza"
   - Image URL: (optional)
4. Check "Available for ordering"
5. Click **Add Item**

### Restocking Low Item
1. Go to Inventory or Dashboard
2. Find low stock item
3. Click **Restock**
4. Enter new quantity (e.g., 50)
5. Click **Update Stock**
6. Status auto-updates to "Available"

---

## ⚠️ Common Issues

| Issue | Solution |
|-------|----------|
| Can't login | Ensure json-server running on 4001 |
| Data not saving | Check browser console for errors |
| Modal won't close | Click X button or outside modal |
| Search not working | Try different keywords |
| Empty inventory | Run json-server to load sample data |

---

## 📚 Full Documentation

See [ADMIN_PANEL_README.md](./ADMIN_PANEL_README.md) for comprehensive documentation including:
- Technical architecture
- Data models
- API endpoints
- Advanced features
- Future enhancements

---

## 🎨 Visual Guide

### Color Coding
- 🔴 **Red** (#ff6b6b): Primary actions, high priority
- 🟢 **Green** (#4caf50): Confirm, success actions
- 🟠 **Orange** (#ff9800): Warnings, pending
- 🔵 **Blue** (#2196f3): Information, secondary
- ⚫ **Gray** (#666): Neutral, secondary info

### Status Colors
- 🟡 **Pending**: Yellow - waiting to start
- 🔵 **Preparing**: Blue - being prepared
- 🟢 **Ready**: Green - ready for pickup
- ✅ **Delivered**: Green - completed
- ❌ **Cancelled**: Red - cancelled

---

## 🚀 Advanced Usage

### Filtering Orders by Date Range
Use the status tabs to narrow down orders, then use search for specific customers.

### Bulk Operations
Plan for future: Currently single operations, bulk delete/update coming soon.

### Reports & Analytics
Available on Dashboard - expandable with charts and metrics in future versions.

---

## 📞 Support

For help:
1. Check ADMIN_PANEL_README.md for detailed docs
2. Review component source files for implementation
3. Check browser console for errors
4. Verify database is running and accessible

---

**Happy Admin-ing! 🎉**
