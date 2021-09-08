var express = require('express');
var router = express.Router();
var User = require('../models/user')
var jwt = require('jsonwebtoken');
var Facebook = require('fb').Facebook;
var FB = new Facebook({
  appId: '187424133360729',
  appSecret: 'db1c27b22b233b4a34761df3242b3d45'
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

router.post('/dashboard',function(req,res,next){
  var user = new User({
    message: req.body.message,
    published: req.body.published,
    scheduled_publish_time: req.body.timestamp
  });

  let promise = user.save();

  promise.then(function(doc){
    FB.setAccessToken('EAACqdhTkLFkBANbpmaANLppOLpJl63lZA61P2K1DGLu8nhvU3tyZBS3o10IiAIoGxBnUO7mMSvonZA39KWVa73P0cOzcxeVtJYTdL8Haj3ZCJvd7ZAmxDtP7gkP5V6csvrJEETZCdvxDZCqZCluv9jGWPD56OOXZCzuJ0R2ZBzvfF0sb48lK3QkPolZBjDUBzPlr1sbLhQmgZCjXqgZDZD')
  
    FB.api('me/feed', 'post', { message: user.message, published: user.published, scheduled_publish_time:user.scheduled_publish_time }, function (res) {
    if(!res || res.error) {
      console.log(!res ? 'error occurred' : res.error);
      next();
    }
    console.log('Post Id: ' + res.id);
    })
  
    
    return res.status(201).json(doc);
  })

  promise.catch(function(err){
    return res.status(501).json({message: 'Error posting.'})
  })

});


module.exports = router;