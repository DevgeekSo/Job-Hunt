"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Calendar, Clock, MapPin, Edit } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function EmployerDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
            return;
        }

        const fetchJobs = async () => {
            if (!user) return;
            try {
                const jobsRef = collection(db, "jobs");
                const q = query(jobsRef, where("recruiterId", "==", user.uid));

                const querySnapshot = await getDocs(q);
                const jobsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setJobs(jobsData);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            } finally {
                setIsLoadingJobs(false);
            }
        };

        if (user) {
            fetchJobs();
        }
    }, [user, loading, router]);


    if (loading || isLoadingJobs) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="container py-10 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Employer Dashboard</h1>
                <Link href="/dashboard/employer/jobs/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Post a Job
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.length > 0 ? (
                    jobs.map(job => (
                        <Card key={job.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="line-clamp-1" title={job.title}>{job.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">{job.location || 'Remote'}</p>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{job.type || 'Full Time'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {job.createdAt?.seconds
                                                ? new Date(job.createdAt.seconds * 1000).toLocaleDateString()
                                                : job.createdAt && !isNaN(new Date(job.createdAt).getTime())
                                                    ? new Date(job.createdAt).toLocaleDateString()
                                                    : 'Recently'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardContent className="pt-0">
                                <div className="flex gap-2">
                                    <Link href={`/dashboard/employer/jobs/${job.id}/edit`} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <Link href={`/dashboard/employer/jobs/${job.id}`} className="flex-1">
                                        <Button className="w-full">Manage</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-muted-foreground mb-4">You haven't posted any jobs yet.</p>
                        <Link href="/dashboard/employer/jobs/new">
                            <Button variant="outline">Post your first job</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
