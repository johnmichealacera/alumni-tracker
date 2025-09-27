import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email"
import { Role } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      studentId,
      course,
      yearGraduated,
      phoneNumber,
      currentLocation,
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !studentId || !course || !yearGraduated) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Check if student ID already exists
    const existingStudentId = await prisma.alumniProfile.findUnique({
      where: { studentId }
    })

    if (existingStudentId) {
      return NextResponse.json(
        { message: "Student ID already registered" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and alumni profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: Role.ALUMNI,
        }
      })

      // Create alumni profile
      const alumniProfile = await tx.alumniProfile.create({
        data: {
          userId: user.id,
          studentId,
          firstName,
          lastName,
          course,
          yearGraduated: parseInt(yearGraduated),
          phoneNumber: phoneNumber || null,
          currentLocation: currentLocation || null,
          isApproved: false, // Requires admin approval
        }
      })

      return { user, alumniProfile }
    })

    // Send welcome email
    try {
      const welcomeTemplate = emailTemplates.welcome(`${firstName} ${lastName}`)
      await sendEmail({
        to: email,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html,
        text: welcomeTemplate.text,
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}
