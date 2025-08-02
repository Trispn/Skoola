import express, { Request, Response } from 'express';

const app = express();
const port = 3001;

// Use express.json() middleware to parse JSON bodies
app.use(express.json());

// In-memory store for users (for demonstration purposes)
// In a real application, you would use a database.
const users: any[] = [];

// POST /register
// Creates a new user
app.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Check if user already exists
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // In a real application, you should hash the password before saving.
  const newUser = { id: users.length + 1, username, password };
  users.push(newUser);

  console.log('User registered:', newUser);
  console.log('All users:', users);


  res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
});

// POST /login
// Authenticates a user
app.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Find the user and check the password
  // In a real application, you would compare the hashed password.
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    // In a real application, you would return a JWT (JSON Web Token) here.
    res.status(200).json({ message: 'Login successful', userId: user.id });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// GET /
// A simple health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Auth service is running');
});

app.listen(port, () => {
  console.log(`Auth service listening at http://localhost:${port}`);
});
