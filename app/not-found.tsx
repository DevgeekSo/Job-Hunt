import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
            <h2 className="text-4xl font-bold">404</h2>
            <p className="text-xl font-semibold">Page Not Found</p>
            <p className="text-muted-foreground">The resource you are looking for does not exist or has been moved.</p>
            <Link href="/">
                <Button variant="default">Return Home</Button>
            </Link>
        </div>
    )
}
