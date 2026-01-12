import { db } from "@/lib/firebase"
import { notFound } from "next/navigation"
import { JobCard } from "@/components/shared/JobCard"
import { doc, getDoc, collection, query, where, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore"

interface CompanyDetailsProps {
    params: {
        id: string
    }
}

export default async function CompanyDetailsPage({ params }: CompanyDetailsProps) {
    const companyRef = doc(db, "companies", params.id)
    let companySnap;
    try {
        companySnap = await getDoc(companyRef)
    } catch (error) {
        console.error("Error fetching company:", error)
        // Let it throw or return notFound if critical, or handle gracefully?
        // If we can't get company, page is useless.
        // We'll let it proceed to check exists() which will fail on undefined if we don't handle it.
    }

    if (!companySnap || !companySnap.exists()) notFound()

    const companyData = { id: companySnap.id, ...companySnap.data() } as any

    // Fetch jobs for this company
    let jobsSnap: { docs: QueryDocumentSnapshot<DocumentData>[] } = { docs: [] }

    try {
        const jobsRef = collection(db, "jobs")
        const q = query(jobsRef, where("companyId", "==", params.id))
        jobsSnap = await getDocs(q)
    } catch (error) {
        console.error("Error fetching company jobs:", error)
    }

    // We need to inject the company data into the job object for the JobCard
    const jobs = jobsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
        id: doc.id,
        ...doc.data(),
        company: companyData
    })) as any[]

    return (
        <div className="container py-10 px-4">
            <div className="mb-8 border-b pb-8">
                <h1 className="text-4xl font-bold mb-2">{companyData.name}</h1>
                <p className="text-muted-foreground text-lg mb-4">{companyData.location || "Remote"}</p>
                <p className="max-w-3xl whitespace-pre-wrap">{companyData.description}</p>
                {companyData.website && (
                    <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-4 inline-block font-medium">
                        Visit Website
                    </a>
                )}
            </div>

            <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.length > 0 ? (
                    jobs.map((job: any) => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <p className="text-muted-foreground">No open positions at the moment.</p>
                )}
            </div>
        </div>
    )
}
