var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
  	title: 'Messenger⇪',
  	subtitle: 'FREE Messenger app. Turnkey deployments.'
  });
});

module.exports = router;
