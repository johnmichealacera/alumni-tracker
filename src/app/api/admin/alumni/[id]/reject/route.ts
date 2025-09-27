import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
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

    // Delete the alumni profile and associated user in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete alumni profile (this will cascade delete employments)
      await tx.alumniProfile.delete({
        where: { id: params.id }
      })

      // Delete user account
      await tx.user.delete({
        where: { id: alumniProfile.userId }
      })
    })

    // Send rejection email
    try {
      await sendEmail({
        to: alumniProfile.user.email,
        subject: "Alumni Profile Application - Update Required",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">Profile Application Update</h1>
            <p>Hi ${alumniProfile.firstName},</p>
            <p>Thank you for your interest in joining our alumni network. Unfortunately, we need additional information or corrections to approve your profile.</p>
            <p>Please contact our administrators for more details on how to proceed.</p>
            <p>Best regards,<br>The Alumni Tracker Team</p>
          </div>
        `,
        text: `Hi ${alumniProfile.firstName}, Your alumni profile application requires additional information. Please contact administrators for details.`
      })
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError)
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({
      message: "Alumni profile rejected and removed successfully"
    })

  } catch (error) {
    console.error("Alumni rejection error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
