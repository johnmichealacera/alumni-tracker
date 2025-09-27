"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Users, Briefcase, BarChart3, Mail, Search } from "lucide-react"
import { AuthenticatedHeader } from "@/components/authenticated-header"

export default function Home() {
  const { data: session } = useSession()
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <AuthenticatedHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Connect • Track • Grow
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Alumni Network,
            <span className="text-blue-600"> Connected</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform for tracking alumni careers, employment opportunities, 
            and building meaningful professional connections within your academic community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <>
                <Link href="/profile">
                  <Button size="lg" className="w-full sm:w-auto">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Search Alumni
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Join as Alumni
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Browse Alumni
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Stay Connected
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From profile management to career tracking, our platform provides all the tools 
              you need to maintain and grow your alumni network.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  Create and maintain comprehensive alumni profiles with academic and professional information.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="h-10 w-10 text-green-600 mb-2" />
                <CardTitle>Career Tracking</CardTitle>
                <CardDescription>
                  Track employment history, current positions, and career progression of alumni.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-purple-600 mb-2" />
                <CardTitle>Advanced Search</CardTitle>
                <CardDescription>
                  Find alumni by graduation year, course, industry, or current employment status.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Generate detailed reports on employment rates, industry trends, and alumni statistics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-10 w-10 text-red-600 mb-2" />
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Stay updated with email notifications and reminders about profile updates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <GraduationCap className="h-10 w-10 text-indigo-600 mb-2" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  Secure access control for alumni, administrators, and potential employers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            {session ? "Explore Your Alumni Network" : "Ready to Connect with Your Alumni Network?"}
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            {session 
              ? "Discover alumni in your field, update your profile, and build meaningful professional connections."
              : "Join thousands of alumni who are already using our platform to stay connected, track career progress, and build professional relationships."
            }
          </p>
          {session ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile">
                <Button size="lg" variant="secondary">
                  Update Profile
                </Button>
              </Link>
              <Link href="/search">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                  Find Alumni
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Get Started Today
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-semibold">Alumni Tracker</span>
          </div>
          <p className="text-sm">
            © 2025 Alumni Tracker. Connecting graduates, tracking success.
          </p>
        </div>
      </footer>
    </div>
  )
}
