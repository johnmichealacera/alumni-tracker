"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  TrendingUp,
  Search,
  Filter,
  Check,
  X,
  Eye,
  Mail,
  Calendar,
  MapPin
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface DashboardStats {
  totalAlumni: number
  pendingApprovals: number
  employedAlumni: number
  recentRegistrations: number
}

interface AlumniProfile {
  id: string
  firstName: string
  lastName: string
  studentId: string
  course: string
  yearGraduated: number
  phoneNumber?: string
  currentLocation?: string
  isApproved: boolean
  createdAt: string
  user: {
    email: string
  }
  employments: Array<{
    company: string
    position: string
    isCurrent: boolean
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchDashboardData()
    }
  }, [session])

  useEffect(() => {
    filterAlumni()
  }, [alumni, searchTerm, statusFilter, yearFilter])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, alumniResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/alumni")
      ])

      if (statsResponse.ok && alumniResponse.ok) {
        const statsData = await statsResponse.json()
        const alumniData = await alumniResponse.json()
        
        setStats(statsData)
        setAlumni(alumniData)
      } else {
        toast.error("Failed to load dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Error loading dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const filterAlumni = () => {
    let filtered = alumni

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alumni => 
        `${alumni.firstName} ${alumni.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumni.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "approved") {
        filtered = filtered.filter(alumni => alumni.isApproved)
      } else if (statusFilter === "pending") {
        filtered = filtered.filter(alumni => !alumni.isApproved)
      }
    }

    // Year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter(alumni => alumni.yearGraduated.toString() === yearFilter)
    }

    setFilteredAlumni(filtered)
  }

  const handleApproveAlumni = async (alumniId: string) => {
    try {
      const response = await fetch(`/api/admin/alumni/${alumniId}/approve`, {
        method: "POST"
      })

      if (response.ok) {
        toast.success("Alumni profile approved successfully")
        fetchDashboardData()
      } else {
        toast.error("Failed to approve alumni profile")
      }
    } catch (error) {
      console.error("Error approving alumni:", error)
      toast.error("Error approving alumni")
    }
  }

  const handleRejectAlumni = async (alumniId: string) => {
    if (!confirm("Are you sure you want to reject this alumni profile?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/alumni/${alumniId}/reject`, {
        method: "POST"
      })

      if (response.ok) {
        toast.success("Alumni profile rejected")
        fetchDashboardData()
      } else {
        toast.error("Failed to reject alumni profile")
      }
    } catch (error) {
      console.error("Error rejecting alumni:", error)
      toast.error("Error rejecting alumni")
    }
  }

  const getUniqueYears = () => {
    const years = [...new Set(alumni.map(a => a.yearGraduated))].sort((a, b) => b - a)
    return years
  }

  const getCurrentEmployment = (employments: AlumniProfile['employments']) => {
    const current = employments.find(emp => emp.isCurrent)
    return current ? `${current.position} at ${current.company}` : "Not specified"
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to access the admin dashboard.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage alumni profiles, approvals, and system overview</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAlumni}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employed Alumni</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.employedAlumni}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Registrations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentRegistrations}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alumni Management */}
      <Card>
        <CardHeader>
          <CardTitle>Alumni Management</CardTitle>
          <CardDescription>
            Review, approve, and manage alumni profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, student ID, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {getUniqueYears().map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alumni Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumni</TableHead>
                  <TableHead>Course & Year</TableHead>
                  <TableHead>Current Employment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.map((alumni) => (
                  <TableRow key={alumni.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {alumni.firstName} {alumni.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{alumni.user.email}</div>
                        <div className="text-sm text-gray-500">ID: {alumni.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alumni.course}</div>
                        <div className="text-sm text-gray-500">Class of {alumni.yearGraduated}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getCurrentEmployment(alumni.employments)}
                      </div>
                      {alumni.currentLocation && (
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {alumni.currentLocation}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={alumni.isApproved ? "default" : "secondary"}
                        className={alumni.isApproved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                      >
                        {alumni.isApproved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {formatDate(new Date(alumni.createdAt))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!alumni.isApproved && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveAlumni(alumni.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectAlumni(alumni.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAlumni.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No alumni found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
