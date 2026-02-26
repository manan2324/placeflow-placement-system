"use client"
import { useEffect, useState } from "react"
import AdminLayout from "@/components/layouts/AdminLayout"
import Card from "@/components/ui/Card"
import Table from "@/components/ui/Table"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { getApplicationLogs } from "@/services/admin.service"
import { formatDateTime, formatDate } from "@/utils/date"

export default function ApplicationLogsPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState("ALL")
  const [selectedYear, setSelectedYear] = useState("ALL")

  // Extract year from log's changedAt date
  const getLogYear = (changedAt) => {
    if (!changedAt) return null
    const date = new Date(changedAt)
    return date.getFullYear()
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await getApplicationLogs()
      setLogs(res.data || [])
    } catch (err) {
      console.error("Failed to fetch application logs:", err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique branches from logs
  const branches = ["ALL", ...new Set(
    logs
      .map(log => log.application?.student?.branch)
      .filter(Boolean)
  )]

  // Get unique years from logs
  const years = ["ALL", ...new Set(
    logs
      .map(log => getLogYear(log.changedAt))
      .filter(year => year !== null)
      .sort((a, b) => b - a) // Sort in descending order (newest first)
  )]

  // Filter logs based on selected branch and year
  const filteredLogs = logs.filter(log => {
    const logBranch = log.application?.student?.branch
    const matchesBranch = selectedBranch === "ALL" || logBranch === selectedBranch
    
    const logYear = getLogYear(log.changedAt)
    const matchesYear = selectedYear === "ALL" || logYear === parseInt(selectedYear, 10)
    
    return matchesBranch && matchesYear
  })

  const statusVariant = (status) => {
    switch (status) {
      case "APPLIED":
        return "info"
      case "SHORTLISTED":
        return "warning"
      case "SELECTED":
        return "success"
      case "REJECTED":
        return "danger"
      default:
        return "default"
    }
  }

  const columns = [
    {
      key: "changedAt",
      label: "Date & Time",
      render: (row) => formatDateTime(row.changedAt)
    },
    {
      key: "student",
      label: "Student",
      render: (row) => (
        <div className="min-w-37.5">
          <div className="font-medium text-gray-900">
            {row.application?.student?.user?.name || "—"}
          </div>
          <div className="text-xs text-gray-500">
            {row.application?.student?.enrollmentNumber || "—"}
          </div>
          <div className="text-xs text-gray-500">
            {row.application?.student?.branch || "—"} • {row.application?.student?.mobileNumber || "—"}
          </div>
        </div>
      )
    },
    {
      key: "company",
      label: "Company",
      render: (row) => (
        <div className="min-w-37.5">
          <div className="font-medium text-gray-900">
            {row.application?.company?.name || "—"}
          </div>
          <div className="text-xs text-gray-500">
            {row.application?.company?.role || "—"}
          </div>
        </div>
      )
    },
    {
      key: "statusChange",
      label: "Status Change",
      render: (row) => (
        <div className="flex items-center gap-2 min-w-50">
          <Badge variant={statusVariant(row.oldStatus)}>
            {row.oldStatus}
          </Badge>
          <span className="text-gray-400">→</span>
          <Badge variant={statusVariant(row.newStatus)}>
            {row.newStatus}
          </Badge>
        </div>
      )
    },
    {
      key: "changedBy",
      label: "Changed By",
      render: (row) => (
        <div className="min-w-37.5">
          <div className="font-medium text-gray-900">
            {row.changedBy?.name || "—"}
          </div>
          <div className="text-xs text-gray-500">
            {row.changedBy?.email || "—"}
          </div>
        </div>
      )
    },
    {
      key: "remark",
      label: "Remark",
      render: (row) => (
        <div className="max-w-50 truncate" title={row.remark || ""}>
          {row.remark || "—"}
        </div>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Application Logs</h1>
            <p className="text-xs sm:text-base text-gray-600 mt-1">Track all application status changes</p>
          </div>
          <Button
            variant="primary"
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 bg-indigo-600 text-white hover:bg-indigo-700"
            onClick={fetchLogs}
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Branch Filter */}
            <div className="space-y-2">
              <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700">
                Filter by Branch
              </label>
              <select
                id="branch-filter"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
              >
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch} ({branch === "ALL" ? logs.length : logs.filter(l => l.application?.student?.branch === branch).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="space-y-2">
              <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">
                Filter by Year
              </label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year} ({year === "ALL" ? logs.length : logs.filter(l => getLogYear(l.changedAt) === year).length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <Card 
          title="Application Status History" 
          subtitle={`${filteredLogs.length} log${filteredLogs.length !== 1 ? 's' : ''} ${
            selectedBranch !== "ALL" || selectedYear !== "ALL" 
              ? `(${selectedBranch !== "ALL" ? selectedBranch : 'All Branches'}${selectedYear !== "ALL" ? `, ${selectedYear}` : ''})` 
              : 'found'
          }`}
        >
          {/* Mobile view - Card list */}
          <div className="block lg:hidden space-y-3">
            {loading ? (
              <div className="space-y-2 py-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse border border-gray-100 rounded-lg p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  No application logs found with the selected filters
                </p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {log.application?.student?.user?.name || "—"}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {log.application?.student?.enrollmentNumber || "—"} • {log.application?.student?.branch || "—"}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {log.application?.student?.mobileNumber || "—"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(log.changedAt)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Company:</span> {log.application?.company?.name || "—"}
                    </p>
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Role:</span> {log.application?.company?.role || "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <Badge variant={statusVariant(log.oldStatus)} className="text-xs">
                      {log.oldStatus}
                    </Badge>
                    <span className="text-gray-400">→</span>
                    <Badge variant={statusVariant(log.newStatus)} className="text-xs">
                      {log.newStatus}
                    </Badge>
                  </div>

                  <div className="pt-1 space-y-1">
                    <p className="text-xs text-gray-700">
                      <span className="font-medium">Changed by:</span> {log.changedBy?.name || "—"}
                    </p>
                    {log.remark && (
                      <p className="text-xs text-gray-600 italic">
                        <span className="font-medium">Remark:</span> {log.remark}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table columns={columns} data={filteredLogs} loading={loading} />
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
