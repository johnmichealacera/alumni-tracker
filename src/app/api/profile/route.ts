import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const alumniProfile = await prisma.alumniProfile.findUnique({
      where: {
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    })

    if (!alumniProfile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(alumniProfile)

  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
      firstName,
      lastName,
      phoneNumber,
      linkedinUrl,
      currentLocation,
      bio,
      course,
      yearGraduated,
      isProfilePublic,
    } = body

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { message: "First name and last name are required" },
        { status: 400 }
      )
    }

    // Check if profile exists
    const existingProfile = await prisma.alumniProfile.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      )
    }

    // Update profile
    const updatedProfile = await prisma.alumniProfile.update({
      where: {
        userId: session.user.id
      },
      data: {
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        linkedinUrl: linkedinUrl || null,
        currentLocation: currentLocation || null,
        bio: bio || null,
        course: course || existingProfile.course,
        yearGraduated: yearGraduated ? parseInt(yearGraduated) : existingProfile.yearGraduated,
        isProfilePublic: isProfilePublic !== undefined ? isProfilePublic : existingProfile.isProfilePublic,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          }
        }
      }
    })

    // Also update the user's name if changed
    const fullName = `${firstName} ${lastName}`
    if (fullName !== session.user.name) {
      await prisma.user.update({
        where: {
          id: session.user.id
        },
        data: {
          name: fullName
        }
      })
    }

    return NextResponse.json(updatedProfile)

  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
