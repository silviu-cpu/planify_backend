var express = require('express');
var router = express.Router();
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var Facebook = require('fb').Facebook;

var FB = new Facebook({

  appID: APP-ID,

  secret: APP-SECRET

});

router.post('/dashboard', (req, res, next) => {
  var user = new User({
    email: req.body.email,
    username: req.body.username,
    password: User.hashPassword(req.body.password),
    creation_dt: new Date()
  });
  
  FB.api(
    '/106621474728507/feed',
    'POST',
    {"message":"Schelduled post","published":"false","scheduled_publish_time":"1631030741"},
    function(response) {
        // Insert your code here
        console.log(response);
    }
  );

});
router.post('/registration', function(req,res,next){
  
  var user = new User({
    email: req.body.email,
    username: req.body.username,
    password: User.hashPassword(req.body.password),
    creation_dt: new Date()
  });

  let promise = user.save();

  promise.then(function(doc){
    return res.status(201).json(doc);
  })

  promise.catch(function(err){
    return res.status(501).json({message: 'Error registering user.'})
  })

})

router.post('/login', function(req,res,next){
  let promise = User.findOne({email:req.body.email}).exec();

  promise.then(function(doc){
    if(doc) {
      if(doc.isValid(req.body.password)){
        //generate token
        let token = jwt.sign({username:doc.username},'secret', {expiresIn: '3h'});

        return res.status(200).json(token);
      } else {
        return res.status(501).json({message:'Invalid Credentials'});
      }
    }
    else {
      return res.status(501).json({message:'User email is not registered'})
    }
  })

  promise.catch(function(err){
    return res.status(501).json({message:'Internal error'})
  })
})

router.get('/username', verifyToken, function(req,res,next){
  return res.status(200).json(decodedToken.username);
})
//middleware
var decodedToken='';
function verifyToken(req,res,next){
  let token = req.query.token;

  jwt.verify(token,'secret',function(err, tokendata){
    if(err){
      return res.status(400).json({message: ' Unaurhorized request '});
    }
    if(tokendata){
      decodedToken = tokendata;
      next();
    }
  })

}

module.exports = router;
