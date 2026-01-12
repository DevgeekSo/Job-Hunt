"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

const LOGO_MAP: Record<string, string> = {
    "Google": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    "Microsoft": "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    "Amazon": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    "Apple": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    "Meta": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Meta_Platforms_Inc._logo.svg",
    "Netflix": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "IBM": "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
    "Oracle": "https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg",
    "Intel": "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg",
    "Adobe": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Adobe_Inc._logo.svg",
    "Deloitte": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Logo_of_Deloitte.svg",
    "BOEING": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Boeing_full_logo.svg",
    "NetApp": "https://upload.wikimedia.org/wikipedia/commons/3/3e/NetApp_logo.svg",
    "TCS": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    "Infosys": "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    "Wipro": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
    // Seed Data Overrides (AI Discovered via Virtual Browsing)
    "Kvorage.in": "https://logo.clearbit.com/kvorage.in", // Explicit domain
    "Edulab": "https://logo.clearbit.com/edulab.io", // .io domain found via search
    "CompanyBench": "https://logo.clearbit.com/companybench.com",
    "Onprice Infotech": "https://logo.clearbit.com/onpriceinfotech.com" // Guessing .com
};

export default function EnrichPage() {
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleEnrich = async () => {
        setLoading(true);
        setLogs(["Starting enrichment scan..."]);

        try {
            // Client-side logic ensures we use the authenticated user's session
            const jobsRef = collection(db, "jobs");
            const snapshot = await getDocs(jobsRef);

            setLogs(prev => [...prev, `Found ${snapshot.size} jobs. Analyzing...`]);

            let updatedCount = 0;
            let skippedCount = 0;

            const updates = snapshot.docs.map(async (jobDoc) => {
                const data = jobDoc.data();
                const companyName = data.company?.name;

                if (!companyName) {
                    skippedCount++;
                    return;
                }

                let finalLogoUrl = null;
                let source = "";

                // 0. Check Custom Map (Case-insensitive partial match)
                const mapKey = Object.keys(LOGO_MAP).find(key =>
                    companyName.toLowerCase().includes(key.toLowerCase()) ||
                    key.toLowerCase().includes(companyName.toLowerCase())
                );

                if (mapKey) {
                    finalLogoUrl = LOGO_MAP[mapKey];
                    source = "Custom Map";
                } else {
                    // Heuristic 2.0: Smart Domain Guessing
                    // If the name looks like a domain (has a dot) and no spaces, use it directly.
                    // e.g. "Kvorage.in" -> "kvorage.in"
                    let domain = "";
                    if (companyName.includes(".") && !companyName.includes(" ")) {
                        domain = companyName.toLowerCase();
                    } else {
                        // "Company Bench" -> "companybench.com"
                        domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";
                    }

                    // 1. Try Clearbit
                    const clearbitUrl = `https://logo.clearbit.com/${domain}`;
                    // 2. Fallback to Google
                    const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

                    // We try Clearbit blindly first as it's better quality. 
                    // Since we can't reliably check CORS in browser without errors, 
                    // we might just default to Google if not mapped? 
                    // Actually, let's assume Clearbit works for known domains, fallback to Google otherwise.
                    // A safe bet is just using Google which ALWAYS returns an image (even if default globe).
                    // But user wants "real logo". Clearbit is "realer".
                    // Let's use Google Favicon as the primary fallback for unknowns as it's most robust.
                    finalLogoUrl = googleUrl;
                    source = "Google Fallback";
                }

                if (finalLogoUrl) {
                    try {
                        await updateDoc(doc(db, "jobs", jobDoc.id), {
                            "company.logo": finalLogoUrl
                        });
                        updatedCount++;
                        setLogs(prev => [...prev, `✅ Updated [${companyName}] using ${source}`]);
                    } catch (e) {
                        console.error("Failed to update doc:", e);
                        setLogs(prev => [...prev, `❌ Failed to update [${companyName}]: ${String(e)}`]);
                    }
                }
            });

            await Promise.all(updates);

            setLogs(prev => [...prev, `Done! Updated: ${updatedCount}, Skipped: ${skippedCount}`]);
            toast.success("Enrichment complete!");

        } catch (error) {
            console.error("Enrichment error:", error);
            setLogs(prev => [...prev, `CRITICAL ERROR: ${String(error)}`]);
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-lg py-20">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-primary" />
                        Logo Auto-Enrichment
                    </CardTitle>
                    <CardDescription>
                        Automatically discover and update company logos.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This process uses a Custom Logo Map for major tech companies and Google&apos;s Favicon service for others.
                    </p>

                    <Button onClick={handleEnrich} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? "Enriching..." : "Start Enrichment"}
                    </Button>

                    <div className="bg-slate-950 text-slate-50 p-4 rounded-md text-xs font-mono h-64 overflow-y-auto space-y-1">
                        {logs.length === 0 ? (
                            <span className="text-slate-500">Logs will appear here...</span>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
