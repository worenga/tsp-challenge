import React, {Component} from 'react';
import {GoogleApiWrapper} from 'google-maps-react'
import {GOOGLE_MAPS_API_KEY as google_api_key} from '../constants/config.js'

import calculateRoundTrip from '../processing/calculateRoundTrip'
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
            mapCenter: undefined,
            isProcessing: false,
            percentageCompleted: 0,
            route: undefined
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

            if (this.state.places.length === 10) {
                return;
            }

            this.state.places.push(place);
            this.setState({places: this.state.places});
        }
    }

    removePlace(placeToRemove)
    {
        this.setState({
            places: this.state.places.filter((place) => {
                return place.place_id !== placeToRemove.place_id;
            })
        });
        this.setState({route:undefined});
    }

    focusPlace(placeToFocus)
    {
        console.log(placeToFocus);
        this.setState({mapCenter: placeToFocus.geometry.location});
    }

    _progressCallback(percentageCompleted)
    {
        console.log("CALLBACK", percentageCompleted)
        this.setState({percentageCompleted: percentageCompleted});
    }

    canCalculate()
    {
        return this.state.places.length > 2 && !this.state.isProcessing
    }

    calculateRoundTrip()
    {
        if (this.canCalculate()) {
            this.setState({isProcessing: true, percentageCompleted: 0});

            return new Promise((resolve, reject) => {
                let new_places = calculateRoundTrip(this.props.google, this.state.places, this._progressCallback.bind(this));
                resolve(new_places);
            }).then((new_places) => {
                this.setState({isProcessing: false, route: new_places});
            }).catch((e) => {
                this.setState({isProcessing: false});
                throw e
            });
        }
    }

    clearRoute()
    {
        this.setState({route:undefined});
    }

    renderProgress()
    {
        return (
            <div className="progress">
                <div className="progress-bar" role="progressbar" aria-valuenow={this.state.percentageCompleted} aria-valuemin="0" aria-valuemax="100" style={{
                    width: this.state.percentageCompleted + '%'
                }}>
                    <span className="sr-only">{this.state.percentageCompleted}% complete</span>
                </div>
            </div>
        );
    }

    render()
    {
        if (!this.props.loaded) {
            return <div>
                Loading...
            </div>
        }

        return (
            <div className="container-fluid">
                <div className="page-header">
                    <h1>The Traveling Salesman&#039;s Planner</h1>
                </div>
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-8">
                        <TspMapWrapper places={this.state.places} center={this.state.mapCenter} onAddPlace={this.addPlace.bind(this)} google={this.props.google} route={this.state.route}/>
                    </div>
                    <div className="col-xs-6 col-md-4">
                        <TspSearchForm google={this.props.google} onAddPlace={this.addPlace.bind(this)}/>
                        <TspTargetList places={this.state.places} onRemovePlace={this.removePlace.bind(this)} onFocusPlace={this.focusPlace.bind(this)}/>
                        <form>
                            {this.state.isProcessing
                                ? this.renderProgress()
                                : null}

                            <div className="btn-group" role="group">
                                <button disabled={this.state.route === undefined} type="button" className="btn btn-danger btn-lg" onClick={this.clearRoute.bind(this)}>
                                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                    Clear Route
                                </button>
                                <button disabled={!this.canCalculate()} type="button" className="btn btn-primary btn-lg" onClick={this.calculateRoundTrip.bind(this)}>
                                    <span className="glyphicon glyphicon-play-circle" aria-hidden="true"></span>
                                    Calculate Round Trip
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
}

// TODO: get this from a config.

export default GoogleApiWrapper({apiKey: google_api_key, libraries: ['places']})(AppWrapper)
