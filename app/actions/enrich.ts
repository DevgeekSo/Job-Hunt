"use server";

import { db } from "@/lib/firebase"; // Using Firebase db
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
    "Deloitte": "https://upload.wikimedia.org/wikipedia/commons/5/56/Deloitte.svg",
    "BOEING": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Boeing_full_logo.svg",
    "NetApp": "https://upload.wikimedia.org/wikipedia/commons/3/3e/NetApp_logo.svg",
    "TCS": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    "Infosys": "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    "Wipro": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg"
};

export async function enrichLogosWithClearbit() {
    try {
        // Fetch all jobs
        const jobsRef = collection(db, "jobs");
        const snapshot = await getDocs(jobsRef);

        let updatedCount = 0;

        const updates = snapshot.docs.map(async (jobDoc) => {
            const data = jobDoc.data();

            const companyName = data.company?.name;
            if (!companyName) return;

            let finalLogoUrl = null;

            // 0. Check Custom Map (Case-insensitive partial match)
            // e.g. "Microsoft Corp" matches "Microsoft"
            const mapKey = Object.keys(LOGO_MAP).find(key =>
                companyName.toLowerCase().includes(key.toLowerCase()) ||
                key.toLowerCase().includes(companyName.toLowerCase())
            );

            if (mapKey) {
                finalLogoUrl = LOGO_MAP[mapKey];
            } else {
                // Skip if already has a valid logo URL and wasn't manually mapped
                if (data.company?.logo && data.company.logo.startsWith("http")) return;

                // Heuristic: Name -> Domain
                const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, "") + ".com";

                // 1. Try Clearbit
                const clearbitUrl = `https://logo.clearbit.com/${domain}`;
                // 2. Fallback to Google
                const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

                try {
                    // Try Clearbit first
                    const res = await fetch(clearbitUrl);
                    if (res.ok) {
                        finalLogoUrl = clearbitUrl;
                    } else {
                        // If Clearbit fails, try Google (almost always returns an image, even a default globe)
                        finalLogoUrl = googleUrl;
                    }
                } catch (e) {
                    // If fetch fails (network etc), fallback to Google
                    finalLogoUrl = googleUrl;
                }
            }

            if (finalLogoUrl) {
                await updateDoc(doc(db, "jobs", jobDoc.id), {
                    "company.logo": finalLogoUrl
                });
                updatedCount++;
            }
        });

        await Promise.all(updates);

        return { success: true, count: updatedCount };
    } catch (error) {
        console.error("Enrichment error:", error);
        return { success: false, error: "Failed to enrich logos" };
    }
}
