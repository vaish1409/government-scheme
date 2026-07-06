const express = require('express');
const { pushSync, pullSync } = require('../controllers/syncController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/push', protect, pushSync);
router.get('/pull', pullSync); // public catalog data, no auth needed

module.exports = router;
