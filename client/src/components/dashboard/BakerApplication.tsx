import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Send, BarChart3, Award, Star, ChefHat, Users } from 'lucide-react';
import { User } from '@shared/schema';

// Define the form schema
const applicationSchema = z.object({
  requested_role: z.enum(['junior_baker', 'main_baker']),
  preferred_main_baker_id: z.number().optional(),
  experience: z.string().min(50, {
    message: 'Please provide at least 50 characters describing your baking experience.',
  }),
  reason: z.string().min(50, {
    message: 'Please provide at least 50 characters explaining why you want to join our team.',
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function BakerApplication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasApplied, setHasApplied] = useState(false);

  // Get existing applications if any
  const { data: applications, isLoading: loadingApplications } = useQuery({
    queryKey: ['/api/baker-applications'],
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setHasApplied(true);
      }
    },
  });

  // Fetch main bakers for selection
  const { data: mainBakers = [], isLoading: loadingMainBakers } = useQuery<User[]>({
    queryKey: ['/api/users/main-bakers'],
    enabled: !!user,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      // Filter only main bakers from the response
      const users = await response.json();
      return users.filter((u: User) => u.role === 'main_baker');
    }
  });

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      requested_role: 'junior_baker',
      experience: '',
      reason: '',
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormValues) => {
      const response = await apiRequest('POST', '/api/baker-applications', {
        ...data,
        current_baker_role: user?.role || 'customer',
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully. We will review it shortly.',
      });
      setHasApplied(true);
      queryClient.invalidateQueries({ queryKey: ['/api/baker-applications'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Application Failed',
        description: error.message || 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ApplicationFormValues) => {
    applicationMutation.mutate(data);
  };

  const isPending = !!applications?.find(app => app.status === 'pending');
  const isApproved = !!applications?.find(app => app.status === 'approved');
  const isRejected = !!applications?.find(app => app.status === 'rejected');

  if (isApproved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-500" />
            Application Approved
          </CardTitle>
          <CardDescription>
            Congratulations! Your application has been approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your account has been upgraded to {user?.role === 'main_baker' ? 'Main Baker' : 'Junior Baker'}.
            You now have access to additional features and responsibilities.
          </p>
          <Button className="mt-4" variant="default">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (loadingApplications) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isPending) {
    const pendingApp = applications?.find(app => app.status === 'pending');
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-500" />
            Application Pending
          </CardTitle>
          <CardDescription>
            Your application is currently under review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Requested Role:</h3>
              <p className="text-sm text-muted-foreground">
                {pendingApp?.requested_role === 'main_baker' ? 'Main Baker' : 'Junior Baker'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Date Applied:</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(pendingApp?.created_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isRejected) {
    const rejectedApp = applications?.find(app => app.status === 'rejected');
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            Application Not Approved
          </CardTitle>
          <CardDescription>
            Unfortunately, your application was not approved at this time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Date Reviewed:</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(rejectedApp?.updated_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              You can apply again after gaining more experience or improving your skills.
            </p>
          </div>
          <Button 
            className="mt-4" 
            variant="outline"
            onClick={() => setHasApplied(false)}
          >
            Apply Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Baker Application</CardTitle>
        <CardDescription>
          Apply to become a baker at BakeryBliss
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="requested_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desired Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="junior_baker">Junior Baker</SelectItem>
                      {user?.role === 'junior_baker' && (
                        <SelectItem value="main_baker">Main Baker</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === 'junior_baker' 
                      ? 'Junior Bakers prepare products based on assignments from Main Bakers.'
                      : 'Main Bakers manage orders and delegate tasks to Junior Bakers.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Main Baker Selection for Junior Baker applications */}
            {form.watch("requested_role") === "junior_baker" && (
              <FormField
                control={form.control}
                name="preferred_main_baker_id"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <div>
                      <FormLabel>Choose a Main Baker</FormLabel>
                      <FormDescription>
                        Select a main baker you'd like to work with. Main bakers supervise and mentor junior bakers.
                      </FormDescription>
                    </div>
                    
                    {loadingMainBakers ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : mainBakers.length === 0 ? (
                      <div className="bg-muted p-4 rounded-md text-center">
                        <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">No main bakers available</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your application will be assigned to a main baker by the admin.
                        </p>
                      </div>
                    ) : (
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                        >
                          {mainBakers.map((baker) => (
                            <div key={baker.id} className="relative">
                              <RadioGroupItem
                                value={baker.id.toString()}
                                id={`baker-${baker.id}`}
                                className="absolute right-4 top-4 h-5 w-5"
                              />
                              <label
                                htmlFor={`baker-${baker.id}`}
                                className="block cursor-pointer rounded-lg border bg-card p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12">
                                    <AvatarFallback>
                                      {baker.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="line-clamp-2 flex-1 text-left">
                                    <p className="font-medium">{baker.username}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                      <ChefHat className="h-3 w-3" />
                                      Main Baker
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center text-xs">
                                  <div className="flex items-center gap-0.5 text-amber-500">
                                    {Array(5).fill(null).map((_, i) => (
                                      <Star key={i} className="h-3 w-3 fill-current" />
                                    ))}
                                  </div>
                                  <span className="ml-1 text-muted-foreground">
                                    5.0 · 100+ orders
                                  </span>
                                </div>
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Baking Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your baking experience, skills, and any relevant education or training."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include details about types of baking you've done, how long you've been baking, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to join our team?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain why you want to join BakeryBliss and what makes you a good candidate."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Tell us about your passion for baking and what you hope to contribute to our team.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={applicationMutation.isPending}
            >
              {applicationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}