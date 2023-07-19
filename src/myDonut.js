import React, { useState } from "react";
import Chart from 'react-apexcharts'

const MyDonut = ({ totals, income, housing }) => {

  let series = [];
  let totalSpend = 0;
  for (const key in totals) {
    let num = Number(totals[key].toFixed(2));
    series.push(num);
    totalSpend += num
  }
  const options = {
    labels: Object.keys(totals)
  }
  if (income > totalSpend) {
    series.push(Number((income - totalSpend).toFixed(2)));
    options.labels.push('Savings')
  }
  if (housing > 0) {
    series.push(Number(housing));
    options.labels.push('Housing')
  }

  return (
    <div className="myDonut">
      <Chart options={options} series={series} type="donut" width="480" />
    </div>
  );
}

/*     if (prevState.income !== this.state.income || prevState.housing !== this.state.housing) {
      let series = this.state.series;
      series[0] = this.state.housing > 0 ? Number(this.state.housing) : 0;
      let total = series.reduce((a,b) => a + b);
      series[3] = (this.state.income - total) > 0 ? (this.state.income - total) : 0;
      this.setState({
        series: series
      })
    }*/

// Code for aggregating spending data into Suggested budget categories (['Housing', 'Insurance', 'Food', 'Savings', 'Utilities', 'Transportation', 'Needs', 'Wants'])
/*      let series = this.state.series;
      let internet = totals.Internet || 0;
      let gas = Math.floor(totals['Gas/Automotive']) || 0;
      let air = Math.floor(totals.Airfare) || 0;
      series[1] = Math.floor(totals.Insurance) || 0;
      series[2] = Math.floor(totals.Dining) || 0;
      series[3] = 0;
      series[4] = internet + totals['Phone/Cable'];
      series[5] = gas + air;
      series[6] = Math.floor(totals['Health Care']) || 0;
      series[7] = Math.floor(totals.Merchandise) || 0; */

export default MyDonut;