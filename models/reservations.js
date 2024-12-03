var mongoose = require('mongoose');

// Define the schema for the Reservation model
const reservationSchema = new mongoose.Schema({
  // Reference to the Pet for which the reservation is made
  pet: {
    type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of a Pet document
    ref: 'Pet', // This field references the Pet model
    required: true // A reservation must be associated with a pet
  },
  // Reference to the User who made the reservation
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of a User document
    ref: 'User', // This field references the User model
    required: true // A reservation must be associated with a user
  },
  // Date of the reservation
  date: {
    type: Date,
    required: true // The date must be provided
  },
  // Time of the reservation
  time: {
    type: String,
    required: true // The time must be provided
  },
  // Additional notes for the reservation
  notes: {
    type: String
    // Optional field, no 'required' constraint
  }
}, {
  // This option automatically adds two fields to the schema:
  // createdAt: A Date field that stores when the document was created
  // updatedAt: A Date field that stores when the document was last updated
  // These fields are automatically managed by Mongoose, so we don't have to
  // manually set or update them in our application code.
  timestamps: true
});

// Create and export the Reservation model
module.exports = mongoose.model('Reservation', reservationSchema);





