import { Button } from "@/components/ui/button"
import Link from "next/link"
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { JobCard } from "@/components/shared/JobCard"
import { HomeSearchBar } from "@/components/shared/HomeSearchBar"
import { Search, Briefcase, Building2, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Home() {
  let recentJobs: any[] = []

  try {
    const jobsRef = collection(db, "jobs")
    const q = query(jobsRef, orderBy("createdAt", "desc"), limit(6))
    const querySnapshot = await getDocs(q)

    recentJobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error("Error fetching recent jobs:", error)
  }

  const tags = ["Frontend Developer", "Backend Developer", "Data Engineer", "DevOps Engineer"];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="w-full pt-16 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-6 text-center">

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-gray-900">
              Search, Apply & Get Your <span className="text-primary">Dream Jobs</span>
            </h1>

            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
              Find the perfect job or hire top talent. Professional job portal for career growth.
            </p>

            <div className="w-full max-w-4xl mt-8">
              <HomeSearchBar />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              {tags.map(tag => (
                <div key={tag} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors">
                  {tag}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* Latest Jobs */}
      <section className="w-full py-12 bg-white">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-black">
            Latest and Top Job Openings
          </h2>
          <p className="text-muted-foreground mb-10">Explore exciting opportunities from top companies</p>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recentJobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/jobs">
              <Button variant="outline" className="rounded-full px-8 py-6 h-auto text-base border-gray-200">View All Jobs &rarr;</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose JobHub */}
      <section className="w-full py-24 bg-white">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-16 text-black">Why Choose JobHub</h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center group">
              <div className="p-4 bg-purple-50 rounded-2xl mb-6 text-primary group-hover:scale-110 transition-transform">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Smart Search</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Find the right job with advanced filters and AI-powered recommendations</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="p-4 bg-purple-50 rounded-2xl mb-6 text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">ATS Resume Checker</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Check how well your resume matches job requirements using AI</p>
            </div>
            <div className="flex flex-col items-center group">
              <div className="p-4 bg-purple-50 rounded-2xl mb-6 text-primary group-hover:scale-110 transition-transform">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-black">Top Companies</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Access opportunities from leading companies across industries</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
