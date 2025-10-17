import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/app-layout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your V7 Form Builder admin
            </p>
          </div>
          <Button>Create New Form</Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-[#c4dfc4] border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                Total Forms
              </CardTitle>
              <Badge className="bg-[#0a0a0a] text-[#c4dfc4]">+12%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0a0a0a]">45</div>
              <p className="text-xs text-[#0a0a0a]/70">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#f5edc8] border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                Submissions
              </CardTitle>
              <Badge className="bg-[#0a0a0a] text-[#f5edc8]">+8%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0a0a0a]">2,350</div>
              <p className="text-xs text-[#0a0a0a]/70">
                +180 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#c8e0f5] border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                Active Forms
              </CardTitle>
              <Badge className="bg-[#0a0a0a] text-[#c8e0f5]">Live</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0a0a0a]">32</div>
              <p className="text-xs text-[#0a0a0a]/70">
                71% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#ddc8f5] border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#0a0a0a]">
                Completion Rate
              </CardTitle>
              <Badge className="bg-[#0a0a0a] text-[#ddc8f5]">+5%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#0a0a0a]">68%</div>
              <p className="text-xs text-[#0a0a0a]/70">
                Above industry avg
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Forms Table */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Forms</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Forms</CardTitle>
                <CardDescription>
                  Your most recently created forms and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Completion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        Customer Feedback Survey
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>487</TableCell>
                      <TableCell>72%</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Product Registration Form
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>1,234</TableCell>
                      <TableCell>85%</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Event Registration
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Draft</Badge>
                      </TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>—</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">
                        Contact Us Form
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                      <TableCell>629</TableCell>
                      <TableCell>68%</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

