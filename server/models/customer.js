let {User} = require('./user');
const mongoose = require('mongoose');
const _ = require('lodash');


let options = {discriminatorKey: 'customer'};
let customerSchema = new mongoose.Schema({}, options);




let Customer = User.discriminator('Customer',
    customerSchema);

module.exports = {Customer};
