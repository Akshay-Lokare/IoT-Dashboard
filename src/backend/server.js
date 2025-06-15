const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Schemas
const DeviceDC = require('./schemas/addDevicesSchema');
const motionEvent = require('./schemas/motionEventSchema');

// Motion payload generator
const { createInitialMotionEvent } = require('../backend/motionPayload.cjs');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// PostgreSQL connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'IoT-Dashboard',
  password: 'root',
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(`❌ Postgres Connection Error: ${err.stack}`);
  else console.log(`✅ Postgres Connection Success\n`);
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/iot-DC');
const mongoDB = mongoose.connection;

mongoDB.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
mongoDB.once('open', () => {
  console.log('✅ MongoDB connection success');
});

// Routes
app.get('/', (req, res) => {
  res.send('🚀 Server is running');
});

// Signup
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
    res.status(201).json({ message: '✅ User Successfully Created' });
  } catch (error) {
    console.log(`⚠️ Signup Error:\n${error}\n`);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body; // Now expecting email instead of username
  console.log(`🔐 Login attempt for email: ${email}`);

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      console.log(`❌ Login failed: Email not found (${email})`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      console.log(`🚫 Login blocked: Inactive account (${email})`);
      return res.status(403).json({ 
        error: 'Account deactivated. Please contact support.' 
      });
    }

    // Check login attempts
    if (user.login_attempts >= 5) {
      return res.status(429).json({
        error: 'Too many attempts. Account temporarily locked.'
      });
    }

    const isPwdValid = await bcrypt.compare(password, user.password_hash);

    if (!isPwdValid) {
      console.log(`❌ Invalid password attempt for email: ${email}`);
      await pool.query(
        'UPDATE users SET login_attempts = login_attempts + 1 WHERE id = $1', 
        [user.id]
      );
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset attempts on successful login
    await pool.query(
      'UPDATE users SET login_attempts = 0, last_login = NOW() WHERE id = $1', 
      [user.id]
    );

    const { password_hash, ...userData } = user;

    console.log(`✅ Login success for email: ${email}`);
    res.json({ 
      message: 'Login successful', 
      user: userData 
    });
  } catch (error) {
    console.error(`⚠️ Login error:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Forgot password
app.put('/forgot-pwd', async (req, res) => {
  console.log('📩 Received PUT /forgot-pwd');
  const { username, email, password } = req.body;

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 OR email = $3',
      [passwordHash, username, email]
    );

    console.log('✅ Password updated');
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('⚠️ Internal server error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin middleware
const requireAdmin = async (req, res, next) => {
  const { adminEmail } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

    if (userResult.rows.length === 0 || !userResult.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin toggle user activation
app.post('/admin/toggle-user', requireAdmin, async (req, res) => {
  const { targetEmail } = req.body;

  try {
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE email = $1 RETURNING *', [targetEmail]);
    res.status(200).json({ message: 'User Updated' });

  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: get all users
app.get('/admin/get-users', async (req, res) => {
  try {
    const users = await pool.query('SELECT * FROM users');
    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: get all devices by creator
app.get('/admin/devices', async (req, res) => {

  try {
    const devices = await DeviceDC.find();
    res.status(200).json(devices);

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user devices' });
  }
});

// Admin: remove a device
app.delete('/admin/delete-device', async (req, res) => {
  const { deveui } = req.query;
  try {
    const deleteDevice = await DeviceDC.deleteOne({ deveui: deveui })
    res.status(200).json({ msg: `${deveui} deleted successfully` });
  } catch (error) {
      res.status(500).json({ error: 'Failed to delete device' });
  }
});

// Add device
app.post('/add-device', async (req, res) => {
  const { deveui, creatorId, locationTags, device_type, record_type } = req.body;

  try {
    const newDevice = new DeviceDC({
      deveui,
      creatorId,
      locationTags: locationTags || [],
      device_type,
      record_type,
    });

    await newDevice.save();
    res.status(201).json({ message: 'Device added successfully', device: newDevice });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add device' });
  }
});

// Get all devices
app.get('/devices', async (req, res) => {
  try {
    const devices = await DeviceDC.find();
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get user devices by email
app.get('/user-devices', async (req, res) => {
  const { email } = req.query;

  try {
    const devices = await DeviceDC.find({ creatorId: email });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// Get a single device by ID
app.get('/device/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const device = await DeviceDC.findById(id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// Create test motion payload
app.get('/create-data', (req, res) => {
  const payload = createInitialMotionEvent();
  res.json({ payload });
});

// Store motion data
app.post('/:type/create-data', async (req, res) => {
  const {
    deveui,
    creatorId,
    locationTags,
    device_type,
    record_type,
    payload,
    fcount,
    createDate,
    updateDate,
  } = req.body;

  try {
    const motionData = new motionEvent({
      deveui,
      creatorId,
      locationTags: locationTags || [],
      device_type,
      record_type,
      payload,
      fcount,
      createDate,
      updateDate,
    });

    await motionData.save();
    res.status(201).json({ message: 'Motion data saved successfully!', device: motionData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save motion event' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}\n`);
});
