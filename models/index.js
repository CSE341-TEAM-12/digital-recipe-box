const mongoose = require('mongoose');

const dbConfig = require('../config/db.js');
const recipe = require("./recipe.js");
const cookbook = require("./cookbook.js");
const review = require("./review.js");
const user = require("./user.js");

mongoose.Promise = global.Promise;

const db = {
    mongoose : mongoose,
    url :  dbConfig.url,
    recipes: recipe(mongoose),
    cookbooks: cookbook(mongoose),
    reviews: review(mongoose),
    users: user(mongoose)
};

module.exports = db;
