import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold mb-4">Debug Jobs Data</h1>
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 p-2">Title</th>
                        <th className="border border-gray-300 p-2">Job Type (Raw)</th>
                        <th className="border border-gray-300 p-2">Company</th>
                        <th className="border border-gray-300 p-2">Location</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job: any) => (
                        <tr key={job.id}>
                            <td className="border border-gray-300 p-2">{job.title}</td>
                            <td className="border border-gray-300 p-2 font-mono bg-gray-100">{job.jobType}</td>
                            <td className="border border-gray-300 p-2">{job.company?.name}</td>
                            <td className="border border-gray-300 p-2">{job.location}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <pre className="mt-8 bg-gray-100 p-4 overflow-auto max-h-96">
                {JSON.stringify(jobs, null, 2)}
            </pre>
        </div>
    );
}
