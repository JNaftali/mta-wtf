import React, { Component } from 'react'

class LineDetails extends Component{
  isDuplicate(object, other_object) {
    return Object.keys(object).all((key)=> object[key] === other_object[key])
  }

  relevantDelays() {
    // const relevant = this.props.liveStatus.filter((update) => update.line === this.props.line.name)
    const update = this.props.liveStatus.find((update)=> update.line === this.props.line.name && update.status === "delays")
    return update ? `This line is experiencing delays going ${update.direction === "both" ? "both ways" : update.direction} because of ${update.reason} at ${update.reason_station}` : null
  }

  stationNames() {
    return this.props.line.stations.map((station, i) => <li style={{borderLeft: '1px solid #9CAAB9', paddingLeft: '1%', paddingRight: '1%'}} key={i}>{station.name}</li>)
  }

  render(){
    return(
      <div>
      <p>This is the {this.props.line.name} train.</p>
      <p>{this.relevantDelays()}</p>
      <ul style={{padding: 0, listStyle: 'none', display: 'flex', justifyContent: 'space-between', flexFlow: 'row wrap'}}>{this.stationNames()}</ul>
      </div>
    )
  }
}

export default LineDetails
