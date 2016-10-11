import React, { Component } from 'react'
import mapStyles from './mapStyles'

class Map extends Component {
  constructor() {
    super()
    this.dashedStyle = [{
      icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            strokeWeight: 3,
            scale: 3
         },
      offset: '0',
      repeat: '20px'
    }]
    this.lineColors = {
      1: '#EE352E',
      2: '#EE352E',
      3: '#EE352E',
      4: '#00933C',
      5: '#00933C',
      6: '#00933C',
      '6E': '#00933C',
      A: '#0039A6',
      C: '#0039A6',
      E: '#0039A6',
      B: '#FF6319',
      D: '#FF6319',
      F: '#FF6319',
      M: '#FF6319',
      G: '#6CBE45',
      J: '#996633',
      Z: '#996633',
      L: '#A7A9AC',
      N: '#FCCC0A',
      Q: '#FCCC0A',
      R: '#FCCC0A',
      S: '#808183',
      7: '#B933AD',
      '7E': '#B933AD'
    }
    this.lineObjects = {}
  }

  componentDidMount() {
    const google = this.props.google
    // Interesting map options:
    // mapTypeId: "hybrid"
    if (!this.map) {
      this.map = new google.maps.Map(this.refs.map, {
        center: {lat: 40.745, lng: -73.897},
        zoom: 11,
        mapTypeControl: false,
        streetViewControl: false,
        styles: mapStyles
      })

      google.maps.event.addListener(this.map, "click", () => this.props.clickInfoWindow(null, null))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.lines && nextProps.stations) {
      this.lines = {}
      nextProps.stations.forEach((station) => {
        this.markStation(station)
        this.drawLines(station)
      })
    }

    // nextProps.lines.forEach((line) => {
    //   if (nextProps.lineToggles[line.name]) {
    //     this.showLine(line.name)
    //   } else {
    //     this.hideLine(line.name)
    //   }
    // })
    // const status = nextProps.liveStatus.filter((x) => x)
    // status.forEach((update) => {
    //   if (update.canceled === true) { this.hideLine(update.line) }
    //   else if (update.canceled) { this.removeClosedStations(update.line, update.canceled[0], update.canceled[1]) }
    //   else if (update.status === 'delays') { this.markDelays(update.line) }
    // })
  }

  markDelays(line_name) {
    const dashedOptions = {
      strokeOpacity: 0,
      icons: this.dashedStyle
    }
    Object.keys(this.lines).forEach((station_pair) => this.lines[station_pair][line_name] ? this.lines[station_pair][line_name].setOptions(dashedOptions) : null)
  }

  findStationById(station_id) {
    return this.props.stations.find((station) => station.id === station_id)
  }

  findLineById(line_id) {
    return this.props.lines.find((line) => line.id === line_id)
  }

  getSegmentsBetween(station, other_station) {
    return this.lines[[station.mta_id, other_station.mta_id].sort().join('_')]
  }

  getConnectingLines(a,b) {
    return a.lines.filter((aline)=>b.lines.find((bline)=>bline === aline))
  }

  getNextStation(line, station) {
    const idx = line.stations.indexOf(station)
    return line.stations[idx + 1] || null
  }

  getPrevStation(line, station) {
    const idx = line.stations.indexOf(station)
    return line.stations[idx - 1] || null
  }

  getStationConnections(station) {
    return station.order.reduce((result, _, line_id) => {
      const line = station.lines.find((line)=>line.id === line_id)
      const idx = line.stations.indexOf(station)
      if (idx > 0) result.push(line.stations[idx - 1])
      if (idx < line.stations.length - 1) result.push(line.stations[idx + 1])
      return result
    }, [])
  }

  offsetStationPosition(station, lat_offset, lng_offset) {
    return {
      lat: station.lat + lat_offset,
      lng: station.lng + lng_offset
    }
  }

  drawLines(station) {
    const connecting_stations = this.getStationConnections(station)
    connecting_stations.forEach((other_station)=> {
      this.drawLinesBetween(station, other_station)
    })
  }

  drawLinesBetween(station, other_station) {
    const google = this.props.google
    const name = [station.mta_id, other_station.mta_id].sort().join('_')
    if (this.lines[name]) Object.keys(this.lines[name]).forEach((line) => this.lines[name][line].setMap(null))
    const lines = this.getConnectingLines(station, other_station).sort((a,b) => a.line_id > b.line_id ? 1 : -1)
    const angle = Math.atan((station.lng - other_station.lng) / (other_station.lat - station.lat))
    const lat_offset = Math.sin(angle)
    const lng_offset = Math.cos(angle)
    this.lines[name] = lines.reduce((result,line, i) => {
      const factor = (i - (lines.length / 2)) / 10000
      const coords = [this.offsetStationPosition(station, lat_offset * factor, lng_offset * factor), this.offsetStationPosition(other_station, lat_offset * factor, lng_offset * factor)]
      const path = this.drawLineSegment(coords, null, line)
      google.maps.event.addListener(path, "mouseover", () => this.props.lineHover(line.name))
      google.maps.event.addListener(path, "mouseout", () => this.props.lineHover(""))
      google.maps.event.addListener(path, "click", () => this.props.clickInfoWindow(line.name))
      path.setMap(this.map)
      result[line.name] = path
      return result
    }, {})
  }

  hideLine(line_name) {
    Object.keys(this.lines).forEach((station_pair) => this.lines[station_pair][line_name] ? this.lines[station_pair][line_name].setMap(null) : null)
  }

  showLine(line_name) {
    Object.keys(this.lines).forEach((station_pair) => this.lines[station_pair][line_name] ? this.lines[station_pair][line_name].setMap(this.map) : null)
  }

  removeClosedStations(line_name, first_station_name, last_station_name) {
    this.hideLine(line_name)
    const line = this.props.lines.find((l) => l.name === line_name)
    if (!line) return false
    const remove_from = line.stations.find((station) => first_station_name.match(station.name) || station.name.match(first_station_name.trim()))
    const remove_to = line.stations.find((station) => last_station_name.match(station.name) || station.name.match(last_station_name.trim()))
    if (!(remove_from && remove_to)) return false
    const big_order = this.getStationOrder(remove_from, line) > this.getStationOrder(remove_to, line) ? this.getStationOrder(remove_from, line) : this.getStationOrder(remove_to, line)
    const small_order = this.getStationOrder(remove_from, line) < this.getStationOrder(remove_to, line) ? this.getStationOrder(remove_from, line) : this.getStationOrder(remove_to, line)
    const filtered_line = this.sortStations(line).filter((station) => !(this.getStationOrder(station, line) >= small_order && this.getStationOrder(station, line) <= big_order) )
    filtered_line.forEach((station,i)=>{
      const other_station = filtered_line[i+1]
      if (other_station) {
        this.drawLinesBetween(station,other_station)
      }
    })
  }


  getStationOrder(station, line) {
    return station.line_stations.find((ls) => ls.line_id === line.id).order
  }

  sortStations(line) {
    return line.stations.sort((a, b) => {
      if (this.getStationOrder(a, line) > this.getStationOrder(b, line)) {
        return 1
      } else if (this.getStationOrder(b, line) > this.getStationOrder(a, line)) {
        return -1
      }
      return 0
    })
  }

  drawLineSegment(pairOfLatLng, lineType, line) {
    return new this.props.google.maps.Polyline({
      path: pairOfLatLng,
      strokeColor: this.lineColors[line.name],
      strokeOpacity: (lineType === 'dashed') ? 0 : 1,
      //set strokeOpacity to 0 for dashed lines and 1 for solid
      strokeWeight: 4,
      icons: (lineType === 'dashed') ? this.dashedStyle : null,
      zIndex: 1
    })
  }

  markStation(station) {
    const google = this.props.google
    const circle = new google.maps.Circle({
      center: station,
      fillColor: 'white',
      fillOpacity: 1,
      strokeColor: 'white',
      radius: 25,
      zIndex: 2
    })
    google.maps.event.addListener(circle, "mouseover", () => this.props.stationHover(null, station))
    google.maps.event.addListener(circle, "mouseout", () => this.props.stationHover(null, ""))
    google.maps.event.addListener(circle, "click", () => this.props.clickInfoWindow(null, station))
    circle.setMap(this.map)
  }

  render() {
    return (
      // <pre><code>{JSON.stringify(this.props, null, 4)}</code></pre>
      <div className="panel panel-default" id="map-container" ref="map" style={{ height: 900, border: '1px solid black'}}>Mappy mcMapperface</div>
    )
  }
}

export default Map
