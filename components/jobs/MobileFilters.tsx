"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { JobFilters } from "./JobFilters"

export function MobileFilters() {
    const [open, setOpen] = useState(false)

    return (
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        <span className="hidden xs:inline">Filters</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Filter Jobs</SheetTitle>
                    </SheetHeader>
                    <JobFilters />
                </SheetContent>
            </Sheet>
        </div>
    )
}
