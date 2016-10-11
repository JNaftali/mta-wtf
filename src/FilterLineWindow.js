import React, { Component } from 'react'
import LineList from './LineList'

class FilterLineWindow extends Component {
  constructor() {
    super()
    this.state = {
      linesDisplayed: false
    }
    this.toggleLines = this.toggleLines.bind(this);
  }

  toggleLines(e){
   e.preventDefault();
   let shouldToggleLines = !this.state.linesDisplayed

   this.setState({
     linesDisplayed: shouldToggleLines
   })
 }


  render() {
    return(
      <div className="panel panel-default" id="line-wrapper">
      <div className="panel-heading" id="line-header"><h2 id="line-text" onClick={this.toggleLines}>Click to View Lines</h2></div>
          { this.state.linesDisplayed ? <div className="panel-body" id="line-input-container"><LineList lineToggles={this.props.lineToggles} toggleLineCheckbox={this.props.toggleLineCheckbox} lines={this.props.lines} /></div> : null }
      </div>
    )
  }
}

export default FilterLineWindow
