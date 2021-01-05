const mongoose=require('mongoose');
const User=mongoose.model('user',{
    username:String,
    password:String,
    acntno:Number,
    balance:Number,
    history:[{
        typeOfTransaction:String,
        amount:Number
    }]
});
module.exports={
    User
}