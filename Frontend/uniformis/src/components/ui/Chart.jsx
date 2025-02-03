import React from "react";

// You can customize the styles and structure of the chart container
export function ChartContainer({ children }) {
  return (
    <div style={{ width: '100%', height: 300, padding: '20px', background: '#f7f7f7', borderRadius: '10px' }}>
      {children}
    </div>
  );
}

// Tooltip content for chart (You can modify it to match your design)
export function ChartTooltipContent() {
  return (
    <div style={{ padding: '10px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '5px' }}>
      <p style={{ margin: 0 }}>Value: </p>
    </div>
  );
}
