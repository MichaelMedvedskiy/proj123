var {User} = require('./../models/user');

var authenticate = async function(req, res, next) {
  try{
  let token = req.header('x-auth');
  let user = await User.findByToken(token);
    if(!user){
      console.log('No user with such token');
      //return Promise.reject(e);
      throw new Error('Your authentication is incorrect');
    }
    req.userId = user._id;
    req.userType = user.userType;
    req.token = token;
    next();
  }catch(e){
    res.status(401).send(e);
  };
};

module.exports = {authenticate};

 
