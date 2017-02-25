import React, {Component} from 'react';

import './styles/responsiveMap.css';
import {Map, Marker, InfoWindow} from 'google-maps-react'

class TspMapWrapper extends Component {

    constructor(props, context) {
        super(props, context);

        this.state = {
            showingInfoWindow: false,
            activeMarker: null,
            activeMapMarker: null
        }
    }

    onMarkerClick(marker, google_marker) {
        this.setState({activeMapMarker: google_marker, activeMarker: marker, showingInfoWindow: true});
    }

    onMapClicked(map, google_map, event) {
        if (this.state.showingInfoWindow) {
            this.setState({showingInfoWindow: false, activeMarker: null, activeMapMarker: null})
        } else {
            const {google,onAddPlace} = this.props;
            console.log(event.latLng.lat(),event.latLng.lng())
            let geocoder = new google.maps.Geocoder();
            let data = {
                location: event.latLng
            }
            let promise = new Promise((resolve, reject) => {
                geocoder.geocode(data, (results, status) => {
                    if (status === google.maps.GeocoderStatus.OK) {
                        resolve(results, status);
                    } else {
                        reject(status);
                    }
                });
            });

            promise.then((geocoding_result) => {
                return new Promise((resolve, reject) => {
                    let service = new google.maps.places.PlacesService(google_map);
                    service.getDetails({
                            placeId: geocoding_result[0].place_id
                        },
                        (place, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK)
                            {
                                resolve(place);
                            } else {
                                reject();
                            }
                        }
                    );
                });
            }).then((place) => {
                onAddPlace(place)
            });
        }
    }

    renderActiveMarker()
    {
        let innerHtml = '';
        if (this.state.activeMarker) {
            innerHtml = this.state.activeMarker.place.adr_address;
        }

        return <div dangerouslySetInnerHTML={{
            __html: innerHtml
        }}/>
    }

    render()
    {
        return (
            <Map
            google={this.props.google}
            className="iframecontainer"
            containerStyle={{
                position: 'relative',
                width: undefined,
                height: undefined
            }} zoom={5}
            initialCenter={this.props.initialCenter}
            streetViewControl={false}
            disableDoubleClickZoom={true}
            center={this.props.center}
            onClick={this.onMapClicked.bind(this)}>

                {this.props.places.map((place, index) => {
                    return (<Marker key={index} onClick={this.onMarkerClick.bind(this)} position={{
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    }} place={place}/>)
                })}

                <InfoWindow marker={this.state.activeMapMarker} visible={this.state.showingInfoWindow}>
                    {this.renderActiveMarker()}
                </InfoWindow>
            </Map>
        )
    }
}

TspMapWrapper.propTypes = {
    google: React.PropTypes.object.isRequired,
    onAddPlace: React.PropTypes.function,
    center: React.PropTypes.object,
    initialCenter: React.PropTypes.object
}

TspMapWrapper.defaultProps = {
    onAddPlace: (place) => {},
    center: undefined,
    initialCenter: {
        lat: 50.98586317954162, //Centered to Germany
        lng: 10.450995415449142
    }
}

export default TspMapWrapper;
