import express from 'express';
import {spawn} from 'child_process';
import uuid from 'uuid';

let router = express.Router();

//Ephemeral Storage for jobs
let jobs = {}
let results = {}

router.post('/start', (req, res) => {
    //TODO get input
    console.log(req.body);

    //TODO Validate input

    let new_job_id = uuid.v4();
    console.log("New Job Id:"+new_job_id);
    jobs[new_job_id] = spawn(__dirname + '/../../../../backend/build/geneial_tsp_solver');
    jobs[new_job_id].on('close', function(code) {
        console.log('process exit code ' + code);
        delete jobs[new_job_id];
    });
    jobs[new_job_id].stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    results[new_job_id] = []
    console.log(JSON.stringify(req.body))
    jobs[new_job_id].stdin.write(JSON.stringify(req.body));
    jobs[new_job_id].stdin.write("\n");
    jobs[new_job_id].stdout.on('data', function(data) {
        let str = data.toString()
        console.log(data)
        let lines = str.split(/(\r?\n)/g);
        let objects = lines.map(line => {JSON.parse(line)});
        results[new_job_id] = results[new_job_id].concat(objects);

    }.bind(this));
    res.json({job_id: new_job_id});});

router.get('/status/:jobId', (req, res) => {
    if (jobs[req.params.jobId]) {
        if (results[new_job_id].length > 0) {
            res.json(results[new_job_id][results[new_job_id].length - 1]);
        } else {
            res.json({status: "INPROGRESS"});
        }
    } else {
        res.status(404).json({status: "NOT FOUND"});
    }
});

router.get('/cleanup/:jobId', (req, res) => {
    if (jobs[req.params.jobId]) {
        delete jobs[new_job_id];
        res.json({status: "OK"});
    } else {
        res.status(404).json({"status": "NOT FOUND"});
    }
});

export default router;
