var ObjectId = require('mongodb').ObjectID;
var async = require('async');
const Machine = require('../model/machine');


class MachineController {
    // constructor(con) {
    //     this.config = con;
    // }

    list(req, res) {
        try {
            Machine.aggregate([{
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryData"
                }
            }, { $unwind: "$categoryData" }, {
                $project: {
                    "name": 1,
                    "categoryData.name": 1,
                    "category": 1,
                    "qty": 1,
                    "capacity_per_hr": 1,
                    "cost_per_hr": 1,
                    "createdAt": 1
                }
            }, { $sort: { "createdAt": -1 } }]).exec((err, result) => {

                if (!err) {
                    return res.status(200).send({ "message": "Success", data: result })
                } else {
                    return res.status(500).send({ "message": err.message, data: [] })
                }
            })
        } catch (err) {
            return res.status(500).send({ "message": err.message, data: [] })

        }

    }

    insert(req, res) {
        try {
            var machine = new Machine();
            machine.name = req.body.name;
            machine.qty = req.body.qty;
            machine.category = req.body.category;
            machine.cost_per_hr = req.body.cost_per_hr;
            machine.capacity_per_hr = req.body.capacity_per_hr;
            machine.save((err, result) => {
                if (!err) {
                    return res.status(200).send({ "message": "Success", data: result })
                } else {
                    return res.status(500).send({ "message": err.message, data: [] })
                }
            })
        } catch (err) {
            return res.status(500).send({ "message": err.message, data: [] })

        }

    }

    update(req, res) {
        try {
            Machine.findOneAndUpdate({ "_id": req.params.id }, { $set: req.body }, { new: true }, (err, result) => {
                if (result) {
                    return res.status(200).send({ "message": 'update successfully', data: result });

                } else {
                    return res.status(404).send({ "message": 'Data not found', data: [] });

                }
            })

        } catch (error) {

            return res.status(500).send({ "message": err.message, data: [] });

        }

    }

    delete(req, res) {
        Machine.findOne({ "_id": req.params.id }, (err, result) => {

            if (result) {
                try {
                    result.remove(function(error, success) {
                        // console.log(error, success)
                        return res.status(200).send({ "message": 'Delete successfully', data: [] });
                    })
                } catch (err) {
                    return res.status(500).send({ "message": err.message, data: [] });

                }
            } else {
                return res.status(404).send({ "message": 'Data not found', data: [] });

            }
        }).catch(function(error) {
            if (error) {
                return res.status(500).send({ "message": err.message, data: [] });

            }

        })
    }
    // find one of best machine which complete 10000 unit in lowesttime and lowestcost.
    //  it should be possible lowesttime has more cost and lowestcost has more time so finalize bad on total cost as per hr and cost.
    async best(req, res) {
        var ProductionUnit = 10000;

        try {


            var lowestTimePerCost = findLowestTime(req.query.category, req.query.from, req.query.to, ProductionUnit)
            var lowestCost = findLowestCost(req.query.category, req.query.from, req.query.to, ProductionUnit)

            var f1 = await lowestTimePerCost
            var f2 = await lowestCost;

            if (f1.amount <= f2.amount) {
                return res.status(200).send(f1)
            } else {
                return res.status(200).send(f2)

            }

        } catch (error) {
            return res.status(500).send({ "message": err.message, data: [] })
        }
    }


}

// find lowesttime from max capacity after that count required hr for production unit to complete and find total cost based as per taht hour

findLowestTime = (categoryId, from, to, ProductionUnit) => {

    var match = { category: ObjectId(categoryId), "capacity_per_hr": { $gte: Number(from) }, "capacity_per_hr": { $lte: Number(to) } };
    var group = { "_id": "$name", maxCap: { $max: { $multiply: ["$qty", "$capacity_per_hr"] } }, "whole_Data": { $push: "$$ROOT" } };
    var sort = { "maxCap": -1 }

    return new Promise(function(resolve, reject) {
        // Do async job
        try {
            Machine.aggregate([{ $match: match }, { $group: group }, { $sort: sort }, { $limit: 1 }]).exec((error, result) => {

                if (result && result[0]) {
                    var maxCapPer_hr = result[0].maxCap;
                    var hr = Number(ProductionUnit / maxCapPer_hr);

                    var totalAmount = hr * Number(result[0].whole_Data[0].cost_per_hr);
                    resolve({ "amount": totalAmount, "name": result[0]._id })

                }
            })

        } catch (error) {
            reject(error)
        }
    })

}
// find minimum cost from all machine then based on that machine get unit per hr with qty of machine and count hr and total amount 
findLowestCost = (categoryId, from, to, ProductionUnit) => {

    var match = { category: ObjectId(categoryId), "capacity_per_hr": { $gte: Number(from) }, "capacity_per_hr": { $lte: Number(to) } };
    var group = { "_id": "$name", minCost: { $min: "$cost_per_hr" }, "whole_Data": { $push: "$$ROOT" } };
    var sort = { "minCost": -1 }


    return new Promise(function(resolve, reject) {
        // Do async job
        try {
            Machine.aggregate([{ $match: match }, { $group: group }, { $sort: sort }, { $limit: 1 }]).exec((error, result) => {

                if (result && result[0]) {
                    var minCostPer_hr = Number(result[0].minCost);
                    var data = result[0].whole_Data[0];

                    var unit = (data.qty * data.capacity_per_hr);

                    var hr = Number(ProductionUnit / unit);


                    var totalAmount = hr * minCostPer_hr;

                    resolve({ "amount": totalAmount, "name": result[0]._id })

                }
            })

        } catch (error) {
            reject(error)
        }
    })



}
module.exports = MachineController;