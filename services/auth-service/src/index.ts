import express, { Request, Response } from 'express';
import pool from './db';
import bcrypt from 'bcrypt';

const app = express();
const port = 3001;

// Use express.json() middleware to parse JSON bodies
app.use(express.json());

// POST /register
// Creates a new user in the database with a hashed password
app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /login
// Authenticates a user against the database
app.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      // In a real application, you would return a JWT (JSON Web Token) here.
      res.status(200).json({ message: 'Login successful', userId: user.id });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /
// A simple health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Auth service is running');
});

// GET /db-test
// A temporary endpoint to test the database connection
app.get('/db-test', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      message: 'Database connection successful',
      time: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database connection failed', error: err });
  }
});

app.listen(port, () => {
  console.log(`Auth service listening at http://localhost:${port}`);
});
