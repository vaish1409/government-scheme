const express = require('express');
const voice = require('../channels/voiceController');
const whatsapp = require('../channels/whatsappController');
const { verifyTwilioSignature } = require('../middleware/twilioSignature');

const router = express.Router();

// Twilio posts these as application/x-www-form-urlencoded, not JSON — see
// server.js, which mounts a urlencoded parser on this path before this router.
router.use(verifyTwilioSignature);

router.post('/voice/incoming', voice.incoming);
router.post('/voice/language', voice.language);
router.post('/voice/gather', voice.gather);
router.post('/voice/consent', voice.consent);

router.post('/whatsapp/incoming', whatsapp.incoming);

module.exports = router;
