import { AppLayout } from "@/components/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Star } from "lucide-react";

const templates = [
  {
    name: "Contact Form",
    description: "Simple contact form with name, email, and message",
    fields: 3,
    color: "bg-[#c4dfc4]",
    popular: true,
  },
  {
    name: "Customer Feedback",
    description: "Collect customer feedback with ratings and comments",
    fields: 4,
    color: "bg-[#f5edc8]",
    popular: true,
  },
  {
    name: "Event Registration",
    description: "Register attendees for events with details",
    fields: 6,
    color: "bg-[#c8e0f5]",
    popular: false,
  },
  {
    name: "Job Application",
    description: "Complete job application with resume upload",
    fields: 8,
    color: "bg-[#ddc8f5]",
    popular: true,
  },
  {
    name: "Survey Form",
    description: "Multi-question survey with various input types",
    fields: 10,
    color: "bg-[#c4dfc4]",
    popular: false,
  },
  {
    name: "Order Form",
    description: "Product order form with payment details",
    fields: 7,
    color: "bg-[#f5edc8]",
    popular: false,
  },
];

export default function TemplatesPage() {
  return (
    <AppLayout>
      <div className="w-full h-full overflow-auto">
        <div className="p-8">
          <div className="mx-auto max-w-[1600px] space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white">Templates</h1>
              <p className="text-muted-foreground mt-1">
                Start with a pre-built template and customize it to your needs
              </p>
            </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`${template.color} border-0 rounded-lg p-3`}>
                      <FileText className="h-6 w-6 text-[#0a0a0a]" />
                    </div>
                    {template.popular && (
                      <Badge className="bg-[#0a0a0a] text-[#f5edc8]">
                        <Star className="h-3 w-3 mr-1 fill-[#f5edc8]" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {template.fields} fields
                    </span>
                    <Button size="sm" className="bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5]">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

