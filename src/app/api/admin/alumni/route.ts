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

    const alumni = await prisma.alumniProfile.findMany({
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
            isCurrent: true,
          }
        }
      },
      orderBy: [
        { isApproved: 'asc' }, // Pending first
        { createdAt: 'desc' }  // Most recent first
      ]
    })

    return NextResponse.json(alumni)

  } catch (error) {
    console.error("Admin alumni fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
