import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import Contact from './models/Contact.js';
import User from './models/User.js';
import { authenticateToken, requireAdmin } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lifehope';

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

let dbConnected = false;
const fallbackUsers = [];
const fallbackContacts = [];

async function connectDatabase() {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    dbConnected = true;
    console.log('MongoDB connected.');
  } catch (error) {
    dbConnected = false;
    console.warn('MongoDB unavailable. Falling back to in-memory storage.', error.message);
  }
}

async function findUserByEmail(email) {
  if (dbConnected) {
    return User.findOne({ email: email.toLowerCase() });
  }

  return fallbackUsers.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

async function findUserById(userId) {
  if (dbConnected) {
    return User.findById(userId).select('-password');
  }

  return fallbackUsers.find((user) => user._id.toString() === userId.toString()) || null;
}

async function createUser(data) {
  if (dbConnected) {
    return User.create(data);
  }

  const user = {
    _id: String(fallbackUsers.length + 1),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  fallbackUsers.push(user);
  return user;
}

async function createContact(data) {
  if (dbConnected) {
    return Contact.create(data);
  }

  const contact = {
    _id: String(fallbackContacts.length + 1),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  fallbackContacts.push(contact);
  return contact;
}

async function getContactsByPeriod(period = 'month') {
  const now = new Date();
  let fromDate = new Date(now);

  switch (period) {
    case 'week':
      fromDate.setDate(now.getDate() - 7);
      break;
    case 'year':
      fromDate.setFullYear(now.getFullYear() - 1);
      break;
    case 'month':
    default:
      fromDate.setMonth(now.getMonth() - 1);
      break;
  }

  if (dbConnected) {
    return Contact.find({ createdAt: { $gte: fromDate } }).sort({ createdAt: -1 });
  }

  return fallbackContacts.filter((contact) => new Date(contact.createdAt) >= fromDate).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || 'admin@lifehope.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const existing = await findUserByEmail(email);

  if (!existing) {
    const hash = await bcrypt.hash(password, 10);
    await createUser({
      name: 'Administrator',
      email,
      password: hash,
      role: 'admin',
    });
    console.log(`Default admin user created: ${email}`);
  }
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' }
  );
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: dbConnected ? 'connected' : 'fallback' });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for that email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      role: 'user',
    });

    const token = signToken(user);
    const safeUser = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.status(201).json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create account.', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    const safeUser = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return res.json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to sign in.', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load profile.', error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  const { name, phone, email, preferredService, healthConcern } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required.' });
  }

  try {
    const contact = await createContact({
      name,
      phone,
      email: email || '',
      preferredService: preferredService || '',
      healthConcern: healthConcern || '',
    });

    return res.status(201).json({ message: 'Contact request saved successfully.', contact });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save contact request.', error: error.message });
  }
});

app.get('/api/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const contacts = await getContactsByPeriod(period);
    return res.json({ contacts });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load contacts.', error: error.message });
  }
});

app.get('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

async function initializeApp() {
  await connectDatabase();
  await ensureAdminUser();
}

async function startServer() {
  await initializeApp();

  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  startServer();
}

export { app, connectDatabase, ensureAdminUser, initializeApp, startServer };
export default app;
