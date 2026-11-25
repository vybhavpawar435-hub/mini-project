const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../utils/db');
const { generateToken } = require('../utils/jwt');
const { logAudit } = require('../utils/audit');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, first_name, last_name, phone, blood_group, date_of_birth, gender, address } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'Missing required fields (email, password, first name, last name)' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Security: Only 'donor' and 'requester' can register publicly
    // Admin and Staff roles must be provisioned internally
    const requestedRole = role || 'donor';
    const allowedPublicRoles = ['donor', 'requester'];
    if (!allowedPublicRoles.includes(requestedRole)) {
      return res.status(403).json({ success: false, message: 'Public registration is only available for Donor and Requester roles' });
    }

    // Check if user already exists
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [userResult] = await conn.execute(
        `INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [email.toLowerCase().trim(), password_hash, requestedRole, first_name.trim(), last_name.trim(), phone || null]
      );

      const userId = userResult.insertId;

      // If donor, create donor profile
      if (requestedRole === 'donor') {
        const bg = blood_group || 'O+';
        const [bgRows] = await conn.execute('SELECT id FROM blood_groups WHERE group_name = ?', [bg]);
        const bgId = bgRows.length > 0 ? bgRows[0].id : 1;

        await conn.execute(
          `INSERT INTO donors (user_id, blood_group_id, date_of_birth, gender, address, status)
           VALUES (?, ?, ?, ?, ?, 'registered')`,
          [userId, bgId, date_of_birth || '1995-01-01', gender || 'other', address || null]
        );
      }

      await conn.commit();

      const token = generateToken({ id: userId, email: email.toLowerCase().trim(), role: requestedRole });

      await logAudit(userId, 'USER_REGISTER', 'users', userId, null, { email, role: requestedRole }, req.ip);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { token, user: { id: userId, email: email.toLowerCase().trim(), role: requestedRole, first_name: first_name.trim(), last_name: last_name.trim() } }
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const trimmedEmail = email.toLowerCase().trim();

    const [users] = await db.execute(
      'SELECT id, email, password_hash, role, first_name, last_name, is_active FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated. Contact administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    await logAudit(user.id, 'USER_LOGIN', 'users', user.id, null, null, req.ip);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed due to server error', error: err.message });
  }
});

// GET /api/auth/me - Verify active session and return current user details
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No authorization token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token);

    const [users] = await db.execute(
      'SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({ success: false, message: 'Session invalid or user deactivated' });
    }

    const user = users[0];
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone
        }
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message });
  }
});

module.exports = router;
