const rao = require(`./database/redis_access_object`);
const Task = require(`./database/models/task`);
const logger = require(`./logger`);
const bluebird = require(`bluebird`);
var Promise = require(`bluebird`);
const syncDelay = bluebird.promisify(setTimeout);

// Code for Worker Containers

function wait(s) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Sample Function to Simulate long running task
            resolve(s * 1000)
        }, s * 1000 )
    })
}

// The task attribute of model is used to select handler, this ideally should be done using typescript
const FunctionMapper = {
    "task1": function(data){

        // If chosen to one could fire data to webhook here as they wish
        return wait(data.n);
    }
};


async function processTask(tasks, id) {
    const task = tasks[0];
    const taskPromise = FunctionMapper[task.getDataValue("task")](task.getDataValue("data"));
    var waitTime = 2, isDeleted = false;
    while (taskPromise.isPending() === true) {

        var didWait = wait(waitTime);
        await didWait;
        waitTime <<= 1;
        waitTime = (waitTime >= 1024) ? 2 : waitTime;


        await rao.getAsync(`DeleteAtlanQ${id}`).then(isMarked => {
            if (isMarked !== null) {
                rao.delAsync(`DeleteAtlanQ${id}`).then(logger.info).catch(logger.error);
                isDeleted = true;
                taskPromise.cancel();
                Task.update({
                    status: `aborted`
                }, {
                    where: {
                        id: id
                    }
                }).then(res => {
                    logger.info(`Task Aborted`);
                }).error(err => {
                    logger.error(`Couldn't Update Database for Aborted task ${err}`);
                });
            }
            return true;
        }).catch(logger.error);
    }

    if (isDeleted === false)
        Task.update({
            status: `successful`
        }, {
            where: {
                id: id
            }
        }).then(res => {
            logger.info(`Task Done`);
        }).error(err => {
            logger.error(`Couldn't Update Database for Successful task ${err}`);
        });
}

async function main(){
    while(true) {
        try {
            await wait(Math.floor(Math.random() * 10));
            const id = await rao.rpopAsync("AtlanQ");
            if(id === null){
                logger.info(`Queue Empty`);
                continue;
            }
            logger.info(`Id Popped from the Queue ${id}`);
            Task.update({
                status: "running"
            }, {
                where: {
                    id: id
                }
            }).then(res=>{
                logger.info(`Task Schedulation Notified`);
            }).catch(logger.error);
            await Task.findAll({
                where:{
                    id: id
                }
            }).then(tasks => {
                return processTask(tasks, id);
            }).catch(err => {
                logger.error(`An error occurred while fetching task from db, re-queuing ${err}`);

                Task.update({
                    status: `terminated`
                }, {
                    where:{
                        id: id
                    }
                }).then(res=> {
                    logger.info(`Task Terminated`);
                }).error(err => {
                    logger.error(`Couldn't Update Database for terminated task ${err}`);
                });
            });
        } catch (err) {
            logger.info(`an error occurred while fetching task ${err}`);
            continue;
        }
    }
};

main();