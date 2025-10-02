const mongoose =require("mongoose");

const userSchema=mongoose.Schema({
    fullname:{
        type:String,
        minLength:3,
        trim:true,
    },
    email:String,
    password:String,
    cart:[{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        }
    }],
    order:{
        type:Array,
        default:[]
    },
    contact:Number,
    picture:String,
});

module.exports=mongoose.model("user",userSchema);