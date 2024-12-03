# Dog DayCare
This repository contains information for a web page for a dog daycare.

# Table of Contents
1. [Description](#Description)
2. [Characteristics](#Characteristics)
3. [Previous_requirements](#Previous_requirements)
4. [Installation](#Installation)
5. [ExplainingCode](#Explaining code)

# Description

Dog daycare is a platform designed to simplify pet care management for dog daycare centers. It allows users to register pet information and track daily reservations.

# Characteristics

Dog DayCare offers a variety of features to simplify and enhance the management of a dog daycare.

- **Express.js** backend
- **Handlebars** (HBS) for templating

# Previous_requirements

Before running the project, make sure you have the following software and tools installed:

1. **Node.js** (version 14.x or higher)
   - Node.js is required to run the application and manage dependencies.
   - You can download it from [https://nodejs.org](https://nodejs.org).

2. **npm** (Node Package Manager)
   - npm is used to install project dependencies. It comes bundled with Node.js.
   - Verify it's installed by running `npm -v` in your terminal.

3. **Express Generator** (Optional, if you haven't set up the project yet)
   - If you are generating the Express application, you will need Express Generator installed globally.
   - Install it by running:
     ```bash
     npm install -g express-generator

# Installation

Follow these steps to set up and run the project:

1. **Clone the repository**:
    ```bash
    git clone https://github.com/AlineRG/dogDaycare
    ```
2. **Navigate to the project folder** and install dependencies:
    ```bash
    cd dogDaycare
    npm install
    ```
3. **Start the server**:
    ```bash
    npm start
    ```
The server will be running at `http://localhost:3000`

## Usage

Once the server is running, you can access the platform via a web browser and start registering and managing the dogs and bookings.

# ExplainingCode 

## The code about how the information is set up in the edit form 

- The route fetches the pet data from the database using `Pet.findOne()`.
- The pet data is passed to the template in the `pet` object.
- In the template, Handlebars expressions like `{{pet.name}}` are used to populate the form fields with the pet's current information.
- The `action` variable is set to 'edit', which is used in the template to conditionally render the edit form.
- The form's action attribute is set to `/pets/{{pet._id}}`, which will submit the form to the correct update route.

1. **route/pets/js**
```
// Show edit form
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    // Use .lean() to obtain a plain Javascript object
    const pet = await Pet.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    }).lean();

    if (!pet) {
      return res.status(404).render('pets', { 
        error: 'Pet not found', 
        action: 'list' 
      });
    }

    console.log('Pet to edit:', pet); // For debugging

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

// Update pet
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
        error: 'Pet not found', 
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
```
2. **views/pets.hbs**

    {{#if error}}
        <p class="error" role="alert">{{error}}</p>
    {{/if}}

    {{#if (eq action "edit")}}
        <form action="/pets/{{pet._id}}" method="POST" class="pet-form">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" value="{{pet.name}}" required>
            </div>
            <div class="form-group">
                <label for="species">Breed:</label>
                <input type="text" id="breed" name="breed" value="{{pet.breed}}" required>
            </div>
            <div class="form-group">
                <label for="color">Color:</label>
                <input type="text" id="color" name="color" value="{{pet.color}}">
            </div>
            <div class="form-group">
                <label for="age">Age:</label>
                <input type="number" id="age" name="age" value="{{pet.age}}">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Update pet</button>
                <a href="/pets" class="btn">Cancel</a>
            </div>
        </form>
    {{/if}}

3. **app.js**
```
app.use(express.static(path.join(__dirname, 'public')));

app.helpers = {
  // Helper function to check equality between two values
  eq: function (a, b) { 
    return a === b; // Returns true if a is strictly equal to b
  },
  // Helper function to convert an object to a formatted JSON string
  json: function(context) {
    return JSON.stringify(context, null, 2); // Converts context to JSON with 2-space indentation
  }
}
```

## The code about how to see the information in the pets page

The server-side route (`router.get('/', ...)`) fetches all pets belonging to the logged-in user from the database.
It then renders the 'pets' template, passing in the following data:

- `title`: The page title
- `pets`: An array of pet objects
- `action`: Set to 'list' to indicate we're listing pets

In the Handlebars template:

- First check for any errors and display them if present.
- Then check if the `action` is 'list'.
- If there are pets (`pets.length` is truthy), we iterate over the `pets` array using `{{#each pets}}`.
- For each pet, we display its name, breed, color, and age.
- It also provide 'Edit' and 'Delete' buttons for each pet.
- If there are no pets, the page display a message encouraging the user to add a pet.
- Finally, I added an 'Add New Pet' button.

1. **routes/pets.js**
```
const express = require('express');
const router = express.Router();
const Pet = require('../models/pet'); // Assuming you have a Pet model

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Route to display all pets
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Fetch all pets belonging to the logged-in user
    const pets = await Pet.find({ userId: req.user._id }).lean();

    // Render the pets page with the fetched data
    res.render('pets', { 
      title: 'Your Pets',
      pets: pets,
      action: 'list'
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).render('error', { message: 'Error fetching pets' });
  }
});

module.exports = router;
```
2. **views/pets.hbs**
```
    {{#if error}}
        <p class="error" role="alert">{{error}}</p>
    {{/if}}

    {{#if (eq action "list")}}
        {{#if pets.length}}
            <ul class="pet-list">
                {{#each pets}}
                    <li class="pet-item">
                        <h2>{{this.name}}</h2>
                        <p>Breed: {{this.breed}}</p>
                        <p>Color: {{this.color}}</p>
                        <p>Age: {{this.age}}</p>
                        <div class="pet-actions">
                            <a href="/pets/{{this._id}}/edit" class="btn btn-primary">Edit</a>
                            <form action="/pets/{{this._id}}/delete" method="POST">
                                <button type="submit" class="btn btn-danger">Delete</button>
                            </form>
                        </div>
                    </li>
                {{/each}}
            </ul>
        {{else}}
            <p>You don't have any pets yet.</p>
        {{/if}}
        <a href="/pets/new" class="btn btn-success">Add New Pet</a>
    {{/if}}
</body>
</html>
```
## The code about how I put the pet names to appear in the dropdown menu in the reservations page:

In the route (`reservations.js`):

- Fetch all pets belonging to the current user using `Pet.find({ userId: req.user._id })`
- Use `.lean()` to convert the Mongoose documents to plain JavaScript objects
- Pass the pets to the template in the `render` function

In the template (`reservations.hbs`):

- Use `{{#each pets}}` to loop through all the user's pets
- For each pet, create an `<option>` with:

- `value="{{this._id}}"`: The pet's ID (needed for the reservation)
- `{{this.name}}`: The pet's name (what you see in the dropdown)