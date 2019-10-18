var express = require('express');
var router = express.Router();
const logger = require(`../logger`);
const Task = require(`../database/models/task`);
const rao = require(`../database/redis_access_object`);

/* GET home page. */
router.get('/:uid', function(req, res, next) {

    logger.info(`Fetching Tasks of User ${req.params.uid}`);
    Task.findAll({
        where:{
            uid: req.params.uid
        }
    }).then(result => {
        const resultObj = result.map(e => e.dataValues);
        res.status(200).send(resultObj);
    }).catch(err => {
        res.status(500).send(`An error occurred ${err}`);
    })
});

router.post('/', function(req, res, next) {

    logger.info(`A task request is submitted`);
    if(req.body.uid === undefined || req.body.task === undefined || req.body.data === undefined){
        res.status(400).send("Request Missing Parameters");
    }
    else {
        const {uid, task, data, hook} = req.body;
        Task.create({
            uid: uid.toString(),
            task: task,
            data: data,
            hook: hook
        }).then(result => {
            rao.lpushAsync("AtlanQ", result.getDataValue("id")).then(rres => {
                logger.info(rres);
            });
            res.status(200).send({
                id: result.getDataValue("id")
            });
        }).catch(err => {
            res.status(500).send({
                error: err.toString()
            });
        });

    }
});

router.delete('/', function(req, res, next) {
    logger.info(`Deletion request for task`);
    const {uid, id} = req.body;
    if(uid === undefined || id === undefined){
        res.status(400).send("Paramteres Missing");
    } else {
        Task.findAll({
            where:{
                uid: uid.toString(),
                id: id
            }
        }).then(rows => {

            if(rows.length > 0) {
                rao.setAsync(`DeleteAtlanQ${id}`, true).then(rres => {
                    logger.info(`Successfully set deletion flag for worker`);
                });
                res.status(200).send({
                    n: rows.length
                });
            }
            else res.status(400).send({
                err: "Task not found for this user"
            })
        }).catch(err => {
            res.status(500).send({
                err: `An error occurred ${err}`
            });
        })
    }
});
module.exports = router;
