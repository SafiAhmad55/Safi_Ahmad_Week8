# AVENRIX Technologies - Full Stack Web Development
## Week 8 - Invoice Management & Application Refinement

Week 8 extends the existing CRM and Task Management application by adding a complete Invoice Management module and refining the overall application.

---

## Project Overview

The Week 8 module provides complete invoice management connected with existing Clients and Projects.

The application supports invoice creation, viewing, editing, deletion, automatic calculations, status management, searching, filtering, printable invoices, and responsive UI.

---

## Technologies Used

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt
- CORS
- dotenv
- Multer

### Development & Testing
- Visual Studio Code
- Git
- GitHub
- Postman
- Browser Print / Save as PDF

---

# Invoice Management

## Invoice Features

The Invoice Management module includes:

- Invoice list
- Create Invoice
- View Invoice
- Edit Invoice
- Delete Invoice
- Invoice number
- Client selection
- Project selection
- Issue date
- Due date
- Invoice items
- Item description
- Quantity
- Unit price
- Item total
- Subtotal
- Total amount

---

# Automatic Invoice Calculation

Invoice amounts are calculated automatically.

For each item:

`Item Total = Quantity × Unit Price`

The invoice subtotal is calculated from all invoice items.

`Subtotal = Sum of all Item Totals`

The total amount is automatically calculated from the subtotal.

---

# Invoice Status Management

The system supports the following invoice statuses:

- Draft
- Sent
- Paid
- Overdue

Status badges are displayed in the invoice list and can also be used for filtering.

---

# Search & Filtering

Invoices can be searched and filtered using:

- Invoice Number
- Client
- Project
- Status

A clear filters option is also available.

---

# Printable Invoice

Invoice details can be printed using the browser print functionality.

Users can:

- Open invoice details
- Click Print / Save as PDF
- Print the invoice
- Save the invoice as a PDF

---

# Frontend Application Refinement

The frontend was reviewed and improved according to the Week 8 requirements.

## Responsive CRM Interface

The interface is designed to work across:

- Desktop
- Tablet
- Mobile

Responsive layouts and horizontal scrolling are used where necessary for invoice tables.

## Form Validation

Invoice forms validate:

- Required fields
- Dates
- Invoice items
- Quantity
- Unit price

## Loading States

Loading states are displayed while invoice/data information is being fetched.

## Error Messages

The application displays error messages for:

- API errors
- Form errors
- Failed data requests

## Empty States

Empty states are handled when:

- No invoices are available
- No invoices match the search/filter criteria

## Consistent Navigation

The Week 8 Invoice module is integrated into the existing CRM navigation structure.

The application includes:

- Dashboard
- Meetings
- Create Task
- Filters
- Kanban Board
- File Management
- Reports
- Invoices
- Logout

---

# Authentication & Authorization

The application uses JWT-based authentication.

Authentication includes:

- User login
- JWT token generation
- Protected application functionality
- User role information

The application supports the following roles:

- Admin
- Employee

Role-based permissions are used for protected operations.

---



## API Endpoints

### Create Invoice

`POST /api/invoices`

Creates a new invoice.

### Get All Invoices

`GET /api/invoices`

Returns all invoices with client and project information.

### Get Single Invoice

`GET /api/invoices/:id`

Returns details of a specific invoice.

### Update Invoice

`PUT /api/invoices/:id`

Updates an existing invoice and recalculates invoice totals when invoice items are changed.

### Delete Invoice

`DELETE /api/invoices/:id`

Deletes an invoice.

---

# Database

The Invoice schema contains:

- Invoice Number
- Client
- Project
- Issue Date
- Due Date
- Items
- Quantity
- Unit Price
- Item Total
- Subtotal
- Total Amount
- Status

Invoice items are stored as embedded subdocuments.

Client and Project are connected using MongoDB ObjectId references.

---

# API Testing

Invoice APIs were tested using Postman.

Testing included:

- Create Invoice
- Read/View Invoice
- Update Invoice
- Delete Invoice
- Invoice calculation
- Invoice status
- Search/filter functionality
- Validation
- Error handling

---

# Existing CRM Modules

The Week 8 application contains the existing modules developed during previous weeks:

- Authentication
- Dashboard
- Clients
- Projects
- Tasks
- Kanban Board
- File Management
- Meetings
- Reports

Week 8 adds:

- Invoice Management

---

# Testing & Bug Fixes

The application was tested with the backend and database.

Testing covered:

- Authentication
- Dashboard
- Clients
- Projects
- Tasks
- Kanban Board
- File Management
- Meetings
- Reports
- Invoices
- Invoice CRUD
- Invoice calculations
- Status management
- Search and filtering
- Print / Save as PDF
- Loading states
- Error messages
- Empty states
- Navigation

### Conclusion
Week 8 completes the Invoice Management module and improves the existing CRM application with invoice CRUD operations, automatic calculations, status management, search and filtering, printable invoices, responsive design, validation, loading states, error handling, empty states, authentication, authorization, and application-wide testing.



