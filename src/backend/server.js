const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'IoT-Dashboard',
  password: 'root',
  port: 5432,
});

// Test Postgres connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(`❌ Postgres Connection Error: ${err.stack}`);
  else console.log(`✅ Postgres Connection Success\n`);
});

// Sign-up route
app.post('/sign-up', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(`📝 Received sign-up request:\nUsername: ${username}\nEmail: ${email}\n`);

  try {
    const userExists = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userExists.rows.length > 0) {
      console.log(`🚫 Username/email already exists: ${username} / ${email}\n`);
      return res.status(400).json({ error: `${username} username already exists` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO users (username, email, password_hash, is_active, is_admin, login_attempts) VALUES ($1, $2, $3, $4, $5, $6)',
      [username, email, passwordHash, true, false, 0]
    );

    console.log(`✅ User created successfully: ${username}\n`);
    res.status(201).json({ message: `✅ User Successfully Created` });
  } catch (error) {
    console.log(`⚠️ Signup Error:\n${error}\n`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`🔐 Login attempt:\nUsername: ${username}\n`);

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ Login failed: User not found (${username})\n`);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      console.log(`🚫 Login blocked: Inactive account (${username})\n`);
      return res.status(403).json({ error: 'Account deactivated. Contact admin.' });
    }

    const isPwdValid = await bcrypt.compare(password, user.password_hash);

    if (!isPwdValid) {
      console.log(`❌ Invalid password attempt for user: ${username}\n`);
      await pool.query(
        'UPDATE users SET login_attempts = login_attempts + 1 WHERE id = $1',
        [user.id]
      );
      return res.status(401).json({ error: 'Invalid password' });
    }

    await pool.query(
      'UPDATE users SET login_attempts = 0, last_login = NOW() WHERE id = $1',
      [user.id]
    );

    const { password_hash, ...userData } = user;

    console.log(`✅ Login success for user: ${username}\n`);
    res.json({
      message: 'Login Success',
      user: userData
    });
  } catch (error) {
    console.error(`⚠️ Login error:\n${error}\n`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin middleware
const requireAdmin = async (req, res, next) => {
  const { userId } = req.body;
  console.log(`🛡️ Admin check for userId: ${userId}\n`);

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      console.log(`🚫 Admin access denied for userId: ${userId}\n`);
      return res.status(403).json({ error: 'Admin access required' });
    }

    console.log(`✅ Admin access granted for userId: ${userId}\n`);
    next();
  } catch (error) {
    console.error(`⚠️ Admin check error:\n${error}\n`);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin toggle user activation
app.post('/admin/toggle-user', requireAdmin, async (req, res) => {
  const { userId } = req.body;
  console.log(`🔄 Toggle activation for userId: ${userId}\n`);

  try {
    await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1',
      [userId]
    );

    console.log(`✅ Toggled user activation status for userId: ${userId}\n`);
    res.status(200).json({ message: 'User Updated' });
  } catch (error) {
    console.error(`⚠️ Toggle user error:\n${error}\n`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}\n`);
});
