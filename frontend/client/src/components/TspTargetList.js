import React, { Component } from 'react';
import _ from 'lodash';

import {MAX_PLACES} from '../constants/config'

class TspTargetList extends Component {

  renderPlaces()
  {
        return _.map(this.props.places, (place, index) => {
              let description = {__html: place.adr_address}

              let photo = null;
              if(place.photos && place.photos.length > 0)
              {
                let url = place.photos[0].getUrl({'maxWidth': 50, 'maxHeight': 50});
                console.log(url)
                photo = (<img role="presentation" src={url} className="img" />);
              }

              return (<tr key={index}>
                      <td style={{width:"50px"}}>
                        {photo}
                      </td>
                      <td dangerouslySetInnerHTML={description}></td>
                      <td>
                        <button type="button" className="btn btn-info btn-sm" onClick={this.props.onFocusPlace.bind(this, place)}>
                          <span className="glyphicon glyphicon-pushpin" aria-hidden="true"></span>
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" onClick={this.props.onRemovePlace.bind(this, place)}>
                          <span className="glyphicon glyphicon-trash" aria-hidden="true"></span>
                        </button>
                      </td>
                    </tr>);
              }
        );
  }

  renderTableFooter()
  {
    let footerText = null;
    if (this.props.places.length >= 0)
    {
      if(this.props.places.length === 1)
      {
        footerText = "one Place"
      }
      else
      {
        footerText = this.props.places.length + " places"
      }

      if(this.props.places.length < 3)
      {
        footerText += ", " + (3 - this.props.places.length)+ " more required to start"
      }
      else if(this.props.places.length >= MAX_PLACES)
      {
        footerText += ", maximum reached."
      }

      }
    return (<tfoot>
      <tr>
        <td colSpan="3">{footerText}</td>
      </tr>
    </tfoot>);
  }

  render()
  {
    return (
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th colSpan="2">Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {this.renderPlaces()}
          </tbody>
          {this.renderTableFooter()}
        </table>
      </div>
    );
  }
}

TspTargetList.defaultProps = {
  places: [],
  onRemovePlace: (place) => {}
}

TspTargetList.propTypes = {
  onRemovePlace: React.PropTypes.function,
  places: React.PropTypes.array
}

export default TspTargetList;
