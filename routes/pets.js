const express = require('express');
const router = express.Router();
const Pet = require('../models/pets');
const mongoose = require('mongoose');

// Middleware to verify authentication
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Route to list all pets
router.get('/', isAuthenticated, async (req, res) => {
    try {
      const pets = await Pet.find({ userId: req.user._id }).lean();
      console.log('Pets found:', pets);
      
      res.render('pets', { 
        pets, 
        title: 'Register pets',
        action: 'list',
        user: req.user
      });
    } catch (error) {
      console.error('Error fetching pets:', error);
      res.status(500).render('pets', { error: error.message, action: 'list' });
    }
  });

// Show new pet form
router.get('/new', isAuthenticated, (req, res) => {
  res.render('pets', { title: 'Add new pet', action: 'new' });
});

// CREATE new pet
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const newPet = new Pet({
      name: req.body.name,
      breed: req.body.breed,
      color: req.body.color,
      age: req.body.age,
      userId: req.user._id
    });
    
    console.log('Creating new pet:', newPet);
    
    const savedPet = await newPet.save();
    console.log('Pet saved:', savedPet);
    
    res.redirect('/pets');
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(400).render('pets', { error: error.message, action: 'new' });
  }
});

// Show pet details
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, userId: req.user._id });
    if (!pet) {
      return res.status(404).render('pets', { error: 'Pet not found', action: 'list' });
    }
    res.render('pets', { pet, title: pet.name, action: 'show' });
  } catch (error) {
    res.status(500).render('pets', { error: error.message, action: 'list' });
  }
});

// EDIT 

router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
      const pet = await Pet.findOne({ 
        _id: req.params.id, 
        userId: req.user._id 
      }).lean(); //Convert the Mongoose document to a plain JavaScript object to see information to edit
  
      if (!pet) {
        return res.status(404).render('pets', { 
          error: 'Pet not found', 
          action: 'list' 
        });
      }
  
      console.log('Pet to edit:', pet);
  
      res.render('pets', { 
        pet, 
        title: `Edit ${pet.name}`, 
        action: 'edit'
      });
    } catch (error) {
      console.error('Error fetching pet for edit:', error);
      res.status(500).render('pets', { 
        error: error.message, 
        action: 'list' 
      });
    }
  });
  
// UPDATE
router.post('/:id', isAuthenticated, async (req, res) => {
    try {
      const updatedPet = await Pet.findOneAndUpdate(
        { 
          _id: req.params.id, 
          userId: req.user._id 
        },
        {
          name: req.body.name,
          breed: req.body.breed,
          color: req.body.color,
          age: req.body.age
        },
        { new: true }
      );
  
      if (!updatedPet) {
        return res.status(404).render('pets', { 
          error: 'Pet Not found', 
          action: 'list' 
        });
      }
  
      res.redirect('/pets');
    } catch (error) {
      console.error('Error updating pet:', error);
      res.status(400).render('pets', { 
        error: error.message, 
        action: 'edit', 
        pet: req.body 
      });
    }
  });
  

// DELETE 
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).render('pets', { error: 'pet ID invalid', action: 'list' });
  }

  try {
    const result = await Pet.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) {
      return res.status(404).render('pets', { error: 'Pet not found', action: 'list' });
    }
    console.log('Pet deleted:', result);
    res.redirect('/pets');
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).render('pets', { error: error.message, action: 'list' });
  }
});

module.exports = router;
