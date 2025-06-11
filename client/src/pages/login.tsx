import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import Header from "@/components/landing/header";
import { useToast } from "@/hooks/use-toast";
import { loginWithEmail } from "@/lib/supabase";
import { getTempUser, createTempSession } from "@/lib/auth-bypass";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Try Supabase login first
      const { user, session, error } = await loginWithEmail(data.email, data.password);

      if (user && session) {
        localStorage.setItem('supabase_session', JSON.stringify(session));
        localStorage.setItem('user', JSON.stringify(user));
        
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        
        setLocation('/dashboard');
        return;
      }

      // If Supabase login failed, try temp user authentication
      if (error?.message?.includes("Email not confirmed") || error?.message?.includes("Invalid login credentials")) {
        const tempUser = getTempUser(data.email, data.password);
        if (tempUser) {
          createTempSession(tempUser);
          
          toast({
            title: "Welcome back!",
            description: "You've been successfully logged in.",
          });
          
          setLocation('/dashboard');
          return;
        }
      }

      // If both methods fail, throw the original error
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      // Check if this is an email confirmation error
      if (error.message?.includes("Email not confirmed")) {
        toast({
          title: "Email not confirmed",
          description: "Please check your email for a confirmation link, or try registering again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-900">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-midnight-800 border-midnight-700">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
                <CardDescription className="text-gray-400">
                  Sign in to your QuoteKit account
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10 bg-midnight-700 border-midnight-600 text-white placeholder-gray-400"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10 pr-10 bg-midnight-700 border-midnight-600 text-white placeholder-gray-400"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-neon-500 hover:bg-neon-600 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-neon-400 hover:text-neon-300">
                      Sign up
                    </Link>
                  </p>
                  
                  <Link href="/forgot-password" className="text-sm text-gray-400 hover:text-white mt-2 inline-block">
                    Forgot your password?
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}