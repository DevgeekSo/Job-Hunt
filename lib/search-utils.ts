import { db } from "@/lib/firebase"
import { collection, getDocs, limit, query } from "firebase/firestore"

// Cache for job data to avoid repeated Firestore calls
let jobsCache: any[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getJobsCache() {
    const now = Date.now()

    // Return cached data if it's still fresh
    if (jobsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return jobsCache
    }

    // Fetch fresh data
    try {
        const jobsRef = collection(db, "jobs")
        const q = query(jobsRef, limit(500)) // Limit to avoid excessive data
        const snapshot = await getDocs(q)

        jobsCache = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        cacheTimestamp = now

        return jobsCache
    } catch (error) {
        console.error("Error fetching jobs:", error)
        return []
    }
}

export async function searchJobTitles(searchTerm: string): Promise<string[]> {
    if (!searchTerm || searchTerm.length < 2) {
        return []
    }

    const jobs = await getJobsCache()
    const lowerSearch = searchTerm.toLowerCase()

    // Extract unique job titles that match
    const matchingTitles = new Set<string>()

    jobs.forEach(job => {
        if (job.title && job.title.toLowerCase().includes(lowerSearch)) {
            matchingTitles.add(job.title)
        }
    })

    // Convert to array and return top 10 matches
    return Array.from(matchingTitles).slice(0, 10)
}

export async function searchLocations(searchTerm: string): Promise<string[]> {
    if (!searchTerm || searchTerm.length < 2) {
        return []
    }

    const jobs = await getJobsCache()
    const lowerSearch = searchTerm.toLowerCase()

    // Extract unique locations that match
    const matchingLocations = new Set<string>()

    jobs.forEach(job => {
        if (job.location && job.location.toLowerCase().includes(lowerSearch)) {
            matchingLocations.add(job.location)
        }
    })

    // Convert to array and return top 10 matches
    return Array.from(matchingLocations).slice(0, 10)
}

// Clear cache function (useful if you want to refresh data manually)
export function clearSearchCache() {
    jobsCache = null
    cacheTimestamp = 0
}
