const STATUS_PENDING='STATUS_PENDING'
const STATUS_FINISHED='STATUS_FINISHED'

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

export default function calculateRoundTrip(google, places, progresscb=(progress)=>{})
{

    let context = {
        jobid: 1337,
        promiseCount: 0,
        places: places
    }


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
