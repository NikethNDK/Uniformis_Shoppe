import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Printer, Download } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import logo from '../../../assets/logo.png'
import adminAxiosInstance from "../../../adminaxiosconfig"
import { toast } from "react-toastify"
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { useQuery } from "@tanstack/react-query"

const SalesReport = () => {
  const [reportType, setReportType] = useState("daily")
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

  const { data, isLoading, error } = useQuery({
    queryKey: ['salesReport', { reportType, startDate, endDate }],
    queryFn: async () => {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { start_date: format(startDate, "yyyy-MM-dd") }),
        ...(endDate && { end_date: format(endDate, "yyyy-MM-dd") }),
      })
      const response = await adminAxiosInstance.get(`/orders/sales-report/generate?${params}`)
      console.log('sales report',response.data)
      return response.data
    },
    enabled: reportType === 'custom' ? !!(startDate && endDate) : true
  })

  const handlePrint = () => {
    const printContent = document.getElementById('report-content')
    const originalDisplay = printContent.style.display
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write('<html><head><title>Sales Report</title>')
    
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(style => {
      printWindow.document.write(style.outerHTML)
    })
    
    printWindow.document.write('</head><body>')
    printWindow.document.write(printContent.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

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
      const productsData = data.products.map(product => ({
        'Product Name': product.product_name,
        'Category': product.variant__product__category__name,
        'Total Sales': product.total_sales,
        'Total Orders': product.total_orders
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(productsData)
      
      XLSX.utils.sheet_add_aoa(ws, [
        ['Sales Report'],
        ['Report Type:', reportType.charAt(0).toUpperCase() + reportType.slice(1)],
        ['Date:', format(new Date(), "dd.MM.yyyy")],
        ['Period:', reportType === 'custom' 
          ? `${format(startDate, "dd.MM.yyyy")} to ${format(endDate, "dd.MM.yyyy")}`
          : reportType],
        [''],
        ['Summary'],
        ['Total Sales', data.total_sales],
        ['Total Orders', data.total_orders],
        ['Total Discount', data.total_discount],
        [''],
        ['Products List']
      ], { origin: 'A1' })
      
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Report')
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      saveAs(blob, `sales_report_${reportType}_${format(new Date(), "yyyy-MM-dd")}.xlsx`)
      
      toast.success('Successfully downloaded Excel report')
    } catch (error) {
      console.error('Error downloading Excel:', error)
      toast.error('Failed to download Excel report')
    }
  }

  if (isLoading) return <div className="ml-64 p-4">Loading...</div>
  if (error) return <div className="ml-64 p-4">Error: {error.message}</div>

  return (
    <div className="ml-64 p-4 max-w-7xl admin-order-management content1 ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
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
            <img src={logo} alt="Logo" className="mx-auto h-16 mb-2" />
            <p className="text-sm text-gray-600">1st Floor Rabby Tower, Kannur, 670001</p>
          </div>

          <div className="flex justify-between mb-6">
            <div>
              <h3 className="font-semibold">Sales Report</h3>
              <p className="text-sm text-gray-600">
                Type: {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
              </p>
              {reportType === 'custom' && (
                <p className="text-sm text-gray-600">
                  Period: {format(startDate, "dd.MM.yyyy")} - {format(endDate, "dd.MM.yyyy")}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                <strong>Generated Date:</strong> {format(new Date(), "dd.MM.yyyy")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
              <p className="text-2xl font-bold">₹{data.total_sales.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
              <p className="text-2xl font-bold">{data.total_orders}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Total Discount</h2>
              <p className="text-2xl font-bold">₹{data.total_discount.toFixed(2)}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Sl No.</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Total Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.variant__product__category__name}</TableCell>
                  <TableCell className="text-right">₹{product.total_sales.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.total_orders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export default SalesReport