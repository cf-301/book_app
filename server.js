'use strict';

//Express dependencies
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');

//Express app creation
const app = express();
app.use(express.urlencoded({extended:true}));

//PG instantiation
const client = new pg.Client(process.env.DATABASE_URL)
client.connect();
client.on('error', err => console.error(err));

//Port
const PORT = process.env.PORT || 3000;

//EJS declaration folder dependency + express folder route
app.set('view engine', 'ejs');
app.use(express.static('./public'))


//----------------------------------------------------
//Routes and handlers
app.get('/search', (request,response) => {response.render('pages/search');})
app.get('/', getBooks);

app.post('/searches', dealWithSearches);

app.get('/book/:book_id', getOneBook);

app.get('/welcome', (request,response) => {
  handleError('This is a test error', response);
})

app.get('*', (request,response) => response.status(404).send('This route does not exist'));



//----------------------------------------------------
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
    .then(results => {
      results.map(book => book.save());
      response.render('pages/index',{path:'searches/show',searchesResults:results}
      )})
    .catch(error => handleError(error,response));
}



//Book constructor
function Book(data){
  const placeholderImage = 'https//i.imgur.com/J5LVHEL.jpg';

  this.title = data.volumeInfo.title ? data.volumeInfo.title: 'No title available';
  this.author = data.volumeInfo.authors ? data.volumeInfo.authors[0] : 'No Author available';
  this.isbn = data.volumeInfo.industryIdentifiers ? `ISBN_13 ${data.volumeInfo.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = data.volumeInfo.imageLinks ? data.volumeInfo.imageLinks.smallThumbnail : placeholderImage;
  this.description = data.volumeInfo.description ?data.volumeInfo.description : 'No description available';
  this.bookshelf = data.volumeInfo.industryIdentifiers ? `${data.volumeInfo.industryIdentifiers[0].identifier}` : '';
}

Book.prototype = {
  save:function() {
    const SQL = 'INSERT INTO books (title,author,isbn,image_url,description,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
    const values = [this.title, this.author, this.isbn, this.image_url, this.description, this.bookshelf];

    return client.query(SQL, values)
  }
}

function getBooks(reqeust, response){
  const SQL = `SELECT * FROM books`;
  return client.query(SQL)
    .then(result => {
      response.render('pages/index',{path:'./books/show',searchesResults:result.rows});
    })
}

function getOneBook(request,response){
  let SQL = `SELECT * FROM books WHERE id=$1;`;
  let values = [request.params.book_id];
  return client.query(SQL, values)
    .then(result => {
      return response.render('pages/index', {path:'./books/detail',item: result.rows[0]})
    })
    .catch(err => handleError(err, response))
}

app.listen(PORT,() => console.log(`Listening on ${PORT}`));
