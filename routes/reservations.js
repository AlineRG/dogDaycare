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
router.post('/', async (req, res) => {
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
        
        const pets = await Pet.find({ userId: req.user._id }).lean();
        
        res.status(400).render('reservations', { 
            title: 'Make a Reservation',
            pets: pets,
            error: 'Error creating reservation. Please try again.',
            action: 'list'
        });
    }
});

module.exports = router;