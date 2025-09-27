import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EmploymentStatus } from "@prisma/client"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if employment exists and belongs to the user
    const existingEmployment = await prisma.employment.findFirst({
      where: {
        id: params.id,
        alumniId: alumniProfile.id
      }
    })

    if (!existingEmployment) {
      return NextResponse.json(
        { message: "Employment not found" },
        { status: 404 }
      )
    }

    // If this is marked as current, update all other employments to not current
    if (isCurrent) {
      await prisma.employment.updateMany({
        where: {
          alumniId: alumniProfile.id,
          isCurrent: true,
          id: { not: params.id }
        },
        data: {
          isCurrent: false
        }
      })
    }

    // Update employment
    const updatedEmployment = await prisma.employment.update({
      where: {
        id: params.id
      },
      data: {
        company,
        position,
        industry: industry || null,
        location: location || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        status: status as EmploymentStatus || EmploymentStatus.EMPLOYED,
        description: description || null,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json(updatedEmployment)

  } catch (error) {
    console.error("Employment update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
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

    // Check if employment exists and belongs to the user
    const existingEmployment = await prisma.employment.findFirst({
      where: {
        id: params.id,
        alumniId: alumniProfile.id
      }
    })

    if (!existingEmployment) {
      return NextResponse.json(
        { message: "Employment not found" },
        { status: 404 }
      )
    }

    // Delete employment
    await prisma.employment.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Employment deleted successfully" })

  } catch (error) {
    console.error("Employment deletion error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
