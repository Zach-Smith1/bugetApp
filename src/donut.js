import React, { useState } from "react";
import Chart from 'react-apexcharts'

const Donut = ({ version, legend }) => {
  const options = version ? {
    labels: ['Housing', 'Insurance', 'Food', 'Savings', 'Utilities', 'Transportation', 'Needs', 'Wants'],
    legend: {
      show: true,
      position: 'bottom'
    },
    title: {
      text: 'Suggested Budget',
      align: 'center'
    }
  } :
    {
      labels: ['Living Expenses', 'Debt/Savings', 'Wants/Fun'],
      legend: {
        show: legend,
        position: 'bottom'
      },
      title: {
        text: 'Suggested Budget',
        align: 'center'
      }
    }
  const series = version ? [30, 10, 15, 10, 5, 10, 15, 5] : [70, 20, 10]

  return (
    <div className="donut">
      <Chart options={options} series={series} type="donut"/>
    </div>
  );
}

export default Donut;