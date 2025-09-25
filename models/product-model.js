const mongoose = require('mongoose');

// Define schema correctly
const productSchema = new mongoose.Schema({
    image: String,       // you might want Buffer for image if storing binary
    name: String,
    price: Number,
    discount: {
        type: Number,
        default: 0,
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
});

// Export model
module.exports = mongoose.model('Product', productSchema);
