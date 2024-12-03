var express = require('express');
var router = express.Router();
var Pet = require('../models/pets');
var mongoose = require('mongoose');

// This function checks if a user is logged in
// If they're not, it sends them to the login page
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// GET /pets
// Show a list of all pets for the logged-in user
router.get('/', isAuthenticated, async (req, res) => {
    try {
      // Find all pets belonging to the current user
      const pets = await Pet.find({ userId: req.user._id }).lean();
      console.log('Pets found:', pets);
      
      // Show the pets page with the list of pets
      res.render('pets', { 
        pets, 
        title: 'Pets information',
        action: 'list',
        user: req.user
      });
    } catch (error) {
      console.error('Error fetching pets:', error);
      // If there's an error, show the error on the pets page
      res.status(500).render('pets', { error: error.message, action: 'list' });
    }
  });

// GET /pets/new
// Show the form to add a new pet
router.get('/new', isAuthenticated, (req, res) => {
  res.render('pets', { title: 'Add new pet', action: 'new' });
});

// POST /pets
// Create a new pet
router.post('/', isAuthenticated, async (req, res) => {
  try {
    // Create a new pet object with the form data
    const newPet = new Pet({
      name: req.body.name,
      breed: req.body.breed,
      color: req.body.color,
      age: req.body.age,
      sex: req.body.sex,
      neutered: req.body.neutered === 'true',
      weight: req.body.weight,
      userId: req.user._id
    });
    
    console.log('Creating new pet:', newPet);
    
    // Save the new pet to the database
    const savedPet = await newPet.save();
    console.log('Pet saved:', savedPet);
    
    // Redirect to the pets list page
    res.redirect('/pets');
  } catch (error) {
    console.error('Error creating pet:', error);
    // If there's an error, show it on the new pet form
    res.status(400).render('pets', { error: error.message, action: 'new' });
  }
});

// GET /pets/:id
// Show details of a specific pet
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    // Find the pet by ID and user ID
    const pet = await Pet.findOne({ _id: req.params.id, userId: req.user._id });
    if (!pet) {
      return res.status(404).render('pets', { error: 'Pet not found', action: 'list' });
    }
    // Show the pet details page
    res.render('pets', { pet, title: pet.name, action: 'show' });
  } catch (error) {
    res.status(500).render('pets', { error: error.message, action: 'list' });
  }
});

// GET /pets/:id/edit
// Show the form to edit a pet
router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
      // Find the pet by ID and user ID
      const pet = await Pet.findOne({ 
        _id: req.params.id, 
        userId: req.user._id 
      }).lean(); // Convert the Mongoose document to a plain JavaScript object
  
      if (!pet) {
        return res.status(404).render('pets', { 
          error: 'Pet not found', 
          action: 'list' 
        });
      }
  
      console.log('Pet to edit:', pet);
  
      // Show the edit form with the pet's current information
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
  
// POST /pets/:id
// Update a pet's information
router.post('/:id', isAuthenticated, async (req, res) => {
    try {
      // Find the pet by ID and user ID, then update its information
      const updatedPet = await Pet.findOneAndUpdate(
        { 
          _id: req.params.id, 
          userId: req.user._id 
        },
        {
          name: req.body.name,
          breed: req.body.breed,
          color: req.body.color,
          age: req.body.age,
          sex: req.body.sex,
          neutered: req.body.neutered === 'true',
          weight: req.body.weight
        },
        { new: true } // Return the updated document
      );
  
      if (!updatedPet) {
        return res.status(404).render('pets', { 
          error: 'Pet Not found', 
          action: 'list' 
        });
      }
  
      // Redirect to the pets list page after successful update
      res.redirect('/pets');
    } catch (error) {
      console.error('Error updating pet:', error);
      // If there's an error, show it on the edit form
      res.status(400).render('pets', { 
        error: error.message, 
        action: 'edit', 
        pet: req.body 
      });
    }
  });
  

// POST /pets/:id/delete
// Delete a pet
router.post('/:id/delete', isAuthenticated, async (req, res) => {
  // Check if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).render('pets', { error: 'pet ID invalid', action: 'list' });
  }

  try {
    // Find the pet by ID and user ID, then delete it
    const result = await Pet.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) {
      return res.status(404).render('pets', { error: 'Pet not found', action: 'list' });
    }
    console.log('Pet deleted:', result);
    // Redirect to the pets list page after successful deletion
    res.redirect('/pets');
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).render('pets', { error: error.message, action: 'list' });
  }
});

module.exports = router;