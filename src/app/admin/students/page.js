"use client"
import { useEffect, useState } from "react"
import AdminLayout from "@/components/layouts/AdminLayout"
import Card from "@/components/ui/Card"
import Table from "@/components/ui/Table"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Link from "next/link"
import { getStudents, deleteStudent } from "@/services/admin.service"

export default function AdminStudentsPage() {
	const [students, setStudents] = useState([])
	const [loading, setLoading] = useState(true)
	const [deleteModal, setDeleteModal] = useState({ open: false, student: null })
	const [password, setPassword] = useState("")
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState("")

	useEffect(() => {
		fetchStudents()
	}, [])

	const fetchStudents = async () => {
		try {
			const res = await getStudents()
			setStudents(res.data || [])
		} catch (err) {
			console.error("Failed to fetch students:", err)
		} finally {
			setLoading(false)
		}
	}

	const handleDeleteClick = (student) => {
		setDeleteModal({ open: true, student })
		setPassword("")
		setError("")
	}

	const handleDeleteConfirm = async () => {
		if (!password.trim()) {
			setError("Password is required")
			return
		}

		setDeleting(true)
		setError("")

		try {
			await deleteStudent(deleteModal.student._id, password)
			alert("Student deleted successfully!")
			setDeleteModal({ open: false, student: null })
			setPassword("")
			fetchStudents() // Refresh the list
		} catch (err) {
			const errorMsg = err.response?.data?.message || "Failed to delete student"
			setError(errorMsg)
		} finally {
			setDeleting(false)
		}
	}

	const handleDeleteCancel = () => {
		setDeleteModal({ open: false, student: null })
		setPassword("")
		setError("")
	}

	const columns = [
		{ key: "name", label: "Name", render: (row) => row.user?.name || "—" },
		{ key: "email", label: "Email", render: (row) => row.user?.email || "—" },
		{ key: "enrollmentNumber", label: "Enrollment" },
		{ key: "branch", label: "Branch" },
		{ key: "cgpa", label: "CGPA", render: (row) => typeof row.cgpa === "number" ? row.cgpa.toFixed(2) : "—" },
		{ key: "backlogCount", label: "Backlog Count", render: (row) => (
			<Badge variant={row.backlogCount > 0 ? "danger" : "success"}>
				{row.backlogCount ?? 0}
			</Badge>
		) },
		{ key: "resume", label: "Resume", render: (row) => (
			row.resumeUrl ? (
				<Link href={row.resumeUrl} target="_blank" className="text-indigo-600 hover:underline">View</Link>
			) : (
				"—"
			)
		) },
		{ key: "resumeUpdatedAt", label: "Resume Updated", render: (row) => (
			row.resumeUpdatedAt ? new Date(row.resumeUpdatedAt).toLocaleString() : "—"
		) },
		{ key: "createdAt", label: "Created", render: (row) => (
			row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—"
		) },
		{ key: "actions", label: "Actions", render: (row) => (
			<Button
				variant="danger"
				className="text-xs py-1 px-2"
				onClick={() => handleDeleteClick(row)}
			>
				Delete
			</Button>
		) },
	]

	return (
		<AdminLayout>
			<div className="space-y-4 sm:space-y-6 animate-fade-in">
				<div className="animate-slide-up flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Students</h1>
						<p className="text-sm sm:text-base text-gray-600 mt-1">View all student profiles</p>
					</div>
					<Button
						variant="primary"
						className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 active:scale-95 bg-indigo-600 text-white hover:bg-indigo-700"
						onClick={fetchStudents}
					>
						Refresh
					</Button>
				</div>

				<Card title="Student Directory" subtitle="All registered students">
					{/* Mobile view - Card list */}
					<div className="block lg:hidden space-y-3">
						{loading ? (
							<div className="flex justify-center py-8">
								<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
							</div>
						) : students.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-gray-500 text-sm">No students found</p>
							</div>
						) : (
							students.map((s) => (
								<div key={s._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2">
									<div className="flex items-start justify-between gap-2">
										<div className="min-w-0 flex-1">
											<h3 className="font-semibold text-gray-900 text-sm">{s.user?.name || "—"}</h3>
											<p className="text-xs text-gray-600 mt-0.5">{s.user?.email || "—"}</p>
										</div>
									<Badge variant={s.backlogCount > 0 ? "danger" : "success"}>
										{s.backlogCount > 0 ? `${s.backlogCount} Backlog(s)` : "Clear"}
										</Badge>
									</div>
									<div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
										<p>Enroll: {s.enrollmentNumber}</p>
										<p>Branch: {s.branch}</p>
										<p>CGPA: {typeof s.cgpa === "number" ? s.cgpa.toFixed(2) : "—"}</p>
										<p>Created: {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</p>
									</div>
									<div className="pt-1 flex items-center justify-between">
										{s.resumeUrl ? (
											<Link href={s.resumeUrl} target="_blank" className="text-indigo-600 text-xs hover:underline">View Resume</Link>
										) : (
											<span className="text-xs text-gray-500">No resume</span>
										)}
										<Button
											variant="danger"
											className="text-xs py-1 px-2"
											onClick={() => handleDeleteClick(s)}
										>
											Delete
										</Button>
									</div>
								</div>
							))
						)}
					</div>

					{/* Desktop view - Table */}
					<div className="hidden lg:block overflow-x-auto">
						<Table columns={columns} data={students} loading={loading} />
					</div>
				</Card>
			</div>

			{/* Delete Confirmation Modal */}
			{deleteModal.open && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
						<div>
							<h2 className="text-xl font-bold text-gray-900">Confirm Deletion</h2>
							<p className="text-sm text-gray-600 mt-2">
								You are about to delete student:{" "}
								<span className="font-semibold text-gray-900">
									{deleteModal.student?.user?.name || "Unknown"}
								</span>
							</p>
							<p className="text-sm text-red-600 mt-2 font-medium">
								⚠️ This will permanently delete the student profile, user account, and all associated applications.
							</p>
						</div>

						<div className="space-y-2">
							<label className="block text-sm font-medium text-gray-700">
								Enter your admin password to confirm:
							</label>
							<Input
								type="password"
								placeholder="Your admin password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={deleting}
								className="w-full"
								onKeyDown={(e) => {
									if (e.key === "Enter" && !deleting) {
										handleDeleteConfirm()
									}
								}}
							/>
							{error && (
								<p className="text-sm text-red-600">{error}</p>
							)}
						</div>

						<div className="flex gap-3 pt-2">
							<Button
								variant="secondary"
								className="flex-1"
								onClick={handleDeleteCancel}
								disabled={deleting}
							>
								Cancel
							</Button>
							<Button
								variant="danger"
								className="flex-1"
								onClick={handleDeleteConfirm}
								disabled={deleting}
							>
								{deleting ? "Deleting..." : "Delete Student"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	)
}

