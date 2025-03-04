// import { useState } from "react"
// import { format } from "date-fns"
// import { CalendarIcon, Printer, Download } from "lucide-react"
// import { Button } from "../../components/ui/button"
// import { Calendar } from "../../components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
// import logo from '../../../assets/logo.png'
// import adminAxiosInstance from "../../../adminaxiosconfig"
// import { toast } from "react-toastify"
// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'
// import * as XLSX from 'xlsx'
// import { saveAs } from 'file-saver'
// import { useQuery } from "@tanstack/react-query"

// const SalesReport = () => {
//   const [reportType, setReportType] = useState("daily")
//   const [startDate, setStartDate] = useState()
//   const [endDate, setEndDate] = useState()

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['salesReport', { reportType, startDate, endDate }],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         type: reportType,
//         ...(startDate && { start_date: format(startDate, "yyyy-MM-dd") }),
//         ...(endDate && { end_date: format(endDate, "yyyy-MM-dd") }),
//       })
//       const response = await adminAxiosInstance.get(`/orders/sales-report/generate?${params}`)
//       console.log('sales report',response.data)
//       return response.data
//     },
//     enabled: reportType === 'custom' ? !!(startDate && endDate) : true
//   })

//   const handlePrint = () => {
//     const printContent = document.getElementById('report-content')
//     const originalDisplay = printContent.style.display
    
//     const printWindow = window.open('', '_blank')
//     printWindow.document.write('<html><head><title>Sales Report</title>')
    
//     document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
//       printWindow.document.write(style.outerHTML)
//     })
    
//     printWindow.document.write('</head><body>')
//     printWindow.document.write(printContent.innerHTML)
//     printWindow.document.write('</body></html>')
//     printWindow.document.close()
    
//     printWindow.onload = () => {
//       printWindow.print()
//       printWindow.close()
//     }
//   }

//   const handleDownloadPDF = async () => {
//     try {
//       const element = document.getElementById('report-content')
//       const canvas = await html2canvas(element)
//       const imgData = canvas.toDataURL('image/png')
      
//       const pdf = new jsPDF('p', 'mm', 'a4')
//       const imgProps = pdf.getImageProperties(imgData)
//       const pdfWidth = pdf.internal.pageSize.getWidth()
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
//       pdf.save(`sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.pdf`)
      
//       toast.success('Successfully downloaded PDF report')
//     } catch (error) {
//       console.error('Error downloading PDF:', error)
//       toast.error('Failed to download PDF report')
//     }
//   }

//   const handleDownloadExcel = () => {
//     try {
//       const productsData = data.products.map(product => ({
//         'Product Name': product.product_name,
//         'Category': product.variant__product__category__name,
//         'Total Sales': product.total_sales,
//         'Total Orders': product.total_orders
//       }))

//       const wb = XLSX.utils.book_new()
//       const ws = XLSX.utils.json_to_sheet(productsData)
      
//       XLSX.utils.sheet_add_aoa(ws, [
//         ['Sales Report'],
//         ['Report Type:', reportType.charAt(0).toUpperCase() + reportType.slice(1)],
//         ['Date:', format(new Date(), "dd.MM.yyyy")],
//         ['Period:', reportType === 'custom' 
//           ? `${format(startDate, "dd.MM.yyyy")} to ${format(endDate, "dd.MM.yyyy")}`
//           : reportType],
//         [''],
//         ['Summary'],
//         ['Total Sales', data.total_sales],
//         ['Total Orders', data.total_orders],
//         ['Total Discount', data.total_discount],
//         [''],
//         ['Products List']
//       ], { origin: 'A1' })
      
//       XLSX.utils.book_append_sheet(wb, ws, 'Sales Report')
//       const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
//       const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
//       saveAs(blob, `sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
      
//       toast.success('Successfully downloaded Excel report')
//     } catch (error) {
//       console.error('Error downloading Excel:', error)
//       toast.error('Failed to download Excel report')
//     }
//   }

//   if (isLoading) return <div className="ml-64 p-4">Loading...</div>
//   if (error) return <div className="ml-64 p-4">Error: {error.message}</div>

//   return (
//     <div className="ml-64 p-4 max-w-7xl admin-order-management content1 ">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Sales Report</h1>
//         <div className="space-x-2">
//           <Button variant="outline" onClick={handlePrint}>
//             <Printer className="h-4 w-4 mr-2" />
//             Print
//           </Button>
//           <Button variant="outline" onClick={handleDownloadPDF}>
//             <Download className="h-4 w-4 mr-2" />
//             PDF
//           </Button>
//           <Button variant="outline" onClick={handleDownloadExcel}>
//             <Download className="h-4 w-4 mr-2" />
//             Excel
//           </Button>
//         </div>
//       </div>

