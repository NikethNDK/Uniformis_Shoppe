// import React from "react";
// import { format } from "date-fns";
// import { Printer, Download } from "lucide-react";
// import { Button } from "../../components/ui/button"
// import {
//     DialogContent,
//     Dialog,
//     DialogHeader,
//     DialogFooter,
//     DialogTitle,
//     DialogDescription,
//   } from "../../components/ui/dialog"
// import logo from '../../../assets/logo.png';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const Invoice = ({ order, onClose }) => {
//   const handlePrint = () => {
//     const printContent = document.getElementById('invoice-content');
//     const originalDisplay = printContent.style.display;
    
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write('<html><head><title>Invoice</title>');
    
//     document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
//       printWindow.document.write(style.outerHTML);
//     });
    
//     printWindow.document.write('</head><body>');
//     printWindow.document.write(printContent.innerHTML);
//     printWindow.document.write('</body></html>');
//     printWindow.document.close();
    
//     printWindow.onload = () => {
//       printWindow.print();
//       printWindow.close();
//     };
//   };

//   const handleDownload = async () => {
//     const content = document.getElementById('invoice-content');
    
//     try {
//       const canvas = await html2canvas(content);
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`invoice-${order.order_number}.pdf`);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//     }
//   };

//   // Check if all items are cancelled or refunded
//   const isEntireOrderCancelled = order.items.every(
//     item => item.status === "cancelled" || item.status === "refunded"
//   );

//   // Check if all items are delivered
//   const isEntireOrderDelivered = order.items.every(
//     item => item.status === "delivered"
//   );

//   return (
//     <DialogContent className="max-w-4xl max-h-screen flex flex-col">
//       <DialogHeader>
//         <DialogTitle className="flex justify-between items-center">
//           <span>Invoice</span>
//           <div className="space-x-2">
//             <Button variant="outline" onClick={handlePrint}>
//               <Printer className="h-4 w-4 mr-2" />
//               Print
//             </Button>
//             <Button variant="outline" onClick={handleDownload}>
//               <Download className="h-4 w-4 mr-2" />
//               Download
//             </Button>
//             <Button variant="outline" onClick={onClose}>
//               Close
//             </Button>
//           </div>
//         </DialogTitle>
//       </DialogHeader>

//       <div id="invoice-content" className="flex-1 overflow-y-auto p-6">
//         <div className="space-y-6 relative">
//           {/* Order Status Stamp */}
//           {isEntireOrderCancelled && (
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] border-8 border-red-500 rounded-lg p-4 text-red-500 text-4xl font-bold opacity-30 pointer-events-none">
//               CANCELLED
//             </div>
//           )}
//           {isEntireOrderDelivered && (
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] border-8 border-green-500 rounded-lg p-4 text-green-500 text-4xl font-bold opacity-30 pointer-events-none">
//               DELIVERED
//             </div>
//           )}

//           <div className="text-center">
//             <img src={logo} alt="Logo" className="logo_img01 mx-auto" />
//             <p className="text-sm text-gray-600">1st Floor Rabby Tower, Kannur, 670001</p>
//           </div>

//           <div className="flex justify-between">
//             <div>
//               <h3 className="font-semibold">
//                 Bill To: <span>{order.delivery_address.name}</span>
//               </h3>
//               <div className="mt-2">
//                 <h6 className="font-medium">Delivery Address</h6>
//                 <div className="leading-none">
//                   <p className="font-semibold">{order.delivery_address.name}</p>
//                   <p>{order.delivery_address.house_no}</p>
//                   <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
//                   <p>{order.delivery_address.pin_code}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <p><strong>Invoice Date:</strong> {format(new Date(order.created_at), "dd.MM.yyyy")}</p>
//               <p><strong>Order Number:</strong> {order.order_number}</p>
//             </div>
//           </div>

