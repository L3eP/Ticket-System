const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'mayung',
  password: 'awanrinjani',
  database: 'ticket_system'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // Create table if not exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aktivitas ENUM('PSB', 'Maintenance', 'Migrasi') NOT NULL,
      sub_node ENUM('ANJ', 'SKM', 'JRG', 'DMS', 'RKM', 'MBL') NOT NULL,
      lokasi VARCHAR(255) NOT NULL,
      pic ENUM('Ijang', 'Ijang2') NOT NULL,
      priority ENUM('Low', 'Moderate', 'Urgent') NOT NULL,
      status ENUM('Terlapor', 'Dikerjakan', 'Selesai', 'Pending') NOT NULL,
      info TEXT,
      evidence VARCHAR(255),
      date_terlapor TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      date_selesai TIMESTAMP NULL
    )
  `;
  
  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      return;
    }
    console.log('Tickets table created or already exists');
  });
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
// Create ticket
app.post('/api/tickets', upload.single('evidence'), (req, res) => {
  const { aktivitas, sub_node, lokasi, pic, priority, status, info } = req.body;
  const evidence = req.file ? req.file.filename : null;

  const query = 'INSERT INTO tickets (aktivitas, sub_node, lokasi, pic, priority, status, info, evidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [aktivitas, sub_node, lokasi, pic, priority, status, info, evidence], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: result.insertId, message: 'Ticket created successfully' });
  });
});

// Get all tickets
app.get('/api/tickets', (req, res) => {
  const query = 'SELECT * FROM tickets ORDER BY date_terlapor DESC';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Get single ticket
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM tickets WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (results.length === 0) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }
    res.json(results[0]);
  });
});

// Update ticket
app.put('/api/tickets/:id', upload.single('evidence'), (req, res) => {
  const { id } = req.params;
  const { aktivitas, sub_node, lokasi, pic, priority, status, info } = req.body;
  const evidence = req.file ? req.file.filename : undefined;

  let query = 'UPDATE tickets SET aktivitas = ?, sub_node = ?, lokasi = ?, pic = ?, priority = ?, status = ?, info = ?';
  let params = [aktivitas, sub_node, lokasi, pic, priority, status, info];

  if (evidence) {
    query += ', evidence = ?';
    params.push(evidence);
  }

  if (status === 'Selesai') {
    query += ', date_selesai = CURRENT_TIMESTAMP';
  }

  query += ' WHERE id = ?';
  params.push(id);

  db.query(query, params, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Ticket updated successfully' });
  });
});

// Delete ticket
app.delete('/api/tickets/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM tickets WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Ticket deleted successfully' });
  });
});

// Export to CSV
app.get('/api/export', (req, res) => {
  const query = 'SELECT * FROM tickets ORDER BY date_terlapor DESC';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const headers = ['ID', 'Aktivitas', 'Sub-Node', 'Lokasi', 'PIC', 'Priority', 'Status', 'Info', 'Date Terlapor', 'Date Selesai'];
    let csv = headers.join(',') + '\n';

    results.forEach(row => {
      const values = [
        row.id,
        row.aktivitas,
        row.sub_node,
        row.lokasi,
        row.pic,
        row.priority,
        row.status,
        `"${row.info?.replace(/"/g, '""') || ''}"`,
        row.date_terlapor,
        row.date_selesai
      ];
      csv += values.join(',') + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('tickets.csv');
    res.send(csv);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 