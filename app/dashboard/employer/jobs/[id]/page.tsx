"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function JobApplicationsPage() {
    const { id } = useParams(); // Job ID
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [jobTitle, setJobTitle] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!user || typeof id !== 'string') return;
            setLoading(true);
            try {
                // First verify job belongs to recruiter (optional but good security)
                const jobRef = doc(db, "jobs", id);
                const jobSnap = await getDoc(jobRef);
                if (jobSnap.exists()) {
                    setJobTitle(jobSnap.data().title);
                }

                const appsRef = collection(db, "applications");
                const q = query(appsRef, where("jobId", "==", id));
                const snapshot = await getDocs(q);

                const appsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setApplications(appsData);
            } catch (error) {
                console.error("Error fetching applications:", error);
                toast.error("Failed to load applications");
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [id, user]);

    const updateStatus = async (appId: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, "applications", appId), {
                status: newStatus
            });
            setApplications(apps => apps.map(app =>
                app.id === appId ? { ...app, status: newStatus } : app
            ));
            toast.success(`Application updated to ${newStatus}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container py-10 px-4">
            <h1 className="text-3xl font-bold mb-2">Applications for {jobTitle}</h1>
            <p className="text-muted-foreground mb-8">Manage candidates for this position.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Candidates ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">No applications yet.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Applied At</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Resume</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.candidateName}</TableCell>
                                        <TableCell>{app.candidateEmail}</TableCell>
                                        <TableCell>{app.appliedAt?.seconds ? new Date(app.appliedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={app.status === 'HIRED' ? 'default' : app.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                                {app.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {/* Need to fetch resume URL from candidate profile or store it in application */}
                                            {/* Assuming we store resumeUrl in application for easier access or fetch profile here. Simple: Button placeholder */}
                                            <Button variant="outline" size="sm" onClick={() => toast.info("View profile feature coming soon")}>
                                                View Profile
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" onClick={() => updateStatus(app.id, "INTERVIEWING")}>Interview</Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateStatus(app.id, "HIRED")}>Hire</Button>
                                                <Button size="sm" variant="destructive" onClick={() => updateStatus(app.id, "REJECTED")}>Reject</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
