
const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  return res.status(200).json({ message: 'User registered successfully' });
});

public_users.get('/', async (req, res) => {
  try {
    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books' });
  }
});

public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const book = response.data[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving book' });
  }
});

public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const author = decodeURIComponent(req.params.author).toLowerCase();

    const result = Object.fromEntries(
      Object.entries(response.data).filter(
        ([, book]) => book.author.toLowerCase() === author
      )
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books by author' });
  }
});

public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    const title = decodeURIComponent(req.params.title).toLowerCase();

    const result = Object.fromEntries(
      Object.entries(response.data).filter(
        ([, book]) => book.title.toLowerCase() === title
      )
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving books by title' });
  }
});

public_users.get('/review/:isbn', async (req, res) => {
  try {
    const book = books[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book.reviews || {});
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

module.exports.general = public_users;
