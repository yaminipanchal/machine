const express = require('express');
const router = express.Router();


const machineController = require('../controller/machine');
const machine = new machineController();


module.exports = function(app) {

    app.route("/api/list_machine").get(machine.list);
    app.route("/api/add_machine").post(machine.insert);
    app.route("/api/update_machine/:id").put(machine.update);
    app.route('/api/delete_machine/:id').delete(machine.delete);
    app.route("/api/best_machine").get(machine.best);
    app.get('/machineList', function(req, res) {
        res.render('machine')
    })
    app.get('/addMachine', function(req, res) {
        res.render('machineForm')
    })
}