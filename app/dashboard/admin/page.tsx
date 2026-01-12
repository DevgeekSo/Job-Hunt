import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') redirect('/')

    const usersCount = await db.user.count()
    const jobsCount = await db.job.count()
    const companiesCount = await db.company.count()

    return (
        <div className="container py-10 px-4">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Users</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{usersCount}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Jobs</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{jobsCount}</p></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Companies</CardTitle></CardHeader>
                    <CardContent><p className="text-3xl font-bold">{companiesCount}</p></CardContent>
                </Card>
            </div>
        </div>
    )
}
