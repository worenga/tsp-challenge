import express from 'express';
import {spawn} from 'child_process';

let router = express.Router();
let jobs{}


router.post('/start',(req,res)=>{

var prc = spawn('fortune');

prc.stdout.setEncoding('utf8');
prc.stdout.on('data', function (data) {
    var str = data.toString()
    var lines = str.split(/(\r?\n)/g);
    console.log(lines.join(""));
});

prc.on('close', function (code) {
    console.log('process exit code ' + code);
});


});

router.get('/peter',(req,res)=>{
  res.json("test")



});

export default router;
