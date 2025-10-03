import express from 'express';
import pkg from 'pg';
import cors from 'cors';

const { Pool } = pkg;
const app = express();
const port = 3000; //choose a port for backend

app.use(cors());
app.use(express.json()); // to parse JSON request bodies

//Database connection pool
const pool = new Pool({
    user: 'finnensley',
    host: 'localhost',
    database: 'shipping_app',
    password: 'Finnigan2020!',
    port: 5432, //Default PostgreSQL port
});

// API endpoint to fetch data

app.get('/inventory', async (req, res) => {
  try {
    const inventory = await pool.query('SELECT * FROM inventory');
    res.json({ inventory: inventory.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/orders', async (req, res) => {
  try {
    const orders = await pool.query('SELECT * FROM orders');
    res.json({ orders: orders.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/locations', async (req, res) => {
  try {
    const locations = await pool.query('SELECT * FROM locations');
    res.json({ locations: locations.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.json({ users: users.rows });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

//Start the server
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
})

// In termainl to run server: 
// node src/server.js