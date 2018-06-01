'use strict';

const express = require('express');

const router = express.Router();

const knex = require('../knex');


router.get('/', (req,res,next) =>{

  knex('tags')
    .select('id', 'name')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req,res,next) =>{
  const tagId = req.params.id;

  knex('tags')
    .select('id', 'name')
    .where({'id' : tagId})
    .then(item => item? res.json(item[0]) : next())
    .catch(err => next(err));
});

router.post('/',(req,res,next)=>{
  const {name} = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('tags')
    .insert({'name': name})
    .returning(['id','name'])
    .then(results =>{
      res.location(`${req.originalUrl}/${results[0].id}`).status(201).json(results[0]);
    })
    .catch(err => next(err));
});

router.put('/:id', (req,res,next)=>{
  const updId = req.params.id;

  const {name} =req.body;

  if (!name){
    const err = new Error('Missing name in request body');
    err.status = 400;
    return next(err);
  }

  knex('tags')
    .update({'name':name})
    .where({'id': updId})
    .returning(['id', 'name'])
    .then(item =>  item? res.json(item[0]) : next() )
    .catch(err => next(err));
});

router.delete('/:id', (req,res,next)=>{
  const delId = req.params.id;

  knex('tags')
    .where({'id': delId})
    .del()
    .then(() =>res.status(204).send())
    .catch(err => next(err));

});

module.exports = router;
