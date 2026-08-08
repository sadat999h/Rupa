import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User as UserIcon } from "lucide-react";

export default function DashboardProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocationField] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setNameBn(user.nameBn ?? "");
      setBio(user.bio ?? "");
      setLocationField(user.location ?? "");
      setPhone(user.phone ?? "");
      setAvatar(user.avatar ?? "");
    }
  }, [user]);

  const updateMe = useUpdateMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({ title: "Profile updated", description: "Your artisan profile has been updated." });
      },
      onError: (err: any) => toast({ title: "Error", description: err.error || "Failed to update profile.", variant: "destructive" }),
    },
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Missing info", description: "Name is required.", variant: "destructive" });
      return;
    }
    updateMe.mutate({
      data: {
        name,
        nameBn: nameBn || null,
        bio: bio || null,
        location: location || null,
        phone: phone || null,
        avatar: avatar || null,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
      <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 flex items-center gap-3">
        <UserIcon className="h-8 w-8 text-primary" /> Artisan Profile
      </h1>
      <p className="text-muted-foreground mb-8">
        This is your public profile — buyers see this on your Artisan page{user.role === "seller" ? (
          <> (<Link href={`/sellers/${user.id}`} className="text-primary hover:underline">view it</Link>)</>
        ) : null}.
      </p>

      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-serif text-muted-foreground">{name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-1.5 block">Avatar Image URL</label>
                <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name (Bengali)</label>
              <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="আপনার নাম" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell buyers about yourself and your craft..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Location</label>
                <Input value={location} onChange={(e) => setLocationField(e.target.value)} placeholder="e.g. Dhanmondi, Dhaka" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880..." />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={updateMe.isPending}>
              {updateMe.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
