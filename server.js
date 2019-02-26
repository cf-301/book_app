'use strict';

const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('./public'))

app.get('/', (request,response) => {
  response.render('pages/index');
})

app.get('*', (request,response) => response.status(404).send('This route does not exist'));

app.listen(PORT,() => console.log(`Listening on ${PORT}`));
