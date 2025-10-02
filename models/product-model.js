const mongoose = require('mongoose');

// Define schema correctly
const productSchema = new mongoose.Schema({
    image: Buffer,       // you might want Buffer for image if storing binary
    name: String,
    price: Number,
    discount: {
        type: Number,
        default: 0,
    },
    bgcolor: String,
    panelcolor: String,
    textcolor: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'owner',
        required: true
    }
});

// Export model
module.exports = mongoose.model('Product', productSchema);
