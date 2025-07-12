const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middlewares/auth');

router.get('/charts', auth, reportController.getChartsData);

module.exports = router;