'use strict';

const knex = require('../knex');













// let searchTerm = 'gaga';

//get and search
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

// let findId = 10;

//get by id

// knex('notes')
//   .select()
//   .where({id: findId })
//   .then(results => {
//     console.log(JSON.stringify(results[0], null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

//create obj

//let newObj = {title: 'so sample', content: 'would that it were'}

// knex('notes')
//   .insert(newObj)
//   .returning(['id','title'])
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });

//del obj by id

let delId = 14;

// knex('notes')
//   .where({id: delId})
//   .del()
//   .then(console.log)
//   .catch(err => {
//     console.error(err);
//   });

// update obj by id and updateObj

// let upId = 13;
// let updateObj = {title: 'something entierly different'}

// knex('notes')
//   .where({id: upId})
//   .update(updateObj)
//   .returning(['id','title'])
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });