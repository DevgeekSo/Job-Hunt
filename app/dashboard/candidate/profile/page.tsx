"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";

export default function CandidateProfilePage() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [resumeFile, setResumeFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        // Personal
        name: "",
        title: "",
        bio: "",
        phone: "",

        // Education - 10th
        edu_10th_school: "",
        edu_10th_year: "",
        edu_10th_percentage: "",

        // Education - 12th
        edu_12th_college: "",
        edu_12th_year: "",
        edu_12th_percentage: "",

        // Education - Graduation
        edu_grad_college: "",
        edu_grad_degree: "",
        edu_grad_year: "",
        edu_grad_score: "",

        // Skills & Experience
        skills: "", // Keeping as string for simplicity, or could use tags UI
        experience: "",

        // Preferences
        pref_location: "",
        pref_salary: "",
        pref_job_type: "FULL_TIME",
        pref_role: "",

        // Resume
        resume_url: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const docRef = doc(db, "candidates", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFormData(prev => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    // Helper to convert file to Base64
    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSaving(true);
        // toast.info("Starting save process...");

        try {
            let downloadURL = formData.resume_url;

            if (resumeFile) {
                // Check file size (limit to 700KB for Firestore)
                if (resumeFile.size > 700 * 1024) {
                    toast.error("File too large. Max size is 700KB for free storage.");
                    setIsSaving(false);
                    return;
                }

                toast.info("Processing resume...");
                // Convert to Base64 to store in Firestore (Free, no Storage bucket needed)
                downloadURL = await convertToBase64(resumeFile);
                toast.success("Resume processed");
            }

            toast.info("Updating profile data...");
            const updateData = {
                ...formData,
                resume_url: downloadURL,
                updatedAt: new Date(),
                profileCompleted: true
            };

            await updateDoc(doc(db, "candidates", user.uid), updateData);

            await updateDoc(doc(db, "users", user.uid), {
                name: formData.name,
                profileCompleted: true
            });

            setFormData(prev => ({ ...prev, resume_url: downloadURL }));
            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(`Failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>;

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50/30">
            <div className="container max-w-4xl py-10 px-4">
                <h1 className="text-3xl font-bold mb-2 text-center">My Profile</h1>
                <p className="text-muted-foreground mb-8 text-center">Complete your profile to stand out to recruiters.</p>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details about you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="title">Professional Title</Label>
                                <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Fullstack Developer" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Summary</Label>
                                <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Briefly describe your professional background..." className="min-h-[100px]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Education */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Education Details</CardTitle>
                            <CardDescription>Your academic qualifications.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Graduation */}
                            <div className="space-y-4 border-b pb-4">
                                <h3 className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Graduation / Post Graduation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_grad_college">College / University</Label>
                                        <Input id="edu_grad_college" name="edu_grad_college" value={formData.edu_grad_college} onChange={handleChange} placeholder="University Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_grad_degree">Degree & Stream</Label>
                                        <Input id="edu_grad_degree" name="edu_grad_degree" value={formData.edu_grad_degree} onChange={handleChange} placeholder="e.g. B.Tech Computer Science" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_grad_year">Passing Year</Label>
                                        <Input id="edu_grad_year" name="edu_grad_year" value={formData.edu_grad_year} onChange={handleChange} placeholder="e.g. 2023" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_grad_score">CGPA / Percentage</Label>
                                        <Input id="edu_grad_score" name="edu_grad_score" value={formData.edu_grad_score} onChange={handleChange} placeholder="e.g. 8.5 CGPA or 85%" />
                                    </div>
                                </div>
                            </div>

                            {/* 12th / Diploma */}
                            <div className="space-y-4 border-b pb-4">
                                <h3 className="font-semibold text-sm text-muted-foreground">Class XII / Diploma</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_12th_college">School / College</Label>
                                        <Input id="edu_12th_college" name="edu_12th_college" value={formData.edu_12th_college} onChange={handleChange} placeholder="School Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_12th_year">Passing Year</Label>
                                        <Input id="edu_12th_year" name="edu_12th_year" value={formData.edu_12th_year} onChange={handleChange} placeholder="e.g. 2019" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_12th_percentage">Percentage</Label>
                                        <Input id="edu_12th_percentage" name="edu_12th_percentage" value={formData.edu_12th_percentage} onChange={handleChange} placeholder="e.g. 80%" />
                                    </div>
                                </div>
                            </div>

                            {/* 10th */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm text-muted-foreground">Class X</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_10th_school">School</Label>
                                        <Input id="edu_10th_school" name="edu_10th_school" value={formData.edu_10th_school} onChange={handleChange} placeholder="School Name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_10th_year">Passing Year</Label>
                                        <Input id="edu_10th_year" name="edu_10th_year" value={formData.edu_10th_year} onChange={handleChange} placeholder="e.g. 2017" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edu_10th_percentage">Percentage</Label>
                                        <Input id="edu_10th_percentage" name="edu_10th_percentage" value={formData.edu_10th_percentage} onChange={handleChange} placeholder="e.g. 85%" />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Job Preferences */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Preferences</CardTitle>
                            <CardDescription>Tell us what kind of job you are looking for.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="pref_role">Preferred Role</Label>
                                    <Input id="pref_role" name="pref_role" value={formData.pref_role} onChange={handleChange} placeholder="e.g. Frontend Developer" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pref_job_type">Preferred Job Type</Label>
                                    <select
                                        id="pref_job_type"
                                        name="pref_job_type"
                                        value={formData.pref_job_type}
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
                                    <Label htmlFor="pref_location">Preferred Location</Label>
                                    <Input id="pref_location" name="pref_location" value={formData.pref_location} onChange={handleChange} placeholder="e.g. Bangalore, Remote" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pref_salary">Expected Salary (Annual)</Label>
                                    <Input id="pref_salary" name="pref_salary" value={formData.pref_salary} onChange={handleChange} placeholder="e.g. 8 LPA" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills & Experience */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Skills & Experience</CardTitle>
                            <CardDescription>Your professional toolkit.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="skills">Technical Skills</Label>
                                <Input id="skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g. React.js, Node.js, Python, AWS (Comma separated)" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Work Experience Summary</Label>
                                <Textarea id="experience" name="experience" value={formData.experience} onChange={handleChange} placeholder="Briefly describe your past roles and companies..." className="min-h-[100px]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resume Upload */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resume</CardTitle>
                            <CardDescription>Upload your latest CV.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.resume_url && (
                                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
                                    <FileText className="h-5 w-5" />
                                    <span className="text-sm font-medium">Resume Uploaded</span>
                                    <a href={formData.resume_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-sm underline hover:text-green-800">View / Download</a>
                                </div>
                            )}
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="resume">Upload Resume (PDF, DOCX - Max 700KB)</Label>
                                <div className="flex gap-2">
                                    <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="cursor-pointer" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" size="lg" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Profile
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
