# Alumni Tracker

A comprehensive web application for tracking alumni careers, employment, and networking opportunities built with Next.js, TypeScript, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **Alumni Registration & Profile Management**: Complete profile system with academic and professional information
- **Employment & Career Tracking**: Track current and past employment with detailed job information
- **Role-Based Access Control**: Secure access for Alumni, Admins, and Employers
- **Advanced Search Engine**: Find alumni by name, course, year, industry, or location
- **Admin Dashboard**: Comprehensive management interface with approval workflows
- **PDF Report Generation**: Generate and export detailed alumni reports
- **Email Notifications**: Automated notifications for registrations, approvals, and reminders

### User Roles
- **Alumni**: Manage profile, update employment information, search network
- **Admin**: Full system access, approve profiles, generate reports, manage users
- **Employer**: Limited access to search and view public alumni profiles

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials and Google SSO
- **Styling**: TailwindCSS + shadcn/ui components
- **Email**: Nodemailer (configurable SMTP)
- **PDF Generation**: PDFKit
- **SMS (Optional)**: Twilio integration

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- SMTP email service (Gmail, SendGrid, etc.)
- Google OAuth credentials (optional)
- Twilio account (optional for SMS)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd alumni-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/alumni_tracker"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   
   # Twilio (optional SMS)
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_PHONE_NUMBER="your-twilio-phone-number"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
alumni-tracker/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── admin/         # Admin-only pages
│   │   │   ├── profile/       # Profile management
│   │   │   ├── employment/    # Employment tracking
│   │   │   └── search/        # Alumni search
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── admin/         # Admin API routes
│   │   │   ├── profile/       # Profile management API
│   │   │   ├── employment/    # Employment API
│   │   │   └── search/        # Search API
│   │   ├── auth/              # Authentication pages
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── email.ts           # Email utilities
│   │   ├── pdf.ts             # PDF generation
│   │   └── utils.ts           # Helper functions
│   └── middleware.ts          # Route protection middleware
├── prisma/
│   └── schema.prisma          # Database schema
├── components.json            # shadcn/ui configuration
└── package.json
```

## 🗄️ Database Schema

The application uses the following main models:

- **User**: Authentication and basic user information
- **AlumniProfile**: Detailed alumni information and academic history
- **Employment**: Employment history and current positions
- **Notification**: System notifications for users
- **Report**: Generated PDF reports metadata

## 🔐 Authentication Flow

1. **Registration**: Alumni register with email/password or Google SSO
2. **Profile Creation**: Automatic alumni profile creation with approval required
3. **Admin Approval**: Admins review and approve new profiles
4. **Email Notification**: Approved users receive welcome email
5. **Access Control**: Middleware enforces role-based route protection

## 📊 Report Types

The system supports multiple report types:

- **Alumni Statistics**: Complete directory with contact information
- **Employment Report**: Employment statistics and industry breakdown
- **Graduation Year Report**: Alumni statistics grouped by graduation year
- **Industry Report**: Industry distribution and career progression

## 🔧 Configuration

### Email Setup
Configure SMTP settings in your environment variables. For Gmail:
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use the app password in `SMTP_PASS`

### Google OAuth Setup
1. Create a project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs

### Database Setup
The application supports PostgreSQL. For local development:
```bash
# Using Docker
docker run --name alumni-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=alumni_tracker -p 5432:5432 -d postgres

# Or install PostgreSQL locally and create database
createdb alumni_tracker
```

## 🚀 Deployment

### Environment Setup
Ensure all environment variables are configured in your production environment.

### Database Migration
```bash
npx prisma migrate deploy
```

### Build Application
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/docs` (when available)

## 🔮 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Mobile app with React Native
- [ ] Advanced analytics dashboard
- [ ] Integration with LinkedIn API
- [ ] Event management system
- [ ] Mentorship matching platform
- [ ] Job board integration
- [ ] Alumni directory mobile app

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.