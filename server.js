'use strict';

//Express dependencies
const express = require('express');
const superagent = require('superagent');

const app = express();
app.use(express.urlencoded({extended:true}));


//Port
const PORT = process.env.PORT || 3000;

//EJS declaration folder dependency + express folder route
app.set('view engine', 'ejs');
app.use(express.static('./public'))

//Routes and handlers
app.get('/', (request,response) => {response.render('pages/index');})

app.post('/searches', dealWithSearches)

app.get('/welcome', (request,response) => {
  handleError('This is a test error', response);
})

app.get('*', (request,response) => response.status(404).send('This route does not exist'));

// Error handler
function handleError(err, res) {
  console.error(err);
  res.render('pages/error', {error:(err)});
}

//Helper Functions
function dealWithSearches(request,response){
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log('24', request.body.search)
  
  if(request.body.search[1] === 'title') {
    url += `+intitle:${request.body.search[0]}`;
  }
  if(request.body.search[1] === 'author') {
    url += `+inauthor:${request.body.search[0]}`;
  }
  
  superagent.get(url)
    .then(response => response.body.items.map(bookResult => new Book(bookResult)))
    .then(results => response.render('pages/searches/show',{searchesResults:results}))
    .catch(error => handleError(error,response));
}



//Book constructor
function Book(data){
  this.title = data.volumeInfo.title || 'No title found';
  this.authors = data.volumeInfo.authors || 'No author found';
  this.image = data.volumeInfo.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = data.volumeInfo.description || 'No description found';
}


app.listen(PORT,() => console.log(`Listening on ${PORT}`));
