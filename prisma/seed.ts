import { PrismaClient, Role, EmploymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@alumni-tracker.com' },
    update: {},
    create: {
      email: 'admin@alumni-tracker.com',
      password: adminPassword,
      name: 'System Administrator',
      role: Role.ADMIN,
    },
  })

  console.log('Created admin user:', admin.email)

  // Create sample alumni users
  const alumniUsers = [
    {
      email: 'john.doe@example.com',
      name: 'John Doe',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        studentId: '2020001',
        course: 'Computer Science',
        yearGraduated: 2020,
        phoneNumber: '+1 (555) 123-4567',
        currentLocation: 'San Francisco, CA',
        bio: 'Software engineer passionate about web development and AI.',
        isApproved: true,
        isProfilePublic: true,
      },
      employments: [
        {
          company: 'Tech Innovations Inc.',
          position: 'Senior Software Engineer',
          industry: 'Technology',
          location: 'San Francisco, CA',
          startDate: new Date('2022-01-15'),
          isCurrent: true,
          status: EmploymentStatus.EMPLOYED,
          description: 'Leading frontend development team and implementing new features.',
        },
        {
          company: 'StartupXYZ',
          position: 'Frontend Developer',
          industry: 'Technology',
          location: 'San Francisco, CA',
          startDate: new Date('2020-06-01'),
          endDate: new Date('2021-12-31'),
          isCurrent: false,
          status: EmploymentStatus.EMPLOYED,
          description: 'Developed responsive web applications using React and TypeScript.',
        },
      ],
    },
    {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      profile: {
        firstName: 'Jane',
        lastName: 'Smith',
        studentId: '2019002',
        course: 'Business Administration',
        yearGraduated: 2019,
        phoneNumber: '+1 (555) 987-6543',
        currentLocation: 'New York, NY',
        bio: 'Marketing professional with expertise in digital campaigns and brand management.',
        isApproved: true,
        isProfilePublic: true,
      },
      employments: [
        {
          company: 'Global Marketing Solutions',
          position: 'Marketing Manager',
          industry: 'Marketing',
          location: 'New York, NY',
          startDate: new Date('2021-03-01'),
          isCurrent: true,
          status: EmploymentStatus.EMPLOYED,
          description: 'Managing digital marketing campaigns for Fortune 500 clients.',
        },
      ],
    },
    {
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      profile: {
        firstName: 'Mike',
        lastName: 'Johnson',
        studentId: '2021003',
        course: 'Engineering',
        yearGraduated: 2021,
        phoneNumber: '+1 (555) 456-7890',
        currentLocation: 'Austin, TX',
        bio: 'Mechanical engineer working on sustainable energy solutions.',
        isApproved: true,
        isProfilePublic: true,
      },
      employments: [
        {
          company: 'Green Energy Corp',
          position: 'Mechanical Engineer',
          industry: 'Energy',
          location: 'Austin, TX',
          startDate: new Date('2021-08-01'),
          isCurrent: true,
          status: EmploymentStatus.EMPLOYED,
          description: 'Designing and testing renewable energy systems.',
        },
      ],
    },
    {
      email: 'sarah.wilson@example.com',
      name: 'Sarah Wilson',
      profile: {
        firstName: 'Sarah',
        lastName: 'Wilson',
        studentId: '2022004',
        course: 'Medicine',
        yearGraduated: 2022,
        currentLocation: 'Boston, MA',
        bio: 'Medical resident specializing in pediatrics.',
        isApproved: false, // Pending approval
        isProfilePublic: true,
      },
      employments: [],
    },
  ]

  for (const userData of alumniUsers) {
    const password = await bcrypt.hash('password123', 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password,
        name: userData.name,
        role: Role.ALUMNI,
      },
    })

    const profile = await prisma.alumniProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ...userData.profile,
      },
    })

    // Create employments
    for (const empData of userData.employments) {
      await prisma.employment.create({
        data: {
          alumniId: profile.id,
          ...empData,
        },
      })
    }

    console.log('Created alumni user:', userData.email)
  }

  // Create employer user
  const employerPassword = await bcrypt.hash('employer123', 12)
  const employer = await prisma.user.upsert({
    where: { email: 'recruiter@company.com' },
    update: {},
    create: {
      email: 'recruiter@company.com',
      password: employerPassword,
      name: 'HR Recruiter',
      role: Role.EMPLOYER,
    },
  })

  console.log('Created employer user:', employer.email)

  // Create some notifications
  const alumniProfiles = await prisma.alumniProfile.findMany({
    include: { user: true }
  })

  for (const profile of alumniProfiles.slice(0, 2)) {
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        title: 'Welcome to Alumni Tracker',
        message: 'Your profile has been created successfully. Please complete your employment information.',
        type: 'INFO',
      },
    })
  }

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
