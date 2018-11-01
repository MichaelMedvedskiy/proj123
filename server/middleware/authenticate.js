var {User} = require('./../models/user');

var authenticate = function(req, res, next) {
  var token = req.header('x-auth');
  User.findByToken(token).then((user)=>{
    if(!user){
      console.log('No user with such token');
      return Promise.reject(e);
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e)=>{
    res.status(401).send(e);
  });
};

module.exports = {authenticate};

 
