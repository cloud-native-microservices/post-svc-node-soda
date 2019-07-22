const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const PostService = require('./service/post-service');
const ObjectService = require('./service/object-service');
const config = require('./config/config.js');

const indexRouter = require('./routes/index');
const postRouter = require('./routes/posts');
const fileUpload = require('express-fileupload');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());
app.use('/', indexRouter);
app.use('/post', postRouter);

PostService.init().then((postService) => {
    app.set('postService', postService);
});
app.set('objectService', new ObjectService(config));

process.on('exit', function() {
    app.get('postService').closePool();
    console.log('goodbye...');
});

module.exports = app;
