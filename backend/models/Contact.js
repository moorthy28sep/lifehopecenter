import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    preferredService: {
      type: String,
      trim: true,
    },
    healthConcern: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

export default Contact;
