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
  return axios.post('/api/solver/cleanup/'+context.jobId);
}

function recurse(context)   // asynchronous recursive function
{
    let decide = function( response )  // process async result and decide what to do
    {   // do something with asyncResult

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
          context.progressCallback(response.data.pct_done*100)
          return recurse(context);
        }
        else
        {
          return response;
        }
    }

    return queryStatus(context).then(decide);
}

export default function calculateRoundTrip(google, places, progress_callback, options)
{
    options = options || {};
    options.travelMode = options.travelMode || google.maps.TravelMode.DRIVING;


    let context = {
        jobId: undefined,
        progressCallback: progress_callback,
    }

    let fallbackDistanceMatrix = getFallBackDistanceMatrix(places);
    return getDistanceMatrix(google, places, options, fallbackDistanceMatrix)
    .then( (distanceMatrix) => {
      fixMissingValues(distanceMatrix, fallbackDistanceMatrix)
      return axios.post('/api/solver/start', {
            iterations: 3000,
            distanceMatrix: distanceMatrix
          })
    .then(function (response) {
      context.jobId = response.data.job_id;
      return recurse(context);
    })
    .then((state) => {
      if(!state.data.best_path)
      {
        throw Error("No best path found!");

      }else{

        let new_place_order = []
        state.data.best_path.forEach( idx => { new_place_order.push(places[idx])});
        return new_place_order;
      }
    })
    .catch((error) => {
      console.error(error)
    })
    .finally( () => {
      cleanup(context);
    });

        }
    )
}
