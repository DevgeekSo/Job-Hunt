"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";

export default function EditJobPage() {
    const { user, userData } = useAuth();
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        location: "",
        jobType: "FULL_TIME",
        workMode: "ON_SITE",
        vacancies: "",
        deadline: "",
        salary_range: "",
        description: "",
        requirements: "",
        benefits: "",
        experienceLevel: "",
        education: "",
        skills: "",
        companyName: "",
        companyLogo: "",
        companyWebsite: "",
        companyDescription: "",
        industry: "",
        companySize: ""
    });

    useEffect(() => {
        const fetchJob = async () => {
            if (!user || !jobId) return;

            try {
                const jobRef = doc(db, "jobs", jobId);
                const jobSnap = await getDoc(jobRef);

                if (jobSnap.exists()) {
                    const jobData = jobSnap.data();

                    // Check if the user owns this job
                    if (jobData.recruiterId !== user.uid) {
                        toast.error("You don't have permission to edit this job");
                        router.push("/dashboard/employer");
                        return;
                    }

                    // Populate form with existing data
                    setFormData({
                        title: jobData.title || "",
                        location: jobData.location || "",
                        jobType: jobData.jobType || "FULL_TIME",
                        workMode: jobData.workMode || "ON_SITE",
                        vacancies: jobData.vacancies || "",
                        deadline: jobData.deadline || "",
                        salary_range: jobData.salary_range || "",
                        description: jobData.description || "",
                        requirements: jobData.requirements || "",
                        benefits: jobData.benefits || "",
                        experienceLevel: jobData.experienceLevel || "",
                        education: jobData.education || "",
                        skills: Array.isArray(jobData.skills) ? jobData.skills.join(", ") : "",
                        companyName: jobData.company?.name || jobData.companyName || "",
                        companyLogo: jobData.company?.logo || jobData.companyLogo || "",
                        companyWebsite: jobData.company?.website || jobData.companyWebsite || "",
                        companyDescription: jobData.company?.about || jobData.companyDescription || "",
                        industry: jobData.company?.industry || jobData.industry || "",
                        companySize: jobData.company?.size || jobData.companySize || ""
                    });
                } else {
                    toast.error("Job not found");
                    router.push("/dashboard/employer");
                }
            } catch (error) {
                console.error("Error fetching job:", error);
                toast.error("Failed to load job");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [user, jobId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            const jobRef = doc(db, "jobs", jobId);

            await updateDoc(jobRef, {
                ...formData,
                skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
                company: {
                    name: formData.companyName || "Hidden Company",
                    logo: formData.companyLogo || null,
                    website: formData.companyWebsite,
                    about: formData.companyDescription,
                    industry: formData.industry,
                    size: formData.companySize
                },
                updatedAt: serverTimestamp()
            });

            toast.success("Job updated successfully");
            router.push("/dashboard/employer");
        } catch (error) {
            console.error("Error updating job:", error);
            toast.error("Failed to update job");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50/30">
            <div className="container max-w-3xl py-10 px-4">
                <div className="mb-6">
                    <Link href="/dashboard/employer">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-center">Edit Job Post</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Company Information Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>Tell candidates about your organization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name</Label>
                                    <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Inc." required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry</Label>
                                    <select
                                        id="industry"
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="Information Technology">Information Technology</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Education">Education</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="companySize">Company Size</Label>
                                    <select
                                        id="companySize"
                                        name="companySize"
                                        value={formData.companySize}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select Size</option>
                                        <option value="1-10">1-10 Employees</option>
                                        <option value="11-50">11-50 Employees</option>
                                        <option value="51-200">51-200 Employees</option>
                                        <option value="201-500">201-500 Employees</option>
                                        <option value="500+">500+ Employees</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyLogo">Company Logo URL</Label>
                                    <Input id="companyLogo" name="companyLogo" value={formData.companyLogo} onChange={handleChange} placeholder="https://example.com/logo.png" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyWebsite">Company Website</Label>
                                <Input id="companyWebsite" name="companyWebsite" value={formData.companyWebsite} onChange={handleChange} placeholder="https://acme.org" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="companyDescription">About Company</Label>
                                <Textarea id="companyDescription" name="companyDescription" value={formData.companyDescription} onChange={handleChange} placeholder="Tell us about your company mission and culture..." className="min-h-[100px]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Basics Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <CardDescription>The core details of the position.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="jobType">Job Type</Label>
                                    <select
                                        id="jobType"
                                        name="jobType"
                                        value={formData.jobType}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="FULL_TIME">Full Time</option>
                                        <option value="PART_TIME">Part Time</option>
                                        <option value="CONTRACT">Contract</option>
                                        <option value="INTERNSHIP">Internship</option>
                                        <option value="REMOTE">Remote</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="workMode">Work Mode</Label>
                                    <select
                                        id="workMode"
                                        name="workMode"
                                        value={formData.workMode}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="ON_SITE">On-Site</option>
                                        <option value="HYBRID">Hybrid</option>
                                        <option value="REMOTE">Remote</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. New York, NY" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="vacancies">Vacancies</Label>
                                    <Input id="vacancies" name="vacancies" type="number" min="1" value={formData.vacancies} onChange={handleChange} placeholder="e.g. 1" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Application Deadline</Label>
                                    <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirements & Compensation Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements & Compensation</CardTitle>
                            <CardDescription>Who are you looking for and what do you offer?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="experienceLevel">Experience Level</Label>
                                    <select
                                        id="experienceLevel"
                                        name="experienceLevel"
                                        value={formData.experienceLevel}
                                        onChange={handleChange}
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select Level</option>
                                        <option value="Fresher">Fresher</option>
                                        <option value="Junior">Junior (1-2 years)</option>
                                        <option value="Mid Level">Mid Level (3-5 years)</option>
                                        <option value="Senior">Senior (5-8 years)</option>
                                        <option value="Lead">Lead (8+ years)</option>
                                        <option value="Executive">Executive</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="education">Education Requirements</Label>
                                    <Textarea
                                        id="education"
                                        name="education"
                                        value={formData.education}
                                        onChange={handleChange}
                                        placeholder="e.g., Bachelor's degree in Computer Science or related field. Master's preferred."
                                        className="min-h-[80px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salary_range">Salary Range</Label>
                                <Input id="salary_range" name="salary_range" value={formData.salary_range} onChange={handleChange} placeholder="e.g. $100k - $140k" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skills">Skills (Comma separated)</Label>
                                <Input id="skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React, Node.js, TypeScript" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details & Benefits</CardTitle>
                            <CardDescription>Detailed information about the role</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="description">Job Description</Label>
                                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Detailed role responsibilities..." className="min-h-[150px]" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="requirements">Requirements</Label>
                                <Textarea id="requirements" name="requirements" value={formData.requirements} onChange={handleChange} placeholder="Key qualifications and skills..." className="min-h-[100px]" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="benefits">Benefits & Perks</Label>
                                <Textarea id="benefits" name="benefits" value={formData.benefits} onChange={handleChange} placeholder="Healthcare, Remote work, Equity..." className="min-h-[80px]" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Link href="/dashboard/employer" className="flex-1">
                            <Button type="button" variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Job
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
