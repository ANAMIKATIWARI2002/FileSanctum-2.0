import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, RotateCcw, X, Send } from "lucide-react";
import { format } from "date-fns";

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["viewer", "contributor", "admin"]),
  message: z.string().optional(),
});

type InviteForm = z.infer<typeof inviteSchema>;

interface Invitation {
  id: number;
  email: string;
  role: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function UserInvite() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery<Invitation[]>({
    queryKey: ["/api/invitations"],
  });

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "viewer",
      message: "",
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteForm) => {
      const response = await apiRequest("POST", "/api/invitations", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      form.reset();
      toast({
        title: "Invitation sent",
        description: "The user will receive an email invitation",
      });
    },
    onError: () => {
      toast({
        title: "Failed to send invitation",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateInvitationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // In a real implementation, this would call an API to update invitation status
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      toast({
        title: "Invitation updated",
        description: "Invitation status has been updated",
      });
    },
  });

  const onSubmit = (data: InviteForm) => {
    inviteMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "outline",
      accepted: "default",
      expired: "secondary",
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-600 bg-red-50";
      case "contributor":
        return "text-blue-600 bg-blue-50";
      case "viewer":
        return "text-green-600 bg-green-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5" />
            <span>Invite Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) => form.setValue("role", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                rows={3}
                {...form.register("message")}
              />
            </div>
            <Button 
              type="submit" 
              disabled={inviteMutation.isPending}
              className="w-full md:w-auto"
            >
              {inviteMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No invitations</h3>
              <p className="text-slate-600">
                Invited users will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {invitation.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={getRoleColor(invitation.role)}
                        >
                          {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                        </Badge>
                        {getStatusBadge(invitation.status)}
                        <span className="text-xs text-slate-500">
                          Sent {format(new Date(invitation.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => 
                        updateInvitationMutation.mutate({ 
                          id: invitation.id, 
                          status: "pending" 
                        })
                      }
                      disabled={updateInvitationMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => 
                        updateInvitationMutation.mutate({ 
                          id: invitation.id, 
                          status: "expired" 
                        })
                      }
                      className="text-red-600 hover:text-red-700"
                      disabled={updateInvitationMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <h4 className="font-medium text-green-900 mb-2">Viewer</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• View files and system status</li>
                <li>• Download files</li>
                <li>• View activity logs</li>
              </ul>
            </div>
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Contributor</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• All viewer permissions</li>
                <li>• Upload and delete files</li>
                <li>• View system analytics</li>
              </ul>
            </div>
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-medium text-red-900 mb-2">Administrator</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All contributor permissions</li>
                <li>• Manage nodes and system</li>
                <li>• Invite and manage users</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
