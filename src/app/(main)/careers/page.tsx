import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Careers | HomeConnect",
  description: "Join our team and help shape the future of real estate.",
};

const jobs = [
  {
    title: "Junior React Developer",
    location: "Dhaka (Remote)",
    type: "Full-time",
    department: "Engineering",
    description: "We are looking for a passionate React developer to help build our core platform features."
  },
  {
    title: "Real Estate Agent",
    location: "Dhaka",
    type: "Contract",
    department: "Sales",
    description: "Connect with property owners and help them list their properties on HomeConnect."
  },
  {
    title: "UI/UX Designer",
    location: "Remote",
    type: "Part-time",
    department: "Design",
    description: "Design intuitive and beautiful user interfaces for our web and mobile apps."
  }
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <PageHeader
        title="Join Our Team"
        description="We are on a mission to revolutionize the real estate industry in Bangladesh. Come build with us."
        badge="Hiring Now"
      />

      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
          {jobs.map((job, idx) => (
            <Card key={idx} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary">{job.department}</Badge>
                  <Badge variant="outline">{job.type}</Badge>
                </div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">{job.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/contact?type=partnership">Apply Now</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-4">Don&apos;t see a role for you?</h3>
          <p className="text-muted-foreground mb-6">We are always looking for talented individuals. Send us your CV.</p>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}