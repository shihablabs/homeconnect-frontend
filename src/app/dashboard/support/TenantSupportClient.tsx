'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, MessageSquare, FileText, Send, Search } from 'lucide-react';
import { toast } from 'sonner';

export function TenantSupportClient() {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Implement support ticket creation API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Support ticket created successfully!');
      setTicketForm({
        subject: '',
        category: '',
        priority: 'medium',
        description: '',
      });
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(errorMessage || 'Failed to create support ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground mt-1">
          Get help and submit support tickets
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">
            <MessageSquare className="mr-2 h-4 w-4" />
            Create Ticket
          </TabsTrigger>
          <TabsTrigger value="faq">
            <FileText className="mr-2 h-4 w-4" />
            FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Submit a support ticket and our team will get back to you soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={ticketForm.category}
                      onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Booking Issues</SelectItem>
                        <SelectItem value="payment">Payment Issues</SelectItem>
                        <SelectItem value="property">Property Related</SelectItem>
                        <SelectItem value="account">Account Issues</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={ticketForm.priority}
                      onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your issue..."
                    value={ticketForm.description}
                    onChange={(e) =>
                      setTicketForm({ ...ticketForm, description: e.target.value })
                    }
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={submitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">How do I book a property?</h3>
                  <p className="text-sm text-muted-foreground">
                    Search for properties, select your desired dates, and complete the booking
                    process. You&apos;ll need to make a payment to confirm your booking.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards, debit cards, and bank transfers through our
                    secure payment gateway.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Can I cancel my booking?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can cancel your booking. Cancellation policies vary by property. Check
                    the property details for specific cancellation terms.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">How do I contact my landlord?</h3>
                  <p className="text-sm text-muted-foreground">
                    You can contact your landlord through the Messages section in your dashboard
                    after a booking is confirmed.
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">What is the security deposit for?</h3>
                  <p className="text-sm text-muted-foreground">
                    The security deposit is held to cover any damages or unpaid bills. It will be
                    refunded after your stay if there are no issues.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

