const config = require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');

const _ = require('lodash');
let {mongoose} = require('./db/mongoose');

let {User} = require('./models/user');


let {authenticate} = require('./middleware/authenticate');



let app = express();
let port = process.env.PORT;
let getErrorObejct = (text)=>{
    return {errorText: text};
};

app.use(bodyParser.json());

app.post('/users', async (req,res)=>{
    try{
        //All the user data necessary for registration go here
        //TODO: When adding new fields to model, they come through here as data formed from HTTP request
        let user = new User(_.pick(req.body,['email','password','phone','firstName','lastName','birthDate','sex','userType', 'login','rating']));
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth',token).send(user);


    }catch(e){
        console.log('An error occured while saving a user: ', e);
        res.status(400).send(e);
    }
});

app.post('/users/login',async (req, res)=>{

    try {
        const body = _.pick(req.body,['identificationMean','password']);
        const user = await User.findByCredentials(body.identificationMean,body.password);
        const token = await user.generateAuthToken();
        return res.header('x-auth',token).send(user);

    }catch(e){
        res.status(400).send('No such user found');
    }

});



app.listen(port,()=>{
    console.log(`App is up on port ${port}`);
});

module.exports = {app};
