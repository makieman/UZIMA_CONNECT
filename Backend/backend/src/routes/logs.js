const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @route   POST /api/logs
 * @desc    Forward logs from Convex or other services to Google Cloud Logging
 * @access  Private (Should be protected by an API key or internal network)
 */
router.post('/', async (req, res) => {
    console.log(`[LogForwarder] Received log request: ${req.body.event || req.body.message}`);
    const { event, severity, data, message } = req.body;

    try {
        if (!event && !message) {
            return res.status(400).json({ error: 'Missing log data' });
        }

        // Log using the existing winston logger
        logger.log({
            level: (severity || 'info').toLowerCase(),
            message: message || `Event: ${event}`,
            event: event,
            ...data,
            source: 'convex-forwarder'
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Log forwarding failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
