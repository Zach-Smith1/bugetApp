import React, { useState } from "react";
import Chart from 'react-apexcharts'

const MyDonut = ({ totals, income, housing, change, legend }) => {
  let series = [];
  let labels = Object.keys(totals)
  let totalSpend = 0;
  for (const key in totals) {
    let num = Number(totals[key].toFixed(2));
    series.push(num);
    totalSpend += num
  }
  const options = {
    chart: {
      events: {
        animationEnd: undefined,
        legendClick: undefined,
        dataPointSelection: function(event, chartContext, config){
          let val = labels[config.dataPointIndex];
          change(val)
        }
      }
    },
    plotOptions: {
      pie: {
        startAngle: 0,
        endAngle: 360,
        expandOnClick: false,
        offsetX: 0,
        offsetY: 0,
        customScale: 1,
        dataLabels: {
            offset: 0,
            minAngleToShowLabel: 10
        },
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '20px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              color: undefined,
              offsetY: -10,
              formatter: function (val) {
                return val
              }
            },
            value: {
              show: true,
              fontSize: '18px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
              formatter: function (val) {
                return '$' + val
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '22px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 600,
              color: 'black',
              formatter: function (w) {
                // add all categories except Savings and round to 2 decimals
                let i = labels.indexOf('Savings');
                let totals = w.globals.seriesTotals;
                if (i > -1) totals.splice(i,1);
                return '$' + Number((totals.reduce((a, b) => {return a + b})).toFixed(2))
              }
            }
          }
        },
      }
    },
    legend: {
      show: legend,
      showForSingleSeries: false,
      showForNullSeries: true,
      showForZeroSeries: true,
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      fontSize: '14px',
      fontFamily: 'Helvetica, Arial',
      fontWeight: 400,
      formatter: undefined,
      inverseOrder: false,
      width: undefined,
      height: undefined,
      tooltipHoverFormatter: undefined,
      customLegendItems: [],
      offsetX: 0,
      offsetY: 0,
      labels: {
          colors: undefined,
          useSeriesColors: false
      },
      itemMargin: {
          horizontal: 5,
          vertical: 0
      },
      onItemClick: {
          toggleDataSeries: true
      },
      onItemHover: {
          highlightDataSeries: true
      },
  },
    labels: labels,
    title: {
      text: 'Your Spending',
      align: 'center'
    }
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
      <Chart options={options} series={series} type="donut" width='100%'/>
    </div>
  );
}

export default MyDonut;