import React, {Component} from 'react';
import {GoogleApiWrapper} from 'google-maps-react'
import {GOOGLE_MAPS_API_KEY as google_api_key} from '../constants/config.js'

import TspTargetList from './TspTargetList'
import TspSearchForm from './TspSearchForm'
import TspMapWrapper from './TspMapWrapper'

const initialPlaces = []

class AppWrapper extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            places: initialPlaces,
            mapCenter: undefined
        };
    }

    addPlace(place)
    {
        if (place.geometry && place.geometry.location) {
            const placeId = place.place_id;

            let alreadyContained = this.state.places.filter((place) => {
                return place.place_id === placeId;
            });

            if (alreadyContained.length > 0) {
                return;
            }

            if(this.state.places.length === 10)
            {
                return;
            }

            this.state.places.push(place);
            this.setState({places: this.state.places});
        }
    }

    removePlace(placeToRemove)
    {
        this.setState({places: this.state.places.filter((place) => {
                return place.place_id !== placeToRemove.place_id;
            })
        });
    }

    focusPlace(placeToFocus)
    {
        console.log(placeToFocus);
        this.setState({mapCenter: placeToFocus.geometry.location});
    }

    render()
    {
        if (!this.props.loaded) {
            return <div> Loading... </div>
        }

        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1>The Traveling Salesman&#039;s Planner</h1>
                </div>
                <div className="row">
                    <div className="col-xs-6 col-md-4">
                        <TspSearchForm google={this.props.google} onAddPlace={this.addPlace.bind(this)} />
                        <TspTargetList places={this.state.places} onRemovePlace={this.removePlace.bind(this)} onFocusPlace={this.focusPlace.bind(this)}/>
                    </div>
                    <div className="col-xs-12 col-sm-6 col-md-8">
                        <TspMapWrapper places={this.state.places} center={this.state.mapCenter} onAddPlace={this.addPlace.bind(this)} google={this.props.google} />
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
}

// TODO: get this from a config.

export default GoogleApiWrapper({apiKey: google_api_key, libraries: ['places']})(AppWrapper)
