'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Check,
  Copy,
  Facebook,
  Mail,
  MessageSquare,
  Share2,
  Twitter
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShareButtonProps {
  propertyId: string;
  propertySlug?: string;
  propertyTitle: string;
  propertyUrl?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
}

export function ShareButton({
  propertyId,
  propertySlug,
  propertyTitle,
  propertyUrl,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  
  const getPropertyUrl = () => {
    if (propertyUrl) return propertyUrl;
    if (typeof window !== 'undefined') {
      const identifier = propertySlug || propertyId;
      return `${window.location.origin}/properties/${identifier}`;
    }
    return '';
  };

  const shareUrl = getPropertyUrl();
  const shareText = `Check out this property: ${propertyTitle}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async (platform: string) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(propertyTitle)}&body=${text}%20${url}`;
        break;
      default:
        return;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error: unknown) {
        
        console.error('Share error:', error);
        if (error && typeof error === 'object' && 'name' in error) {
          const err = error as { name?: string };
          if (err.name !== 'AbortError') {
            toast.error('Failed to share');
          }
        } else {
          toast.error('Failed to share');
        }
      }
    } else {
      
      handleCopyLink();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            "gap-2 transition-all duration-200 hover:scale-105 active:scale-95",
            className
          )}
        >
          <Share2 className="h-4 w-4" />
          {showLabel && size !== 'icon' && <span>Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {}
        {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share via...
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {}
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {}
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="mr-2 h-4 w-4 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="mr-2 h-4 w-4 text-blue-400" />
          Share on Twitter
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageSquare className="mr-2 h-4 w-4 text-green-600" />
          Share on WhatsApp
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="mr-2 h-4 w-4" />
          Share via Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

