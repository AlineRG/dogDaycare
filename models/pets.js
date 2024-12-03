var mongoose = require('mongoose');

// Define the schema for the Pet model
const petSchema = new mongoose.Schema({
  // Name of the pet
  name: { 
    type: String, 
    required: true, // This field must be provided
    trim: true // Remove whitespace from both ends of the string
  },
  // Breed of the pet
  breed: { 
    type: String, 
    required: true,
    trim: true
  },
  // Color of the pet
  color: { 
    type: String,
    trim: true
  },
  // Age of the pet in years
  age: { 
    type: Number,
    min: 0 // Age cannot be negative
  },
  // Sex of the pet
  sex: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'], // Only these values are allowed
    default: 'Unknown' // If not provided, default to 'Unknown'
  },
  // Whether the pet is neutered/spayed
  neutered: {
    type: Boolean,
    default: false // If not provided, assume not neutered
  },
  // Weight of the pet
  weight: {
    type: Number,
    min: 0 // Weight cannot be negative
  },
  // Reference to the User who owns this pet
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Store the ObjectId of a User document
    ref: 'User', // This field references the User model
    required: true // A pet must belong to a user
  }
}, {
  // Add createdAt and updatedAt fields automatically
  timestamps: true
});

// Create and export the Pet model
module.exports = mongoose.model('Pet', petSchema);




