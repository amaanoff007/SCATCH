const mongoose=require('mongosse');

const productSchema=mongoose.productSchema({
    image:String,
    name:String,
    price:Number,
    discount:{
        type:Number,
        default:0,
    },
    bgcolor:String,
    panelcolor:String,
    textcolor:String,
})
module.exports=mongoose.model('product',productSchema);  