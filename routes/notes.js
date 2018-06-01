'use strict';

const express = require('express');

// Create an router instance (aka "mini-app")
const router = express.Router();

const knex = require('../knex');

const hydrateNotes = require('../utils/hydrateNotes');

// Get All (and search by query)
router.get('/', (req, res, next) => {
  const {searchTerm, folderId, tagId} = req.query;

  knex('notes')
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .leftJoin('folders','notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags','notes_tags.tag_id', 'tags.id')

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
    .modify(function(tagFilter){
      if(tagId){tagFilter.where('tag_id', tagId);}
    })
    .orderBy('notes.id')
    .then(list => list ? res.json(hydrateNotes(list)) : next() )      
    .catch(err => next(err));
});

// Get a single item
router.get('/:id', (req, res, next) => {
 
  const findId = req.params.id;
  knex('notes')
    .select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .leftJoin('folders','notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags','notes_tags.tag_id', 'tags.id')
    .where({'notes.id': findId })
    .then(list => list ? res.json(hydrateNotes(list)[0]) : next() )
    .catch(err => next(err));
});

// Put update an item
router.put('/:id', (req, res, next) => {
  const upId = req.params.id;
  const folder_id = req.body.folder_id;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];
  
  folder_id == true? updateObj.folder_id = folder_id : {};

  let tags= req.body.tags;

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
    .then(() => {
      return knex('notes_tags')
        .where({note_id:upId})
        .del();
    })
    .then(() =>{
      let tagsObj = [];
      tags.forEach(tag => tagsObj.push({note_id:upId, tag_id: tag}));
      return knex('notes_tags')
        .insert(tagsObj);
    })
    .then(() =>{

      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .leftJoin('folders', 'notes.folder_id','folders.id')
        .where('notes.id', upId);

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
  const { title, content, folder_id, tags} = req.body;

  const newItem = { title, content};
  folder_id == true? newItem.folder_id = folder_id : {};

  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex('notes')
    .insert(newItem)
    .returning('id')
    .then(newId =>{
      noteId = newId[0];
      
      let tagsObj = [];
      tags.forEach(tag => tagsObj.push({note_id:noteId, tag_id: tag}));
      return knex('notes_tags')
        .insert(tagsObj);
    })
    .then(onFulfilled =>{
      return knex('notes')
        .select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .leftJoin('folders', 'notes.folder_id','folders.id')
        .where('notes.id', noteId);
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
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
