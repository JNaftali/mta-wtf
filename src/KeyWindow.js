import React, { Component } from 'react'

class KeyWindow extends Component {
  render(){
    var date = new Date()
    return(
      <div className="panel panel-default" id="key-container">
      <div className="panel-body">
        <p><strong>Solid Line</strong>: Trains are running</p>
        <p><strong>Dashed Line</strong>: Trains are delayed</p>
          <form className="refresh-timestamp">
            <button className="btn btn-default btn-lg" onClick={this.props.refreshPage} type="button">Reload</button>
          </form>
          <p>Last Updated: {date.toLocaleString('en-us')}</p>
      </div>
      </div>
    )
  }
}

export default KeyWindow
