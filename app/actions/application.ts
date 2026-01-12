'use server'

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
// import { ApplicationStatus } from "@prisma/client"
type ApplicationStatus = "PENDING" | "REVIEWING" | "INTERVIEWING" | "OFFERED" | "REJECTED" | "ACCEPTED"

export async function applyToJob(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error("Unauthorized")

    const jobId = formData.get("jobId") as string
    const resumeUrl = formData.get("resumeUrl") as string
    const coverLetter = formData.get("coverLetter") as string

    // Check if already applied
    const existing = await db.application.findUnique({
        where: {
            jobId_candidateId: {
                jobId,
                candidateId: session.user.id
            }
        }
    })

    if (existing) throw new Error("Already applied")

    await db.application.create({
        data: {
            jobId,
            candidateId: session.user.id,
            resumeUrl,
            coverLetter
        }
    })

    revalidatePath(`/jobs/${jobId}`)
    revalidatePath("/dashboard/candidate")
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'EMPLOYER') throw new Error("Unauthorized")

    // Verify ownership of the job this application belongs to
    const application = await db.application.findUnique({
        where: { id: applicationId },
        include: { job: true }
    })

    if (!application) throw new Error("Application not found")

    // Check if the current user owns the company that owns the job
    const company = await db.company.findUnique({
        where: { userId: session.user.id }
    })

    if (!company || company.id !== application.job.companyId) {
        throw new Error("Unauthorized")
    }

    await db.application.update({
        where: { id: applicationId },
        data: { status: status as any }
    })
    revalidatePath("/dashboard/employer")
}
