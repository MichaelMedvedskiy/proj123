let {User} = require('./user');
let {masterTypes} = require('../config/masterTypes');
const _ = require('lodash');

const mongoose = require('mongoose');

let options = {discriminatorKey: 'master'};

let masterSchema = new mongoose.Schema({
    experience: {
        type: Number,
        required: true
    },
    masterType:{
        type: String,
        enum: masterTypes,
        required: true
    }
}, options);

masterSchema.methods.toJSON = function (){
    const master = this;
    const masterObject = master.toObject();
    //TODO: here will be written, what is returned as JSON, if the schema changes, this should change as well
    return _.pick(masterObject, ['_id','email','phone','birthDate','sex','experience', 'masterType','firstName','lastName']);
};
let Master = User.discriminator('Master',
    masterSchema);

module.exports = {Master};
