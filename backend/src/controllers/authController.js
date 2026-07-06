const bcrypt = require('bcryptjs');
const { User } = require('../models');
const generateToken = require('../utils/generateToken');

// @route  POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { name, phone, password, age, gender, state, occupation, annualIncome } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'name, phone and password are required' });
    }

    const existing = await User.findOne({ where: { phone } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this phone number already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      passwordHash,
      age,
      gender,
      state,
      occupation,
      annualIncome,
    });

    const token = generateToken(user.id);
    res.status(201).json({ user: user.toSafeJSON(), token });
  } catch (err) {
    next(err);
  }
}

// @route  POST /api/auth/login
async function login(req, res, next) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'phone and password are required' });
    }

    const user = await User.findOne({ where: { phone } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const token = generateToken(user.id);
    res.json({ user: user.toSafeJSON(), token });
  } catch (err) {
    next(err);
  }
}

// @route  GET /api/auth/me
async function getMe(req, res, next) {
  try {
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

// @route  PATCH /api/auth/me
// Lets the user update their profile fields — these feed directly into the
// eligibility engine, so keeping this endpoint simple matters.
async function updateMe(req, res, next) {
  try {
    const allowedFields = [
      'name', 'age', 'gender', 'annualIncome', 'state',
      'occupation', 'category', 'isPregnantOrLactating',
      'hasBankAccount', 'languagePref',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        req.user[field] = req.body[field];
      }
    });

    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login, getMe, updateMe };
