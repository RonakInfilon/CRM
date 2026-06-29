import { data } from 'autoprefixer';
import React from 'react'
import Chart from "react-apexcharts"
const Area = () => {
  const opition = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "July",

      ]
    },
    colors: ["#4f46e5"],
    stroke: {
      curve: "smooth",
      width: 0
    },
    fill: {
      gradient: {
        opacityFrom: 0.5,
        opacityTo: 0.1,
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 5
    },
    grid: {
      show: false
    },
    tooltip: {
      theme: "dark",
    },

  };
  const series = [
    {
      name: "New Leads",
      data: [35, 45, 48, 58, 78, 90],
    },
    {
      name: "Old Leads",
      data: [30, 90, 78, 56, 49, 100],
    }
  ];
  return (
    <div> <h1>Area Chart</h1>
      <Chart
        options={opition}
        series={series}
        type='area'
      />
    </div>
  )
}

export default Area