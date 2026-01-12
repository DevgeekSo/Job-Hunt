"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, ChevronDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { searchJobTitles, searchLocations } from "@/lib/search-utils"

export function JobFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [q, setQ] = useState(searchParams.get("q") || "")
    const [location, setLocation] = useState(searchParams.get("location") || "")
    const [type, setType] = useState(searchParams.get("type") || "")

    // Autocomplete states
    const [jobSuggestions, setJobSuggestions] = useState<string[]>([])
    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
    const [showJobDropdown, setShowJobDropdown] = useState(false)
    const [showLocationDropdown, setShowLocationDropdown] = useState(false)
    const [loadingJobs, setLoadingJobs] = useState(false)
    const [loadingLocations, setLoadingLocations] = useState(false)

    const jobInputRef = useRef<HTMLInputElement>(null)
    const locationInputRef = useRef<HTMLInputElement>(null)
    const jobDropdownRef = useRef<HTMLDivElement>(null)
    const locationDropdownRef = useRef<HTMLDivElement>(null)

    // Update state when URL params change
    useEffect(() => {
        setQ(searchParams.get("q") || "")
        setLocation(searchParams.get("location") || "")
        setType(searchParams.get("type") || "")
    }, [searchParams])

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target as Node) &&
                jobInputRef.current && !jobInputRef.current.contains(event.target as Node)) {
                setShowJobDropdown(false)
            }
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node) &&
                locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
                setShowLocationDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Debounced search for job titles
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (q.length >= 2) {
                setLoadingJobs(true)
                const suggestions = await searchJobTitles(q)
                setJobSuggestions(suggestions)
                setLoadingJobs(false)
                if (suggestions.length > 0) {
                    setShowJobDropdown(true)
                }
            } else {
                setJobSuggestions([])
                setShowJobDropdown(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [q])

    // Debounced search for locations
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (location.length >= 2 && location.toLowerCase() !== 'remote') {
                setLoadingLocations(true)
                const suggestions = await searchLocations(location)
                setLocationSuggestions(suggestions)
                setLoadingLocations(false)
                if (suggestions.length > 0) {
                    setShowLocationDropdown(true)
                }
            } else {
                setLocationSuggestions([])
                setShowLocationDropdown(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [location])

    const handleSearch = () => {
        const params = new URLSearchParams()
        if (q) params.set("q", q)
        if (location) params.set("location", location)
        if (type) params.set("type", type)

        router.push(`/jobs?${params.toString()}`)
        setShowJobDropdown(false)
        setShowLocationDropdown(false)
    }

    const handleTypeChange = (val: string) => {
        setType(val === type ? "" : val)
        const params = new URLSearchParams(searchParams.toString())
        if (val) params.set("type", val)
        else params.delete("type")
        router.push(`/jobs?${params.toString()}`)
    }

    const selectJobSuggestion = (suggestion: string) => {
        setQ(suggestion)
        setShowJobDropdown(false)
        const params = new URLSearchParams(searchParams.toString())
        params.set("q", suggestion)
        router.push(`/jobs?${params.toString()}`)
    }

    const selectLocationSuggestion = (suggestion: string) => {
        setLocation(suggestion)
        setShowLocationDropdown(false)
        const params = new URLSearchParams(searchParams.toString())
        params.set("location", suggestion)
        router.push(`/jobs?${params.toString()}`)
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch()
        } else if (e.key === "Escape") {
            setShowJobDropdown(false)
            setShowLocationDropdown(false)
        }
    }

    return (
        <div className="space-y-8 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Filters</h3>
            </div>

            {/* Search with Autocomplete */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Search</Label>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 z-10" />
                    <Input
                        ref={jobInputRef}
                        placeholder="Job title or keyword"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={onKeyDown}
                        onFocus={() => jobSuggestions.length > 0 && setShowJobDropdown(true)}
                        className="pl-9 bg-white"
                    />
                    {showJobDropdown && (
                        <div
                            ref={jobDropdownRef}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                            {loadingJobs ? (
                                <div className="p-3 text-sm text-gray-500">Searching...</div>
                            ) : jobSuggestions.length > 0 ? (
                                <div className="py-1">
                                    {jobSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            onClick={() => selectJobSuggestion(suggestion)}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-sm text-gray-500">No suggestions found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Location with Autocomplete */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Location</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 z-10" />
                    <Input
                        ref={locationInputRef}
                        placeholder="City or state"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={onKeyDown}
                        onFocus={() => locationSuggestions.length > 0 && setShowLocationDropdown(true)}
                        className="pl-9 bg-white"
                    />
                    {showLocationDropdown && (
                        <div
                            ref={locationDropdownRef}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
                        >
                            {loadingLocations ? (
                                <div className="p-3 text-sm text-gray-500">Searching...</div>
                            ) : locationSuggestions.length > 0 ? (
                                <div className="py-1">
                                    {locationSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            onClick={() => selectLocationSuggestion(suggestion)}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-3 text-sm text-gray-500">No suggestions found</div>
                            )}
                        </div>
                    )}
                </div>
                {/* Remote Only Toggle */}
                <div className="flex items-center space-x-2 pt-1">
                    <div className={`h-4 w-4 rounded-full border border-primary ${location.toLowerCase() === 'remote' ? 'bg-primary' : ''} cursor-pointer`} onClick={() => {
                        const newLoc = location.toLowerCase() === 'remote' ? '' : 'Remote';
                        setLocation(newLoc);
                        const params = new URLSearchParams(searchParams.toString())
                        if (newLoc) params.set("location", newLoc)
                        else params.delete("location")
                        router.push(`/jobs?${params.toString()}`)
                    }}></div>
                    <Label className="font-normal cursor-pointer" onClick={() => {
                        const newLoc = location.toLowerCase() === 'remote' ? '' : 'Remote';
                        setLocation(newLoc);
                        const params = new URLSearchParams(searchParams.toString())
                        if (newLoc) params.set("location", newLoc)
                        else params.delete("location")
                        router.push(`/jobs?${params.toString()}`)
                    }}>Remote only</Label>
                </div>
            </div>

            {/* Job Type */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Job Type</Label>
                    <span className="text-muted-foreground text-xs cursor-pointer hover:text-foreground" onClick={() => handleTypeChange("")}>Clear</span>
                </div>
                <RadioGroup value={type} onValueChange={handleTypeChange} className="space-y-2">
                    {["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"].map((t) => (
                        <div key={t} className="flex items-center space-x-2">
                            <RadioGroupItem value={t} id={t} className="border-primary text-primary" />
                            <Label htmlFor={t} className="font-normal capitalize cursor-pointer">
                                {t.replace("_", " ").toLowerCase()}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Experience Level</Label>
                    <span className="text-muted-foreground text-xs cursor-pointer hover:text-foreground" onClick={() => {
                        const params = new URLSearchParams(searchParams.toString())
                        params.delete("level")
                        router.push(`/jobs?${params.toString()}`)
                    }}>Clear</span>
                </div>
                <RadioGroup value={searchParams.get("level") || ""} onValueChange={(val) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (val) params.set("level", val)
                    else params.delete("level")
                    router.push(`/jobs?${params.toString()}`)
                }} className="space-y-2">
                    {["Fresher", "Junior", "Mid Level", "Senior", "Lead", "Executive"].map((lvl) => (
                        <div key={lvl} className="flex items-center space-x-2">
                            <RadioGroupItem value={lvl} id={lvl} className="border-primary text-primary" />
                            <Label htmlFor={lvl} className="font-normal text-muted-foreground cursor-pointer">{lvl}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Salary Range - Visual Only */}
            <div className="space-y-3">
                <Label className="text-sm font-semibold">Salary Range (LPA)</Label>
                {/* Visual placeholder */}
                <div className="text-xs text-muted-foreground">Select range...</div>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSearch}>
                Apply Filters
            </Button>
        </div>
    )
}
