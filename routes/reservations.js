const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservations');
const Pet = require('../models/pets');

// Import the isAuthenticated middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// GET all reservations
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id }).populate('pet').lean();
    const pets = await Pet.find({ userId: req.user._id }).lean();
    res.render('reservations', { 
      title: 'Reservations',
      reservations,
      pets,
      action: 'list'
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).render('reservations', { error: 'Error fetching reservations', action: 'list' });
  }
});

// POST new reservation
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const newReservation = new Reservation({
      pet: req.body.pet,
      userId: req.user._id,
      date: req.body.date,
      time: req.body.time,
      notes: req.body.notes
    });
    await newReservation.save();
    res.redirect('/reservations');
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(400).render('reservations', { error: 'Error creating reservation', action: 'list' });
  }
});

// DELETE reservation
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  try {
    const result = await Reservation.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user._id 
    });
    
    if (!result) {
      return res.status(404).render('reservations', { 
        error: 'Reservation not found',
        action: 'list'
      });
    }
    
    res.redirect('/reservations');
  } catch (error) {
    console.error('Error deleting reservation:', error);
    res.status(500).render('reservations', { 
      error: 'Error deleting reservation',
      action: 'list'
    });
  }
});

module.exports = router;