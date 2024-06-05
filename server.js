const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// MySQL connection
const db = mysql.createConnection({
  host: '192.168.96.25',
  user: 'isadmin',
  password: 'DB@dmin@2023',
  database: 'iapp_data'
});
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

// API endpoint to save data
app.post('/save-data', (req, res) => {
  const records = req.body;

  // Iterate over records and insert them into the database
  records.forEach(record => {
    // Parse original date and time formats
    const punchDate = record['Punch Date'] ? moment(record['Punch Date'], 'DD/MM/YYYY').format('YYYY-MM-DD') : null;
    const timeIn = record['Time In'] ? moment(punchDate + ' ' + record['Time In'], 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss') : null;
    const timeOut = record['Time Out'] ? moment(punchDate + ' ' + record['Time Out'], 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm:ss') : null;
   
    const query = `
      INSERT INTO iapp_data.user_attendance_details (Code, Name, \`Punch Date\`, Controller, Door, \`Time In\`, \`Time Out\`)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      \`Time Out\` = VALUES(\`Time Out\`)
    `;

    db.query(query, [
      record.Code, record.Name, punchDate,
      record.Controller, record.Door, timeIn, timeOut
    ], (error, results) => {
      if (error) {
        console.error('Error inserting data:', error);
        return res.status(500).json({ message: 'Error inserting data' });
      }
    });
  });

  // Send success response after all records are inserted
  res.status(200).json({ message: 'Data inserted successfully' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
