import axios from 'axios';

const STATUS_PROGRESS_MADE='PROGRESS'
const STATUS_NO_RESULT_YET='INPROGRESS'
const STATUS_NOT_FOUND='NOT FOUND'
const STATUS_ERROR='ERROR'
const STATUS_FINISHED='DONE'

import {getDistanceMatrix} from './distanceMatrix'
import {getFallBackDistanceMatrix} from './fallbackDistance'

function fixMissingValues(distanceMatrix, fallbackDistanceMatrix)
{
    for(let i=0;i<distanceMatrix.length;i++)
        {
            for(let j=0;j<distanceMatrix[i].length;j++)
                {
                    if(!distanceMatrix[i][j])
                    {
                        distanceMatrix[i][j] = fallbackDistanceMatrix[i][j];
                    }
                }
        }
    return distanceMatrix
}


function queryStatus(context)
{
  return axios.get('/api/solver/status/'+context.jobId);
}

function cleanup(context)
{
  return axios.get('/api/solver/cleanup/'+context.jobId);
}

function recurse(context)   // asynchronous recursive function
{
    let decide = function( response )  // process async result and decide what to do
    {   // do something with asyncResult

        console.log(response)

        if( response.data.status === STATUS_FINISHED )
        {
            context.progressCallback(100);
            return response;
        }
        else if(response.data.status === STATUS_NO_RESULT_YET)
        {
            return recurse(context);
        }
        else if(response.data.status === STATUS_PROGRESS_MADE)
        {
          context.progressCallback(response.pct_done*100)
          return recurse(context);
        }
        else
        {
          return response;
        }
    }

    return queryStatus(context).then(decide);
}

export default function calculateRoundTrip(google, places, options, progress_callback=(progress)=>{})
{
    options = options || {};
    options.travelMode = options.travelMode || google.maps.TravelMode.DRIVING;


    let context = {
        jobId: undefined,
        progressCallback: progress_callback,
    }

    let fallbackDistanceMatrix = getFallBackDistanceMatrix(places);
    getDistanceMatrix(google, places, options, fallbackDistanceMatrix).then((distanceMatrix) => {

        fixMissingValues(distanceMatrix, fallbackDistanceMatrix)

          axios.post('/api/solver/start', {
            iterations: 2000,
            distanceMatrix: distanceMatrix
          })
          .then(function (response) {
            console.log(response);
            context.jobId = response.data.job_id;

            return recurse(context).then(
                (state) => {

                     // first make a copy of the original sort array
                     var rplaces = places.slice()

                     // then proceed to shuffle the rsort array
                     for(var idx = 0; idx < rplaces.length; idx++)
                     {
                        var swpIdx = idx + Math.floor(Math.random() * (rplaces.length - idx));
                        // now swap elements at idx and swpIdx
                        var tmp = rplaces[idx];
                        rplaces[idx] = rplaces[swpIdx];
                        rplaces[swpIdx] = tmp;
                     }
                     // here rsort[] will have been randomly shuffled (permuted)
                     return rplaces

                }
            )

          })
          .catch((error) => {
            console.log(error)
          }).finally(
            () => {
              cleanup(context);
            }
          )

        }
    )
}
