const express = require('express');
const router = express.Router();
const hamperController = require('../controllers/hamperController');

router.get('/options', hamperController.getHamperOptions);
router.post('/calculate', hamperController.calculateHamperTotal);

module.exports = router;
