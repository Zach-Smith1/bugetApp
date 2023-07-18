import React, { useState } from "react";
import Chart from 'react-apexcharts'

  const plotoptions = {
          donut: {
            size: '65%',
            background: 'transparent',
            labels: {
              show: false,
              name: {
                show: true,
                fontSize: '22px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                color: undefined,
                offsetY: -10,
                formatter: function (val) {
                  return val
                }
              },
              value: {
                show: true,
                fontSize: '16px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
                color: undefined,
                offsetY: 16,
                formatter: function (val) {
                  return val
                }
              },
              total: {
                show: false,
                showAlways: false,
                label: 'Total',
                fontSize: '22px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                color: '#373d3f',
                formatter: function (w) {
                  return w.globals.seriesTotals.reduce((a, b) => {
                    return a + b
                  }, 0)
                }
              }
            }
          }
        }

    const Donut = ({ version }) => {
    const options = version === '1' ? {
      labels: ['Housing', 'Insurance', 'Food', 'Savings', 'Utilities', 'Transportation', 'Needs', 'Wants']
    } : {labels: ['Living Expenses', 'Debt/Savings', 'Wants/Fun']}
    const series = version === '1' ? [30,10,15,10,5,10,15,5] : [70,20,10]


    return (
      <div className="donut">
        <Chart options={options} series={series} type="donut" width="380" />
      </div>
    );
  }

export default Donut;