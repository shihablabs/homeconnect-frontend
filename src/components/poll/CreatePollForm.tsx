/**
 * CreatePollForm Component
 * Form for creating new community polls (Landlord/Admin only)
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { pollsApi, type CreatePollData } from '@/lib/api/polls-api';
import { propertiesApi } from '@/lib/api/properties-api';
import type { PropertyResponse } from '@/types/property.types';
import { Calendar, Loader2, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface PollOption {
  text: string;
  description?: string;
  imageUrl?: string;
}

export function CreatePollForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);

  const [formData, setFormData] = useState<CreatePollData>({
    title: '',
    description: '',
    pollType: 'maintenance_priority',
    options: [{ text: '' }, { text: '' }], // Minimum 2 options
    allowedVoters: 'property_tenants',
    maxVotesPerUser: 1,
    allowMultipleSelections: false,
    isAnonymous: false,
    showResultsBeforeClose: false,
  });

  const [endDate, setEndDate] = useState('');
  const [startDate, setStartDate] = useState('');

  // Load properties for selection
  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const response = await propertiesApi.getProperties({ limit: 100 });
      setProperties(response.properties || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleAddOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, { text: '' }],
      });
    } else {
      toast.error('Maximum 10 options allowed');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    } else {
      toast.error('Poll must have at least 2 options');
    }
  };

  const handleOptionChange = (index: number, field: keyof PollOption, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || formData.title.length < 10) {
      toast.error('Title must be at least 10 characters');
      return;
    }

    if (formData.options.some(opt => !opt.text || opt.text.trim().length === 0)) {
      toast.error('All options must have text');
      return;
    }

    if (formData.allowedVoters === 'custom' && (!formData.customVoterIds || formData.customVoterIds.length === 0)) {
      toast.error('Custom voter IDs are required when allowedVoters is "custom"');
      return;
    }

    if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (endDate && new Date(endDate) <= new Date()) {
      toast.error('End date must be in the future');
      return;
    }

    try {
      setLoading(true);
      const submitData: CreatePollData = {
        ...formData,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const poll = await pollsApi.createPoll(submitData);
      toast.success('Poll created successfully!');
      router.push(`/dashboard/polls/${poll.id}`);
    } catch (error: unknown) {
      console.error('Failed to create poll:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.response?.data?.message || 'Failed to create poll';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Poll</CardTitle>
          <CardDescription>
            Create a community poll for decision-making, priority voting, or feedback collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Poll Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Which maintenance issue should we prioritize this month?"
                required
                minLength={10}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide additional context about this poll..."
                rows={3}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description?.length || 0}/2000 characters
              </p>
            </div>

            {/* Poll Type */}
            <div className="space-y-2">
              <Label htmlFor="pollType">Poll Type *</Label>
              <Select
                value={formData.pollType}
                onValueChange={(value) => setFormData({ ...formData, pollType: value as CreatePollData['pollType'] })}
              >
                <SelectTrigger id="pollType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance_priority">Maintenance Priority</SelectItem>
                  <SelectItem value="amenity_selection">Amenity Selection</SelectItem>
                  <SelectItem value="community_decision">Community Decision</SelectItem>
                  <SelectItem value="vendor_selection">Vendor Selection</SelectItem>
                  <SelectItem value="budget_allocation">Budget Allocation</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Property Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property (Optional)</Label>
              <Select
                value={formData.propertyId || ''}
                onValueChange={(value) => {
                  if (value) {
                    setFormData({ ...formData, propertyId: value });
                  } else {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { propertyId: _unused, ...rest } = formData;
                    setFormData(rest);
                  }
                }}
                onOpenChange={(open) => {
                  if (open && properties.length === 0) {
                    loadProperties();
                  }
                }}
              >
                <SelectTrigger id="propertyId">
                  <SelectValue placeholder="Select a property (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (General Poll)</SelectItem>
                  {loadingProperties ? (
                    <SelectItem value="loading" disabled>
                      Loading properties...
                    </SelectItem>
                  ) : (
                    properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title} - {property.address}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Allowed Voters */}
            <div className="space-y-2">
              <Label htmlFor="allowedVoters">Who Can Vote? *</Label>
              <Select
                value={formData.allowedVoters}
                onValueChange={(value) => setFormData({ ...formData, allowedVoters: value as CreatePollData['allowedVoters'] })}
              >
                <SelectTrigger id="allowedVoters">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_tenants">All Tenants</SelectItem>
                  <SelectItem value="property_tenants">Property Tenants Only</SelectItem>
                  <SelectItem value="landlords_only">Landlords Only</SelectItem>
                  <SelectItem value="admin_only">Admins Only</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Poll Options *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={formData.options.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder={`Option ${index + 1} *`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      required
                      maxLength={500}
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={option.description || ''}
                      onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                      maxLength={1000}
                    />
                  </div>
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Minimum 2 options, maximum 10 options
              </p>
            </div>

            {/* Voting Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Voting Settings</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowMultiple"
                  checked={formData.allowMultipleSelections}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData,
                      allowMultipleSelections: checked === true,
                      maxVotesPerUser: checked ? formData.maxVotesPerUser : 1,
                    });
                  }}
                />
                <Label htmlFor="allowMultiple" className="cursor-pointer">
                  Allow multiple selections
                </Label>
              </div>

              {formData.allowMultipleSelections && (
                <div className="space-y-2">
                  <Label htmlFor="maxVotes">Maximum Votes Per User</Label>
                  <Input
                    id="maxVotes"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.maxVotesPerUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxVotesPerUser: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAnonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAnonymous: checked === true })
                  }
                />
                <Label htmlFor="isAnonymous" className="cursor-pointer">
                  Anonymous voting
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showResults"
                  checked={formData.showResultsBeforeClose}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, showResultsBeforeClose: checked === true })
                  }
                />
                <Label htmlFor="showResults" className="cursor-pointer">
                  Show results before poll closes
                </Label>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Start Date (Optional)
                </Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  End Date (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Poll'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

