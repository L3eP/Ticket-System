# Ticket Management System

A web-based ticket management system built with Node.js, Express, and MySQL.

## Features

- Create, read, update, and delete tickets
- Image upload for evidence
- Export tickets to CSV
- Responsive design
- Status and priority tracking
- Date tracking for ticket creation and completion

## Prerequisites

- Node.js
- MySQL
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd ticket-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Create MySQL database:
```sql
CREATE DATABASE ticket_system;
```

4. Update database configuration in `server.js`:
```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'ticket_system'
});
```

5. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. Input Form:
   - Fill in ticket details
   - Upload evidence image
   - Submit the form

2. Ticket List:
   - View all tickets
   - Edit or delete tickets
   - View evidence images
   - Export to CSV

## Technologies Used

- Frontend:
  - HTML5
  - CSS3
  - JavaScript (ES6+)

- Backend:
  - Node.js
  - Express.js
  - MySQL

- Additional Tools:
  - Multer (file upload)
  - CORS
  - dotenv 