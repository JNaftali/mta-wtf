import React, { Component } from 'react'
import Line from './Line'

class LineList extends Component {

  constructor(){
    super()
    this.toggleAllCheckboxes = this.toggleAllCheckboxes.bind(this)
    this.gatherCheckboxes = this.gatherCheckboxes.bind(this)
    this.checkboxes = []
  }

  toggleAllCheckboxes() {
    this.props.lines.forEach((line) => {
      this.props.toggleLineCheckbox(line.name, this.refs.selectbox.checked)
    })

    this.checkboxes.forEach((box) => {
      box.checked = this.refs.selectbox.checked
    })
  }

  gatherCheckboxes(box) {
    this.checkboxes.push(box)
  }


  render() {
    return(
      <div>
        <div className="checkbox row">
          <label><input onClick={this.toggleAllCheckboxes} ref="selectbox" type="checkbox" defaultChecked={true} /><span>Show/Hide all lines</span></label>
        </div>
        <div style={{display: "flex", flexFlow: 'row wrap'}}>
        {
          this.props.lines.map((line,i) => {
            return (
              <Line style={{flex: 1}} shouldBeActive={this.props.lineToggles[line.name]} gatherCheckboxes={this.gatherCheckboxes} toggleLineCheckbox={this.props.toggleLineCheckbox} data={line} key={i} />
            )
          })
        }
        </div>
      </div>
    )
  }
}

export default LineList
