import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EmploymentStatus } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the alumni profile first
    const alumniProfile = await prisma.alumniProfile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!alumniProfile) {
      return NextResponse.json(
        { message: "Alumni profile not found" },
        { status: 404 }
      )
    }

    const employments = await prisma.employment.findMany({
      where: {
        alumniId: alumniProfile.id
      },
      orderBy: [
        { isCurrent: 'desc' },
        { startDate: 'desc' }
      ]
    })

    return NextResponse.json(employments)

  } catch (error) {
    console.error("Employment fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      company,
      position,
      industry,
      location,
      startDate,
      endDate,
      isCurrent,
      status,
      description,
    } = body

    // Validate required fields
    if (!company || !position || !startDate) {
      return NextResponse.json(
        { message: "Company, position, and start date are required" },
        { status: 400 }
      )
    }

    // Get the alumni profile
    const alumniProfile = await prisma.alumniProfile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!alumniProfile) {
      return NextResponse.json(
        { message: "Alumni profile not found" },
        { status: 404 }
      )
    }

    // If this is marked as current, update all other employments to not current
    if (isCurrent) {
      await prisma.employment.updateMany({
        where: {
          alumniId: alumniProfile.id,
          isCurrent: true
        },
        data: {
          isCurrent: false
        }
      })
    }

    // Create new employment
    const employment = await prisma.employment.create({
      data: {
        alumniId: alumniProfile.id,
        company,
        position,
        industry: industry || null,
        location: location || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        status: status as EmploymentStatus || EmploymentStatus.EMPLOYED,
        description: description || null,
      }
    })

    return NextResponse.json(employment, { status: 201 })

  } catch (error) {
    console.error("Employment creation error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
