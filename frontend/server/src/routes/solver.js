import express from 'express';
import {spawn} from 'child_process';
import kue from 'kue';


let router = express.Router();
const queue = kue.createQueue({});
queue.watchStuckJobs(1000 * 10);

queue.on('ready', () => {
  console.info('Queue is ready!');
});

queue.on('error', (err) => {
  console.error('There was an error in the main queue!');
  console.error(err);
  console.error(err.stack);
});

queue.process('tsp_instance', 1, function(job, done){
  let geneial_process = spawn(__dirname + '/../../../../backend/build/geneial_tsp_solver');

  //Read Stdout line by line, each line contains some progress json.
  let backlog = ''
  geneial_process.stdout.on('data', function(data) {
      backlog += data
      let n = backlog.indexOf('\n')
      // got a \n? emit one or more 'line' events
      while (~n) {
        geneial_process.stdout.emit('line', backlog.substring(0, n))
        backlog = backlog.substring(n + 1)
        n = backlog.indexOf('\n')
      }
  }.bind(this));

  geneial_process.on('close', function(code) {
      if (backlog) {
        geneial_process.stdout.emit('line', backlog)
      }
      console.log(`${job.id} process exit code ${code}`);
      done();
  });

  geneial_process.stderr.on('data', (data) => {
    console.error(`${job.id} stderr: ${data}`);
  });

  console.log(JSON.stringify(job.data))

  geneial_process.stdin.write(JSON.stringify(job.data));
  geneial_process.stdin.write("\n");

  geneial_process.stdout.on('line',function(line)
  {
    //Omit parsing json here for performance.
    job.progress(0, undefined, line);
  });
});


router.post('/start', (req, res) => {
    var job = queue.create('tsp_instance', req.body)
      .priority('high')
      .attempts(3)
      .backoff(true)
      .save((err) => {
        if (!err) {
            res.json({job_id: job.id});
        } else {
            res.status(500);
        }
    });
});

router.get('/status/:jobId', (req, res) => {

    let id = req.params.jobId;
    kue.Job.get(id,
    ( err, job ) => {
      if( err )
      {
        return res.status(404).json({status: "NOT FOUND"});
      }else{
        if(!job.progress_data)
        {
          return res.json({status:"INPROGRESS"});
        }
        else
        {
          return res.json(JSON.parse(job.progress_data));
        }
        return res.json(job);
      }
    });
});

router.post('/cleanup/:jobId', (req, res) => {
  let id = req.params.jobId;

  kue.Job.get(id, (err, job) => {
    if (err) return;
    job.remove((err) => {
      if (err){
        res.status(500);
      }else{
        res.status(200);
      }
    });
  });
});

export default router;
