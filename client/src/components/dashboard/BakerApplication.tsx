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
import { Loader2, Send, BarChart3, Award } from 'lucide-react';

// Define the form schema
const applicationSchema = z.object({
  requested_role: z.enum(['junior_baker', 'main_baker']),
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