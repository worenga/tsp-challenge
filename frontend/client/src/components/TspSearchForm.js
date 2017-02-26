  import React, {Component} from 'react';
import ReactDOM from 'react-dom'

export class TspSearchForm extends Component {

  onSubmit(event) {
    event.preventDefault()
  }

  componentDidMount() {
    this.renderAutoComplete();
  }

  renderAutoComplete() {
    console.log("Trigger Render Autocomplete")
    const {google, onAddPlace} = this.props;
    if (!google) return;

    const aref = this.refs.autocomplete;
    const node = ReactDOM.findDOMNode(aref);

    var autocomplete = new google.maps.places.Autocomplete(node);
    autocomplete.addListener('place_changed', () => {

      const place = autocomplete.getPlace();
      console.log("Place Changed: ", place)
      if (!place) {
        return;
      }
      onAddPlace(place);
    })
  }
    render()
    {
        return (
            <form onSubmit={this.onSubmit}>
                    <div className="form-group">
                        <label htmlFor="inputLocation">Location to add</label>
                          <div className="input-group">
                            <span className="input-group-addon" >
                              <span className="glyphicon glyphicon-map-marker" aria-hidden="true"></span>
                            </span>
                            <input className="form-control" ref='autocomplete' type="text" placeholder="Enter some location" id="inputLocation"/>
                          </div>
                    </div>
            </form>
        );
    }
}

TspSearchForm.propTypes = {
  google: React.PropTypes.object.isRequired,
  onAddPlace: React.PropTypes.function
}

TspSearchForm.defaultProps = {
  onChangeBindToMap: () => {},
  onAddPlace: (place) => {}
}


export default TspSearchForm;
