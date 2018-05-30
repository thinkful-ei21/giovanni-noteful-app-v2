'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
//const data = require('../db/notes');
//const simDB = require('../db/simDB');
//const notes = simDB.initialize(data);

const knex = require('../knex');


// Get All (and search by query)
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  knex('notes')
    .select('id', 'title', 'content')
    .modify(function (searchFilter){
      if(searchTerm){
        searchFilter
          .where('title', 'like', `%${searchTerm}%`)
          .orWhere('content', 'like', `%${searchTerm}%`);
      }

    })
    .orderBy('notes.id')
    .then(list => {
      res.json(list);
    })
    .catch(err => {
      next(err);
    });
  // notes.filter(searchTerm)
  //   .then(list => {
  //     res.json(list);
  //   })
  //   .catch(err => {
  //     next(err);
  //   });
});

// Get a single item
router.get('/:id', (req, res, next) => {
  const findId = req.params.id;

  knex('notes')
    .select()
    .where({id: findId })
    
  // notes.find(id)
    .then(item => {
      if (item) {
        res.json(item[0]);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const upId = req.params.id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .where({id: upId})
    .update(updateObj)
    .returning(['id','title','content'])

  // notes.update(id, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// Post (insert) an item
router.post('/', (req, res, next) => {
  const { title, content } = req.body;

  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .insert(newItem)
    .returning(['id','title', 'content'])
  // notes.create(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      }
    })
    .catch(err => {
      next(err);
    });
});

// Delete an item
router.delete('/:id', (req, res, next) => {
  const delId = req.params.id;

  knex('notes')
    .where({id: delId})
    .del()
  // notes.delete(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
