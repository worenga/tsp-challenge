import axios from 'axios';

const STATUS_PENDING='STATUS_PENDING'
const STATUS_FINISHED='STATUS_FINISHED'

import {getDistanceMatrix} from './distanceMatrix'
import {getFallBackDistance, getFallBackDistanceMatrix} from './fallbackDistance'

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
    return new Promise((resolve,reject) =>
    {
      console.log(context.promiseCount);
      window.setTimeout( () => {
          console.log(context)
              if(context.promiseCount === 1)
              {
                  resolve({status:STATUS_FINISHED, progress: 100/5 * context.promiseCount})
              }else
              {
                  context.promiseCount++;
                  resolve({status:STATUS_PENDING, progress: 100/5 * context.promiseCount})
              }
        }, Math.random() * 1000);
    });
}

export default function calculateRoundTrip(google, places, options, progresscb=(progress)=>{})
{
    options = options || {};
    options.travelMode = options.travelMode || google.maps.TravelMode.DRIVING;


    let context = {
        jobid: 1337,
        promiseCount: 0,
        places: places
    }

    let fallbackDistanceMatrix = getFallBackDistanceMatrix(places);
    console.log(fallbackDistanceMatrix);

    getDistanceMatrix(google, places, options, fallbackDistanceMatrix).then((distanceMatrix) => {
        console.log("Distance MatrixBefore", distanceMatrix);
        fixMissingValues(distanceMatrix, fallbackDistanceMatrix)
        console.log("Distance Matrix", distanceMatrix);
           axios.post('/api/solver/start', {
            iterations: 100000,
            distanceMatrix: distanceMatrix
          })
          .then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });

        }
    )

    //TODO 1.) Construct Distance Matrix
    //TODO 2.) Validate given Distance Matrix check if there are fields that need fallback
    //TODO 3.) Create a job in the backend
    //TODO 4.) Having a job in the backend, query its status.


    let recurse = function (context)   // asynchronous recursive function
    {
        let decide = function( state )  // process async result and decide what to do
        {   // do something with asyncResult
            console.log(state)
            if( state.status === STATUS_FINISHED )
            {
                console.log("finish");
                return state;
            }
            else
            {
                progresscb(state.progress)
                console.log("recurse");
                return recurse(context);
            }
        }

        return queryStatus(context).then(decide);
    }



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
}
