const Categories = require('../model/category');



class CategoryController {

    list(req, res) {
        try {
            Categories.aggregate([{ $project: { id: 1, name: 1, createdAt: 1 } }, { $sort: { "createdAt": -1 } }]).exec((err, result) => {
                if (!err) {
                    return res.status(200).send({ "message": "Success", data: result })
                } else {
                    return res.status(500).send({ "message": err.errmsg, data: [] })
                }
            })
        } catch (err) {
            return res.status(500).send({ "message": err.errmsg, data: [] })

        }

    }

    insert(req, res) {
        try {
            var cat = new Categories();
            cat.name = req.body.name;

            cat.save((err, result) => {
                if (!err) {
                    return res.status(200).send({ "message": "Success", data: result })
                } else {
                	
                    return res.status(500).send({ "message": err.errmsg, data: [] })
                }
            })
        } catch (error) {
            return res.status(500).send({ "message": error.errmsg, data: [] })

        }

    }

    update(req, res) {
        
        try {
            Categories.findOneAndUpdate({ "_id": req.params.id }, { $set: req.body }, { new: true }, (err, result) => {
                console.log(err, result)
                if (result) {
                    return res.status(200).send({ "message": 'update successfully', data: result });

                } else {
                    return res.status(404).send({ "message": 'Data not found/already existed', data: [] });

                }
            })

        } catch (error) {

            return res.status(500).send({ "message": error.errmsg, data: [] });

        }

    }

    delete(req, res) {
       
        Categories.findOne({ "_id": req.params.id }, (err, result) => {

            if (result) {
                try {
                    result.remove(function(error, success) {
                        
                        return res.status(200).send({ "message": 'Delete successfully', data: [] });
                    })
                } catch (err) {
                    return res.status(500).send({ "message": err.errmsg, data: [] });

                }
            } else {
                return res.status(404).send({ "message": 'Data not found', data: [] });

            }
        }).catch(function(error) {
            if (error) {
                return res.status(500).send({ "message": err.errmsg, data: [] });

            }

        })
    }

}
module.exports = CategoryController;