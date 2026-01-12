import { db } from "@/lib/firebase"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { collection, getDocs } from "firebase/firestore"
import { Building2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CompaniesPage() {
    let companies: any[] = []

    try {
        // Fetch all jobs
        const jobsRef = collection(db, "jobs")
        const jobsSnap = await getDocs(jobsRef)

        // Extract unique companies from jobs
        const companyMap = new Map<string, any>()

        jobsSnap.docs.forEach((doc) => {
            const jobData = doc.data()
            const companyData = jobData.company || {}
            const companyName = companyData.name || jobData.companyName || "Unknown Company"

            if (!companyMap.has(companyName)) {
                companyMap.set(companyName, {
                    id: companyName.toLowerCase().replace(/\s+/g, '-'),
                    name: companyName,
                    logo: companyData.logo || jobData.companyLogo || null,
                    website: companyData.website || jobData.companyWebsite || null,
                    about: companyData.about || jobData.companyDescription || "",
                    industry: companyData.industry || jobData.industry || "",
                    size: companyData.size || jobData.companySize || "",
                    location: jobData.location || "Remote",
                    jobCount: 0
                })
            }

            // Increment job count
            const company = companyMap.get(companyName)
            company.jobCount++
        })

        // Convert map to array and sort by job count
        companies = Array.from(companyMap.values()).sort((a, b) => b.jobCount - a.jobCount)

    } catch (error) {
        console.error("Error fetching companies:", error)
    }

    return (
        <div className="container py-10 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Top Companies</h1>
                <p className="text-muted-foreground">
                    Discover {companies.length} companies hiring on JobHub
                </p>
            </div>

            {companies.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {companies.map((company: any) => (
                        <Card key={company.id} className="hover:shadow-lg transition-shadow h-full cursor-pointer group">
                            <CardHeader>
                                <div className="flex items-start gap-4 mb-2">
                                    {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="w-12 h-12 rounded object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                                            {company.name}
                                        </CardTitle>
                                        {company.industry && (
                                            <CardDescription className="text-xs mt-1">
                                                {company.industry}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {company.location && (
                                        <p className="text-sm text-muted-foreground">{company.location}</p>
                                    )}
                                    <p className="font-semibold text-primary">
                                        {company.jobCount} Open {company.jobCount === 1 ? 'Position' : 'Positions'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-6xl mb-4">🏢</div>
                    <h3 className="text-xl font-semibold mb-2">No companies found</h3>
                    <p className="text-muted-foreground max-w-md">
                        Companies will appear here once jobs are posted.
                    </p>
                </div>
            )}
        </div>
    )
}
