// Admin dashboard temporarily disabled - was using Prisma DB
// Project now uses Firebase, admin features need to be reimplemented
import { redirect } from "next/navigation"

export default async function AdminDashboard() {
    // Admin features disabled - project migrated to Firebase
    redirect('/')
}
