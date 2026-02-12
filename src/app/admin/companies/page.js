"use client"
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '@/components/layouts/AdminLayout'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { getCompanies, updateCompanyStatus } from '@/services/admin.service'

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies()
      setCompanies(res.data)
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseCompany = async (id) => {
    setUpdating(id)
    try {
      await updateCompanyStatus(id)
      toast.success('Company closed successfully!')
      fetchCompanies()
    } catch (error) {
      toast.error('Failed to close company')
    } finally {
      setUpdating(null)
    }
  }

  const statusVariant = (status) => (status === 'OPEN' ? 'success' : 'danger')

  const columns = [
    { key: 'name', label: 'Company Name' },
    { 
      key: 'role',
      label: 'Role'
    },
    { 
      key: 'ctc',
      label: 'CTC',
      render: (row) => (typeof row.ctc === 'number' ? `₹${row.ctc} LPA` : 'N/A')
    },
    {
      key: 'eligibleBranches',
      label: 'Eligible Branches',
      render: (row) => Array.isArray(row.eligibleBranches) ? row.eligibleBranches.join(', ') : '—'
    },
    {
      key: 'minCgpa',
      label: 'Min CGPA',
      render: (row) => (typeof row.minCgpa === 'number' ? row.minCgpa.toFixed(2) : '—')
    },
    {
      key: 'applicationDeadline',
      label: 'Deadline',
      render: (row) => row.applicationDeadline ? new Date(row.applicationDeadline).toLocaleString() : '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(row.status)}>
          {row.status || '—'}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (row) => (
        <Button
          variant="danger"
          className="text-xs py-1 px-2"
          onClick={() => handleCloseCompany(row._id)}
          disabled={updating === row._id || row.status !== 'OPEN' || (row.applicationDeadline && new Date(row.applicationDeadline) <= new Date())}
        >
          {row.status === 'OPEN' ? 'Close' : 'Closed'}
        </Button>
      )
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="animate-slide-up flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Companies</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage company listings</p>
          </div>

          <Link
            href="/admin/companies/create"
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Create Company
          </Link>
        </div>

        <Card title="Company Listings" subtitle="View and manage companies">
          {/* Mobile view - Card list */}
          <div className="block lg:hidden space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No companies found</p>
              </div>
            ) : (
              companies.map((company) => (
                <div key={company._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{company.name}</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Role: {company.role}</p>
                    </div>
                    <Badge variant={statusVariant(company.status)}>
                      {company.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-700">CTC: {typeof company.ctc === 'number' ? `₹${company.ctc} LPA` : 'N/A'}</p>
                  <p className="text-xs text-gray-700">Min CGPA: {typeof company.minCgpa === 'number' ? company.minCgpa.toFixed(2) : '—'}</p>
                  <p className="text-xs text-gray-700">Branches: {Array.isArray(company.eligibleBranches) ? company.eligibleBranches.join(', ') : '—'}</p>
                  <p className="text-xs text-gray-500">Deadline: {company.applicationDeadline ? new Date(company.applicationDeadline).toLocaleString() : '—'}</p>
                  <Button
                    variant="danger"
                    className="text-xs py-1.5 w-full"
                    onClick={() => handleCloseCompany(company._id)}
                    disabled={updating === company._id || company.status !== 'OPEN' || (company.applicationDeadline && new Date(company.applicationDeadline) <= new Date())}
                  >
                    {company.status === 'OPEN' ? 'Close' : 'Closed'}
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Desktop view - Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table columns={columns} data={companies} loading={loading} />
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
