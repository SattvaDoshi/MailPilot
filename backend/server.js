// server.js
import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/database.js';

const PORT = process.env.PORT || 5000;


// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
