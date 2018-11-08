const config = require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');

const {ObjectID} = require('mongodb');

const _ = require('lodash');
let {mongoose} = require('./db/mongoose');

const {User} = require('./models/user');
const {Record} = require('./models/record');

let {authenticate} = require('./middleware/authenticate');



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
        let user = new User(_.pick(req.body,['email','password','phone','firstName','lastName','birthDate','sex','userType', 'login','rating']));
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth',token).send(user);


    }catch(e){
        console.log('An error occured while saving a User: ', e);
        res.status(400).send(e);
    }
});
//creating a record as an authenticated user
app.post('/records',authenticate, async(req,res)=>{
    try{
        const requestBody = _.pick(req.body, ['coords','time','price']);
        //const user = User.findByToken(req.token);
        const recordType = req.userType;
        const userId = req._id;
        const record = new Record({...requestBody, recordType,userId});
        await record.save();
        res.header('x-auth',req.token).send(record);
    }catch(e){
        console.log('An error occured while saving a Record: ', e);
        res.status(400).send(e);

    }
});
//loggining in
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
//getting a record as an authenticated user
app.post('/records/filter', authenticate, async (req,res)=>{
    try{
        let filters = _.pick(req.body,[]);
        filters.recordType = !req.userType;
        console.log(filters);
        const records = await Record.getFilteredRecords(filters);
        return res.header('x-auth',req.token).send(records);
    }catch(e){
        res.status(400).send('Error getting filtered records');
    }
})

app.listen(port,()=>{
    console.log(`App is up on port ${port}`);
});

module.exports = {app};
