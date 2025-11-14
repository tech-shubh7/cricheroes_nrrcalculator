
'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

const matchRoutes = require('./src/routes/matchRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '100kb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api', matchRoutes);

app.get('/health', (req, res) => {
  const uptime = process.uptime();
  res.json({ status: 'ok', uptime });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}


