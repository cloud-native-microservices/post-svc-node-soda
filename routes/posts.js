const express = require('express');
const router = express.Router();
const cors = require('cors');
const asyncHandler = require('express-async-handler')
const postSchema = require('../model/post-schema');

router.get('/', cors(), asyncHandler( async (req, res, next) => {
  res.send( { "health": "OK", "at": new Date() } );
}));

router.post('/', cors(), asyncHandler( async (req, res, next) => {
  const post = JSON.parse(req.body.post);
  const valid = postSchema.schema.validate( post, postSchema.options );
  if( valid.error ) {
    res.status(400).send( valid.error.details );
  }
  else {
    let file = req.files ? req.files.upload : null;
    if( file ) {
      const uploadResult = await res.app.get('objectService').upload(file.data, file.mimetype);
      post.key = uploadResult.key;
    }
    res.status(201).send( await res.app.get('postService').save(post) );
  }
}));

router.put('/:id', cors(), asyncHandler( async (req, res, next) => {
  const post = JSON.parse(req.body.post);
  const valid = postSchema.schema.validate( post, postSchema.options );
  if( valid.error ) {
    res.status(400).send( valid.error.details );
  }
  else {
    // no files accepted on update
    res.status(200).send( await res.app.get('postService').update(req.params.id, JSON.parse(req.body.post)) );
  }
}));

router.get('/:id', cors(), asyncHandler( async (req, res, next) => {
  res.send( await res.app.get('postService').getById(req.params.id) );
}));

router.get('/user/:id', cors(), asyncHandler( async (req, res, next) => {
  res.send( await res.app.get('postService').getByUserId(req.params.id) );
}));

router.get('/user/:id/:offset/:max', cors(), asyncHandler( async (req, res, next) => {
  res.send( await res.app.get('postService').getByUserId(req.params.id, req.params.offset, req.params.max) );
}));

router.delete('/:id', cors(), asyncHandler( async (req, res, next) => {
  const deleted = await res.app.get('postService').deleteById(req.params.id);
  res.status(deleted.count == 1 ? 204 : 404).end();
}));

/* preflight check
router.options('/control', cors());
*/

module.exports = router;
