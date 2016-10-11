import React, { Component } from 'react'
import StationDetails from './StationDetails'
import LineDetails from './LineDetails'

class InfoWindow extends Component {

  getActiveLine(line_name) {
    return this.props.lines.find((line) => line.name === line_name)
  }

  whatShouldIShow() {
    if (this.props.showStation) {
      return <StationDetails showStation={this.props.showStation} lines={this.props.lines} />
    } else if (this.props.showLine) {
      return <LineDetails liveStatus={this.props.liveStatus} line={this.getActiveLine(this.props.showLine)} />
    } else if (this.props.defaultStation) {
      return <StationDetails showStation={this.props.defaultStation} lines={this.props.lines} />
    } else if (this.props.defaultLine) {
      return <LineDetails liveStatus={this.props.liveStatus} line={this.getActiveLine(this.props.defaultLine)} />
    } else {
      return <p>Please hover over a line or station for current service status.</p>
    }
  }

  render(){
    return (
      <div className="panel panel-default" id="info-container" >
        <div className="panel-body">
           {this.whatShouldIShow()}
        </div>
      </div>
    )
  }
}

export default InfoWindow
