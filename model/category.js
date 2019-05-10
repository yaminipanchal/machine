const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true, unique: true },

}, {
    timestamps: true
});


// Export the model
module.exports = mongoose.model('Categories', CategorySchema);

