import React, { Component } from 'react'

class StationDetails extends Component {

  getStationConnections(station) {
    return station.line_stations.map((linestation) => {
      return this.props.lines.find((line) => {
        return line.id === linestation.line_id
      })
      })
    };

  render(){
    let lineNames = this.getStationConnections(this.props.showStation).map((line)=>{
      return line.name
    }).join(', ')

    return(
      <div>
      <p>This is the {this.props.showStation.name} station.</p>
      <p>Lines currently serving this station: {lineNames}</p>
      </div>
    )
  }
}

export default StationDetails
