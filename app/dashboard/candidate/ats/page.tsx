"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, TrendingUp, AlertCircle, CheckCircle, FileText } from "lucide-react"
import { analyzeResume } from "@/app/actions/ats"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"

export default function ATSCheckerPage() {
    const { user } = useAuth()
    const [resumeData, setResumeData] = useState<string | null>(null)
    const [jobDesc, setJobDesc] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(true)

    useEffect(() => {
        const fetchResume = async () => {
            if (!user) return
            try {
                const docRef = doc(db, "candidates", user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const data = docSnap.data()
                    if (data.resume_url) {
                        setResumeData(data.resume_url)
                    }
                }
            } catch (error) {
                console.error("Error fetching resume:", error)
            } finally {
                setIsLoadingProfile(false)
            }
        }
        fetchResume()
    }, [user])

    const handleAnalyze = async () => {
        if (!resumeData) {
            toast.error("No resume found. Please upload one in your profile first.")
            return
        }

        setIsAnalyzing(true)
        try {
            const data = await analyzeResume(resumeData, jobDesc)
            if (data.error) {
                toast.error(data.error)
            } else {
                setResult(data)
                toast.success("Analysis complete!")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred during analysis")
        } finally {
            setIsAnalyzing(false)
        }
    }

    if (isLoadingProfile) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="container max-w-4xl py-10 px-4">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-primary" />
                AI Resume Checker
            </h1>
            <p className="text-muted-foreground mb-8">
                We analyze your <strong>uploaded resume</strong> using Google's Gemini AI to give you a score and actionable feedback.
            </p>

            <div className="grid gap-8 lg:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Resume Source</CardTitle>
                            <CardDescription>We use the resume directly from your profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {resumeData ? (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                    <FileText className="h-6 w-6 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-800">Resume Detected</p>
                                        <p className="text-xs text-green-600">Ready for analysis</p>
                                    </div>
                                    <CheckCircle className="ml-auto h-5 w-5 text-green-600" />
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                    <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                    <p className="font-medium text-yellow-800">No Resume Found</p>
                                    <p className="text-xs text-yellow-600 mb-3">Please upload a resume in your profile first.</p>
                                    <Link href="/dashboard/candidate/profile">
                                        <Button variant="outline" size="sm" className="bg-white">Go to Profile</Button>
                                    </Link>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Description (Optional)</label>
                                <Textarea
                                    placeholder="Paste the job description you are targeting..."
                                    className="min-h-[100px]"
                                    value={jobDesc}
                                    onChange={(e) => setJobDesc(e.target.value)}
                                />
                            </div>
                            <Button onClick={handleAnalyze} disabled={isAnalyzing || !resumeData} className="w-full">
                                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isAnalyzing ? "Analyzing..." : "Analyze My Resume"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {result ? (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    Analysis Result
                                    <span className={`text-2xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {result.score}/100
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Progress value={result.score} className="h-3" />

                                <div className="p-4 bg-white rounded-lg border">
                                    <p className="font-medium text-gray-900 mb-2">Summary</p>
                                    <p className="text-sm text-gray-600">{result.summary}</p>
                                </div>

                                {result.missingSkills && result.missingSkills.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-red-600">
                                            <AlertCircle className="h-4 w-4" /> Missing Keywords
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.missingSkills.map((skill: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-100">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {result.suggestions && result.suggestions.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2 mb-2 text-primary">
                                            <CheckCircle className="h-4 w-4" /> Suggestions
                                        </h4>
                                        <ul className="space-y-2">
                                            {result.suggestions.map((suggestion: string, i: number) => (
                                                <li key={i} className="text-sm text-gray-700 flex gap-2">
                                                    <span className="text-primary">•</span> {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl bg-gray-50/50">
                            <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
                            <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                            <p className="max-w-xs text-sm">We'll use your uploaded resume to provide an ATS score and insights.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
