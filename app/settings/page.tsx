"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Users, 
  Building2, 
  Plug, 
  Bell, 
  CreditCard, 
  Shield, 
  Palette,
  Plus,
  Trash2,
  Edit,
  Key,
  Mail,
  Smartphone,
  Globe,
  Settings as SettingsIcon,
  Briefcase,
  Loader2,
  Save
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data
const locations = [
  { id: 1, name: "Main Kitchen - Downtown", address: "123 Main St", users: 12, status: "Active" },
  { id: 2, name: "Prep Area - Uptown", address: "456 Oak Ave", users: 8, status: "Active" },
  { id: 3, name: "Storage Facility", address: "789 Elm St", users: 4, status: "Active" },
];

const teams = [
  { id: 1, name: "Kitchen Staff", members: 15, lead: "Sarah M.", locations: 2 },
  { id: 2, name: "Dining Room", members: 10, lead: "John D.", locations: 1 },
  { id: 3, name: "Management", members: 5, lead: "Maria G.", locations: 3 },
];

const users = [
  { id: 1, name: "Sarah Martinez", email: "sarah@checkit.com", role: "Kitchen Manager", team: "Kitchen Staff", status: "Active" },
  { id: 2, name: "John Davis", email: "john@checkit.com", role: "Team Lead", team: "Dining Room", status: "Active" },
  { id: 3, name: "Maria Garcia", email: "maria@checkit.com", role: "Admin", team: "Management", status: "Active" },
  { id: 4, name: "David Lee", email: "david@checkit.com", role: "Inspector", team: "Kitchen Staff", status: "Inactive" },
];

const integrations = [
  { id: 1, name: "Slack", description: "Real-time alerts and notifications", icon: "💬", status: "Connected" },
  { id: 2, name: "Email (SMTP)", description: "Send email notifications", icon: "✉️", status: "Connected" },
  { id: 3, name: "Webhooks", description: "Custom API integrations", icon: "🔗", status: "Not Connected" },
  { id: 4, name: "Google Drive", description: "Export reports to Drive", icon: "📁", status: "Not Connected" },
];

