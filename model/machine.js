const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MachineSchema = new Schema({
    name: { type: String, required: true, unique: true },
    category: { type: Schema.ObjectId, ref: 'Categories' },
    qty: { type: Number, required: true },
    capacity_per_hr: { type: Number, required: true },
    cost_per_hr: { type: Number, required: true }
}, {
    timestamps: true
});


// Export the model
module.exports = mongoose.model('Machines', MachineSchema);