import React, { useState } from "react";
import Chart from 'react-apexcharts'

class MyDonut extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      options: {
        labels: ['Housing', 'Insurance', 'Food', 'Savings', 'Utilities', 'Transportation', 'Needs', 'Wants']
      }
    }
  }

  render() {

    return (
      <div className="myDonut">
        <Chart options={this.state.options} series={this.props.series} type="donut" width="380" />
      </div>
    );
  }
}

export default MyDonut;