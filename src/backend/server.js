const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const DeviceDC = require('./schemas/addDevicesSchema');
const motionEvent = require('./schemas/motionEventSchema.');

const { createInitialMotionEvent } = require('../helpers/motionPayload.');

const app = express();
const PORT = 5000;

app.use(express.json());
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

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/iot-DC');

const mongoDB = mongoose.connection;
mongoDB.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
mongoDB.once('open', () => {
  console.log('✅ MongoDB connection success');
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

// forgot password
app.put('/forgot-pwd', async (req, res) => {
  console.log("📩 Received PUT /forgot-pwd");
  const { username, email, password } = req.body;
  console.log(`Username: ${username}, Email: ${email}`);

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (userResult.rows.length === 0) {
      console.log("❌ User not found");
      return res.status(404).json({ error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE username = $2 OR email = $3',
      [passwordHash, username, email]
    );

    console.log("✅ Password updated");
    res.status(200).json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error("⚠️ Internal server error:", error.message);
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


// Add a new IoT device
app.post('/add-device', async (req, res) => {
  const {
    deveui,
    creatorId,
    locationTags,
    device_type,
    record_type,
  } = req.body;

  console.log(`📡 Add Device Request from ${creatorId} for device "${deveui}"\n`);

  try {
    const newDevice = new DeviceDC({
      deveui,
      creatorId,
      locationTags: locationTags || [],
      device_type,
      record_type,
    });

    await newDevice.save();
    console.log(`✅ Device "${deveui}" added by ${creatorId}\n`);

    res.status(201).json({ message: 'Device added successfully', device: newDevice });
  } catch (error) {
    console.error(`⚠️ Add Device Error:\n${error}\n`);
    res.status(500).json({ error: 'Failed to add device' });
  }
});

app.get('/devices', async (req, res) => {
  try {
    const devices = await DeviceDC.find();
    console.log(`📦 Retrieved ${devices.length} devices\n`);
    res.status(200).json(devices);

  } catch (error) {
    console.error(`⚠️ Fetch All Devices Error:\n${error}\n`);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.get('/user-devices', async (req, res) => {
  const { email } = req.query;
  try {
    const devices = await DeviceDC.find({ creatorId: email });
    console.log(`📦 Retrieved ${devices.length} devices\n`);
    res.status(200).json(devices);  

  } catch (error) {
    console.error(`⚠️ Fetch All Devices Error:\n${error}\n`);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});


app.get('admin/devices/:creatorId', async (req, res) => {
  const { creatorId } = req.params;

  try {
    const devices = await DeviceDC.find({ creatorId });
    console.log(`📥 Found ${devices.length} devices for creator: ${creatorId}\n`);
    res.status(200).json(devices);

  } catch (error) {
    console.error(`⚠️ Fetch Devices by Creator Error:\n${error}\n`);
    res.status(500).json({ error: 'Failed to fetch user devices' });
  }
});

app.get('/device/:id', async(req, res) => {
  const { id } = req.params;

  try {
    const device = await DeviceDC.findById({ id });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    console.log(`🔍 Found device with ID: ${id}\n`);
    res.status(200).json(device);

  } catch (error) {
    console.error(`⚠️ Fetch Device by ID Error:\n${error}\n`);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

app.get('/create-data', async (req, res) => {
  const payload = createInitialMotionEvent();
  res.json({ payload });
});

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
    updateDate
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
      updateDate
    });``

    await motionData.save();
    console.log(`✅ Motion Data created by ${creatorId}\n`);
    res.status(201).json({ message: 'Motion data saved successfully!', device: newDevice });

  } catch (error) {
    console.error(`⚠️ Motion event Error:\n${error}\n`);
    res.status(500).json({ error: 'Failed to save motion event' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}\n`);
});
