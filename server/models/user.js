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

    email: {
      type: String,
      required: false,
      minlength: 6,
      trim: true,
      unique: true,
      validate: {
        validator: (value)=>{
            return validator.isEmail(value);
        },
        message: '{VALUE} is not a valid email'
      },
        sparse: true
    },
    phone: {
        type: String,
        required: false,
        minlength: 7,
        trim: true,
        unique: true,
        sparse: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
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
//TODO: here will be written, what is returned as JSON, if the schema changes, this should change as well

UserSchema.methods.toJSON = function (){
  const user = this;
  const userObject = user.toObject();
  return _.pick(userObject, ['_id','email','phone','sex','birthDate','firstName','lastName']);
};

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  const access = 'Auth';
  const token = jwt.sign(
    {
      _id: user._id.toHexString(),
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

UserSchema.statics.findByCredentials = function(identificationMean, password){
  const User = this;

    //User.findOne({email}).then((user)=>{
    //Here it checks both for the email, LOGIN and phone to find user for password check

    return User.findOne(
        {$or: [
                {email: identificationMean},
                {phone: identificationMean}
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
// UserSchema.pre('save',function () {
//    if(this.isModified('phone')) this.email = undefined;
//    if(this.isModified('email')) this.phone = undefined;
//
// });


const User = mongoose.model('User',
UserSchema
);

module.exports = {User};
