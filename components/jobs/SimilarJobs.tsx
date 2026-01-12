"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { JobCard } from "@/components/shared/JobCard";

interface SimilarJobsProps {
    currentJobId: string;
    jobType?: string; // Could be used to filter by same job type
}

export function SimilarJobs({ currentJobId, jobType }: SimilarJobsProps) {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSimilarJobs = async () => {
            setLoading(true);
            try {
                const jobsRef = collection(db, "jobs");
                // Simple query: get recent jobs, limit 3. 
                // In a real app, you'd want to filter by category or skills and exclude currentId.
                // Firestore inequality filters have limitations, so we might fetch a few more and filter in client.

                // Removed orderBy to avoid missing index issues for now
                let q = query(jobsRef, limit(10));

                if (jobType) {
                    // Note: Requires composite index if mixing equality (jobType) and range (createdAt)
                    // keeping it simple for now to avoid index creation errors for the user
                    // q = query(jobsRef, where("jobType", "==", jobType), limit(5));  
                }

                const snapshot = await getDocs(q);
                const fetchedJobs = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((job: any) => job.id !== currentJobId)
                    .slice(0, 3);

                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Error fetching similar jobs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarJobs();
    }, [currentJobId, jobType]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-[200px] w-full rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-[200px] w-full rounded-xl bg-gray-100 animate-pulse" />
            </div>
        );
    }

    if (jobs.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Similar Jobs</h3>
            <div className="grid gap-4">
                {jobs.map((job) => (
                    <div key={job.id} className="h-full">
                        {/* Simplified wrapper to ensure JobCard fits in sidebar */}
                        <JobCard job={job} />
                    </div>
                ))}
            </div>
        </div>
    );
}
