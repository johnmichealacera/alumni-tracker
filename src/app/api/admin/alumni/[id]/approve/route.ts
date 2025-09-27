import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email"
import { Role } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find the alumni profile
    const alumniProfile = await prisma.alumniProfile.findUnique({
      where: { id: params.id },
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
        { message: "Alumni profile not found" },
        { status: 404 }
      )
    }

    if (alumniProfile.isApproved) {
      return NextResponse.json(
        { message: "Alumni profile is already approved" },
        { status: 400 }
      )
    }

    // Approve the profile
    const updatedProfile = await prisma.alumniProfile.update({
      where: { id: params.id },
      data: {
        isApproved: true,
        updatedAt: new Date(),
      }
    })

    // Send approval email
    try {
      const approvalTemplate = emailTemplates.profileApproved(
        `${alumniProfile.firstName} ${alumniProfile.lastName}`
      )
      await sendEmail({
        to: alumniProfile.user.email,
        subject: approvalTemplate.subject,
        html: approvalTemplate.html,
        text: approvalTemplate.text,
      })
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError)
      // Don't fail the approval if email fails
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: alumniProfile.userId,
        title: "Profile Approved",
        message: "Your alumni profile has been approved and is now live on the platform.",
        type: "SUCCESS",
      }
    })

    return NextResponse.json({
      message: "Alumni profile approved successfully",
      profile: updatedProfile
    })

  } catch (error) {
    console.error("Alumni approval error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
