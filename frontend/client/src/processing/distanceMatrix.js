export function getDistanceMatrix(google, places, options) {

    const defaultTransitOptions = {
      //modes: [transitMode1, transitMode2]
      routingPreference: google.maps.TransitRoutePreference.FEWER_TRANSFERS
    };

    const defaultDrivingOptions = {
           departureTime: new Date(Date.now()),  // for the time N milliseconds from now.
           trafficModel: google.maps.TrafficModel.OPTIMISTIC
    };

    options = options || {}
    options.travelMode = options.travelMode || google.maps.TravelMode.DRIVING;
    options.transitOptions = options.transitOptions || defaultTransitOptions;
    options.drivingOptions = options.drivingOptions || defaultDrivingOptions;
    options.avoidHighways =  options.avoidHighways || false;
    options.avoidTolls =  options.avoidTolls || false;

    //Transform places to required format:
    let transformedPlaces = places.map((place) => {
        return {'placeId': place.place_id}
    });
    let distanceMatrixService = new google.maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
        distanceMatrixService.getDistanceMatrix({
            origins: transformedPlaces,
            destinations: transformedPlaces,
            travelMode: options.travelMode, //TODO
            transitOptions: options.transitOptions,
            drivingOptions: options.drivingOptions,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        }, (response, status) => {
            if (status === google.maps.DistanceMatrixStatus.OK) {
                resolve(response)
            } else {
                reject(status)
            }
        };}).then((resonse) => {

        let origins = response.originAddresses;
        let destinations = response.destinationAddresses;

        //TOOD Create Multidimensional Array

        for (let i = 0; i < origins.length; i++) {
            let results = response.rows[i].elements;
            for (let j = 0; j < results.length; j++) {
                let element = results[j];
                let status = element.status;
                let from = origins[i];
                let to = destinations[j];
                if(status !== google.maps.DistanceMatrixElement.OK)
                {
                    console.log("Error Route from ", from, "to", to, "cannot be computed!")
                }
                let distance = element.distance.text;
                let duration = element.duration.text;


            }
        }
    });
}
