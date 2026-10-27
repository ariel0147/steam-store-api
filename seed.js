// fills the database with sample data: npm run seed
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const User = require('./models/User');
const Category = require('./models/Category');
const Game = require('./models/Game');
const Order = require('./models/Order');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Promise.all([Order.deleteMany(), Game.deleteMany(), Category.deleteMany(), User.deleteMany()]);

    const [action, rpg, strategy] = await Category.insertMany([
      { name: 'Action', description: 'Fast paced shooters and fighting games' },
      { name: 'RPG', description: 'Role playing games' },
      { name: 'Strategy', description: 'Think before you move' },
      { name: 'Sports', description: 'Football, racing and more' }
    ]);

    await Game.insertMany([
      { title: 'Elden Ring', developer: 'FromSoftware', price: 59.99, stock: 40, category: rpg._id, platforms: ['PC', 'PlayStation', 'Xbox'], releaseDate: '2022-02-25' },
      { title: 'The Witcher 3', developer: 'CD Projekt Red', price: 29.99, stock: 25, category: rpg._id, platforms: ['PC', 'PlayStation', 'Xbox', 'Switch'], releaseDate: '2015-05-19' },
      { title: 'Baldur\'s Gate 3', developer: 'Larian Studios', price: 59.99, stock: 15, category: rpg._id, platforms: ['PC', 'PlayStation'], releaseDate: '2023-08-03' },
      { title: 'Counter-Strike 2', developer: 'Valve', price: 14.99, stock: 100, category: action._id, platforms: ['PC'], releaseDate: '2023-09-27' },
      { title: 'DOOM Eternal', developer: 'id Software', price: 39.99, stock: 3, category: action._id, platforms: ['PC', 'PlayStation', 'Xbox'], releaseDate: '2020-03-20' },
      { title: 'Civilization VI', developer: 'Firaxis Games', price: 49.99, stock: 20, category: strategy._id, platforms: ['PC', 'Switch'], releaseDate: '2016-10-21' },
      { title: 'Age of Empires IV', developer: 'Relic Entertainment', price: 39.99, stock: 0, category: strategy._id, platforms: ['PC', 'Xbox'], releaseDate: '2021-10-28' }
    ]);

    await User.insertMany([
      { username: 'gamer_one', email: 'gamer1@example.com', fullName: 'Dana Levi' },
      { username: 'noob_master', email: 'noob@example.com', fullName: 'Yossi Cohen', country: 'USA' }
    ]);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
