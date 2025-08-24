const express = require('express')
const {open} = require('sqlite')
const path = require('path')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'goodreads.db')
let db = null

// Function to initialize database connection and start the server
const initializeDBAndServer = async () => {
  // 1. Open a connection to the SQLite database
  // - filename: path to the database file (goodreads.db)
  // - driver: tells SQLite to use the sqlite3 engine
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    // 2. If database connection is successful, start the Express server
    // - listen() binds the app to port 3000
    // - the callback runs once the server starts successfully
    app.listen(3000, () => {
      console.log('Server is runing at http://localhost:3000')
    })
  } catch (e) {
    // 3. If something goes wrong (DB connection or server start),
    //    log the error message
    console.log(`db error ${e.message}`)
    // 4. Exit the Node.js process with status code 1 (means failure)
    process.exit(1)
  }
}

initializeDBAndServer()

app.get('/', (request, respond) => {
  respond.send('Hello! Your server is running 🚀')
})

app.get('/books/', async (request, respond) => {
  const getBooksQuery = `SELECT * FROM book ORDER BY book_id`
  const booksArray = await db.all(getBooksQuery)
  respond.send(booksArray)
})

//Get Book API
app.get('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const getBooksQuery = `SELECT * FROM book WHERE book_id = ${bookId};`
  const book = await db.get(getBooksQuery)
  response.send(book)
})

//add Book API
app.post('/books/', async (request, response) => {
  const bookDetails = request.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`

  const dbResponse = await db.run(addBookQuery)
  const bookId = dbResponse.lastID
  response.send({bookId: bookId})
})

//put book
app.put('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const bookDetails = request.body
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price=${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`
  await db.run(updateBookQuery)
  response.send('Book Updated Successfully')
})

//delete book
app.delete('/books/:bookId/', async (request, response) => {
  const {bookId} = request.params
  const deleteBookQuery = `
    DELETE FROM
      book
    WHERE
      book_id = ${bookId};`
  await db.run(deleteBookQuery)
  response.send('Book Deleted Successfully')
})

app.get('/authors/:authorId/books/', async (request, response) => {
  const {authorId} = request.params
  const getAuthorBooksQuery = `
    SELECT
     *
    FROM
     book
    WHERE
      author_id = ${authorId};`
  const booksArray = await db.all(getAuthorBooksQuery)
  response.send(booksArray)
})