//       <div className="flex space-x-4 mb-6">
//         <Select value={reportType} onValueChange={setReportType}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Select report type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="daily">Daily</SelectItem>
//             <SelectItem value="weekly">Weekly</SelectItem>
//             <SelectItem value="monthly">Monthly</SelectItem>
//             <SelectItem value="yearly">Yearly</SelectItem>
//             <SelectItem value="custom">Custom</SelectItem>
//           </SelectContent>
//         </Select>

//         {reportType === "custom" && (
//           <>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className={`w-[280px] justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
//                 >
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
//               </PopoverContent>
//             </Popover>

//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className={`w-[280px] justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
//                 >
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
//               </PopoverContent>
//             </Popover>
//           </>
//         )}
//       </div>

//       {data && (
//         <div id="report-content" className="bg-white p-8 rounded-lg shadow-lg">
//           <div className="text-center mb-6">
//             <img src={logo} alt="Logo" className="mx-auto h-16 mb-2" />
//             <p className="text-sm text-gray-600">1st Floor Rabby Tower, Kannur, 670001</p>
//           </div>

//           <div className="flex justify-between mb-6">
//             <div>
//               <h3 className="font-semibold">Sales Report</h3>
//               <p className="text-sm text-gray-600">
//                 Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
//               </p>
//               {reportType === 'custom' && (
//                 <p className="text-sm text-gray-600">
//                   Period: {format(startDate, "dd.MM.yyyy")} - {format(endDate, "dd.MM.yyyy")}
//                 </p>
//               )}
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-600">
//                 <strong>Generated Date:</strong> {format(new Date(), "dd.MM.yyyy")}
//               </p>
//             </div>
//           </div>

//           <div className="grid grid-cols-3 gap-4 mb-6">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
//               <p className="text-2xl font-bold">₹{data.total_sales.toFixed(2)}</p>
//             </div>
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
//               <p className="text-2xl font-bold">{data.total_orders}</p>
//             </div>
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h2 className="text-lg font-semibold mb-2">Total Discount</h2>
//               <p className="text-2xl font-bold">₹{data.total_discount.toFixed(2)}</p>
//             </div>
//           </div>

//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="w-12">Sl No.</TableHead>
//                 <TableHead>Product Name</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead className="text-right">Total Sales</TableHead>
//                 <TableHead className="text-right">Total Orders</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {data.products.map((product, index) => (
//                 <TableRow key={index}>
//                   <TableCell>{index + 1}</TableCell>
//                   <TableCell>{product.product_name}</TableCell>
//                   <TableCell>{product.variant__product__category__name}</TableCell>
//                   <TableCell className="text-right">₹{product.total_sales.toFixed(2)}</TableCell>
//                   <TableCell className="text-right">{product.total_orders}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </div>
//       )}
//     </div>
//   )
// }

// export default SalesReport


// import { useState } from "react"
// import { format } from "date-fns"
// import { CalendarIcon, Printer, Download, AlertTriangle, TrendingUp, CreditCard } from "lucide-react"
// import { Button } from "../../components/ui/button"
// import { Calendar } from "../../components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
// import { Badge } from "../../components/ui/badge"
// import logo from '../../../assets/logo.png'
// import adminAxiosInstance from "../../../adminaxiosconfig"
// import { toast } from "react-toastify"
// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas'
// import * as XLSX from 'xlsx'
// import { saveAs } from 'file-saver'
// import { useQuery } from "@tanstack/react-query"

// const SalesReport = () => {
//   const [reportType, setReportType] = useState("daily")
//   const [startDate, setStartDate] = useState()
//   const [endDate, setEndDate] = useState()
//   const [activeTab, setActiveTab] = useState("summary")

//   const { data, isLoading, error } = useQuery({
//     queryKey: ['salesReport', { reportType, startDate, endDate }],
//     queryFn: async () => {
//       const params = new URLSearchParams({
//         type: reportType,
//         ...(startDate && { start_date: format(startDate, "yyyy-MM-dd") }),
//         ...(endDate && { end_date: format(endDate, "yyyy-MM-dd") }),
//       })
//       const response = await adminAxiosInstance.get(`/orders/sales-report/generate?${params}`)
//       console.log('sales report', response.data)
//       return response.data
//     },
//     enabled: reportType === 'custom' ? !!(startDate && endDate) : true
//   })

