"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Briefcase, User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<"candidate" | "employer">("candidate");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // Create user profile in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                role: role,
                createdAt: new Date(),
                profileCompleted: false,
            });

            // Create role-specific document
            if (role === "candidate") {
                await setDoc(doc(db, "candidates", user.uid), {
                    uid: user.uid,
                    name: formData.name,
                    email: formData.email,
                });
            } else {
                await setDoc(doc(db, "employers", user.uid), {
                    uid: user.uid,
                    name: formData.name,
                    email: formData.email,
                });
            }

            toast.success("Account created successfully");
            router.push("/");

        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                toast.error("Email already in use");
            } else {
                toast.error("Failed to create account: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 text-primary font-bold text-2xl mb-2">
                        <Briefcase className="h-8 w-8" />
                        <span>JobHub</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
                        Create an account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join thousands of professionals and companies
                    </p>
                </div>

                <Card className="border-0 shadow-lg ring-1 ring-gray-900/5 sm:rounded-xl">
                    <CardHeader>
                        <CardTitle className="text-xl">I want to...</CardTitle>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div
                                className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all ${role === "candidate"
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                                onClick={() => setRole("candidate")}
                            >
                                <User className={`h-8 w-8 mb-2 ${role === "candidate" ? "text-primary" : "text-gray-500"}`} />
                                <span className={`font-medium ${role === "candidate" ? "text-primary" : "text-gray-700"}`}>
                                    Find a Job
                                </span>
                            </div>
                            <div
                                className={`cursor-pointer rounded-lg border-2 p-4 flex flex-col items-center justify-center transition-all ${role === "employer"
                                    ? "border-primary bg-primary/5"
                                    : "border-gray-200 hover:border-gray-300"
                                    }`}
                                onClick={() => setRole("employer")}
                            >
                                <Building2 className={`h-8 w-8 mb-2 ${role === "employer" ? "text-primary" : "text-gray-500"}`} />
                                <span className={`font-medium ${role === "employer" ? "text-primary" : "text-gray-700"}`}>
                                    Hire Talent
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Account
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <div className="text-center text-sm w-full">
                            Already have an account?{" "}
                            <Link href="/login" className="font-medium text-primary hover:underline">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
