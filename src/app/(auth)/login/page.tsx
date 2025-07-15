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
import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
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
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Log in to access your digital wardrobe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jane.doe../../..example.com" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Your password" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Link href="/" className="w-full"><Button className="w-full">Login</Button></Link>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
