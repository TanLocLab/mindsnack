'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Copy, Check, Share2, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MentalModel } from '@/types';

interface ModelCardProps {
  model: MentalModel;
  cardId: string;
  categoryIndex: number;
  modelIndex: number;
}

const LAST_READ_KEY = 'mindsnack_last_read';

export default function ModelCard({ model, cardId, categoryIndex, modelIndex }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle both data structures: properties object or flat structure
  const title = model.properties?.title || model.title || '';
  const content = model.properties?.content || model.content || '';
  const tldr = model.properties?.tldr || model.tldr || '';
  const tags = model.properties?.tags || model.tags || [];

  // Get preview text (first 150 characters)
  const getPreviewText = (text: string) => {
    const plainText = text.replace(/\*\*/g, '').replace(/\n/g, ' ');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };
  const previewText = getPreviewText(content);

  // Check if this is the last read card on mount and if it's been read
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastRead = localStorage.getItem(LAST_READ_KEY);
      if (lastRead === cardId) {
        setIsExpanded(true);
        setIsRead(true);
        // Scroll to this card after a short delay to ensure it's rendered
        setTimeout(() => {
          cardRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      } else {
        // Check if this card has been read before
        const readCards = JSON.parse(localStorage.getItem('mindsnack_read_cards') || '[]');
        setIsRead(readCards.includes(cardId));
      }
    }
  }, [cardId]);

  const handleExpand = () => {
    setIsExpanded(true);
    
    // Save to localStorage when expanded
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_READ_KEY, cardId);
      
      // Mark as read
      const readCards = JSON.parse(localStorage.getItem('mindsnack_read_cards') || '[]');
      if (!readCards.includes(cardId)) {
        readCards.push(cardId);
        localStorage.setItem('mindsnack_read_cards', JSON.stringify(readCards));
        setIsRead(true);
        // Trigger a custom event to update progress
        window.dispatchEvent(new Event('mindsnack_read_update'));
      }
    }
  };

  const handleCopy = async () => {
    const textToCopy = `${title}\n\n${content}\n\n${tldr}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: `${tldr}`,
      url: window.location.href + `#${cardId}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy
        await navigator.clipboard.writeText(`${title}\n\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // User cancelled or error
      console.error('Share failed:', err);
    }
  };


  return (
    <div 
      ref={cardRef}
      id={cardId}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
        isRead ? 'border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30' : 'border-transparent'
      } ${isExpanded ? 'ring-2 ring-indigo-200' : ''}`}
    >
      <div className="p-4 sm:p-5">
        {/* Header Section */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2 leading-tight">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                {model.model_name}
              </p>
            </div>
            {isRead && (
              <BookOpen className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
            )}
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* TL;DR Badge */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-3 sm:p-4 mb-3 sm:mb-4 rounded-r shadow-sm">
          <p className="text-xs sm:text-sm font-semibold text-amber-900 mb-1">TL;DR</p>
          <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
            {tldr}
          </p>
        </div>

        {/* Preview Content with Fade */}
        {!isExpanded && (
          <div className="relative mb-3 sm:mb-4">
            <div className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {previewText}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        )}

        {/* Expandable Content */}
        <div 
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div 
            ref={contentRef}
            className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200"
          >
            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-li:text-gray-700 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-code:text-indigo-700 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-100 prose-pre:text-gray-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isExpanded ? (
          <div className="flex items-center justify-center mt-3 sm:mt-4">
            <button
              onClick={handleExpand}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              <ChevronDown className="w-4 h-4" />
              <span className="hidden sm:inline">Xem chi tiết</span>
              <span className="sm:hidden">Chi tiết</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 mt-3 sm:mt-4">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:shadow-md"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Đã copy!</span>
                  <span className="sm:hidden">OK</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

