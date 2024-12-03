var express = require('express');
var router = express.Router();
var Reservation = require('../models/reservations');
var Pet = require('../models/pets');

// This middleware checks if a user is logged in
// If they're not, it redirects them to the login page
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// GET /reservations
// Show a list of all reservations for the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Find all reservations for the current user and include pet details
    const reservations = await Reservation.find({ userId: req.user._id }).populate('pet').lean();
    // Also get all pets for the current user (likely for a dropdown in the form)
    const pets = await Pet.find({ userId: req.user._id }).lean();
    
    // Render the reservations page with the list of reservations and pets
    res.render('reservations', { 
      title: 'Reservations',
      reservations,
      pets,
      action: 'list'
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    // If there's an error, show it on the reservations page
    res.status(500).render('reservations', { error: 'Error fetching reservations', action: 'list' });
  }
});

// POST /reservations
// Create a new reservation
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Create a new reservation object with the form data
    const newReservation = new Reservation({
      pet: req.body.pet,
      userId: req.user._id,
      date: req.body.date,
      time: req.body.time,
      notes: req.body.notes
    });
    
    // Save the new reservation to the database
    await newReservation.save();
    
    // Redirect to the reservations list page after successful creation
    res.redirect('/reservations');
  } catch (error) {
    console.error('Error creating reservation:', error);
    // If there's an error, show it on the reservations page
    res.status(400).render('reservations', { error: 'Error creating reservation', action: 'list' });
  }
});

// POST /reservations/:id/delete
// Delete a specific reservation
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    // Find the reservation by ID and user ID, then delete it
    const result = await Reservation.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user._id 
    });
    
    // If no reservation was found, show an error
    if (!result) {
      return res.status(404).render('reservations', { 
        error: 'Reservation not found',
        action: 'list'
      });
    }
    
    // Redirect to the reservations list page after successful deletion
    res.redirect('/reservations');
  } catch (error) {
    console.error('Error deleting reservation:', error);
    // If there's an error, show it on the reservations page
    res.status(500).render('reservations', { 
      error: 'Error deleting reservation',
      action: 'list'
    });
  }
});

module.exports = router;