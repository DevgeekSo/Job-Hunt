'use server'

// DISABLED: This file uses Prisma but app now uses Firebase
// import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateCompanyProfile(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'EMPLOYER') {
        throw new Error("Unauthorized")
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const website = formData.get("website") as string
    const location = formData.get("location") as string

    await db.company.upsert({
        where: { userId: session.user.id },
        create: {
            userId: session.user.id,
            name,
            description,
            website,
            location
        },
        update: {
            name,
            description,
            website,
            location
        }
    })

    revalidatePath("/dashboard/employer")
}
