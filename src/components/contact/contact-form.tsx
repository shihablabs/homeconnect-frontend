"use client";

import { useCreateContactMutation } from "@/redux/features/contact/contactApiSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

const inquiryTypes = [
  "rent",
  "buy",
  "sell",
  "landlord",
  "support",
  "partnership",
  "other",
] as const;

const FormSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || phoneRegex.test(v), {
      message: "Enter a valid phone number",
    }),
  type: z.enum(inquiryTypes, {
    message: "Please select an inquiry type",
  }),
  propertyId: z.string().optional(),
  message: z.string().min(10, "Tell us a bit more (min 10 characters)"),
  consent: z.boolean().refine((value) => value === true, {
    message: "Please accept the privacy policy",
  }),
  
  company: z.string().max(0).optional(),
});

type FormValues = z.infer<typeof FormSchema>;

type Props = {
  prefill?: { propertyId?: string; type?: FormValues["type"] };
};

export function ContactForm({ prefill }: Props) {
  
  const [createContact, { isLoading }] = useCreateContactMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      type: prefill?.type ?? "rent",
      propertyId: prefill?.propertyId ?? "",
      message: "",
      consent: false,
      company: "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: FormValues) {
    
    if (values.company) return;

    
    Swal.fire({
      title: "Sending Message...",
      text: "Please wait while we connect you to our team.",
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await createContact({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        type: values.type,
        propertyId: values.propertyId || undefined,
        message: values.message,
        source: "homeconnect-web",
        pathname:
          typeof window !== "undefined" ? window.location.pathname : undefined,
      }).unwrap();

      form.reset();

      
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "We have received your inquiry. Our team will contact you within 24 hours.",
        confirmButtonColor: "#10b981", 
        timer: 5000,
        timerProgressBar: true,
      });
    } catch (error: any) {
      const description =
        error?.data?.message ||
        error?.data?.error ||
        error?.message ||
        "Please check your internet connection and try again.";

      
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: description,
        confirmButtonColor: "#ef4444",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          {...form.register("company")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} className="h-11 shadow-sm bg-white focus-visible:ring-primary/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    inputMode="email"
                    placeholder="jane@company.com"
                    {...field}
                    className="h-11 shadow-sm bg-white focus-visible:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    inputMode="tel"
                    placeholder="+1 415 555 0199"
                    {...field}
                    className="h-11 shadow-sm bg-white focus-visible:ring-primary/20"
                  />
                </FormControl>
                <FormDescription>We’ll call only if needed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inquiry type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 shadow-sm bg-white focus-visible:ring-primary/20">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                    <SelectItem value="landlord">Landlord services</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="propertyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property ID (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., HC-102" {...field} className="h-11 shadow-sm bg-white focus-visible:ring-primary/20" />
              </FormControl>
              <FormDescription>
                Include if your message is about a specific listing.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How can we help?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share details about your inquiry..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the{" "}
                  <a
                    href="/privacy"
                    className="text-primary hover:underline underline-offset-4"
                  >
                    Privacy Policy
                  </a>
                </FormLabel>
                <FormDescription>
                  You consent to receiving updates from HomeConnect.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Secure form. You’ll get a confirmation email.
          </div>
          <Button type="submit" className="min-w-[140px]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send message"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
