const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  breed: { 
    type: String, 
    required: true,
    trim: true
  },
  color: { 
    type: String,
    trim: true
  },
  age: { 
    type: Number,
    min: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
}
}, {
  timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);