//   const handlePrint = () => {
//     const printContent = document.getElementById('report-content')
//     const printWindow = window.open('', '_blank')
//     printWindow.document.write('<html><head><title>Sales Report</title>')
    
//     document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
//       printWindow.document.write(style.outerHTML)
//     })
    
//     printWindow.document.write('</head><body>')
//     printWindow.document.write(printContent.innerHTML)
//     printWindow.document.write('</body></html>')
//     printWindow.document.close()
    
//     printWindow.onload = () => {
//       printWindow.print()
//       printWindow.close()
//     }
//   }

//   const handleDownloadPDF = async () => {
//     try {
//       const element = document.getElementById('report-content')
//       const canvas = await html2canvas(element, { scale: 1 })
//       const imgData = canvas.toDataURL('image/png')
      
//       const pdf = new jsPDF('p', 'mm', 'a4')
//       const imgProps = pdf.getImageProperties(imgData)
//       const pdfWidth = pdf.internal.pageSize.getWidth()
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      
//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
//       pdf.save(`sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.pdf`)
      
//       toast.success('Successfully downloaded PDF report')
//     } catch (error) {
//       console.error('Error downloading PDF:', error)
//       toast.error('Failed to download PDF report')
//     }
//   }

//   const handleDownloadExcel = () => {
//     try {
//       if (!data) return;
      
//       // Create product data with detailed information
//       const productsData = data.products.map(item => ({
//         'Order Number': item.order__order_number,
//         'Order Date': format(new Date(item.order__created_at), "dd-MM-yyyy"),
//         'Product Name': item.product_name,
//         'Category': item.variant__product__category__name,
//         'Status': item.status,
//         'Quantity': item.quantity,
//         'Original Price': item.original_price,
//         'Discount Amount': item.discount_amount,
//         'Final Price': item.final_price,
//         'Coupon %': item.coupon_percentage || '',
//         'Coupon Code': item.coupon_code || '',
//         'Refund Amount': item.refund_amount || '',
//         'Refund Processed': item.refund_processed ? 'Yes' : 'No',
//         'Cancelled/Returned Date': item.cancelled_at ? 
//           format(new Date(item.cancelled_at), "dd-MM-yyyy") : 
//           (item.returned_at ? format(new Date(item.returned_at), "dd-MM-yyyy") : '')
//       }))

//       // Create workbook and sheets
//       const wb = XLSX.utils.book_new()
      
//       // Summary sheet
//       const summaryData = [
//         ['Sales Report'],
//         [''],
//         ['Report Type:', reportType.charAt(0).toUpperCase() + reportType.slice(1)],
//         ['Period:', data.report_period.start_date + ' to ' + data.report_period.end_date],
//         ['Generated Date:', format(new Date(), "dd-MM-yyyy")],
//         [''],
//         ['SUMMARY'],
//         ['Total Original Price', data.original_total],
//         ['Total Discount', data.total_discount],
//         ['Total Orders', data.total_orders],
//         ['Total Sales', data.total_sales],
//         ['Total Cancelled', data.total_cancelled],
//         ['Total Refunded', data.total_refunded],
//         ['Net Sales', data.net_sales],
//       ]
      
//       const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
//       XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')
      
//       // Products sheet
//       const productsWs = XLSX.utils.json_to_sheet(productsData)
//       XLSX.utils.book_append_sheet(wb, productsWs, 'Products')
      
//       // Payment methods sheet if available
//       if (data.payment_methods && data.payment_methods.length > 0) {
//         const paymentData = data.payment_methods.map(pm => ({
//           'Payment Method': pm.payment_method,
//           'Count': pm.count,
//           'Total': pm.total
//         }))
//         const paymentWs = XLSX.utils.json_to_sheet(paymentData)
//         XLSX.utils.book_append_sheet(wb, paymentWs, 'Payment Methods')
//       }
      
//       // Write and save
//       const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
//       const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
//       saveAs(blob, `sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
      
//       toast.success('Successfully downloaded Excel report')
//     } catch (error) {
//       console.error('Error downloading Excel:', error)
//       toast.error('Failed to download Excel report')
//     }
//   }

//   const getStatusBadge = (status) => {
//     switch(status) {
//       case 'active':
//         return <Badge className="bg-green-100 text-green-800">Active</Badge>
//       case 'cancelled':
//         return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
//       case 'returned':
//         return <Badge className="bg-yellow-100 text-yellow-800">Returned</Badge>
//       default:
//         return <Badge>{status}</Badge>
//     }
//   }

//   if (isLoading) return <div className="ml-64 p-4">Loading...</div>
//   if (error) return <div className="ml-64 p-4">Error: {error.message}</div>

