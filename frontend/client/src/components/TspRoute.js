import React, {Component} from 'react';
import _ from 'lodash';

class TspRoute extends Component {

  renderRoute()
  {
        return _.map(this.props.route, (place, index) => {
              let description = {__html: place.adr_address}

              return (<tr key={index}>
                      <td>
                        {index+1}.
                      </td>
                      <td dangerouslySetInnerHTML={description}></td>
                      <td>
                        <button type="button" className="btn btn-info btn-sm" onClick={this.props.onFocusPlace.bind(this, place)}>
                          <span className="glyphicon glyphicon-pushpin" aria-hidden="true"></span>
                        </button>
                      </td>
                    </tr>);
              }
        );
  }

  render()
  {
    return (<div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th colSpan="2">Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.renderRoute()}
              </tbody>
            </table>
          </div>);
  }
}

export default TspRoute;
TspRoute.propTypes = {
  onFocusPlace: React.PropTypes.func,
  route: React.PropTypes.array,
}
TspRoute.defaultProps = {
  onFocusPlace: (place) => {}
}
