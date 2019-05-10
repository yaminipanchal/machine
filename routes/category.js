const express = require('express');
const router = express.Router();


const categoryController = require('../controller/category');
const category = new categoryController();


module.exports = function(app) {

    app.route("/api/list_category").get(category.list);
    app.route("/api/add_category").post(category.insert);
    app.route("/api/update_category/:id").put(category.update);
    app.route('/api/delete_category/:id').delete(category.delete);
}