//   return (
//     <div className="ml-64 p-4 max-w-7xl admin-order-management content1">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Sales Report</h1>
//         <div className="space-x-2">
//           <Button variant="outline" onClick={handlePrint}>
//             <Printer className="h-4 w-4 mr-2" />
//             Print
//           </Button>
//           <Button variant="outline" onClick={handleDownloadPDF}>
//             <Download className="h-4 w-4 mr-2" />
//             PDF
//           </Button>
//           <Button variant="outline" onClick={handleDownloadExcel}>
//             <Download className="h-4 w-4 mr-2" />
//             Excel
//           </Button>
//         </div>
//       </div>

//       <div className="flex space-x-4 mb-6">
//         <Select value={reportType} onValueChange={setReportType}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Select report type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="daily">Daily</SelectItem>
//             <SelectItem value="weekly">Weekly</SelectItem>
//             <SelectItem value="monthly">Monthly</SelectItem>
//             <SelectItem value="yearly">Yearly</SelectItem>
//             <SelectItem value="custom">Custom</SelectItem>
//           </SelectContent>
//         </Select>

//         {reportType === "custom" && (
//           <>
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className={`w-[280px] justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
//                 >
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
//               </PopoverContent>
//             </Popover>

//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button
//                   variant="outline"
//                   className={`w-[280px] justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
//                 >
//                   <CalendarIcon className="mr-2 h-4 w-4" />
//                   {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0">
//                 <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
//               </PopoverContent>
//             </Popover>
//           </>
//         )}
//       </div>

//       {data && (
//         <div id="report-content" className="bg-white p-8 rounded-lg shadow-lg">
//           <div className="text-center mb-6">
//             <img src={logo} alt="Logo" className="mx-auto h-16 mb-2" />
//             <h2 className="text-xl font-bold">Sales Report</h2>
//             <p className="text-sm text-gray-600">1st Floor Rabby Tower, Kannur, 670001</p>
//           </div>

//           <div className="flex justify-between mb-6">
//             <div>
//               <h3 className="font-semibold">Report Details</h3>
//               <p className="text-sm text-gray-600">
//                 Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
//               </p>
//               <p className="text-sm text-gray-600">
//                 Period: {data.report_period ? 
//                   `${data.report_period.start_date} to ${data.report_period.end_date}` : 
//                   reportType}
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-600">
//                 <strong>Generated Date:</strong> {format(new Date(), "dd.MM.yyyy")}
//               </p>
//             </div>
//           </div>

//           <Tabs defaultValue="summary" className="mb-6" onValueChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-4">
//               <TabsTrigger value="summary">Summary</TabsTrigger>
//               <TabsTrigger value="details">Detailed Orders</TabsTrigger>
//               <TabsTrigger value="payment">Payment Methods</TabsTrigger>
//               <TabsTrigger value="trends">Trends</TabsTrigger>
//             </TabsList>
            
//             <TabsContent value="summary" className="mt-4">
//               <div className="grid grid-cols-4 gap-4 mb-6">
//                 <Card>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">{data.total_orders}</div>
//                   </CardContent>
//                 </Card>
                
//                 <Card>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm font-medium">Original Total</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">₹{data.original_total?.toFixed(2)}</div>
//                   </CardContent>
//                 </Card>
                
//                 <Card>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">₹{data.total_discount?.toFixed(2)}</div>
//                     <p className="text-xs text-muted-foreground">
//                       {((data.total_discount / data.original_total) * 100).toFixed(1)}% of sales
//                     </p>
//                   </CardContent>
//                 </Card>
                
//                 <Card>
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm font-medium">Final Sales</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="text-2xl font-bold">₹{data.total_sales?.toFixed(2)}</div>
//                   </CardContent>
//                 </Card>
                
//                 <Card className="col-span-2">
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-center gap-4">
//                       <AlertTriangle className="h-8 w-8 text-yellow-500" />
//                       <div>
//                         <div className="text-2xl font-bold">₹{data.total_cancelled?.toFixed(2)}</div>
//                         <p className="text-xs text-muted-foreground">
//                           {((data.total_cancelled / data.total_sales) * 100).toFixed(1)}% of total sales
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
                
//                 <Card className="col-span-2">
//                   <CardHeader className="pb-2">
//                     <CardTitle className="text-sm font-medium">Net Sales (After Refunds)</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="flex items-center gap-4">
//                       <TrendingUp className="h-8 w-8 text-green-500" />
//                       <div>
//                         <div className="text-2xl font-bold">₹{data.net_sales?.toFixed(2)}</div>
//                         <p className="text-xs text-muted-foreground">
//                           Total refunded: ₹{data.total_refunded?.toFixed(2)}
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
              
//               <h3 className="text-lg font-bold mb-3">Top Selling Products</h3>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead className="w-12">Sl No.</TableHead>
//                     <TableHead>Product Name</TableHead>
//                     <TableHead>Category</TableHead>
//                     <TableHead className="text-right">Total Sales</TableHead>
//                     <TableHead className="text-right">Quantity</TableHead>
//                     <TableHead className="text-right">Status</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {data.products.slice(0, 10).map((product, index) => (
//                     <TableRow key={index} className={product.status === 'cancelled' ? "line-through opacity-70" : ""}>
//                       <TableCell>{index + 1}</TableCell>
//                       <TableCell>{product.product_name}</TableCell>
//                       <TableCell>{product.variant__product__category__name}</TableCell>
//                       <TableCell className="text-right">₹{product.final_price.toFixed(2)}</TableCell>
//                       <TableCell className="text-right">{product.quantity}</TableCell>
//                       <TableCell className="text-right">{getStatusBadge(product.status)}</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TabsContent>
            
//             <TabsContent value="details" className="mt-4">
//               <div className="rounded-md border">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Order #</TableHead>
//                       <TableHead>Date</TableHead>
//                       <TableHead>Product</TableHead>
//                       <TableHead>Category</TableHead>
//                       <TableHead>Quantity</TableHead>
//                       <TableHead>Original Price</TableHead>
//                       <TableHead>Discount</TableHead>
//                       <TableHead>Coupon</TableHead>
//                       <TableHead>Final Price</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Refund</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {data.products.map((item, index) => (
//                       <TableRow 
//                         key={index} 
//                         className={item.status !== 'active' ? "bg-gray-50" : ""}
//                       >
//                         <TableCell className="font-mono text-xs">{item.order__order_number}</TableCell>
//                         <TableCell className="whitespace-nowrap">
//                           {format(new Date(item.order__created_at), "dd-MM-yyyy")}
//                         </TableCell>
//                         <TableCell className={item.status === 'cancelled' ? "line-through" : ""}>
//                           {item.product_name}
//                         </TableCell>
//                         <TableCell>{item.variant__product__category__name}</TableCell>
//                         <TableCell className="text-center">{item.quantity}</TableCell>
//                         <TableCell className="text-right">₹{item.original_price.toFixed(2)}</TableCell>
//                         <TableCell className="text-right">
//                           {item.discount_amount > 0 ? 
//                             `₹${item.discount_amount.toFixed(2)}` : 
//                             "-"}
//                         </TableCell>
//                         <TableCell>
//                           {item.coupon_code ? 
//                             <span className="text-xs">
//                               {item.coupon_code} ({item.coupon_percentage}%)
//                             </span> : 
//                             "-"}
//                         </TableCell>
//                         <TableCell className="text-right font-medium">
//                           ₹{item.final_price.toFixed(2)}
//                         </TableCell>
//                         <TableCell>{getStatusBadge(item.status)}</TableCell>
//                         <TableCell>
//                           {item.refund_amount ? 
//                             <span className="text-xs text-red-600 font-medium">
//                               -₹{item.refund_amount.toFixed(2)}
//                               {!item.refund_processed && <span> (pending)</span>}
//                             </span> : 
//                             "-"}
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </TabsContent>
            
//             <TabsContent value="payment" className="mt-4">
//               {data.payment_methods && data.payment_methods.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   {data.payment_methods.map((method, index) => (
//                     <Card key={index}>
//                       <CardHeader className="pb-2">
//                         <CardTitle className="flex items-center gap-2">
//                           <CreditCard className="h-4 w-4" />
//                           {method.payment_method.toUpperCase()}
//                         </CardTitle>
//                         <CardDescription>
//                           {method.count} orders
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent>
//                         <div className="text-2xl font-bold">₹{method.total.toFixed(2)}</div>
//                         <p className="text-xs text-muted-foreground">
//                           {((method.total / data.total_sales) * 100).toFixed(1)}% of total sales
//                         </p>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-muted-foreground">
//                   No payment method data available
//                 </div>
//               )}
//             </TabsContent>
            
//             <TabsContent value="trends" className="mt-4">
//               {data.daily_trend && data.daily_trend.length > 0 ? (
//                 <div className="rounded-md border">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Date</TableHead>
//                         <TableHead className="text-right">Orders</TableHead>
//                         <TableHead className="text-right">Sales Amount</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {data.daily_trend.map((day, index) => (
//                         <TableRow key={index}>
//                           <TableCell>{format(new Date(day.date), "dd-MM-yyyy")}</TableCell>
//                           <TableCell className="text-right">{day.count}</TableCell>
//                           <TableCell className="text-right font-medium">₹{day.total.toFixed(2)}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-muted-foreground">
//                   No trend data available
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>
//       )}
//     </div>
//   )
// }

// export default SalesReport


"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Printer, Download, AlertTriangle, TrendingUp, CreditCard } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip"
import logo from "../../../assets/logo.png"
import adminAxiosInstance from "../../../adminaxiosconfig"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { useQuery } from "@tanstack/react-query"

const SalesReport = () => {
  const [reportType, setReportType] = useState("daily")
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()
  const [activeTab, setActiveTab] = useState("summary")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 18

  const { data, isLoading, error } = useQuery({
    queryKey: ["salesReport", { reportType, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { start_date: format(startDate, "yyyy-MM-dd") }),
        ...(endDate && { end_date: format(endDate, "yyyy-MM-dd") }),
      })
      const response = await adminAxiosInstance.get(`/orders/sales-report/generate?${params}`)
      console.log("sales report", response.data)
      return response.data
    },
    enabled: reportType === "custom" ? !!(startDate && endDate) : true,
  })

  // Pagination logic
  const [paginatedProducts, setPaginatedProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (data?.products) {
      const total = Math.ceil(data.products.length / itemsPerPage)
      setTotalPages(total)

      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setPaginatedProducts(data.products.slice(startIndex, endIndex))
    }
  }, [data, currentPage])

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePrint = () => {
    const printContent = document.getElementById("report-content")
    const printWindow = window.open("", "_blank")
    printWindow.document.write("<html><head><title>Sales Report</title>")

    // Add custom styles to fix the gray background issue
    printWindow.document.write(`
      <style>
        body { background-color: white !important; color: black; }
        table { background-color: white !important; }
        .bg-white { background-color: white !important; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          * { background-color: white !important; }
        }
      </style>
    `)

    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((style) => {
      printWindow.document.write(style.outerHTML)
    })

    printWindow.document.write("</head><body>")
    printWindow.document.write(printContent.innerHTML)
    printWindow.document.write("</body></html>")
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  // const handleDownloadPDF = async () => {
  //   try {
  //     const element = document.getElementById("report-content")

  //     // Apply white background to fix the gray background issue
  //     const originalBackground = element.style.background
  //     element.style.background = "white"

  //     const canvas = await html2canvas(element, {
  //       scale: 1,
  //       backgroundColor: "#ffffff",
  //       useCORS: true,
  //       logging: false,
  //     })

  //     // Restore original background
  //     element.style.background = originalBackground

  //     const imgData = canvas.toDataURL("image/png")

  //     const pdf = new jsPDF("p", "mm", "a4")
  //     const imgProps = pdf.getImageProperties(imgData)
  //     const pdfWidth = pdf.internal.pageSize.getWidth()
  //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

  //     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
  //     pdf.save(`sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.pdf`)

  //     toast.success("Successfully downloaded PDF report")
  //   } catch (error) {
  //     console.error("Error downloading PDF:", error)
  //     toast.error("Failed to download PDF report")
  //   }
  // }
  const handleDownloadPDF = async () => {
        try {
          const element = document.getElementById('report-content')
          const canvas = await html2canvas(element)
          const imgData = canvas.toDataURL('image/png')
          
          const pdf = new jsPDF('p', 'mm', 'a4')
          const imgProps = pdf.getImageProperties(imgData)
          const pdfWidth = pdf.internal.pageSize.getWidth()
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
          pdf.save(`sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.pdf`)
          
          toast.success('Successfully downloaded PDF report')
        } catch (error) {
          console.error('Error downloading PDF:', error)
          toast.error('Failed to download PDF report')
        }
      }

  const handleDownloadExcel = () => {
    try {
      if (!data) return

      // Create product data with detailed information
      const productsData = data.products.map((item) => ({
        "Order Number": item.order__order_number,
        "Order Date": format(new Date(item.order__created_at), "dd-MM-yyyy"),
        "Product Name": item.product_name,
        Category: item.variant__product__category__name,
        "Order Status": item.status,
        "Payment Status": getPaymentStatusFromOrderStatus(item.status, item.refund_processed),
        Quantity: item.quantity,
        "Original Price": item.original_price,
        "Discount Amount": item.discount_amount,
        "Final Price": item.final_price,
        "Coupon %": item.coupon_percentage || "",
        "Coupon Code": item.coupon_code || "",
        "Refund Amount": item.refund_amount || "",
        "Refund Processed": item.refund_processed ? "Yes" : "No",
        "Cancelled/Returned Date": item.cancelled_at
          ? format(new Date(item.cancelled_at), "dd-MM-yyyy")
          : item.returned_at
            ? format(new Date(item.returned_at), "dd-MM-yyyy")
            : "",
      }))

      // Create workbook and sheets
      const wb = XLSX.utils.book_new()

      // Summary sheet
      const summaryData = [
        ["Sales Report"],
        [""],
        ["Report Type:", reportType.charAt(0).toUpperCase() + reportType.slice(1)],
        ["Period:", data.report_period.start_date + " to " + data.report_period.end_date],
        ["Generated Date:", format(new Date(), "dd-MM-yyyy")],
        [""],
        ["SUMMARY"],
        ["Total Original Price", data.original_total],
        ["Total Discount", data.total_discount],
        ["Total Orders", data.total_orders],
        ["Total Sales", data.total_sales],
        ["Total Cancelled", data.total_cancelled],
        ["Total Refunded", data.total_refunded],
        ["Net Sales", data.net_sales],
      ]

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, summaryWs, "Summary")

      // Products sheet
      const productsWs = XLSX.utils.json_to_sheet(productsData)
      XLSX.utils.book_append_sheet(wb, productsWs, "Products")

      // Payment methods sheet if available
      if (data.payment_methods && data.payment_methods.length > 0) {
        const paymentData = data.payment_methods.map((pm) => ({
          "Payment Method": pm.payment_method,
          Count: pm.count,
          Total: pm.total,
        }))
        const paymentWs = XLSX.utils.json_to_sheet(paymentData)
        XLSX.utils.book_append_sheet(wb, paymentWs, "Payment Methods")
      }

      // Write and save
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      saveAs(blob, `sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.xlsx`)

      toast.success("Successfully downloaded Excel report")
    } catch (error) {
      console.error("Error downloading Excel:", error)
      toast.error("Failed to download Excel report")
    }
  }

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "returned":
        return <Badge className="bg-yellow-100 text-yellow-800">Returned</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status, refundProcessed) => {
    if (status === "cancelled" && refundProcessed) {
      return <Badge className="bg-purple-100 text-purple-800">Refunded</Badge>
    } else if (status === "cancelled" && !refundProcessed) {
      return <Badge className="bg-orange-100 text-orange-800">Pending Refund</Badge>
    } else if (status === "returned" && refundProcessed) {
      return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>
    } else if (status === "active") {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    }
    return <Badge>{status}</Badge>
  }

  const getPaymentStatusFromOrderStatus = (status, refundProcessed) => {
    if (status === "cancelled" && refundProcessed) {
      return "Refunded"
    } else if (status === "cancelled" && !refundProcessed) {
      return "Pending Refund"
    } else if (status === "returned" && refundProcessed) {
      return "Refunded"
    } else if (status === "active") {
      return "Completed"
    }
    return status
  }

  if (isLoading) return <div className="ml-64 p-4">Loading...</div>
  if (error) return <div className="ml-64 p-4">Error: {error.message}</div>

  return (
    <div className="ml-64 p-4 max-w-7xl admin-order-management content1">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <div className="space-x-2">
          {/* <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button> */}
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleDownloadExcel}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {reportType === "custom" && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[280px] justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[280px] justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>

      {data && (
        <div id="report-content" className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <img src={logo || "/placeholder.svg"} alt="Logo" className="mx-auto h-16 mb-2" />
            <h2 className="text-xl font-bold">Sales Report</h2>
            <p className="text-sm text-gray-600">1st Floor Rabby Tower, Kannur, 670001</p>
          </div>

          <div className="flex justify-between mb-6">
            <div>
              <h3 className="font-semibold">Report Details</h3>
              <p className="text-sm text-gray-600">Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
              <p className="text-sm text-gray-600">
                Period:{" "}
                {data.report_period ? `${data.report_period.start_date} to ${data.report_period.end_date}` : reportType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                <strong>Generated Date:</strong> {format(new Date(), "dd.MM.yyyy")}
              </p>
            </div>
          </div>

          <Tabs defaultValue="summary" className="mb-6" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Detailed Orders</TabsTrigger>
              <TabsTrigger value="payment">Payment Methods</TabsTrigger>
              <TabsTrigger value="trends">Trending Sales</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.total_orders}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Original Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{data.original_total?.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{data.total_discount?.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {((data.total_discount / data.original_total) * 100).toFixed(1)}% of sales
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Final Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{data.total_sales?.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="h-8 w-8 text-yellow-500" />
                      <div>
                        <div className="text-2xl font-bold">₹{data.total_cancelled?.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                          {((data.total_cancelled / data.total_sales) * 100).toFixed(1)}% of total sales
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Net Sales (After Refunds)</CardTitle>
                    <CardDescription>Total refunded: ₹{data.total_refunded?.toFixed(2)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <TrendingUp className="h-8 w-8 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">₹{data.net_sales?.toFixed(2)}</div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-blue-600 underline cursor-help">How is this calculated?</p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Net Sales = Total Sales - Total Refunded</p>
                              <p>
                                Only items with status 'cancelled' or 'returned' AND refund_processed=true are counted
                                in refunds.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-lg font-bold mb-3">Recently Sold Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Sl No.</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    {/* <TableHead>Order Status</TableHead> */}
                    <TableHead>Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.products.slice(0, 10).map((product, index) => (
                    <TableRow key={index} className={product.status === "cancelled" ? "opacity-70" : ""}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className={product.status === "cancelled" ? "line-through" : ""}>
                        {product.product_name}
                      </TableCell>
                      <TableCell>{product.variant__product__category__name}</TableCell>
                      <TableCell className="text-right">₹{product.final_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      {/* <TableCell>{getOrderStatusBadge(product.status)}</TableCell> */}
                      <TableCell>{getPaymentStatusBadge(product.status, product.refund_processed)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Original Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Coupon</TableHead>
                      <TableHead>Final Price</TableHead>
                      {/* <TableHead>Order Status</TableHead> */}
                      <TableHead>Payment Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((item, index) => (
                      <TableRow key={index} className={item.status !== "active" ? "bg-gray-50" : ""}>
                        <TableCell className="font-mono text-xs">{item.order__order_number}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(item.order__created_at), "dd-MM-yyyy")}
                        </TableCell>
                        <TableCell className={item.status === "cancelled" ? "line-through" : ""}>
                          {item.product_name}
                        </TableCell>
                        <TableCell>{item.variant__product__category__name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">₹{item.original_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          {item.discount_amount > 0 ? `₹${item.discount_amount.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell>
                          {item.coupon_code ? (
                            <span className="text-xs">
                              {item.coupon_code} ({item.coupon_percentage}%)
                            </span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{item.final_price.toFixed(2)}</TableCell>
                        {/* <TableCell>{getOrderStatusBadge(item.status)}</TableCell> */}
                        <TableCell>{getPaymentStatusBadge(item.status, item.refund_processed)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </TabsContent>

            <TabsContent value="payment" className="mt-4">
              {data.payment_methods && data.payment_methods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.payment_methods.map((method, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {method.payment_method.toUpperCase()}
                        </CardTitle>
                        <CardDescription>{method.count} orders</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">₹{method.total.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                          {((method.total / data.total_sales) * 100).toFixed(1)}% of total sales
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No payment method data available</div>
              )}
            </TabsContent>

            <TabsContent value="trends" className="mt-4">
              {/* <div className="bg-gray-50 p-4 mb-4 rounded-md border">
                <h3 className="font-semibold mb-2">How Trending Sales are Calculated</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Trending sales show the daily sales pattern over the selected period. The calculation includes:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  <li>
                    <strong>Total Sales:</strong> Sum of final_total for all orders in the period
                  </li>
                  <li>
                    <strong>Cancelled Items:</strong> Sum of final_price for items with status='cancelled'
                  </li>
                  <li>
                    <strong>Refunded Amount:</strong> Sum of refund_amount for items with status in ['cancelled',
                    'returned'] AND refund_processed=true
                  </li>
                  <li>
                    <strong>Net Sales:</strong> Total Sales - Total Refunded
                  </li>
                </ul>
              </div> */}

              {data.daily_trend && data.daily_trend.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Sales Amount</TableHead>
                        <TableHead className="text-right">After Refunds</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.daily_trend.map((day, index) => (
                        <TableRow key={index}>
                          <TableCell>{format(new Date(day.date), "dd-MM-yyyy")}</TableCell>
                          <TableCell className="text-right">{day.count}</TableCell>
                          <TableCell className="text-right">₹{day.total.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ₹{(day.total - (day.refunded || 0)).toFixed(2)}
                            {day.refunded > 0 && (
                              <span className="text-xs text-red-600 ml-1">(-₹{day.refunded.toFixed(2)})</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No trend data available</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}

export default SalesReport

