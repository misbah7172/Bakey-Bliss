import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { BakerApplication } from '@/components/dashboard/BakerApplication';
import { Helmet } from 'react-helmet';
import { roleRedirectMap } from '@/lib/utils';

// Extended schema for form validation
const loginSchema = insertUserSchema.pick({
  username: true,
  password: true,
});

const registerSchema = insertUserSchema.extend({
  passwordConfirm: z.string(),
  email: z.string().email(),
  fullName: z.string().min(2, 'Full name is required'),
}).refine(data => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Get tab from URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    if (tab === 'register' || tab === 'baker-application') {
      setActiveTab(tab);
    }
  }, []);
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      const redirectTo = roleRedirectMap[user.role] || '/';
      navigate(redirectTo);
    }
  }, [user, navigate]);
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      passwordConfirm: '',
      email: '',
      fullName: '',
    },
  });
  
  const onLoginSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  const onRegisterSubmit = async (data: RegisterFormValues) => {
    const { passwordConfirm, email, fullName, ...userData } = data;
    
    // In a real app, you'd likely store email and fullName as well
    // For this MVP, we'll just use username and password
    registerMutation.mutate(userData);
  };
  
  // Don't render the page content if user is authenticated (will be redirected)
  if (user) {
    return null;
  }
  
  return (
    <>
      <Helmet>
        <title>Login or Register | BakeryBliss</title>
        <meta name="description" content="Login or register to access your BakeryBliss account" />
      </Helmet>
      
      <div className="min-h-screen bg-neutral-light flex flex-col">
        <div className="py-4 px-4 bg-white shadow-sm">
          <div className="container mx-auto">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 40 40" 
                  className="text-primary"
                  fill="currentColor"
                >
                  <path d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20s20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16s-7.163 16-16 16z"/>
                  <path d="M20 8c-3.314 0-6 2.686-6 6v10c0 3.314 2.686 6 6 6c3.314 0 6-2.686 6-6V14c0-3.314-2.686-6-6-6zm2 16c0 1.105-.895 2-2 2s-2-.895-2-2v-6h4v6zm0-10h-4v-1c0-1.105.895-2 2-2s2 .895 2 2v1z"/>
                </svg>
                <span className="font-accent text-xl text-primary">BakeryBliss</span>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="flex-1 container mx-auto p-4 md:p-8 flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Auth Forms */}
          <div className="w-full max-w-md">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Login to access your BakeryBliss account
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          type="text"
                          {...loginForm.register('username')}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-destructive">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"}
                            {...loginForm.register('password')}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/70 hover:text-neutral-dark"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-destructive">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary-light"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              {/* Register Form */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Join BakeryBliss and start your baking journey
                    </CardDescription>
                  </CardHeader>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          type="text"
                          {...registerForm.register('fullName')}
                        />
                        {registerForm.formState.errors.fullName && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          {...registerForm.register('email')}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reg-username">Username</Label>
                        <Input 
                          id="reg-username" 
                          type="text"
                          {...registerForm.register('username')}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password</Label>
                        <div className="relative">
                          <Input 
                            id="reg-password" 
                            type={showPassword ? "text" : "password"}
                            {...registerForm.register('password')}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/70 hover:text-neutral-dark"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="passwordConfirm">Confirm Password</Label>
                        <div className="relative">
                          <Input 
                            id="passwordConfirm" 
                            type={showConfirmPassword ? "text" : "password"}
                            {...registerForm.register('passwordConfirm')}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-dark/70 hover:text-neutral-dark"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {registerForm.formState.errors.passwordConfirm && (
                          <p className="text-sm text-destructive">
                            {registerForm.formState.errors.passwordConfirm.message}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary-light"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Register"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              {/* Baker Application Form */}
              <TabsContent value="baker-application">
                <Card>
                  <CardHeader>
                    <CardTitle>Apply to Become a Baker</CardTitle>
                    <CardDescription>
                      Join our baking team and share your passion with our customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-neutral-dark/70">
                        Please sign up for an account first to apply as a baker.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('register')}
                        variant="outline"
                        className="w-full"
                      >
                        Register Now
                      </Button>
                      <p className="text-sm text-neutral-dark/70">
                        Already have an account? You can apply from your dashboard after logging in.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Image Side */}
          <div className="w-full max-w-lg hidden md:block">
            <div className="bg-primary rounded-xl overflow-hidden shadow-xl">
              <div className="p-8 md:p-12 flex flex-col">
                <h2 className="font-heading text-3xl font-bold text-white mb-4">
                  Taste the Difference at BakeryBliss
                </h2>
                <p className="text-white/90 mb-6">
                  Join our community of baking enthusiasts and enjoy:
                </p>
                <ul className="text-white/90 mb-8 space-y-4">
                  <li className="flex items-start">
                    <svg viewBox="0 0 24 24" className="mr-2 h-6 w-6 text-accent" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Custom cakes and chocolates tailored to your preferences</span>
                  </li>
                  <li className="flex items-start">
                    <svg viewBox="0 0 24 24" className="mr-2 h-6 w-6 text-accent" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Exclusive members-only discounts and early access to seasonal items</span>
                  </li>
                  <li className="flex items-start">
                    <svg viewBox="0 0 24 24" className="mr-2 h-6 w-6 text-accent" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Opportunity to become a baker and share your creations</span>
                  </li>
                  <li className="flex items-start">
                    <svg viewBox="0 0 24 24" className="mr-2 h-6 w-6 text-accent" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Seamless order tracking and direct communication with your baker</span>
                  </li>
                </ul>
                <img 
                  src="https://images.unsplash.com/photo-1549944850-84e00be4203b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="Artisan Breads"
                  className="rounded-lg shadow-md w-full h-48 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
