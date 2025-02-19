import React, { useState, useEffect } from 'react';
import CanvasJSReact from '@canvasjs/react-charts';
import axios from 'axios';

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [reportType, setReportType] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, [reportType]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/sales-report/generate/?type=${reportType}`);
      
      // Transform the product sales data for the chart
      const categoryData = response.data.products.reduce((acc, item) => {
        const category = item.variant__product__category__name;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(item.total_sales);
        return acc;
      }, {});

      // Calculate percentages
      const total = Object.values(categoryData).reduce((sum, value) => sum + value, 0);
      const dataPoints = Object.entries(categoryData).map(([category, sales]) => ({
        y: Number(((sales / total) * 100).toFixed(1)),
        label: category,
        toolTip: `${category}\nSales: $${sales.toFixed(2)}`
      }));

      setSalesData(dataPoints);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch sales data');
      setLoading(false);
    }
  };

  const options = {
    animationEnabled: true,
    exportEnabled: true,
    theme: "light2",
    title: {
      text: "Sales Distribution by Category"
    },
    subtitles: [{
      text: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      fontSize: 16
    }],
    data: [{
      type: "pie",
      indexLabel: "{label}: {y}%",
      startAngle: -90,
      dataPoints: salesData
    }]
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center p-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : (
        <CanvasJSChart options={options} />
      )}
    </div>
  );
};

export default SalesChart;