const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(

  {
      firstName: {
          type: String,
          required: true
      },
      lastName: {
          type: String,
          required: true
      },
      birthDate: {
        type: Number,
        required: true
      },
      sex:{
          type: Boolean,
          required: true
      },
      userType: {
          type: Boolean,
          required: true
      },
      login: {
          type: String,
          required: true,
          minlength: 6,
          trim: true,
          unique: true

      },
    email: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      unique: true,
      validate: {
        validator: (value)=>{
            return validator.isEmail(value);
        },
        message: '{VALUE} is not a valid email'
      }
    },
    phone: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        unique: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
      //The data to the creation of the model gets sent from the server.js file!/
      //TODO: validate data to be 0-10 integer
      rating:{
          type: Number,
          default:undefined
      },

    tokens: [
      {
        access: {
          type: String,
          required: true
        },
        token: {
          type: String,
          required: true
        }
      }
    ]
  }


);

UserSchema.methods.toJSON = function (){
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['_id','email','userType']);
};

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = 'Auth';
  const token = jwt.sign(
    {
      _id: user._id.toHexString(),
      userType:user.userType,//Will it decode as boolean?
       access
    },
    process.env.JWT_SECRET
  ).toString();
  user.tokens = user.tokens.concat([{access,token}]);
  return user.save().then(()=>{
    return token;
  });
};

UserSchema.methods.removeToken = function(token){
  let user = this;
  return user.update({
    $pull: {
      tokens: {
        token
      }
    }
  }
  );
};
    //get all user related info
//get user data - it is in the token

UserSchema.statics.findByToken = function(token){
  const User = this;
  let decoded;

  try{
      decoded = jwt.verify(token,process.env.JWT_SECRET);
      return User.findOne({
      '_id': decoded._id,
      'userType': decoded.userType,
      'tokens.token': token,
      'tokens.access': 'Auth'
    });
  }catch (e){
      // return new Promise((resolve, reject)=>{
      //   reject(e);
      // });
      return Promise.reject(e);
  }
};

//TODO: Change Email for the "Allavalible data - phone, email, login"
UserSchema.statics.findByCredentials = function(identificationMean, password){
  const User = this;

    //User.findOne({email}).then((user)=>{
    //Here it checks both for the email, LOGIN and phone to find user for password check

    return User.findOne(
        {$or: [
                {email: identificationMean},
                {phone: identificationMean},
                {login: identificationMean}
            ]}
        ).then((user)=>{
    if(!user) return Promise.reject();


    return new Promise ((resolve, reject)=>{

      bcrypt.compare(password, user.password, (err, res)=>{
        if(err) reject(err);

        if(res) {
          resolve(user);
        }else{
            reject();
        }
      });

    });


  });
}


//Hashess password on each save of user model, when a password is touched
UserSchema.pre('save', function(next){
  let user = this;

  if(user.isModified('password')) {
    const pass = user.password;
    bcrypt.genSalt(10,(err,salt)=>{
      bcrypt.hash(pass,salt,(err,hash)=>{
        user.password = hash;
        next();
      });
    });
  }else{
    next();
  }
});

//Patch the differences between Master and Customer
UserSchema.pre('save',  function(next){
    let user = this;
//removes rating
    if(user.userType && user.rating===undefined){
        user.rating = 0;
       // console.log(123);
    }


     next();
});

const User = mongoose.model('User',
UserSchema
);

module.exports = {User};
