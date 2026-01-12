"use client";

import Link from "next/link";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full border-t border-primary/20 bg-primary text-white pt-16 pb-8">
            <div className="container px-4 md:px-6">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
                            <span className="text-white"><Briefcase className="h-6 w-6" /></span>
                            <span className="text-white">JobHub</span>
                        </Link>
                        <p className="text-white/80 text-sm leading-relaxed max-w-xs">
                            Your trusted partner in finding the perfect job opportunity. Connect with top companies and build your career today.
                        </p>
                    </div>

                    {/* For Candidates */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-white text-lg">For Candidates</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/jobs" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Browse Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/companies" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Browse Companies
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/candidate/ats" className="text-white/70 hover:text-white transition-colors text-sm">
                                    ATS Resume Checker
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/candidate/saved" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Saved Jobs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* For Employers */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-white text-lg">For Employers</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/dashboard/employer/jobs/new" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Post a Job
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/employer" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Employer Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-white/70 hover:text-white transition-colors text-sm">
                                    Pricing Plans
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h3 className="font-semibold text-white text-lg">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-white/80 text-sm">
                                <Mail className="h-5 w-5 text-white shrink-0" />
                                <span>support@jobhub.com</span>
                            </li>
                            <li className="flex items-start gap-3 text-white/80 text-sm">
                                <Phone className="h-5 w-5 text-white shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-start gap-3 text-white/80 text-sm">
                                <MapPin className="h-5 w-5 text-white shrink-0" />
                                <span>123 Market Street<br />San Francisco, CA 94103</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-sm text-white/70">
                        &copy; {new Date().getFullYear()} JobHub. All rights reserved. • Made by Sandeep Hinwar
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-sm text-white/70 hover:text-white">Privacy Policy</Link>
                        <Link href="/terms" className="text-sm text-white/70 hover:text-white">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
