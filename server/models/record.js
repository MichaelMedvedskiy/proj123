const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
//Nested objects as schemas
var CoordsSchema = new mongoose.Schema({
    latitude:{
        type:Number,
        reqired:true
    },
    longitude:{
        type:Number,
        reqired:true
    }
});

//main record schema
const RecordSchema = new mongoose.Schema(

    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true
        },
        coords:{
           type:CoordsSchema,
            required:true
        },
        time:{
            type:Number,
            reqired:true
        },
        price:{
            type:Number,
            reqired:true,
            min:200
        },
        recordType:{
            type:Boolean,
            required:true
        }
    }

);

RecordSchema.statics.getFilteredRecords = function(filters){
   const Record = this;
   return Record.find({...filters});
};

const Record = mongoose.model('Record',RecordSchema);

module.exports = {Record};
