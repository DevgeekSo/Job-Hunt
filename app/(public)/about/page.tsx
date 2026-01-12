import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-50/30">
            <div className="container py-20 max-w-4xl px-4">
                <h1 className="text-4xl font-bold text-center mb-10">About JobHub</h1>

                <div className="grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Our Mission</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                At JobHub, our mission is to connect improved talent with the best opportunities.
                                We believe that finding a job should be a seamless, transparent, and empowering experience.
                                Whether you are a fresh graduate looking for your first internship or a seasoned professional seeking a career pivot,
                                JobHub provides the tools and resources you need to succeed.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Why Choose Us?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li><strong>AI-Powered Matching:</strong> Our algorithms ensure you see jobs that actually fit your profile.</li>
                                <li><strong>Verified Employers:</strong> We vet every company to ensure safe and legitimate opportunities.</li>
                                <li><strong>Career Growth Tools:</strong> From resume checking to skill assessments, we help you prepare.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
