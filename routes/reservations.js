const express = require('express');
const router = express.Router();
const Reservation = require('../models/reservations');
const Pet = require('../models/pets');

router.get('/', async (req, res) => {
    try {
        console.log('User ID:', req.user._id);
        const pets = await Pet.find({ userId: req.user._id }).lean();
        console.log('Fetched pets:', pets);

        const reservations = await Reservation.find({ userId: req.user._id })
            .populate('pet')
            .lean();
        
        res.render('reservations', { 
            title: 'Make a Reservation',
            pets: pets,
            reservations: reservations,
            action: 'list'
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).render('reservations', { 
            error: 'Error loading pets and reservations',
            action: 'list'
        });
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