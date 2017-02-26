import {Component} from 'react';

// Helper delay function to wait a specific amount of time.
function delay(time){
    return new Promise(function(resolve){
        setTimeout(resolve, time);
    });
}

// A function to just keep retrying forever.
function runFunctionWithRetries(func, initialTimeout, increment){
    return func().catch(function(err){
        return delay(initialTimeout).then(function(){
            return runFunctionWithRetries(
                    func, initialTimeout + increment, increment);
        });
    });
}

// Helper to retry a function, with incrementing and a max timeout.
function runFunctionWithRetriesAndMaxTimeout(
        func, initialTimeout, increment, maxTimeout){

    var overallTimeout = delay(maxTimeout).then(function(){
        // Reset the function so that it will succeed and no
        // longer keep retrying.
        func = function(){ return Promise.resolve() };
        throw new Error('Function hit the maximum timeout');
    });

    // Keep trying to execute 'func' forever.
    var operation = runFunctionWithRetries(function(){
        return func();
    }, initialTimeout, increment);

    // Wait for either the retries to succeed, or the timeout to be hit.
    return Promise.race([operation, overallTimeout]);
}

export class MapDirection extends Component {

      constructor(props)
      {
          super(props);
          this.directionsService = undefined;
          this.directionsDisplay = [];
      }

  requestDirections(from,to,renderIdx)
  {
    return new Promise((resolve, reject) =>
    {
      const {google,map,} = this.props;
      if(!google || !map)
      {
        return;
      }
      if(!this.directionsDisplay[renderIdx])
      {
        this.directionsDisplay[renderIdx] = new google.maps.DirectionsRenderer(
          {
            suppressMarkers: true,
           preserveViewport: true
          }
        );
        this.directionsDisplay[renderIdx].setMap(this.props.map);
      }else{
        this.directionsDisplay[renderIdx].set('directions', null);
      }
      let start = {'placeId': from.place_id }
      let end = {'placeId': to.place_id }
      let request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING', //TODO
        provideRouteAlternatives: false
      };
      this.directionsService.route(request, function(result, status) {
        if (status === 'OK') {
          this.directionsDisplay[renderIdx].setDirections(result);
          resolve(result)
        }else{
          reject(status,result)
        }
      }.bind(this));
      }
    );
  }


  getDirections()
  {
      const {google,map,route} = this.props;
      if(!google || !map)
      {
        return;
      }
      if(!this.directionsService)
      {
        this.directionsService = new google.maps.DirectionsService();
      }

      if(!route)
      {
        for (let display in this.directionsDisplay)
        {
          this.directionsDisplay[display].set('directions', null);
        }
      }
      else
      {
        for(let i=0;i<route.length;i++)
        {
          if (i!=route.length -1)
          {
            runFunctionWithRetriesAndMaxTimeout(
              function(){
                return this.requestDirections(route[i],route[i+1],i)
              }.bind(this), 500, 200, 25000);

          }
          else
          {
            runFunctionWithRetriesAndMaxTimeout(
              function(){
                  return this.requestDirections(route[i],route[0],i);
              }.bind(this), 500, 200, 25000);
          }
          console.log(i)
        }
      }
  }

  render()
  {
    this.getDirections();
    return null;
  }

}


export default MapDirection;
