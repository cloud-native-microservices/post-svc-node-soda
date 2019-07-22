const express = require('express');
const router = express.Router();
const cors = require('cors');

/* GET home page. */
router.get('/', cors(), function(req, res, next) {
  res.send({"OK": true, "service": "post-svc"});
});

module.exports = router;
