import React, { useState } from "react";
import Chart from 'react-apexcharts'

  const options = {
      labels: ['Housing', 'Insurance', 'Food', 'Savings', 'Utilities', 'Transportation', 'Needs', 'Wants']
    }

  const MyDonut = ({ series}) => {
    console.log(series)
    return (
      <div className="myDonut">
        <Chart options={options} series={series} type="donut" width="480" />
      </div>
    );
  }


export default MyDonut;