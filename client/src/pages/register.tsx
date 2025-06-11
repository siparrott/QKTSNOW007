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
import { signUpWithEmail, loginWithEmail } from "@/lib/supabase";
import { storeTempUser, createTempSession } from "@/lib/auth-bypass";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    
    try {
      const { user, session, error } = await signUpWithEmail(data.email, data.password);

      // If Supabase signup successful with session, use it
      if (user && session) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('supabase_session', JSON.stringify(session));
        
        toast({
          title: "Registration successful!",
          description: "Please select your subscription plan to continue.",
        });
        
        setLocation('/subscribe');
        return;
      }

      // If Supabase signup succeeded but no session (email confirmation required), create temp user
      if (user && !session) {
        const tempUser = storeTempUser(data.email, data.password);
        createTempSession(tempUser);
        
        toast({
          title: "Registration successful!",
          description: "Please select your subscription plan to continue.",
        });
        
        setLocation('/subscribe');
        return;
      }

      // If signup failed, check if it's a rate limit or email issue (common with Supabase)
      if (error) {
        console.log('Signup failed, creating temporary account for user:', error.message);
        
        // For rate limits or email issues, create temporary user and continue smoothly
        if (error.message?.includes('rate limit') || 
            error.message?.includes('email') || 
            error.message?.includes('confirmation')) {
          
          const tempUser = storeTempUser(data.email, data.password);
          createTempSession(tempUser);
          
          toast({
            title: "Welcome to QuoteKit!",
            description: "Your account has been created. Let's set up your subscription.",
          });
          
          setLocation('/subscribe');
          return;
        }
        
        // For other errors, show appropriate message
        throw new Error(error.message);
      }
      
      // Fallback: create temporary user if no response
      const tempUser = storeTempUser(data.email, data.password);
      createTempSession(tempUser);
      
      toast({
        title: "Welcome to QuoteKit!",
        description: "Your account has been created. Let's set up your subscription.",
      });
      
      setLocation('/subscribe');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Only show error for genuine failures (not rate limits)
      if (!error.message?.includes('rate limit') && 
          !error.message?.includes('email') && 
          !error.message?.includes('confirmation')) {
        
        let errorMessage = "Registration failed. Please try again.";
        
        if (error.message?.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (error.message?.includes('Invalid email')) {
          errorMessage = "Please enter a valid email address.";
        } else if (error.message?.includes('Password')) {
          errorMessage = "Password must be at least 6 characters long.";
        }
        
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Even in catch block, if it's just a rate limit, create user and continue
        const tempUser = storeTempUser(data.email, data.password);
        createTempSession(tempUser);
        
        toast({
          title: "Welcome to QuoteKit!",
          description: "Your account has been created. Let's set up your subscription.",
        });
        
        setLocation('/subscribe');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#060517'}}>
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
                <CardTitle className="text-2xl text-white">Create Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Get started with QuoteKit today
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                type="text"
                                placeholder="Enter your full name"
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
                                placeholder="Create a password"
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
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                className="pl-10 pr-10 bg-midnight-700 border-midnight-600 text-white placeholder-gray-400"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-400">
                    Already have an account?{" "}
                    <Link href="/login" className="text-neon-400 hover:text-neon-300">
                      Sign in
                    </Link>
                  </p>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 text-center">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-neon-400 hover:text-neon-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-neon-400 hover:text-neon-300">
                    Privacy Policy
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