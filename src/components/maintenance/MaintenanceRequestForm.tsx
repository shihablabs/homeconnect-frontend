'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { maintenanceApi } from '@/lib/api/maintenance-api';
import { uploadApi } from '@/lib/api/upload-api';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Form Schema
const maintenanceRequestSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.enum([
    'plumbing',
    'electrical',
    'hvac',
    'appliances',
    'structural',
    'pest_control',
    'cleaning',
    'other',
  ]),
  priority: z.enum(['urgent', 'medium', 'low']).default('medium'),
});

type MaintenanceRequestFormData = z.infer<typeof maintenanceRequestSchema>;

interface MaintenanceRequestFormProps {
  propertyId?: string;
  onSuccess?: () => void;
}

export function MaintenanceRequestForm({
  propertyId,
  onSuccess,
}: MaintenanceRequestFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const form = useForm<MaintenanceRequestFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(maintenanceRequestSchema) as any,
    defaultValues: {
      propertyId: propertyId || '',
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = imageFiles.length + newFiles.length;
      if (totalFiles > 10) {
        toast.error('Maximum 10 images allowed');
        return;
      }
      setImageFiles([...imageFiles, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const response = await uploadApi.post('/upload/images', formData, {
        params: { folder: 'maintenance' },
      });
      return response.data.data.map((img: { url: string }) => img.url);
    } catch (error: unknown) {
      console.error('Image upload error:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw new Error((error as any).response?.data?.message || 'Failed to upload images');
    }
  };

  const onSubmit = async (data: MaintenanceRequestFormData) => {
    try {
      setIsSubmitting(true);

      // Upload images first
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setIsUploadingImages(true);
        try {
          imageUrls = await uploadImages(imageFiles);
        } catch (error: unknown) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          toast.error((error as any).message || 'Failed to upload images');
          setIsSubmitting(false);
          setIsUploadingImages(false);
          return;
        } finally {
          setIsUploadingImages(false);
        }
      }

      // Create maintenance request
      const requestData = {
        ...data,
        images: imageUrls,
      };

      await maintenanceApi.createMaintenanceRequest(requestData);

      toast.success('Maintenance request submitted successfully!');
      form.reset();
      setImageFiles([]);

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard/maintenance');
      }
    } catch (error: unknown) {
      console.error('Error creating maintenance request:', error);
      toast.error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any).response?.data?.message ||
        'Failed to submit maintenance request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const imagePreviews = imageFiles.map((file) => URL.createObjectURL(file));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Property ID - Only show if not provided */}
        {!propertyId && (
          <FormField
            control={form.control}
            name="propertyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Property ID"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter the property ID for this maintenance request
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Leaky faucet in kitchen"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of the maintenance issue
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed information about the maintenance issue..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the issue in detail (minimum 20 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="appliances">Appliances</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="pest_control">Pest Control</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  How urgent is this maintenance issue?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <FormLabel>Images (Optional)</FormLabel>
          <FormDescription>
            Upload up to 10 images to help describe the issue
          </FormDescription>

          {/* Image Previews */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border"
                >
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {imageFiles.length < 10 && (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload images ({imageFiles.length}/10)
                </p>
              </div>
              <Input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              setImageFiles([]);
            }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            {isSubmitting || isUploadingImages ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploadingImages ? 'Uploading images...' : 'Submitting...'}
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

