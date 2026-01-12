"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Building2, Calendar, DollarSign, CheckCircle, Briefcase, BookmarkIcon, Share2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { SimilarJobs } from "@/components/jobs/SimilarJobs";

export default function JobDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, userData } = useAuth();

    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [saving, setSaving] = useState(false); // Helper for save button (placeholder)
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const [applicantCount, setApplicantCount] = useState(0);

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchJobAndApplicationStatus = async () => {
            setLoading(true);
            try {
                if (typeof id !== "string") return;

                // Fetch Job
                const jobRef = doc(db, "jobs", id);
                const jobSnap = await getDoc(jobRef);

                if (jobSnap.exists()) {
                    setJob({ id: jobSnap.id, ...jobSnap.data() });
                } else {
                    toast.error("Job not found");
                }

                // Check application count
                const appsRef = collection(db, "applications");
                const countQuery = query(appsRef, where("jobId", "==", id));
                const countSnapshot = await getDocs(countQuery);
                setApplicantCount(countSnapshot.size);

                // Check if user applied OR saved
                if (user) {
                    // Check Application
                    const appQ = query(appsRef, where("jobId", "==", id), where("candidateId", "==", user.uid));
                    const appSnap = await getDocs(appQ);
                    if (!appSnap.empty) setHasApplied(true);

                    // Check Saved
                    const savedRef = collection(db, "saved_jobs");
                    const savedQ = query(savedRef, where("jobId", "==", id), where("candidateId", "==", user.uid));
                    const savedSnap = await getDocs(savedQ);
                    if (!savedSnap.empty) setIsSaved(true);
                }

            } catch (error) {
                console.error("Error fetching job:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobAndApplicationStatus();
    }, [id, user]);

    const handleApply = async () => {
        if (!user) {
            toast.error("Please login to apply");
            router.push(`/login?redirect=/jobs/${id}`);
            return;
        }

        if (userData?.role === "employer") {
            toast.error("Employers cannot apply to jobs");
            return;
        }

        setApplying(true);
        try {
            await addDoc(collection(db, "applications"), {
                jobId: id,
                candidateId: user.uid,
                recruiterId: job.recruiterId, // Make sure job has this
                status: "PENDING",
                appliedAt: new Date(),
                candidateName: userData?.name || user.displayName || "Unknown Candidate",
                candidateEmail: user.email,
                jobTitle: job.title
            });
            setHasApplied(true);
            toast.success("Application submitted successfully!");
        } catch (error) {
            console.error("Error applying:", error);
            toast.error("Failed to submit application");
        } finally {
            setApplying(false);
        }
    };

    const handleSaveJob = async () => {
        if (!user) {
            toast.error("Please login to save jobs");
            return;
        }
        setSaving(true);
        try {
            const savedRef = collection(db, "saved_jobs");

            if (isSaved) {
                // Unsave
                const q = query(savedRef, where("jobId", "==", id), where("candidateId", "==", user.uid));
                const snap = await getDocs(q);
                snap.forEach(async (d) => {
                    await deleteDoc(doc(db, "saved_jobs", d.id));
                });
                setIsSaved(false);
                toast.success("Job removed from saved items");
            } else {
                // Save
                await addDoc(savedRef, {
                    jobId: id,
                    candidateId: user.uid,
                    jobTitle: job.title,
                    companyName: job.company?.name || "Unknown",
                    savedAt: new Date()
                });
                setIsSaved(true);
                toast.success("Job saved to your dashboard!");
            }
        } catch (error) {
            console.error("Error saving job:", error);
            toast.error("Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    if (!job) return <div className="container py-20 text-center">Job not found</div>;

    const logoLetter = job.company?.name ? job.company.name.charAt(0).toUpperCase() : "C";

    return (
        <div className="container py-8 w-full max-w-[1700px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Main Content - Left Column (9 cols wide on desktop) */}
                <div className="lg:col-span-9 space-y-8">

                    {/* Header Section */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Briefcase className="w-32 h-32 text-primary" />
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 relative z-10">
                            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shrink-0 overflow-hidden">
                                {job.company?.logo ? (
                                    <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                                ) : (
                                    logoLetter
                                )}
                            </div>

                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{job.company?.name || "Company Name"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>{job.location || "Remote"}</span>
                                        {job.workMode && <span className="text-gray-300">|</span>}
                                        {job.workMode && <span>{job.workMode.replace(/_/g, " ")}</span>}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {job.jobType && (
                                        <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 uppercase tracking-wide text-xs">
                                            {job.jobType.replace(/_/g, " ")}
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 uppercase tracking-wide text-xs">
                                        {job.salary_range || job.salary || "Competitive"}
                                    </Badge>
                                    <Badge variant="outline" className="px-3 py-1 border-gray-200 text-gray-600">
                                        Posted {job.createdAt?.seconds ? new Date(job.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 uppercase tracking-wide text-xs">
                                        {applicantCount} Applicants
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Job Description
                            </h2>
                            <div className={`prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line relative ${!isDescriptionExpanded ? "max-h-[200px] overflow-hidden" : ""}`}>
                                {job.description}
                                {!isDescriptionExpanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                className="mt-2 text-primary hover:text-primary/90 p-0 h-auto font-medium"
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            >
                                {isDescriptionExpanded ? "Show Less" : "Read More"}
                            </Button>
                        </div>

                        {/* Key Responsibilities */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Key Responsibilities
                            </h2>
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {job.requirements || "No specific requirements listed."}
                            </div>
                        </div>

                        {/* Job Requirements Section */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                Job Requirements
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500 font-medium">Experience Level</div>
                                    <div className="text-gray-900 font-medium">{job.experienceLevel || "Not specified"}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500 font-medium">Job Type</div>
                                    <div className="text-gray-900 font-medium capitalize">{job.jobType ? job.jobType.replace(/_/g, " ").toLowerCase() : "Full Time"}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500 font-medium">Salary Range</div>
                                    <div className="text-gray-900 font-medium">{job.salary_range || job.salary || "Competitive"}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500 font-medium">Location</div>
                                    <div className="text-gray-900 font-medium">{job.location || "Remote"}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500 font-medium">Education</div>
                                    <div className="text-gray-900 font-medium">{job.education || "Not specified"}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500 font-medium">Vacancies</div>
                                    <div className="text-gray-900 font-medium">{job.vacancies || "Not specificed"}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-sm text-gray-500 font-medium">Deadline</div>
                                    <div className="text-gray-900 font-medium">{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open until filled"}</div>
                                </div>
                            </div>

                            {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-500 font-medium">Required Skills</div>
                                    <div className="flex flex-wrap gap-2">
                                        {job.skills.map((skill: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Company Info Card (Moved to Main Content) */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                About {job.company?.name || "the Company"}
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shrink-0 overflow-hidden">
                                    {job.company?.logo ? (
                                        <img src={job.company.logo} alt={job.company.name} className="h-full w-full object-cover" />
                                    ) : (
                                        logoLetter
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">{job.company?.name || "Company"}</h3>
                                        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                            {job.location && (
                                                <>
                                                    <MapPin className="h-3 w-3" />
                                                    {job.location}
                                                </>
                                            )}
                                            {job.company?.industry && (
                                                <>
                                                    <span className="text-gray-300 text-xs">|</span>
                                                    <span>{job.company.industry}</span>
                                                </>
                                            )}
                                            {job.company?.size && (
                                                <>
                                                    <span className="text-gray-300 text-xs">|</span>
                                                    <span>{job.company.size}</span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">
                                            {job.company?.about || `Join ${job.company?.name || "our team"} and help us build the future. We are looking for talented individuals to grow with us.`}
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {job.company?.website && (
                                                <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                                                    <Button variant="outline" size="sm">
                                                        Visit Website
                                                    </Button>
                                                </a>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => { }}>
                                                View Company Profile
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Actions Card (Sticky) */}
                    <div className="sticky top-24 space-y-6">
                        <Card className="border-gray-100 shadow-sm overflow-hidden">
                            <div className="bg-primary/5 p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Interested in this job?</h3>
                                <p className="text-xs text-muted-foreground mt-1">Review the details and apply when you are ready.</p>
                            </div>
                            <CardContent className="p-5 space-y-4">
                                {hasApplied ? (
                                    <Button className="w-full bg-green-600 hover:bg-green-700 h-12 text-base" disabled>
                                        <CheckCircle className="mr-2 h-5 w-5" /> Application Sent
                                    </Button>
                                ) : (
                                    <Button className="w-full bg-primary hover:bg-primary/90 h-12 text-base shadow-sm" onClick={handleApply} disabled={applying}>
                                        {applying && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Apply Now
                                    </Button>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant={isSaved ? "secondary" : "outline"} className="w-full" onClick={handleSaveJob} disabled={saving}>
                                        <BookmarkIcon className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                                        {saving ? "Updating..." : isSaved ? "Saved" : "Save Job"}
                                    </Button>
                                    <Button variant="outline" className="w-full" onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success("Link copied to clipboard!");
                                    }}>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Similar Jobs Component */}
                        <div className="bg-gray-50/50 rounded-2xl p-1">
                            <SimilarJobs currentJobId={job.id} jobType={job.jobType} />
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}
