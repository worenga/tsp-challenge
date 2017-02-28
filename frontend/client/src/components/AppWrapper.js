import React, {Component} from 'react';
import {GoogleApiWrapper} from 'google-maps-react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import {GOOGLE_MAPS_API_KEY as google_api_key} from '../constants/config.js'


import calculateRoundTrip from '../processing/calculateRoundTrip'
import TspTargetList from './TspTargetList'
import TspSearchForm from './TspSearchForm'
import TspMapWrapper from './TspMapWrapper'
import TspRoute from './TspRoute'

const initialPlaces = []

class AppWrapper extends Component {

    constructor(props)
    {
        super(props);

        this.state = {
            places: initialPlaces,

            isProcessingRoute: false,
            percentagePctComplete: 0.0,

            isRenderingDirections: false,
            directionRenderingPctComplete: 0.0,

            route: undefined,
            currentTabIndex: 0,

            highlightedPlace: undefined,

            setting_iterations: parseInt(localStorage.getItem("setting_iterations"),10) || 2500,
            setting_distancemodel: localStorage.getItem("setting_distancemodel") || "DRIVING",
            setting_fallback: localStorage.getItem("setting_fallback") || "LINE_OF_SIGHT",
            setting_metric: localStorage.getItem("setting_metric") || "DISTANCE"

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
        if(this.state.highlightedPlace)
        {
            if(this.state.highlightedPlace.place_id === placeToRemove.place_id){
                this.clearHighlightedPlace();
            }

        }
        this.setState({
            places: this.state.places.filter((place) => {
                return place.place_id !== placeToRemove.place_id;
            })
        });
        this.clearRoute();
    }

    focusPlace(placeToFocus)
    {
        const mapCenter = {lat: placeToFocus.geometry.location.lat(),
                        lng: placeToFocus.geometry.location.lng()};

        this.setState({highlightedPlace: placeToFocus, mapCenter: mapCenter });
    }

    progressCallback(percentagePctComplete)
    {
        this.setState({percentagePctComplete: percentagePctComplete});
    }

    canCalculate()
    {
        return this.state.places.length > 2 && !this.state.isProcessingRoute
    }

    computeBestRoute()
    {
        this.clearRoute();
        if (this.canCalculate()) {
            this.setState({isProcessingRoute: true, errormessage:"", percentagePctComplete: 0});

            const options = {
                iterations: parseInt(this.state.setting_iterations,10),
                distanceModel: this.state.setting_distancemodel,
                fallbackStrategy: this.state.setting_fallback,
                metric: this.state.setting_metric
            };

            return new Promise((resolve, reject) => {
                calculateRoundTrip(this.props.google, this.state.places, this.progressCallback.bind(this), options)
                .then((result)=>{
                    if(result.error === false){
                        resolve(result.result);
                    }else{
                        reject(result.error);
                    }
                }).catch((result) => {
                    reject(result);
                });
            })
            .delay(100) //Give the css animation some time...
            .then((new_places) => {
                this.setState({isProcessingRoute: false, route: new_places});
            }).catch((e) => {
                this.setState({isProcessingRoute: false, errormessage:e.message});
            });
        }
    }

    clearRoute()
    {
        this.setState({route:undefined, currentTabIndex:0});
    }

    renderProgress()
    {
        return (
            <div className="progress">
                <div className="progress-bar progress-bar-striped" role="progressbar" aria-valuenow={this.state.percentagePctComplete} aria-valuemin="0" aria-valuemax="100" style={{
                    width: this.state.percentagePctComplete + '%'
                }}>
                    <span className="sr-only">{this.state.percentagePctComplete}% complete</span>
                </div>
            </div>
        );
    }

    onStartRenderDirections()
    {
        this.setState({isRenderingDirections:true, directionRenderingPctComplete:0.0});
    }

    onRenderDirectionProgress(progress)
    {
        this.setState({directionRenderingPctComplete:progress*100});
    }

    onFinishRenderDirections()
    {
        this.setState({isRenderingDirections:false});
    }

    renderDirectionIndicator()
    {
        return (
            <div className="progress progress-bar-striped">
                <div className="progress-bar progress-bar-striped bg-warning" role="progressbar" aria-valuenow={this.state.directionRenderingPctComplete} aria-valuemin="0" aria-valuemax="100" style={{

                    width: this.state.directionRenderingPctComplete + '%'
                }}>
                Rendering Directions... {this.state.directionRenderingPctComplete}%
                </div>
            </div>
        );
    }

    handleSelectTab(index,last)
    {
        this.setState({currentTabIndex:index});
    }

    clearHighlightedPlace()
    {
        this.setState({highlightedPlace:undefined});
    }

    handleIterationChange(e)
    {
        let value = e.target.value;
        localStorage.setItem("setting_iterations", value);
        this.setState({setting_iterations: value});
    }
    handleDistanceModelChange(e)
    {
        let value = e.target.value;
        localStorage.setItem("setting_distancemodel", value);
        this.setState({setting_distancemodel: value});
    }
    handleFallBackChange(e)
    {
        let value = e.target.value;
        localStorage.setItem("setting_fallback", value);
        this.setState({setting_fallback: value});
    }
    handleMetricChange(e)
    {
        let value = e.target.value;
        localStorage.setItem("setting_metric", value);
        this.setState({setting_metric: value});
    }
    handleSettingsSubmit(e) {
        e.preventDefault()
    }

    render()
    {
        if (!this.props.loaded) {
            return <div>
                Loading..., you must have Internet connectivity to run this Application!
            </div>
        }

        let errormessage;
        if(this.state.errormessage)
        {
            errormessage =  <div className="alert alert-danger">
                                  {this.state.errormessage}
                              </div>;
        };

        let controls=(
                    <form>
                        {this.state.isProcessingRoute
                            ? this.renderProgress()
                            : null}
                        {this.state.isRenderingDirections
                            ? this.renderDirectionIndicator()
                            : null}

                        <div className="btn-group" role="group">
                            <button disabled={this.state.route === undefined} type="button" className="btn btn-danger btn-medium" onClick={this.clearRoute.bind(this)}>
                                <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                                Clear Route
                            </button>
                            <button disabled={!this.canCalculate()} type="button" className="btn btn-primary btn-medium" onClick={this.computeBestRoute.bind(this)}>
                                <span className="glyphicon glyphicon-play-circle" aria-hidden="true"></span>
                                Calculate Round Trip
                            </button>
                        </div>
                    </form>);

        return (


        <div>
            <nav className="navbar navbar-inverse navbar-static-top">
              <div className="container-fluid">
                <div className="navbar-header">
                  <a className="navbar-brand" href="#">The Traveling Salesman&#039;s Planner</a>
                </div>
              </div>
            </nav>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-12 col-sm-6 col-md-8">
                        <TspMapWrapper
                            places={this.state.places}
                            highlightedPlace={this.state.highlightedPlace}
                            center={this.state.mapCenter}
                            onClearHighlight={this.clearHighlightedPlace.bind(this)}
                            onAddPlace={this.addPlace.bind(this)}
                            onRemovePlace={this.removePlace.bind(this)}
                            google={this.props.google}
                            route={this.state.route}
                            onStartRenderDirections={this.onStartRenderDirections.bind(this)}
                            onRenderDirectionProgress={this.onRenderDirectionProgress.bind(this)}
                            onFinishRenderDirections={this.onFinishRenderDirections.bind(this)}
                            directionDistanceModel={this.state.setting_distancemodel}
                        />
                    </div>
                    <div className="col-xs-6 col-md-4">
                        {errormessage}
                        <Tabs
                            onSelect={this.handleSelectTab.bind(this)}
                            selectedIndex={this.state.currentTabIndex}
                          >
                              <TabList>
                                  <Tab>Places</Tab>
                                  <Tab disabled={this.state.route === undefined}>Route</Tab>
                                  <Tab>Settings</Tab>
                              </TabList>

                            <TabPanel>
                                <TspSearchForm google={this.props.google} onAddPlace={this.addPlace.bind(this)} />
                                <TspTargetList places={this.state.places} onRemovePlace={this.removePlace.bind(this)} onFocusPlace={this.focusPlace.bind(this)}/>
                            </TabPanel>

                            <TabPanel>
                                <TspRoute route={this.state.route} onFocusPlace={this.focusPlace.bind(this)}/>
                            </TabPanel>

                            <TabPanel>
                                <form onSubmit={this.handleSettingsSubmit.bind(this)}>

                                    <div className="form-group">
                                      <label htmlFor="iterations">Iterations:</label>
                                      <input type="number" className="form-control" id="iterations" onChange={this.handleIterationChange.bind(this)} value={this.state.setting_iterations}
                                        aria-describedby="helpIterations"
                                      />
                                        <small id="helpIterations" className="text-muted">
                                          Strictly speaking, the travelling salesman's planner computes an approximation for the best round trip. The higher the number of iterations the better the result, but also the longer the computation takes!
                                          Increasing this is only required for large numbers of targets (9 or 10), but the default value is sufficient for most cases.
                                        </small>
                                    </div>

                                    <div className="form-group">
                                      <label htmlFor="distanceModel">Distance Model:</label>
                                      <select className="form-control" id="distanceModel" onChange={this.handleDistanceModelChange.bind(this)} value={this.state.setting_distancemodel} aria-describedby="helpDistanceModel">
                                        <option value="LINE_OF_SIGHT">Line of Sight</option>
                                        <option value="DRIVING">Google: Driving</option>
                                        <option value="WALKING">Google: Walking</option>
                                        <option value="TRANSIT">Google: Transit</option>
                                      </select>
                                      <small id="helpDistanceModel" className="text-muted">
                                        Select which data source should be used to compute the distances between the targets.
                                        Line of Sight is always available, others depend on Google's availability.
                                      </small>
                                    </div>

                                    <div className="form-group">
                                      <label htmlFor="fallback">Fallback:</label>
                                        <select className="form-control" id="fallback" onChange={this.handleFallBackChange.bind(this)} value={this.state.setting_fallback} aria-describedby="helpFallback">
                                            <option value="LINE_OF_SIGHT">Line of Sight</option>
                                            <option value="NONE">None</option>
                                      </select>
                                      <small id="helpFallback" className="text-muted">
                                          Specify what to do if there is no data available in the data source for a given route. Either fall back to Line of Sight or None, which essentially will abort the computation.
                                      </small>
                                    </div>

                                    <div className="form-group">
                                      <label htmlFor="metric">Metric:</label>
                                      <select className="form-control" id="metric" onChange={this.handleMetricChange.bind(this)} value={this.state.setting_metric} aria-describedby="helpMetric">
                                        <option value="DISTANCE">Distance</option>
                                        <option value="DURATION">Duration</option>
                                      </select>
                                      <small id="helpMetric" className="text-muted">
                                          Use the physiscal distance or the travel duration as metric for the computation. Note that Duration is ignored in the Line-of-Sight distance model.
                                      </small>
                                    </div>

                                </form>

                            </TabPanel>
                            </Tabs>
                        {controls}
                    </div>
                </div>
                {this.props.children}
            </div>
        </div>
        );
    }
}

// TODO: get this from a config.

export default GoogleApiWrapper({apiKey: google_api_key, libraries: ['places']})(AppWrapper)
