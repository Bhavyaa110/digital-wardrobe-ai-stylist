'use client';

import { Button } from "../../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { useState } from "react";
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"; // ✅ Import router

export default function SignupPage() {
  const router = useRouter(); // ✅ Initialize router

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      // parse JSON safely
      const data = await res.json().catch(() => ({} as any));

      if (res.ok) {
        console.log('Signup successful:', data);
        router.push('/login');
        return;
      }

      // show helpful error in dev and log
      const msg = data?.message || data?.error || JSON.stringify(data) || 'Signup failed';
      console.error('Signup failed:', msg);
      // quick dev feedback (replace with UI toast if desired)
      alert(msg);
    } catch (networkErr) {
      console.error('Network or unexpected error during signup:', networkErr);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/20">
                    <Sparkles className="text-primary w-6 h-6"/>
                </div>
                <h1 className="text-3xl font-headline">Fitzy</h1>
            </div>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Join Fitzy and revolutionize your wardrobe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full mt-4">Create Account</Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
