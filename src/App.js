import React, { Component } from 'react';
import NavBar from './NavBar'
import KeyWindow from './KeyWindow'
import FilterLineWindow from './FilterLineWindow'
import InfoWindow from './InfoWindow'
import Map from './Map'
import GoogleMapsLoader from 'google-maps'
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      lines: [],
      stations: [],
      liveStatus: [],
      lineToggles: {}
    }

    GoogleMapsLoader.KEY = 'AIzaSyAN1IggXefhhur_pk-zNq_s2U9_LEn0z30'
    GoogleMapsLoader.load((google)=> this.setState({google: google}))

    fetch('http://wtf-mta.herokuapp.com/stations')
    .then((response)=> response.json())
    .then((json)=> {
      let {lines, stations, lineStations} = json
      const lineToggles = {}
      lines.forEach((line)=> {
        lineToggles[line.name] = true
      })
      stations = stations.map((station)=>{
        const stationLS = lineStations.filter((ls)=>ls.station_id === station.id)
        station.lines = stationLS.map((ls)=>lines.find((line)=>line.id === ls.line_id))
        station.order = []
        return station
      })
      lines = lines.map((line)=>{
        const lineLS = lineStations.filter((ls)=>ls.line_id === line.id)
        line.stations = lineLS.map((ls)=>{
          const station = stations.find((station)=>station.id === ls.station_id)
          station.order[ls.line_id] = ls.order
          return station
        }).sort((a,b)=> a.order[line.id] - b.order[line.id])
        return line
      })

      this.setState({
        lines: lines,
        stations: stations,
        lineToggles: lineToggles
      })
      this.refreshPage()

    })

    this.setInfoWindow = this.setInfoWindow.bind(this)
    this.toggleLineCheckbox = this.toggleLineCheckbox.bind(this)
    this.clickInfoWindow = this.clickInfoWindow.bind(this)
    this.refreshPage = this.refreshPage.bind(this)
  }

  refreshPage() {
    fetch('http://wtf-mta.herokuapp.com/latest')
    .then((response)=> response.json())
    .then((json)=> this.setState({liveStatus: json}))
  }

  toggleLineCheckbox(line_name, bool) {
    let toggle = { [line_name]: bool }
    let old_setting = this.state.lineToggles
    let new_setting = Object.assign(old_setting, toggle)
    this.setState(({lineToggles: new_setting}))
  }

  setInfoWindow(line, station) {
    this.setState({
      infoWindowLine: line,
      infoWindowStation: station
    })
  }

  clickInfoWindow(line, station) {
    this.setState({
      clickWindowLine: line,
      clickWindowStation: station
    })
  }

  render() {
    const liveStatus = this.state.liveStatus.filter( (x) => x )
    const stations = this.state.lines.reduce((ary,line) => {return ary.concat(line.stations)},[])
    return (
      <div className="container-fluid" id="wrapper">
        <div className="row">
          <div className='col-md-3' id="left-content">
            <NavBar className="row" />
            <KeyWindow className="row" liveStatus={liveStatus} refreshPage={this.refreshPage} />
            <FilterLineWindow className="row" toggleLineCheckbox={this.toggleLineCheckbox} lines={this.state.lines} lineToggles={this.state.lineToggles} />
            <InfoWindow className="row" liveStatus={liveStatus} lines={this.state.lines} showLine={this.state.infoWindowLine} showStation={this.state.infoWindowStation} defaultLine={this.state.clickWindowLine} defaultStation={this.state.clickWindowStation} />
          </div>
          {this.state.google ? <Map className='col-md-9' lineToggles={this.state.lineToggles} trackMouse={this.mouseCoords} liveStatus={liveStatus} lines={this.state.lines} stations={stations} google={this.state.google}
               lineHover={this.setInfoWindow} stationHover={this.setInfoWindow} clickInfoWindow={this.clickInfoWindow} /> : null}
        </div>
      </div>
    );
  }
}

export default App;
