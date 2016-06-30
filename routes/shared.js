var express = require('express');
var router = express.Router();

router.use('/shared', express.static( __dirname +'/../static/shared' ));

module.exports = router;