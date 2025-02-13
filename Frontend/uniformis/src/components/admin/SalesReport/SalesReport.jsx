import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import adminAxiosInstance, { orderApi } from "../../../adminaxiosconfig"

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
      return response.data
    },
    enabled: reportType === 'custom' ? !!(startDate && endDate) : true
  })

  const handleDownload = (format) => {
    // Implement download logic here
    console.log(`Downloading ${format} report`)
  }

  if (isLoading) return <div className="ml-64 p-4">Loading...</div>
  if (error) return <div className="ml-64 p-4">Error: {error.message}</div>

  return (
    <div className="ml-64 p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>

      <div className="flex space-x-4 mb-4">
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
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Total Sales</h2>
              <p className="text-2xl font-bold">₹{data.total_sales.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Total Orders</h2>
              <p className="text-2xl font-bold">{data.total_orders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-2">Total Discount</h2>
              <p className="text-2xl font-bold">₹{data.total_discount.toFixed(2)}</p>
            </div>
          </div>

          <Table>
            <TableCaption>A list of product sales.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Total Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.products.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.product_name}</TableCell>
                  <TableCell>{product.variant__product__category__name}</TableCell>
                  <TableCell>₹{product.total_sales.toFixed(2)}</TableCell>
                  <TableCell>{product.total_orders}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 space-x-4">
            <Button onClick={() => handleDownload("pdf")}>Download PDF</Button>
            <Button onClick={() => handleDownload("excel")}>Download Excel</Button>
          </div>
        </>
      )}
    </div>
  )
}

export default SalesReport