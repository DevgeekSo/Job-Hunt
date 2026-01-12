'use server'
import { writeFile } from "fs/promises"
import { join } from "path"

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File
    if (!file) throw new Error("No file uploaded")

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save to public/uploads
    // Note: In Vercel/Production, use S3/Cloudinary. This is local only.
    const path = join(process.cwd(), "public/uploads", file.name)
    try {
        await writeFile(path, buffer)
        return `/uploads/${file.name}`
    } catch (error) {
        console.error("Upload failed:", error)
        throw new Error("Upload failed")
    }
}
