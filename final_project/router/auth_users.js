
const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(
        user => user.username === username && user.password === password
    );
};

regd_users.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password || !authenticatedUser(username, password)) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign(
        { username },
        'access',
        { expiresIn: '1h' }
    );

    return res.status(200).json({
        message: 'Login successful',
        token
    });
});

regd_users.put('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;
    const { review } = req.body;

    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (typeof review !== 'string' || !review.trim()) {
        return res.status(400).json({ message: 'Review is required' });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: 'Review added/updated successfully',
        reviews: books[isbn].reviews
    });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: 'Review not found' });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: `Review for ISBN ${isbn} deleted`
    });
});

module.exports.authenticated = regd_users;
module.exports.authenticatedUser = authenticatedUser;
module.exports.isValid = isValid;
module.exports.users = users;
