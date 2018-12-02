const config = require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
let {mongoose} = require('./db/mongoose');
const {Master} = require('./models/master');
const {Customer} = require('./models/customer');
let {authenticate} = require('./middleware/authenticate');
let {masterTypes} = require('./config/masterTypes');


let app = express();
let port = process.env.PORT;
let getErrorObejct = (text)=>{
    return {errorText: text};
};

app.use(bodyParser.json());

//Creation of model instances
app.post('/users', async (req,res)=>{
    try{
        //All the user data necessary for registration go here
        //TODO: When adding new fields to model, they come through here as data formed from HTTP request
        //TODO: If we change models or HTTP requests, it should be accounted for here
        let userType = req.body.userType;
        let newUser;
        if(!userType){
            newUser = new Customer(_.pick(req.body,
                ['firstName','lastName','birthDate','sex','password','email','phone']));
        }else{
            newUser = new Master(_.pick(req.body,
                ['firstName','lastName','birthDate','sex','password','email','phone','experience','masterType']));
        }
        await newUser.save();
        const token = await newUser.generateAuthToken();
        console.log(newUser);
        res.header('x-auth',token).send(newUser);


    }catch(e){
        console.log('An error occured while saving a User: ', e);
        res.status(400).send(e);
    }
});

app.get('/system/masterTypes',  async (req,res)=>{
    try{
       res.send(masterTypes);
    }catch(e){
        console.log('An error occured while fetching user types: ', e);
        res.status(400).send(e);
    }

});

app.listen(port,()=>{
    console.log(`App is up on port ${port}`);
});

module.exports = {app};

//change to see it on the github