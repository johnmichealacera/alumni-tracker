import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get stats in parallel
    const [
      totalAlumni,
      pendingApprovals,
      employedAlumni,
      recentRegistrations
    ] = await Promise.all([
      // Total alumni count
      prisma.alumniProfile.count(),
      
      // Pending approvals
      prisma.alumniProfile.count({
        where: { isApproved: false }
      }),
      
      // Alumni with current employment
      prisma.alumniProfile.count({
        where: {
          employments: {
            some: { isCurrent: true }
          }
        }
      }),
      
      // Recent registrations (last 30 days)
      prisma.alumniProfile.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    return NextResponse.json({
      totalAlumni,
      pendingApprovals,
      employedAlumni,
      recentRegistrations
    })

  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