//           <table className="w-full border-collapse">
//             <thead>
//               <tr>
//                 <th className="border p-2 text-left w-16">Sl No.</th>
//                 <th className="border p-2 text-left w-1/3">Item Description</th>
//                 <th className="border p-2 text-left w-16">Qty</th>
//                 <th className="border p-2 text-left w-24">Price</th>
//                 <th className="border p-2 text-left w-24">Discount</th>
//                 <th className="border p-2 text-left w-24">Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {order.items.map((item, index) => (
//                 <tr 
//                   key={item.id} 
//                   className={`relative
//                     ${(item.status === "cancelled" || item.status === "refunded") ? "opacity-50" : ""}
//                     ${item.status === "delivered" ? "bg-green-50" : ""}
//                   `}
//                 >
//                   <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
//                     {index + 1}
//                   </td>
//                   <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
//                     {item.product_name}
//                     {(item.status === "cancelled" || item.status === "refunded") && (
//                       <span className="ml-2 text-sm text-red-500 no-underline">
//                         ({item.status.charAt(0).toUpperCase() + item.status.slice(1)})
//                       </span>
//                     )}
//                   </td>
//                   <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
//                     {item.quantity}
//                   </td>
//                   <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
//                     ₹{item.original_price}
//                   </td>
//                   <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
//                     ₹{item.discount_amount}
//                   </td>
//                   <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
//                     ₹{item.final_price}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="text-right space-y-2">
//             <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
//             <p><strong>Discount:</strong> ₹{order.discount_amount}</p>
//             {order.coupon_discount > 0 && (
//               <p><strong>Coupon Discount:</strong> ₹{order.coupon_discount}</p>
//             )}
//             <p className="text-xl font-bold">
//               <strong>Total:</strong> ₹{order.final_total}
//             </p>
//           </div>
//         </div>
//       </div>
//     </DialogContent>
//   );
// };

// export default Invoice;

import React from "react";
import { format } from "date-fns";
import { Printer, Download } from "lucide-react";
import { Button } from "../../components/ui/button"
import {
    DialogContent,
    Dialog,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
  } from "../../components/ui/dialog"
