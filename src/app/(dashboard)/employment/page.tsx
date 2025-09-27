"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Building,
  User,
  Save,
  X
} from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

const employmentStatuses = [
  { value: "EMPLOYED", label: "Employed" },
  { value: "UNEMPLOYED", label: "Unemployed" },
  { value: "SEEKING", label: "Seeking Opportunities" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "ENTREPRENEUR", label: "Entrepreneur" },
  { value: "STUDENT", label: "Student" },
]

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Government",
  "Non-profit",
  "Media & Entertainment",
  "Real Estate",
  "Transportation",
  "Energy",
  "Agriculture",
  "Other"
]

interface Employment {
  id: string
  company: string
  position: string
  industry?: string
  location?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  status: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function EmploymentPage() {
  const { data: session } = useSession()
  const [employments, setEmployments] = useState<Employment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployment, setEditingEmployment] = useState<Employment | null>(null)
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    industry: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    status: "EMPLOYED",
    description: "",
  })

  useEffect(() => {
    fetchEmployments()
  }, [])

  const fetchEmployments = async () => {
    try {
      const response = await fetch("/api/employment")
      if (response.ok) {
        const data = await response.json()
        setEmployments(data)
      } else {
        toast.error("Failed to load employment history")
      }
    } catch (error) {
      console.error("Error fetching employments:", error)
      toast.error("Error loading employment history")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear end date if current position
    if (field === "isCurrent" && value === true) {
      setFormData(prev => ({ ...prev, endDate: "" }))
    }
  }

  const resetForm = () => {
    setFormData({
      company: "",
      position: "",
      industry: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      status: "EMPLOYED",
      description: "",
    })
    setEditingEmployment(null)
  }

  const handleOpenDialog = (employment?: Employment) => {
    if (employment) {
      setEditingEmployment(employment)
      setFormData({
        company: employment.company,
        position: employment.position,
        industry: employment.industry || "",
        location: employment.location || "",
        startDate: employment.startDate.split("T")[0],
        endDate: employment.endDate ? employment.endDate.split("T")[0] : "",
        isCurrent: employment.isCurrent,
        status: employment.status,
        description: employment.description || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.company || !formData.position || !formData.startDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const url = editingEmployment 
        ? `/api/employment/${editingEmployment.id}`
        : "/api/employment"
      
      const method = editingEmployment ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        }),
      })

      if (response.ok) {
        toast.success(
          editingEmployment 
            ? "Employment updated successfully" 
            : "Employment added successfully"
        )
        fetchEmployments()
        handleCloseDialog()
      } else {
        const error = await response.json()
        toast.error("Failed to save employment", {
          description: error.message || "Please try again"
        })
      }
    } catch (error) {
      console.error("Error saving employment:", error)
      toast.error("Error saving employment")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employment record?")) {
      return
    }

    try {
      const response = await fetch(`/api/employment/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Employment deleted successfully")
        fetchEmployments()
      } else {
        toast.error("Failed to delete employment")
      }
    } catch (error) {
      console.error("Error deleting employment:", error)
      toast.error("Error deleting employment")
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "EMPLOYED":
        return "default"
      case "SEEKING":
        return "secondary"
      case "UNEMPLOYED":
        return "destructive"
      case "FREELANCE":
        return "outline"
      case "ENTREPRENEUR":
        return "default"
      case "STUDENT":
        return "secondary"
      default:
        return "outline"
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Employment History</h1>
          <p className="text-gray-600 mt-1">Track your career journey and current employment status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmployment ? "Edit Employment" : "Add New Employment"}
              </DialogTitle>
              <DialogDescription>
                {editingEmployment 
                  ? "Update your employment information" 
                  : "Add a new position to your employment history"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    placeholder="Company name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    placeholder="Job title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleInputChange("industry", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="City, State/Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Employment Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Position</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={formData.isCurrent}
                      onChange={(e) => handleInputChange("isCurrent", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isCurrent" className="text-sm font-normal">
                      This is my current position
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    disabled={formData.isCurrent}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your role, responsibilities, and achievements..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingEmployment ? "Update" : "Add"} Employment
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employment List */}
      <div className="space-y-4">
        {employments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Employment History</h3>
              <p className="text-gray-600 mb-4">
                Start building your employment history by adding your current or past positions.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Employment
              </Button>
            </CardContent>
          </Card>
        ) : (
          employments.map((employment) => (
            <Card key={employment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {employment.position}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(employment.status)}>
                        {employmentStatuses.find(s => s.value === employment.status)?.label}
                      </Badge>
                      {employment.isCurrent && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Current
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="w-4 h-4" />
                        <span>{employment.company}</span>
                      </div>
                      {employment.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{employment.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(new Date(employment.startDate))} - {" "}
                          {employment.isCurrent 
                            ? "Present" 
                            : employment.endDate 
                              ? formatDate(new Date(employment.endDate))
                              : "Present"
                          }
                        </span>
                      </div>
                    </div>

                    {employment.industry && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Industry:</strong> {employment.industry}
                      </p>
                    )}

                    {employment.description && (
                      <p className="text-gray-700 mt-2">{employment.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(employment)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(employment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
