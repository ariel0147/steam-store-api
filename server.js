/*
 * מטלת סיום - MongoDB
 * שרת REST API לחנות משחקים בסגנון Steam
 *
 * שם: אריאל חזוט
 * ת"ז: 324056670
 */

require('dotenv').config({ quiet: true });
const express = require('express');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const gameRoutes = require('./routes/gameRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Steam Store API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/orders', orderRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
