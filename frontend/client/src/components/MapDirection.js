import {Component} from 'react';

// Helper delay function to wait a specific amount of time.
function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
}

// A function to just keep retrying forever.
function runFunctionWithRetries(func, initialTimeout, increment) {
    return func().catch(function(err) {
        return delay(initialTimeout).then(function() {
            return runFunctionWithRetries(func, initialTimeout + increment, increment);
        });
    });
}

// Helper to retry a function, with incrementing and a max timeout.
function runFunctionWithRetriesAndMaxTimeout(func, initialTimeout, increment, maxTimeout) {

    var overallTimeout = delay(maxTimeout).then(function() {
        // Reset the function so that it will succeed and no
        // longer keep retrying.
        func = function() {
            return Promise.resolve()
        };
        throw new Error('Function hit the maximum timeout');
    });

    // Keep trying to execute 'func' forever.
    var operation = runFunctionWithRetries(function() {
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
        this.fallBackPolyLines = [];
    }

    requestDirections(from, to, renderIdx)
    {
        let copyPolyLines = this.fallBackPolyLines;
        this.fallBackPolyLines = [];
        for (let polyline of copyPolyLines) {
            polyline.setMap(null)
        }
        return new Promise((resolve, reject) => {
            const {google, map} = this.props;
            if (!google || !map) {
                return;
            }
            if (!this.directionsDisplay[renderIdx]) {
                this.directionsDisplay[renderIdx] = new google.maps.DirectionsRenderer({suppressMarkers: true, preserveViewport: true});
                this.directionsDisplay[renderIdx].setMap(this.props.map);
            } else {
                this.directionsDisplay[renderIdx].set('directions', null);
            }
            let start = {
                'placeId': from.place_id
            }
            let end = {
                'placeId': to.place_id
            }
            let request = {
                origin: start,
                destination: end,
                travelMode: 'DRIVING', //TODO
                provideRouteAlternatives: false
            };
            this.directionsService.route(request, function(result, status) {
                if (status === 'OK') {
                    this.directionsDisplay[renderIdx].setDirections(result);
                    resolve(status, result);
                } else if (status === "ZERO_RESULTS") {
                    resolve(status, result);
                } else {
                    reject(status, result);
                }
            }.bind(this));
        });
    }

    getDirections()
    {
        //TODO: Race Condition if calculate Route is called fast.
        const {google, map, route} = this.props;
        if (!google || !map) {
            return;
        }
        if (!this.directionsService) {
            this.directionsService = new google.maps.DirectionsService();
        }

        if (!route) {
            let copyPolyLines = this.fallBackPolyLines;
            this.fallBackPolyLines = [];

            for (let display of this.directionsDisplay)
            {
                if(this.directionsDisplay[display])
                {
                    this.directionsDisplay[display].set('directions', null);
                }

            }

            for (let polyline of copyPolyLines)
            {
                polyline.setMap(null)
            }

        } else {
            for (let i = 0; i < route.length; i++) {
                let start,
                    end;
                if (i !== route.length - 1) {
                    start = i;
                    end = i + 1;
                } else {
                    start = i;
                    end = 0;
                }
                runFunctionWithRetriesAndMaxTimeout(function(){
                    return this.requestDirections(route[start], route[end], i)
                }.bind(this), 500, 200, 25000).then(
                    (status, result) => {
                    if (status === "ZERO_RESULTS") {
                        let routePath = [
                            {
                                lat: route[start].geometry.location.lat(),
                                lng: route[start].geometry.location.lng()
                            }, {
                                lat: route[end].geometry.location.lat(),
                                lng: route[end].geometry.location.lng()
                            }
                        ];
                        let routePoly = new google.maps.Polyline({
                            path: routePath,
                            strokeColor: '#FF0000',
                            strokeOpacity: 1.0,
                            strokeWeight: 2
                        });
                        routePoly.setMap(map);
                        this.fallBackPolyLines.push(routePoly);
                    }
                }).catch(() => {
                    console.log("ERROR!!!")
                })
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