export default function SettingsPage() {
  const { workspaceId, user, updateProfile } = useAuth();
  const [workspace, setWorkspace] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([]);
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceData();
    }
  }, [workspaceId]);

  useEffect(() => {
    if (user) {
      // Load user metadata
      setFirstName(user.user_metadata?.first_name || '');
      setLastName(user.user_metadata?.last_name || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [user]);

  const loadWorkspaceData = async () => {
    if (!workspaceId) return;
    
    setIsLoadingWorkspace(true);
    try {
      // Load workspace details
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) throw workspaceError;
      
      setWorkspace(workspaceData);
      setWorkspaceName(workspaceData.name);

      // Load workspace members with user details using RPC function
      const { data: membersData, error: membersError } = await supabase
        .rpc('get_workspace_members_with_users', { workspace_uuid: workspaceId });

      if (membersError) throw membersError;
      
      setWorkspaceMembers(membersData || []);
    } catch (error: any) {
      console.error('Error loading workspace:', error);
      toast.error('Failed to load workspace data');
    } finally {
      setIsLoadingWorkspace(false);
    }
  };

  const handleSaveWorkspaceName = async () => {
    if (!workspaceId || !workspaceName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ name: workspaceName.trim() })
        .eq('id', workspaceId);

      if (error) throw error;
      
      setWorkspace({ ...workspace, name: workspaceName.trim() });
      toast.success('Workspace name updated successfully');
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      toast.error('Failed to update workspace name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name are required");
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(firstName, lastName, phone);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    
      <div className="w-full h-full overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                <SettingsIcon className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                Manage your organization, users, and application preferences
              </p>
            </div>

          <Tabs defaultValue="workspace" className="space-y-6">
            <TabsList className="bg-[#1a1a1a] flex flex-wrap md:flex-nowrap">
              <TabsTrigger value="workspace">Workspace</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="users">Users & Teams</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Workspace Tab */}
            <TabsContent value="workspace" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#c4dfc4]" />
                    Workspace Information
                  </CardTitle>
                  <CardDescription>
                    Manage your workspace settings and details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingWorkspace ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[#c4dfc4]" />
                    </div>
                  ) : workspace ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="workspaceName" className="text-gray-300">Workspace Name</Label>
                        <div className="flex gap-2">
                          <Input
                            id="workspaceName"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            className="bg-[#1a1a1a] border-gray-700"
                            placeholder="My Workspace"
                          />
                          <Button
                            onClick={handleSaveWorkspaceName}
                            disabled={isSaving || workspaceName === workspace.name}
                            className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Separator className="bg-gray-700" />

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Workspace ID</Label>
                          <Input
                            value={workspace.id}
                            readOnly
                            className="bg-[#0a0a0a] border-gray-700 text-gray-400 font-mono text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Plan</Label>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-[#c4dfc4] text-[#0a0a0a] capitalize">
                              {workspace.plan || 'free'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Workspace Slug</Label>
                        <Input
                          value={workspace.slug}
                          readOnly
                          className="bg-[#0a0a0a] border-gray-700 text-gray-400 font-mono text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Created</Label>
                        <Input
                          value={new Date(workspace.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          readOnly
                          className="bg-[#0a0a0a] border-gray-700 text-gray-400"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No workspace found
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-[#c8e0f5]" />
                    Workspace Members
                  </CardTitle>
                  <CardDescription>
                    Users who have access to this workspace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingWorkspace ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-[#c4dfc4]" />
                    </div>
                  ) : workspaceMembers.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-transparent">
                            <TableHead className="text-gray-400">Name</TableHead>
                            <TableHead className="text-gray-400">Email</TableHead>
                            <TableHead className="text-gray-400">Role</TableHead>
                            <TableHead className="text-gray-400">Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workspaceMembers.map((member: any) => (
                            <TableRow key={member.id} className="border-gray-700 hover:bg-gray-800/50">
                              <TableCell className="font-medium text-white">
                                {member.first_name && member.last_name 
                                  ? `${member.first_name} ${member.last_name}`
                                  : member.email?.split('@')[0] || 'Unknown'}
                                {member.user_id === user?.id && (
                                  <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {member.email || 'No email'}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-[#c4dfc4] text-[#0a0a0a] capitalize">
                                  {member.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {new Date(member.joined_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No members found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-[#1a1a1a] border-gray-700" 
                        placeholder="First name"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-[#1a1a1a] border-gray-700" 
                        placeholder="Last name"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ""} 
                      readOnly
                      className="bg-[#1a1a1a] border-gray-700 text-gray-400" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567" 
                      className="bg-[#1a1a1a] border-gray-700"
                      disabled={isSaving}
                    />
                  </div>
                  <Separator className="bg-gray-700" />
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-[#c4dfc4] to-[#c8e0f5] text-[#0a0a0a] hover:from-[#c4dfc4]/90 hover:to-[#c8e0f5]/90"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Organization Settings</CardTitle>
                  <CardDescription>
                    Manage your organization details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-gray-300">Organization Name</Label>
                    <Input id="orgName" placeholder="Acme Food Services" className="bg-[#1a1a1a] border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-gray-300">Industry</Label>
                    <Input id="industry" placeholder="Food Service / Hospitality" className="bg-[#1a1a1a] border-gray-700" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users & Teams Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-white">Users</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </div>
                    <Button size="sm" className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] shrink-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-transparent">
                        <TableHead className="text-gray-400">Name</TableHead>
                        <TableHead className="text-gray-400">Email</TableHead>
                        <TableHead className="text-gray-400">Role</TableHead>
                        <TableHead className="text-gray-400">Team</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-right text-gray-400">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-gray-700 hover:bg-gray-800/50">
                          <TableCell className="font-medium text-white">{user.name}</TableCell>
                          <TableCell className="text-gray-300">{user.email}</TableCell>
                          <TableCell className="text-gray-300">{user.role}</TableCell>
                          <TableCell className="text-gray-300">{user.team}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "Active" ? "default" : "secondary"} className={user.status === "Active" ? "bg-[#c4dfc4] text-[#0a0a0a]" : ""}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-white">Teams</CardTitle>
                      <CardDescription>Organize users into teams and groups</CardDescription>
                    </div>
                    <Button size="sm" className="bg-[#c8e0f5] text-[#0a0a0a] hover:bg-[#b8d0e5]">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Team
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    {teams.map((team) => (
                      <Card key={team.id} className="bg-[#1a1a1a] border-gray-700">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <Users className="h-8 w-8 text-[#c4dfc4]" />
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardTitle className="text-white mt-2">{team.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-gray-400">
                            <span className="font-medium text-white">{team.members}</span> members
                          </div>
                          <div className="text-sm text-gray-400">
                            Lead: <span className="text-white">{team.lead}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            <span className="font-medium text-white">{team.locations}</span> locations
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-white">Locations</CardTitle>
                      <CardDescription>Manage your facilities and operational sites</CardDescription>
                    </div>
                    <Button size="sm" className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] shrink-0">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Location
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locations.map((location) => (
                      <Card key={location.id} className="bg-[#1a1a1a] border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                              <div className="h-12 w-12 rounded-lg bg-[#c4dfc4]/20 flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-[#c4dfc4]" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{location.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">{location.address}</p>
                                <div className="flex gap-4 mt-2">
                                  <span className="text-xs text-gray-400">
                                    <Users className="h-3 w-3 inline mr-1" />
                                    {location.users} users
                                  </span>
                                  <Badge variant="default" className="bg-[#c4dfc4] text-[#0a0a0a] text-xs">
                                    {location.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">API Keys</CardTitle>
                  <CardDescription>
                    Manage API keys for programmatic access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key" className="text-gray-300">Production API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="api-key"
                        value="sk_live_••••••••••••••••••••••••"
                        readOnly
                        className="font-mono bg-[#1a1a1a] border-gray-700"
                      />
                      <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-api-key" className="text-gray-300">Test API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="test-api-key"
                        value="sk_test_••••••••••••••••••••••••"
                        readOnly
                        className="font-mono bg-[#1a1a1a] border-gray-700"
                      />
                      <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                        <Key className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Connected Integrations</CardTitle>
                  <CardDescription>
                    Manage third-party integrations and services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {integrations.map((integration) => (
                      <Card key={integration.id} className="bg-[#1a1a1a] border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="text-3xl">{integration.icon}</div>
                              <div>
                                <h3 className="font-semibold text-white">{integration.name}</h3>
                                <p className="text-sm text-gray-400 mt-1">{integration.description}</p>
                                <Badge 
                                  variant={integration.status === "Connected" ? "default" : "secondary"}
                                  className={integration.status === "Connected" ? "bg-[#c4dfc4] text-[#0a0a0a] mt-2" : "mt-2"}
                                >
                                  {integration.status}
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={
                                integration.status === "Connected" 
                                  ? "border-red-500 text-red-400 hover:bg-red-500/10"
                                  : "border-[#c4dfc4] text-[#c4dfc4] hover:bg-[#c4dfc4]/10"
                              }
                            >
                              {integration.status === "Connected" ? "Disconnect" : "Connect"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Webhooks</CardTitle>
                  <CardDescription>
                    Configure webhooks for real-time event notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url" className="text-gray-300">Webhook URL</Label>
                    <Input 
                      id="webhook-url" 
                      placeholder="https://your-domain.com/webhook" 
                      className="bg-[#1a1a1a] border-gray-700"
                    />
                  </div>
                  <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Webhook
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Email Notifications</CardTitle>
                  <CardDescription>
                    Configure which email notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Form Submissions", desc: "Get notified when someone submits a form" },
                    { title: "Critical Violations", desc: "Immediate alerts for food safety violations" },
                    { title: "Weekly Reports", desc: "Receive weekly compliance summary reports" },
                    { title: "Team Activity", desc: "Updates when team members complete checklists" },
                    { title: "System Updates", desc: "Product updates and new features" },
                  ].map((notification, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{notification.title}</div>
                          <div className="text-sm text-gray-400">{notification.desc}</div>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                      </div>
                      {idx < 4 && <Separator className="bg-gray-700 mt-4" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">SMS Alerts</CardTitle>
                  <CardDescription>
                    Get critical alerts via text message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Critical Violations</div>
                      <div className="text-sm text-gray-400">SMS alerts for urgent issues</div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                  <Separator className="bg-gray-700" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Temperature Alerts</div>
                      <div className="text-sm text-gray-400">Out-of-range temperature warnings</div>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">Professional Plan</div>
                      <div className="text-gray-400 mt-1">$99/month • Billed monthly</div>
                      <div className="mt-4 space-y-2">
                        <div className="text-sm text-gray-400">✓ Unlimited forms</div>
                        <div className="text-sm text-gray-400">✓ Up to 50 users</div>
                        <div className="text-sm text-gray-400">✓ Advanced reporting</div>
                        <div className="text-sm text-gray-400">✓ API access</div>
                      </div>
                    </div>
                    <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                      Change Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Payment Method</CardTitle>
                  <CardDescription>
                    Update your billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-[#c4dfc4]" />
                      <div>
                        <div className="font-medium text-white">•••• •••• •••• 4242</div>
                        <div className="text-sm text-gray-400">Expires 12/25</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-700 hover:bg-gray-800">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Billing History</CardTitle>
                  <CardDescription>
                    View and download past invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-transparent">
                        <TableHead className="text-gray-400">Date</TableHead>
                        <TableHead className="text-gray-400">Description</TableHead>
                        <TableHead className="text-gray-400">Amount</TableHead>
                        <TableHead className="text-right text-gray-400">Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { date: "Oct 1, 2025", desc: "Professional Plan", amount: "$99.00" },
                        { date: "Sep 1, 2025", desc: "Professional Plan", amount: "$99.00" },
                        { date: "Aug 1, 2025", desc: "Professional Plan", amount: "$99.00" },
                      ].map((invoice, idx) => (
                        <TableRow key={idx} className="border-gray-700 hover:bg-gray-800/50">
                          <TableCell className="text-white">{invoice.date}</TableCell>
                          <TableCell className="text-gray-300">{invoice.desc}</TableCell>
                          <TableCell className="text-white">{invoice.amount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-[#c4dfc4] hover:text-[#c4dfc4] hover:bg-[#c4dfc4]/10">
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">2FA Status</div>
                      <div className="text-sm text-gray-400">Currently disabled</div>
                    </div>
                    <Button className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]">
                      Enable 2FA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Change Password</CardTitle>
                  <CardDescription>
                    Update your password regularly for security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-gray-300">Current Password</Label>
                    <Input id="current-password" type="password" className="bg-[#1a1a1a] border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-gray-300">New Password</Label>
                    <Input id="new-password" type="password" className="bg-[#1a1a1a] border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-300">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" className="bg-[#1a1a1a] border-gray-700" />
                  </div>
                  <Button className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Session Management</CardTitle>
                  <CardDescription>
                    View and manage active sessions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { device: "Chrome on macOS", location: "New York, US", current: true },
                      { device: "Safari on iPhone", location: "New York, US", current: false },
                    ].map((session, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-gray-700">
                        <div>
                          <div className="font-medium text-white">{session.device}</div>
                          <div className="text-sm text-gray-400">{session.location} {session.current && "• Current session"}</div>
                        </div>
                        {!session.current && (
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
    
  );
}