import logo from '../../../assets/logo.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Invoice = ({ order, onClose }) => {
  // Calculate refund totals and updated amount
  const calculateFinancialSummary = (order) => {
    // Active items
    const activeItems = order.items.filter(item => item.status === 'active');
    
    // Modified items (cancelled, returned, refunded)
    const modifiedItems = order.items.filter(
      item => item.status === 'cancelled' || item.status === 'returned' || item.status === 'refunded'
    );

    // Calculate processed refunds (with actual refund_amount)
    const processedRefunds = modifiedItems.reduce((sum, item) => {
      if (item.refund_amount) {
        return sum + parseFloat(item.refund_amount);
      }
      return sum;
    }, 0);

    // Calculate estimated pending refunds
    const pendingItems = modifiedItems.filter(
      item => !item.refund_amount && (item.status === 'returned' || item.status === 'cancelled')
    );
    
    const pendingRefundTotal = pendingItems.reduce((sum, item) => {
      // Calculate coupon impact on this item
      const itemOriginalPrice = parseFloat(item.final_price);
      const couponImpact = order.coupon && parseFloat(order.subtotal) !== 0
        ? (itemOriginalPrice * (parseFloat(order.coupon_discount) / parseFloat(order.subtotal)))
        : 0;
        
      // Item refund should be the price minus its portion of the coupon discount
      const estimatedRefund = itemOriginalPrice - couponImpact;
      return sum + estimatedRefund;
    }, 0);

    // Total refunded amount
    const totalRefunded = processedRefunds;
    
    // Final total after refunds
    const updatedFinalTotal = (parseFloat(order.final_total) - totalRefunded).toFixed(2);
    
    return {
      totalRefunded: totalRefunded.toFixed(2),
      pendingRefundTotal: pendingRefundTotal.toFixed(2),
      updatedFinalTotal
    };
  };

  const { totalRefunded, pendingRefundTotal, updatedFinalTotal } = calculateFinancialSummary(order);
  const hasRefunds = parseFloat(totalRefunded) > 0;

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content');
    const originalDisplay = printContent.style.display;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Invoice</title>');
    
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
      printWindow.document.write(style.outerHTML);
    });
    
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const handleDownload = async () => {
    const content = document.getElementById('invoice-content');
    
    try {
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice-${order.order_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Check if all items are cancelled or refunded
  const isEntireOrderCancelled = order.items.every(
    item => item.status === "cancelled" || item.status === "refunded"
  );

  // Check if all items are delivered
  const isEntireOrderDelivered = order.items.every(
    item => item.status === "delivered"
  );

  return (
    <DialogContent className="max-w-4xl max-h-screen flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex justify-between items-center">
          <span>Invoice</span>
          <div className="space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogTitle>
      </DialogHeader>

      <div id="invoice-content" className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 relative">
          {/* Order Status Stamp */}
          {isEntireOrderCancelled && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] border-8 border-red-500 rounded-lg p-4 text-red-500 text-4xl font-bold opacity-30 pointer-events-none">
              CANCELLED
            </div>
          )}
          {isEntireOrderDelivered && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] border-8 border-green-500 rounded-lg p-4 text-green-500 text-4xl font-bold opacity-30 pointer-events-none">
              DELIVERED
            </div>
          )}

          <div className="text-center">
            <img src={logo} alt="Logo" className="logo_img01 mx-auto" />
            <p className="text-sm text-gray-600">1st Floor Rabby Tower, Kannur, 670001</p>
          </div>

          <div className="flex justify-between">
            <div>
              <h3 className="font-semibold">
                Bill To: <span>{order.delivery_address.name}</span>
              </h3>
              <div className="mt-2">
                <h6 className="font-medium">Delivery Address</h6>
                <div className="leading-none">
                  <p className="font-semibold">{order.delivery_address.name}</p>
                  <p>{order.delivery_address.house_no}</p>
                  <p>{order.delivery_address.city}, {order.delivery_address.state}</p>
                  <p>{order.delivery_address.pin_code}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p><strong>Invoice Date:</strong> {format(new Date(order.created_at), "dd.MM.yyyy")}</p>
              <p><strong>Order Number:</strong> {order.order_number}</p>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-left w-16">Sl No.</th>
                <th className="border p-2 text-left w-1/3">Item Description</th>
                <th className="border p-2 text-left w-16">Qty</th>
                <th className="border p-2 text-left w-24">Price</th>
                <th className="border p-2 text-left w-24">Discount</th>
                <th className="border p-2 text-left w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`relative
                    ${(item.status === "cancelled" || item.status === "refunded") ? "opacity-50" : ""}
                    ${item.status === "delivered" ? "bg-green-50" : ""}
                  `}
                >
                  <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
                    {index + 1}
                  </td>
                  <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
                    {item.product_name}
                    {(item.status === "cancelled" || item.status === "refunded") && (
                      <span className="ml-2 text-sm text-red-500 no-underline">
                        ({item.status.charAt(0).toUpperCase() + item.status.slice(1)})
                      </span>
                    )}
                  </td>
                  <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
                    {item.quantity}
                  </td>
                  <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
                    ₹{item.original_price}
                  </td>
                  <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
                    ₹{item.discount_amount}
                  </td>
                  <td className={`border p-2 ${(item.status === "cancelled" || item.status === "refunded") ? "line-through" : ""}`}>
                    ₹{item.final_price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-right space-y-2">
            <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
            <p><strong>Discount:</strong> ₹{order.discount_amount}</p>
            {order.coupon_discount > 0 && (
              <p><strong>Coupon Discount:</strong> ₹{order.coupon_discount}</p>
            )}
            <p className="text-lg font-semibold">
              <strong>Initial Total:</strong> ₹{order.final_total}
            </p>
            
            {/* Refund information - Only show if there are refunds */}
            {hasRefunds && (
              <div className="mt-4 border-t pt-2">
                <h4 className="text-left font-medium mb-2">Refund Information</h4>
                <table className="w-1/2 ml-auto border-collapse text-sm">
                  <tbody>
                    {parseFloat(totalRefunded) > 0 && (
                      <tr>
                        <td className="text-left py-1">
                          <strong>Total Refunded:</strong>
                        </td>
                        <td className="text-right text-red-600">-₹{totalRefunded}</td>
                      </tr>
                    )}
                    
                    {/* Show updated total */}
                    <tr>
                      <td className="text-left py-1 pt-2">
                        <strong>Final Amount:</strong>
                      </td>
                      <td className="text-right font-bold text-xl text-green-600">₹{updatedFinalTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Refunded items details */}
          {hasRefunds && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium mb-2">Refunded Items</h4>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 text-left">Item</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Original Price</th>
                    <th className="border p-2 text-left">Refund Amount</th>
                    <th className="border p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.filter(item => 
                    item.status === "cancelled" || item.status === "refunded" || item.status === "returned"
                  ).map((item, index) => (
                    <tr key={`refund-${item.id}`}>
                      <td className="border p-2">{item.product_name}</td>
                      <td className="border p-2 capitalize">{item.status}</td>
                      <td className="border p-2">₹{item.final_price}</td>
                      <td className="border p-2 text-red-600">
                        {item.refund_amount ? `₹${item.refund_amount}` : 'Pending'}
                      </td>
                      <td className="border p-2">
                        {item.returned_at ? format(new Date(item.returned_at), "dd.MM.yyyy") : 
                         item.cancelled_at ? format(new Date(item.cancelled_at), "dd.MM.yyyy") : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default Invoice;