'use strict';

const express = require('express');

const router = express.Router();

const knex = require('../knex');

router.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/:id', (req, res, next) => {
  const findId = req.params.id;
  
  knex('folders')
    .select()
    .where({id: findId })
      
    // notes.find(id)
    .then(item => {
      if (item) {res.json(item[0]);}
      else {next();}
    })
    .catch(err => next(err));
});

router.put('/:id', (req, res, next) =>{
  const updId = req.params.id;
  let newName;
  try{
    newName = req.body.newName;
  } catch(error){
    const err = new Error('missing newName in body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .update({name:newName})
    .where({id: updId})
    .then(item=>{
      if(item){res.json(item);}
      else{next();}
    })
    .catch(err => next(err));
});

router.post('/', (req, res, next)=>{
    console.log('routing works')
  let newName;
  try{
    newName = req.body.newName;
  } catch(error){
    const err = new Error('missing newName in body');
    err.status = 400;
    return next(err);
  }
  console.log(newName)
  knex('folders')
    .insert({name: newName})
    .returning(['id','name'])
    .then(item =>{
      if(item){
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);}
      else{next();}
    })
    .catch(err => next(err));

});

router.delete('/:id', (req,res,next)=>{
  const delId = req.params.id;
  knex('folders')
    .where({id:delId})
    .del()
    .then(() =>{
      res.status(204).send();
    })
    .catch(err => next(err));
});



module.exports = router;