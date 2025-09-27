import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const userRole = session.user.role

    // Define what data to include based on user role
    let whereClause: any = {
      isApproved: true, // Only show approved profiles
    }

    // If user is not admin, only show public profiles
    if (userRole !== Role.ADMIN) {
      whereClause.isProfilePublic = true
    }

    const alumni = await prisma.alumniProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: userRole === Role.ADMIN, // Only admins can see emails
            name: true,
          }
        },
        employments: {
          select: {
            id: true,
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

    // Filter out sensitive information for non-admin users
    const filteredAlumni = alumni.map(alumni => {
      const result: any = {
        ...alumni,
        // Only show phone number to admins or if it's the user's own profile
        phoneNumber: userRole === Role.ADMIN || alumni.userId === session.user.id 
          ? alumni.phoneNumber 
          : undefined,
      }

      // For employers, show limited information
      if (userRole === Role.EMPLOYER) {
        result.user = { email: false }
        result.phoneNumber = undefined
      }

      return result
    })

    return NextResponse.json(filteredAlumni)

  } catch (error) {
    console.error("Alumni search error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
