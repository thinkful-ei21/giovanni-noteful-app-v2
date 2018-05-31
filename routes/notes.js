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
  const {searchTerm, folderId} = req.query;

  console.log(searchTerm, folderId);

  knex('notes')
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .leftJoin('folders','notes.folder_id', 'folders.id')
    .modify(function (searchFilter){
      if(searchTerm){
        searchFilter
          .where('title', 'like', `%${searchTerm}%`)
          .orWhere('content', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (folderFilter){
      if(folderId){folderFilter.where('folder_id',folderId);}
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
  console.log('finding a note by id');
  
  const findId = req.params.id;
  knex('notes')
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName')
    .leftJoin('folders','notes.folder_id', 'folders.id')
    .where({'notes.id': findId })
    
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
  const updateableFields = ['title', 'content', 'folder_id'];

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
    .returning('id')
  // notes.update(id, updateObj)
    .then(noteId =>{

      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .leftJoin('folders', 'notes.folder_id','folders.id')
        .where('notes.id', noteId[0]);

    })

    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item[0].id}`).status(201).json(item[0]);
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
  const { title, content, folder_id } = req.body;

  const newItem = { title, content,folder_id};
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .insert(newItem)
    .returning('id')
  // notes.create(newItem)
    .then(noteId =>{

      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .leftJoin('folders', 'notes.folder_id','folders.id')
        .where('notes.id', noteId[0]);

    })
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item[0].id}`).status(201).json(item[0]);
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
