import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PDFGenerator } from "@/lib/pdf"
import { Role, ReportType } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, type, filters } = body

    if (!title || !type) {
      return NextResponse.json(
        { message: "Title and type are required" },
        { status: 400 }
      )
    }

    // Build query based on filters
    let whereClause: any = {
      isApproved: true // Only include approved alumni
    }

    if (filters.course) {
      whereClause.course = filters.course
    }

    if (filters.yearGraduated) {
      whereClause.yearGraduated = parseInt(filters.yearGraduated)
    }

    if (filters.location) {
      whereClause.currentLocation = {
        contains: filters.location,
        mode: 'insensitive'
      }
    }

    // Fetch alumni data
    const alumni = await prisma.alumniProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        },
        employments: {
          select: {
            company: true,
            position: true,
            industry: true,
            location: true,
            isCurrent: true,
            startDate: true,
            endDate: true,
          },
          orderBy: [
            { isCurrent: 'desc' },
            { startDate: 'desc' }
          ]
        }
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' }
      ]
    })

    // Apply employment status filter if specified
    let filteredAlumni = alumni
    if (filters.employmentStatus) {
      if (filters.employmentStatus === "employed") {
        filteredAlumni = alumni.filter(a => 
          a.employments.some(e => e.isCurrent)
        )
      } else if (filters.employmentStatus === "unemployed") {
        filteredAlumni = alumni.filter(a => 
          !a.employments.some(e => e.isCurrent)
        )
      }
    }

    // Create report data object
    const reportData = {
      title,
      description,
      generatedBy: session.user.name || session.user.email || 'Admin',
      generatedAt: new Date(),
      data: filteredAlumni,
      filters: Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value)
      )
    }

    // Generate PDF based on report type
    const pdfGenerator = new PDFGenerator()
    let pdfBuffer: Buffer

    switch (type) {
      case 'ALUMNI_STATISTICS':
        pdfBuffer = pdfGenerator.generateAlumniReport(reportData)
        break
      case 'EMPLOYMENT_REPORT':
        pdfBuffer = pdfGenerator.generateEmploymentReport(reportData)
        break
      case 'GRADUATION_YEAR_REPORT':
        pdfBuffer = pdfGenerator.generateYearReport(reportData)
        break
      case 'INDUSTRY_REPORT':
        pdfBuffer = pdfGenerator.generateEmploymentReport(reportData) // Use same as employment for now
        break
      default:
        return NextResponse.json(
          { message: "Invalid report type" },
          { status: 400 }
        )
    }

    // Save report record to database
    await prisma.report.create({
      data: {
        title,
        description: description || null,
        type: type as ReportType,
        filters: Object.keys(reportData.filters).length > 0 ? reportData.filters : null,
        generatedBy: reportData.generatedBy,
      }
    })

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
