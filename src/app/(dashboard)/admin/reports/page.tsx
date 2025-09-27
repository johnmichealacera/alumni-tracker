"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Briefcase,
  TrendingUp,
  Filter,
  Plus,
  Eye
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

const reportTypes = [
  {
    value: "ALUMNI_STATISTICS",
    label: "Alumni Statistics",
    description: "Complete alumni directory with contact information and employment status",
    icon: Users
  },
  {
    value: "EMPLOYMENT_REPORT", 
    label: "Employment Report",
    description: "Employment statistics, industry breakdown, and top employers",
    icon: Briefcase
  },
  {
    value: "GRADUATION_YEAR_REPORT",
    label: "Graduation Year Report", 
    description: "Alumni statistics grouped by graduation year",
    icon: Calendar
  },
  {
    value: "INDUSTRY_REPORT",
    label: "Industry Report",
    description: "Industry distribution and career progression analysis",
    icon: TrendingUp
  }
]

const courses = [
  "Computer Science",
  "Information Technology",
  "Software Engineering", 
  "Business Administration",
  "Marketing",
  "Finance",
  "Accounting",
  "Engineering",
  "Medicine",
  "Nursing",
  "Education",
  "Psychology",
  "Other"
]

interface Report {
  id: string
  title: string
  description?: string
  type: string
  filters?: any
  generatedBy: string
  filePath?: string
  createdAt: string
}

export default function ReportsPage() {
  const { data: session } = useSession()
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    filters: {
      course: "",
      yearGraduated: "",
      employmentStatus: "",
      location: ""
    }
  })

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchReports()
    }
  }, [session])

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/admin/reports")
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        toast.error("Failed to load reports")
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast.error("Error loading reports")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith("filters.")) {
      const filterField = field.replace("filters.", "")
      setFormData(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          [filterField]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.type) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/admin/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${formData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast.success("Report generated and downloaded successfully")
        setShowCreateForm(false)
        setFormData({
          title: "",
          description: "",
          type: "",
          filters: {
            course: "",
            yearGraduated: "",
            employmentStatus: "",
            location: ""
          }
        })
        fetchReports()
      } else {
        const error = await response.json()
        toast.error("Failed to generate report", {
          description: error.message || "Please try again"
        })
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast.error("Error generating report")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = async (reportId: string, title: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/download`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${title.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        
        toast.success("Report downloaded successfully")
      } else {
        toast.error("Failed to download report")
      }
    } catch (error) {
      console.error("Error downloading report:", error)
      toast.error("Error downloading report")
    }
  }

  const getUniqueYears = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: 50 }, (_, i) => currentYear - i)
  }

  const getReportTypeInfo = (type: string) => {
    return reportTypes.find(rt => rt.value === type)
  }

  if (session?.user?.role !== "ADMIN") {
    return (
      <Alert>
        <AlertDescription>
          You don't have permission to access reports.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and manage alumni reports</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Report Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card key={type.value} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, type: type.value, title: type.label }))
                    setShowCreateForm(true)
                  }}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-sm">{type.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Create Report Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
            <CardDescription>
              Configure your report settings and filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Report Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter report title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Report Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Optional description for this report"
                  rows={2}
                />
              </div>

              {/* Filters */}
              <div>
                <h4 className="font-medium mb-3 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select
                      value={formData.filters.course}
                      onValueChange={(value) => handleInputChange("filters.course", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Courses</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Graduation Year</Label>
                    <Select
                      value={formData.filters.yearGraduated}
                      onValueChange={(value) => handleInputChange("filters.yearGraduated", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Years</SelectItem>
                        {getUniqueYears().map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment">Employment Status</Label>
                    <Select
                      value={formData.filters.employmentStatus}
                      onValueChange={(value) => handleInputChange("filters.employmentStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        <SelectItem value="employed">Currently Employed</SelectItem>
                        <SelectItem value="unemployed">Seeking Opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.filters.location}
                      onChange={(e) => handleInputChange("filters.location", e.target.value)}
                      placeholder="Filter by location"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reports History */}
      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>
            Previously generated reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>No reports generated yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const typeInfo = getReportTypeInfo(report.type)
                return (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {typeInfo && (
                        <typeInfo.icon className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        {report.description && (
                          <p className="text-sm text-gray-600">{report.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-1">
                          <Badge variant="outline">
                            {typeInfo?.label || report.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Generated on {formatDate(new Date(report.createdAt))}
                          </span>
                          <span className="text-xs text-gray-500">
                            by {report.generatedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id, report.title)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
