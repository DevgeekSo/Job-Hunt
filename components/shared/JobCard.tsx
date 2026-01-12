"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, BookmarkIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, query, where, getDocs, doc } from "firebase/firestore";
import { toast } from "sonner";

interface JobCardProps {
    job: {
        id: string
        title: string
        location: string | null
        salary: string | null
        jobType: string
        salary_range?: string | null
        createdAt: any
        description?: string
        experienceLevel?: string
        skills?: string[]
        company: {
            name: string
            logo?: string | null
        }
    }
}

function getTimeAgo(dateInput: any) {
    if (!dateInput) return "Recently";

    // Handle Firestore Timestamp or Date object or string
    const date = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);

    // Check if date is valid
    if (isNaN(date.getTime())) return "Recently";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle negative differences (future dates)
    if (diffInSeconds < 0) return "Recently";

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    try {
        return date.toLocaleDateString();
    } catch {
        return "Recently";
    }
}

export function JobCard({ job }: JobCardProps) {
    const router = useRouter();
    const { user, userData } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check if saved on mount
    useEffect(() => {
        if (!user) return;

        async function checkSavedStatus() {
            try {
                const savedRef = collection(db, "saved_jobs");
                const q = query(savedRef, where("jobId", "==", job.id), where("candidateId", "==", user.uid));
                const snap = await getDocs(q);
                if (!snap.empty) {
                    setIsSaved(true);
                }
            } catch (error) {
                console.error("Error checking saved status", error);
            }
        }

        checkSavedStatus();
    }, [user, job.id]);

    const handleCardClick = () => {
        router.push(`/jobs/${job.id}`);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (!user) {
            toast.error("Please login to save jobs");
            router.push(`/login?redirect=/jobs`);
            return;
        }

        if (userData?.role === "employer") {
            toast.error("Employers cannot save jobs");
            return;
        }

        setLoading(true);
        try {
            const savedRef = collection(db, "saved_jobs");

            if (isSaved) {
                // Unsave
                const q = query(savedRef, where("jobId", "==", job.id), where("candidateId", "==", user.uid));
                const snap = await getDocs(q);
                snap.forEach(async (d) => {
                    await deleteDoc(doc(db, "saved_jobs", d.id));
                });
                setIsSaved(false);
                toast.success("Job removed from saved items");
            } else {
                // Save
                await addDoc(savedRef, {
                    jobId: job.id,
                    candidateId: user.uid,
                    jobTitle: job.title,
                    companyName: job.company.name,
                    savedAt: new Date()
                });
                setIsSaved(true);
                toast.success("Job saved successfully");
            }
        } catch (error) {
            console.error("Error toggling save:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const displaySalary = job.salary_range || (job.salary !== "Not available" && job.salary) ? (job.salary_range || job.salary) : null;
    const timeAgo = getTimeAgo(job.createdAt);
    const logoLetter = job.company.name ? job.company.name.charAt(0).toUpperCase() : "C";

    // Random position count for UI matching (since we don't have it in schema)
    // In a real app this would come from the DB. Using deterministic value from ID to avoid hydration mismatch.
    const positions = (job.id.charCodeAt(0) % 5) + 1; // Placeholder

    return (
        <Card
            onClick={handleCardClick}
            className="flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all rounded-2xl overflow-hidden p-5 h-full cursor-pointer group"
        >
            {/* Header: Logo, Company info, Time ago */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-primary font-bold text-xl shrink-0 overflow-hidden">
                        {job.company.logo ? (
                            <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                        ) : (
                            logoLetter
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1 text-base group-hover:text-primary transition-colors">
                            {job.company.name}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="line-clamp-1">{job.location || 'Remote'}</span>
                        </div>
                    </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
            </div>

            {/* Content: Title, Description */}
            <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={job.title}>
                    {job.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {job.description || "No description available."}
                </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-medium rounded-md px-2 py-1 h-auto">
                    <User className="h-3 w-3 mr-1" />
                    {positions} Positions
                </Badge>

                <Badge variant="secondary" className="bg-purple-50 text-primary font-medium rounded-md px-2 py-1 h-auto capitalize">
                    {job.jobType ? job.jobType.replace(/_/g, " ").toLowerCase() : "Full Time"}
                </Badge>

                {displaySalary && (
                    <Badge variant="outline" className="border-gray-200 text-gray-600 font-medium rounded-md px-2 py-1 h-auto">
                        {displaySalary}
                    </Badge>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 pt-2">
                <Button
                    variant="outline"
                    className="flex-1 border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-lg h-9 md:h-10 text-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${job.id}`);
                    }}
                >
                    Details
                </Button>
                <Button
                    className={`flex-1 rounded-lg h-9 md:h-10 text-sm transition-colors ${isSaved ? "bg-green-600 hover:bg-green-700 text-white" : "bg-primary hover:bg-primary/90 text-white"}`}
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? "..." : isSaved ? "Saved" : "Save"}
                </Button>
            </div>
        </Card>
    )
}
