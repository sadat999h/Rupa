import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/context/auth";
import { useRegister, RegisterInputRole } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, ShoppingBag } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  nameBn: z.string().optional(),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phone: z.string().optional(),
  role: z.enum(['buyer', 'seller'] as const),
  location: z.string().optional(),
  bio: z.string().optional(),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login: authenticate } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      nameBn: "",
      email: "",
      password: "",
      phone: "",
      role: "buyer",
      location: "",
      bio: "",
    },
  });

  const selectedRole = form.watch("role");

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate({ data: values }, {
      onSuccess: (res) => {
        authenticate(res.token);
        toast({ title: "Welcome to Rupa!", description: "Your account has been created." });
        setLocation(res.user.role === 'seller' ? "/dashboard" : "/");
      },
      onError: (err: any) => {
        toast({ 
          title: "Registration failed", 
          description: err.error || "An error occurred during registration.", 
          variant: "destructive" 
        });
      }
    });
  }

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <div className="bg-card border border-border/50 rounded-2xl p-8 md:p-10 shadow-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-primary mb-3">Join the Community</h1>
          <p className="text-muted-foreground">Discover or sell beautiful handmade products</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">I want to...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="buyer" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                          <ShoppingBag className="mb-3 h-6 w-6 text-primary" />
                          <span className="font-medium text-lg">Shop</span>
                          <span className="text-xs text-muted-foreground mt-1">Discover unique items</span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="seller" className="peer sr-only" />
                        </FormControl>
                        <FormLabel className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                          <Store className="mb-3 h-6 w-6 text-primary" />
                          <span className="font-medium text-lg">Sell</span>
                          <span className="text-xs text-muted-foreground mt-1">Open your own shop</span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tasnia Rahman" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameBn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name in Bengali (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="তাসনিয়া রহমান" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="01XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === "seller" && (
              <div className="space-y-6 pt-4 border-t border-border/50">
                <h3 className="font-serif text-lg font-medium text-foreground">Shop Details</h3>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (City/Area)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Dhanmondi, Dhaka" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About You & Your Craft</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell buyers about your background, what you make, and your inspiration..." 
                          className="resize-none h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full rounded-full py-6 text-lg font-medium mt-4" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
