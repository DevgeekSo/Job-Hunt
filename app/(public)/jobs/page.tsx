import { collection, getDocs, orderBy, query, QueryConstraint } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { JobCard } from "@/components/shared/JobCard"
import { JobFilters } from "@/components/jobs/JobFilters"
import { MobileFilters } from "@/components/jobs/MobileFilters"

export const dynamic = "force-dynamic"

interface JobsPageProps {
    searchParams: {
        q?: string
        location?: string
        type?: string
        level?: string
    }
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const { q, location, type, level } = searchParams

    let jobs: any[] = []

    try {
        const jobsRef = collection(db, "jobs")
        const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")]
        const qFirestore = query(jobsRef, ...constraints)
        const querySnapshot = await getDocs(qFirestore)

        jobs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))
    } catch (error) {
        console.error("Error fetching jobs:", error)
    }

    // In-memory filtering for partial matches and flexible search
    if (q || location || type || level) {
        const lowerQ = q?.toLowerCase() || ""
        const lowerLoc = location?.toLowerCase() || ""

        jobs = jobs.filter(job => {
            // Search Query
            const matchesQ = !lowerQ ||
                job.title?.toLowerCase().includes(lowerQ) ||
                job.company?.name?.toLowerCase().includes(lowerQ) ||
                job.description?.toLowerCase().includes(lowerQ) ||
                (Array.isArray(job.skills) && job.skills.some((s: string) => s.toLowerCase().includes(lowerQ)));

            // Location
            const matchesLoc = !lowerLoc ||
                job.location?.toLowerCase().includes(lowerLoc) ||
                (lowerLoc === "remote" && job.jobType === "REMOTE") ||
                (lowerLoc === "remote" && job.location?.toLowerCase().includes("remote"));

            // Job Type (Case Insensitive Match)
            // Check both jobType and type fields for flexibility
            const matchesType = !type || type === "All Types" ||
                job.jobType?.toUpperCase() === type?.toUpperCase() ||
                job.type?.toUpperCase() === type?.toUpperCase();

            // Experience Level (Exact Match)
            const matchesLevel = !level || job.experienceLevel === level;

            return matchesQ && matchesLoc && matchesType && matchesLevel;
        });
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/30">
            <div className="container py-6 md:py-10 px-4">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Desktop Filters */}
                    <aside className="hidden md:block w-80 shrink-0">
                        <div className="sticky top-6">
                            <JobFilters />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        {/* Mobile Filters */}
                        <div className="md:hidden mb-6">
                            <MobileFilters />
                        </div>

                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">
                                {q ? `Search results for "${q}"` : "All Jobs"}
                            </h1>
                            <p className="text-muted-foreground">
                                {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
                            </p>
                        </div>

                        {/* Job Cards Grid */}
                        {jobs.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                                {jobs.map((job: any) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                                <p className="text-muted-foreground max-w-md">
                                    Try adjusting your filters or search terms to find what you're looking for.
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
