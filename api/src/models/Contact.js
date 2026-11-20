const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, default: null, lowercase: true, trim: true },
        category: { type: String, enum: ['personal', 'trabajo', 'otro'], default: 'otro' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

contactSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Contact', contactSchema);
