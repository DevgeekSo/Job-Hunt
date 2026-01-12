"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchJobTitles, searchLocations } from "@/lib/search-utils";

export function HomeSearchBar() {
    const router = useRouter();
    const [jobSearch, setJobSearch] = useState("");
    const [locationSearch, setLocationSearch] = useState("");

    // Autocomplete states
    const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
    const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
    const [showJobDropdown, setShowJobDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [loadingLocations, setLoadingLocations] = useState(false);

    const jobInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const jobDropdownRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (jobDropdownRef.current && !jobDropdownRef.current.contains(event.target as Node) &&
                jobInputRef.current && !jobInputRef.current.contains(event.target as Node)) {
                setShowJobDropdown(false);
            }
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node) &&
                locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
                setShowLocationDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search for job titles
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (jobSearch.length >= 2) {
                setLoadingJobs(true);
                const suggestions = await searchJobTitles(jobSearch);
                setJobSuggestions(suggestions);
                setLoadingJobs(false);
                if (suggestions.length > 0) {
                    setShowJobDropdown(true);
                }
            } else {
                setJobSuggestions([]);
                setShowJobDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [jobSearch]);

    // Debounced search for locations
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (locationSearch.length >= 2) {
                setLoadingLocations(true);
                const suggestions = await searchLocations(locationSearch);
                setLocationSuggestions(suggestions);
                setLoadingLocations(false);
                if (suggestions.length > 0) {
                    setShowLocationDropdown(true);
                }
            } else {
                setLocationSuggestions([]);
                setShowLocationDropdown(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [locationSearch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (jobSearch) params.set("q", jobSearch);
        if (locationSearch) params.set("location", locationSearch);

        setShowJobDropdown(false);
        setShowLocationDropdown(false);

        router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
    };

    const selectJobSuggestion = (suggestion: string) => {
        setJobSearch(suggestion);
        setShowJobDropdown(false);
    };

    const selectLocationSuggestion = (suggestion: string) => {
        setLocationSearch(suggestion);
        setShowLocationDropdown(false);
    };

    return (
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 p-2 bg-white md:bg-gray-50 md:rounded-full md:border md:shadow-sm">
            <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-gray-400 z-10" />
                <Input
                    ref={jobInputRef}
                    className="pl-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-12 md:h-full"
                    placeholder="Job title, keywords..."
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                    onFocus={() => jobSuggestions.length > 0 && setShowJobDropdown(true)}
                />
                {showJobDropdown && (
                    <div
                        ref={jobDropdownRef}
                        className="absolute z-50 w-full top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto text-left"
                    >
                        {loadingJobs ? (
                            <div className="p-3 text-sm text-gray-500 text-left">Searching...</div>
                        ) : jobSuggestions.length > 0 ? (
                            <div className="py-1">
                                {jobSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-left"
                                        onClick={() => selectJobSuggestion(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3 text-sm text-gray-500 text-left">No suggestions found</div>
                        )}
                    </div>
                )}
            </div>
            <div className="hidden md:block w-px h-8 bg-gray-200 self-center"></div>
            <div className="flex-1 relative flex items-center">
                <MapPin className="absolute left-4 h-5 w-5 text-gray-400 z-10" />
                <Input
                    ref={locationInputRef}
                    className="pl-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base h-12 md:h-full"
                    placeholder="City or remote"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    onFocus={() => locationSuggestions.length > 0 && setShowLocationDropdown(true)}
                />
                {showLocationDropdown && (
                    <div
                        ref={locationDropdownRef}
                        className="absolute z-50 w-full top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto text-left"
                    >
                        {loadingLocations ? (
                            <div className="p-3 text-sm text-gray-500 text-left">Searching...</div>
                        ) : locationSuggestions.length > 0 ? (
                            <div className="py-1">
                                {locationSuggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-left"
                                        onClick={() => selectLocationSuggestion(suggestion)}
                                    >
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-3 text-sm text-gray-500 text-left">No suggestions found</div>
                        )}
                    </div>
                )}
            </div>
            <Button type="submit" size="lg" className="rounded-full h-12 w-12 md:w-auto md:px-8 bg-primary hover:bg-primary/90 p-0 md:p-4">
                <SearchIcon className="h-5 w-5 md:hidden" />
                <span className="hidden md:inline">Search</span>
            </Button>
        </form>
    );
}
