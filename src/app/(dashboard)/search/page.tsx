"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Mail,
  Linkedin,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { toast } from "sonner"

interface AlumniProfile {
  id: string
  firstName: string
  lastName: string
  studentId: string
  course: string
  yearGraduated: number
  phoneNumber?: string
  linkedinUrl?: string
  currentLocation?: string
  bio?: string
  profilePicture?: string
  isProfilePublic: boolean
  user: {
    email: string
  }
  employments: Array<{
    id: string
    company: string
    position: string
    industry?: string
    location?: string
    isCurrent: boolean
    startDate: string
    endDate?: string
  }>
}

interface SearchFilters {
  search: string
  course: string
  yearGraduated: string
  location: string
  industry: string
  employmentStatus: string
}

export default function SearchPage() {
  const { data: session } = useSession()
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    course: "all",
    yearGraduated: "all", 
    location: "",
    industry: "all",
    employmentStatus: "all",
  })
  
  // Dynamic filter options from database
  const [availableCourses, setAvailableCourses] = useState<string[]>([])
  const [availableIndustries, setAvailableIndustries] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])

  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    fetchAlumni()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [alumni, filters])

  const fetchAlumni = async () => {
    try {
      const response = await fetch("/api/search/alumni")
      if (response.ok) {
        const data = await response.json()
        setAlumni(data)
        
        // Extract unique filter options from the data
        const courses = [...new Set(data.map((a: AlumniProfile) => a.course))].sort()
        const years = [...new Set(data.map((a: AlumniProfile) => a.yearGraduated))].sort((a, b) => b - a)
        const industries = new Set<string>()
        
        data.forEach((alumni: AlumniProfile) => {
          alumni.employments.forEach(emp => {
            if (emp.industry) industries.add(emp.industry)
          })
        })
        
        setAvailableCourses(courses)
        setAvailableYears(years)
        setAvailableIndustries(Array.from(industries).sort())
      } else {
        const errorData = await response.json()
        toast.error("Failed to load alumni data", {
          description: errorData.message || "Please try again later"
        })
      }
    } catch (error) {
      console.error("Error fetching alumni:", error)
      toast.error("Error loading alumni")
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = alumni

    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(alumni => 
        `${alumni.firstName} ${alumni.lastName}`.toLowerCase().includes(searchTerm) ||
        alumni.course.toLowerCase().includes(searchTerm) ||
        alumni.currentLocation?.toLowerCase().includes(searchTerm) ||
        alumni.employments.some(emp => 
          emp.company.toLowerCase().includes(searchTerm) ||
          emp.position.toLowerCase().includes(searchTerm) ||
          emp.industry?.toLowerCase().includes(searchTerm)
        )
      )
    }

    // Course filter
    if (filters.course && filters.course !== "all") {
      filtered = filtered.filter(alumni => alumni.course === filters.course)
    }

    // Year filter
    if (filters.yearGraduated && filters.yearGraduated !== "all") {
      filtered = filtered.filter(alumni => alumni.yearGraduated.toString() === filters.yearGraduated)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(alumni => 
        alumni.currentLocation?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Industry filter
    if (filters.industry && filters.industry !== "all") {
      filtered = filtered.filter(alumni =>
        alumni.employments.some(emp => emp.industry === filters.industry)
      )
    }

    // Employment status filter
    if (filters.employmentStatus && filters.employmentStatus !== "all") {
      if (filters.employmentStatus === "employed") {
        filtered = filtered.filter(alumni =>
          alumni.employments.some(emp => emp.isCurrent)
        )
      } else if (filters.employmentStatus === "unemployed") {
        filtered = filtered.filter(alumni =>
          !alumni.employments.some(emp => emp.isCurrent)
        )
      }
    }

    setFilteredAlumni(filtered)
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
    setCurrentPage(1)
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      course: "all",
      yearGraduated: "all",
      location: "",
      industry: "all",
      employmentStatus: "all",
    })
  }

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredAlumni.slice(startIndex, endIndex)
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getCurrentEmployment = (employments: AlumniProfile['employments']) => {
    const current = employments.find(emp => emp.isCurrent)
    return current
  }


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const paginatedData = getCurrentPageData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Search Alumni</h1>
        <p className="text-gray-600 mt-1">Find and connect with alumni in your network</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, company, position, or location..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={filters.course}
              onValueChange={(value) => handleFilterChange("course", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Course" />
              </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {availableCourses.map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
            </Select>

            <Select
              value={filters.yearGraduated}
              onValueChange={(value) => handleFilterChange("yearGraduated", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Graduation Year" />
              </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
            </Select>

            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />

            <Select
              value={filters.industry}
              onValueChange={(value) => handleFilterChange("industry", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Industries</SelectItem>
                        {availableIndustries.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
            </Select>

            <Select
              value={filters.employmentStatus}
              onValueChange={(value) => handleFilterChange("employmentStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Employment Status" />
              </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="employed">Currently Employed</SelectItem>
                        <SelectItem value="unemployed">Seeking Opportunities</SelectItem>
                      </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {filteredAlumni.length} alumni found
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedData.map((alumni) => {
          const currentJob = getCurrentEmployment(alumni.employments)
          const canViewFullProfile = session?.user?.role === "ADMIN" || alumni.isProfilePublic

          return (
            <Card key={alumni.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={alumni.profilePicture} alt={`${alumni.firstName} ${alumni.lastName}`} />
                    <AvatarFallback className="text-lg">
                      {getUserInitials(alumni.firstName, alumni.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">
                      {alumni.firstName} {alumni.lastName}
                    </h3>
                    
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm">{alumni.course}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Class of {alumni.yearGraduated}</span>
                    </div>

                    {currentJob && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-1 text-gray-700">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm font-medium">{currentJob.position}</span>
                        </div>
                        <p className="text-sm text-gray-600">{currentJob.company}</p>
                        {currentJob.location && (
                          <div className="flex items-center space-x-1 text-gray-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">{currentJob.location}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!currentJob && (
                      <Badge variant="secondary" className="mt-2">
                        Seeking Opportunities
                      </Badge>
                    )}

                    {alumni.currentLocation && (
                      <div className="flex items-center space-x-1 text-gray-500 mt-2">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{alumni.currentLocation}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 mt-4">
                      {canViewFullProfile && (
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      )}
                      {alumni.linkedinUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={alumni.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {alumni.bio && canViewFullProfile && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700 line-clamp-3">{alumni.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {filteredAlumni.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Alumni Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or filters to find more alumni.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
