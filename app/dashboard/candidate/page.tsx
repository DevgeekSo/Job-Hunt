"use client"

import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { JobCard } from "@/components/shared/JobCard"
import { TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { collection, getDocs, query, where, doc, getDoc, QueryDocumentSnapshot, DocumentData } from "firebase/firestore"

export default function CandidateDashboard() {
    const { user, loading } = useAuth()
    const router = useRouter()

    const [applications, setApplications] = useState<any[]>([])
    const [savedJobs, setSavedJobs] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/')
            return
        }

        async function fetchData() {
            if (!user) return

            try {
                // Fetch applications
                const appsRef = collection(db, "applications")
                const q = query(appsRef, where("candidateId", "==", user.uid))
                const appsSnap = await getDocs(q)

                // For each application, fetch job details
                const appsData = await Promise.all(appsSnap.docs.map(async (appDoc: QueryDocumentSnapshot<DocumentData>) => {
                    const appData = appDoc.data()
                    let jobData = null

                    if (appData.jobId) {
                        const jobRef = doc(db, "jobs", appData.jobId)
                        const jobSnap = await getDoc(jobRef)
                        if (jobSnap.exists()) {
                            jobData = { id: jobSnap.id, ...jobSnap.data() }
                        }
                    }

                    return {
                        id: appDoc.id,
                        ...appData,
                        job: jobData
                    }
                }))

                setApplications(appsData)

                // Fetch Saved Jobs
                const savedRef = collection(db, "saved_jobs")
                const savedQ = query(savedRef, where("candidateId", "==", user.uid))
                const savedSnap = await getDocs(savedQ)

                const savedData = await Promise.all(savedSnap.docs.map(async (docSnap: QueryDocumentSnapshot<DocumentData>) => {
                    const data = docSnap.data()
                    let jobData = null

                    if (data.jobId) {
                        const jobRef = doc(db, "jobs", data.jobId)
                        const jobSnap = await getDoc(jobRef)
                        if (jobSnap.exists()) {
                            jobData = { id: jobSnap.id, ...jobSnap.data() }
                        }
                    }
                    return {
                        id: docSnap.id,
                        ...data,
                        job: jobData
                    }
                }))

                setSavedJobs(savedData)

                // Fetch profile
                const docRef = doc(db, "candidates", user.uid)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    setProfile(docSnap.data())
                }

            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setFetching(false)
            }
        }

        if (!loading && user) {
            fetchData()
        }
    }, [user, loading, router])

    if (loading || (user && fetching)) {
        return <div className="container py-10">Loading...</div>
    }

    if (!user) return null

    return (
        <div className="container py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Candidate Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{profile?.profileCompleted ? "Complete" : "Incomplete"}</div>
                        <p className="text-xs text-muted-foreground mb-4">
                            {profile?.resume_url ? "Resume Uploaded" : "Resume Missing"}
                        </p>
                        <Button asChild size="sm" className="w-full">
                            <a href="/dashboard/candidate/profile">
                                {profile?.profileCompleted ? "Edit Profile" : "Complete Profile"}
                            </a>
                        </Button>
                    </CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Applications</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{applications.length}</p>
                            <p className="text-xs text-muted-foreground">Jobs Applied</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Saved</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">{savedJobs.length}</p>
                            <p className="text-xs text-muted-foreground">Jobs Saved</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Recent Applications</h2>
                    {applications.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {applications.map(app => (
                                <div key={app.id} className="relative">
                                    <div className="absolute top-2 right-2 z-10 bg-white dark:bg-black px-2 py-1 rounded border shadow-sm text-xs font-bold">
                                        {app.status}
                                    </div>
                                    {app.job ? (
                                        <JobCard job={app.job} />
                                    ) : (
                                        <div className="p-4 border rounded">Job details unavailable</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border rounded-lg bg-gray-50 text-gray-500">
                            You haven't applied to any jobs yet.
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4">Saved Jobs</h2>
                    {savedJobs.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {savedJobs.map(saved => (
                                <div key={saved.id}>
                                    {saved.job ? (
                                        <JobCard job={saved.job} />
                                    ) : (
                                        <div className="p-4 border rounded">Job unavailable</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border rounded-lg bg-gray-50 text-gray-500">
                            No saved jobs yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
