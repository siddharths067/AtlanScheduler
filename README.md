# A Scheduler for Distributed Jobs with Abortion Support 
```docker compose build && docker-compose up``` to execute it

NOTE: in some cases db might start late than web, just restart the compose and it'll resolve,
I didn't add a waitforit.sh file

# Data Modelling
The Task Datatype is as follows
```$xslt
id: id of the task
uid: id of the user
status: status of the task queued/running/aborted/termination/succesful
task: identifier of the task to be used by worker object to identify handler
data: optional JSON data to pass to handler in worker
hook: webhook to trigger optionally in handler in worker
```

Each task name has a corresponding handler in worker identified by ```FunctionMapper Object```

# Overview of the System Design
![System Design](SystemDesign.png)

* The user submit a task using the POST request
* A task entry is created and the id is enqueued in the Global Shared Queue
* The Workers check the queue using a random scheme on a 10 second window
* Worker retrieves an id from Queue and updates the database entry to ```running```
* The workers invoke corresponding handler with data attribute passed to the them
* The handler processes the data
* While handler processes the data an exponentially increasing window strategy is used
to check if user has aborted the task by checking a flag in the key value store
* If the user has aborted, the worker terminates the handler thread and updates DB entry
* Else task is successfully completed and DB is updated

# Scaling
* The System is expected to scale horizontally by increasing the worker containers. For the purpose
of easy evaluation I have just added the worker project in the same repo, however it is trivial
to see that it could be used in a separate docker image to extend the system horizontally

# POSTMAN collection for testing
Here is the button for postman collection for testing. 

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/8c4704b570e6d850a929)

