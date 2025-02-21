"use client"

import { useEffect, useState } from "react"
import { FaSearch, FaUserAlt, FaBox, FaShoppingCart, FaSignOutAlt } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import adminAxiosInstance, { orderApi } from "../../../adminaxiosconfig"
import { clearAuthData } from "../../../redux/auth/authSlice"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js"
import { Pie, Line } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title)

const Dashboard = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const [reportType, setReportType] = useState("monthly")
  const [salesData, setSalesData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState([])

  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
  })

  const calculateDashboardStats = (ordersData) => {
    const totalOrders = ordersData.length
    const totalSales = ordersData.reduce((sum, order) => sum + Number.parseFloat(order.final_total || 0), 0)
    const uniqueUsers = new Set(ordersData.map((order) => order.user.id)).size

    return {
      totalOrders,
      totalSales,
      totalUsers: uniqueUsers,
    }
  }

  useEffect(() => {
    fetchDashboardData()
    fetchSalesData()
    fetchRecentOrders()
  }, []) 

  const fetchDashboardData = async () => {
    try {
      const response = await orderApi.get("/")
      console.log("fetchdashboard data ", response.data)
      const stats = calculateDashboardStats(response.data)
      setDashboardStats(stats)
    } catch (error) {
      console.error("Dashboard data fetch error:", error)
      toast.error("Failed to fetch dashboard data")
      setDashboardStats({
        totalUsers: 0,
        totalOrders: 0,
        totalSales: 0,
      })
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const response = await orderApi.get("/")
      console.log("admin recent order api response: ", response.data)
      const sortedOrders = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

      const formattedOrders = sortedOrders.map((order) => ({
        id: order.order_number,
        name: `${order.user.first_name} ${order.user.last_name}`,
        address: order.delivery_address?.city || "N/A",
        amount: Number.parseFloat(order.final_total) || 0,
        date: new Date(order.created_at).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      }))
      setOrders(formattedOrders)
    } catch (error) {
      console.error("Recent orders fetch error:", error)
      toast.error("Failed to fetch recent orders")
      setOrders([])
    }
  }

  const fetchSalesData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch orders data
      const ordersResponse = await orderApi.get("/")
      const orders = ordersResponse.data
  
      // Process orders data for pie chart
      const categoryTotals = orders.reduce((acc, order) => {
        // Process each item in the order
        order.items.forEach(item => {
          const category = item.category.name // Access category name from nested structure
          const salesAmount = Number(item.final_price) // Use final_price for actual sales amount
          
          // Add to category total
          acc[category] = (acc[category] || 0) + salesAmount
        })
        return acc
      }, {})
  
      // Convert the category totals into the format needed for the pie chart
      const pieChartData = Object.entries(categoryTotals).map(([category, sales], index) => ({
        label: category,
        value: sales,
        backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
      }))
  
      console.log('pieChartData', pieChartData)
      setSalesData(pieChartData)
  
      // Process line chart data
      const salesByDate = orders.reduce((acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: reportType === 'monthly' ? 'long' : 'numeric',
          day: reportType === 'daily' ? 'numeric' : undefined
        })
        
        acc[date] = (acc[date] || 0) + Number(order.final_total)
        return acc
      }, {})
  
      // Convert to array and sort by date
      const trendChartData = Object.entries(salesByDate)
        .map(([date, sales]) => ({
          date,
          sales
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
  
      setTrendData(trendChartData)
      setIsLoading(false)
    } catch (error) {
      console.error("Sales data fetch error:", error)
      toast.error("Failed to fetch sales data")
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSalesData()
  }, [reportType]) // Add reportType as dependency to refresh data when filter changes

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales Distribution by Category",
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 20
      },
    },
  }

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: false,
      },
      title: {
        display: true,
        text: "Sales Trend Analysis",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Sales Amount (₹)",
        },
        beginAtZero: true,
      },
    },
  }

  const handleLogout = () => {
    dispatch(clearAuthData())
    navigate("/admin/login")
  }

  

  const filteredOrders = orders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="ml-64 px-6 bg-gray-100 min-h-screen">
      <ToastContainer />
      {/* Top Bar */}
      <div className="bg-white shadow-sm mb-6">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center w-96">
            {/* <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div> */}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUserAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Users</h3>
                <p className="text-2xl font-bold">{dashboardStats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FaBox className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Orders</h3>
                <p className="text-2xl font-bold">{dashboardStats.totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaShoppingCart className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total Sales</h3>
                <p className="text-2xl font-bold">₹{dashboardStats.totalSales.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="mb-6">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Charts Section */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    {/* Pie Chart */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-[400px]">
        {!isLoading && salesData.length > 0 && (
          <Pie
            data={{
              labels: salesData.map(item => item.label),
              datasets: [{
                data: salesData.map(item => item.value),
                backgroundColor: salesData.map(item => item.backgroundColor),
              }],
            }}
            options={pieChartOptions}
          />
        )}
        {!isLoading && salesData.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No sales data available for the selected period</p>
          </div>
        )}
      </div>
    </div>

    {/* Line Chart */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-[400px]">
        {!isLoading && trendData.length > 0 && (
          <Line
            data={{
              labels: trendData.map(item => item.date),
              datasets: [{
                label: "Sales",
                data: trendData.map(item => item.sales),
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
                fill: false,
              }],
            }}
            options={trendChartOptions}
          />
        )}
        {!isLoading && trendData.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No trend data available for the selected period</p>
          </div>
        )}
      </div>
    </div>
  </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.address}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{order.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

