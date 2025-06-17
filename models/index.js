git const mongoose = require('mongoose');

const dbConfig = require('../config/db.js');
const recipe = require("./recipe.js");
const cookbook = require("./cookbook.js");
const review = require("./review.js");
const user = require("./user.js");




mongoose.Promise = global.Promise;

const db = {
    mongoose : mongoose,
    url :  dbConfig.url,
    Recipe: recipe(mongoose),
    Cookbook: cookbook(mongoose),
    Review: review(mongoose),
    User: user(mongoose)

};


module.exports = db;
