'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { MentalModel } from '@/types';

interface ModelCardProps {
  model: MentalModel;
}

export default function ModelCard({ model }: ModelCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle both data structures: properties object or flat structure
  const title = model.properties?.title || model.title || '';
  const content = model.properties?.content || model.content || '';
  const tldr = model.properties?.tldr || model.tldr || '';
  const tags = model.properties?.tags || model.tags || [];

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

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-5">
        {/* Header Section */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-indigo-600 mb-2 leading-tight">
            {title}
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {model.model_name}
          </p>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* TL;DR Badge */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded-r">
          <p className="text-sm font-semibold text-amber-900 mb-1">TL;DR</p>
          <p className="text-sm text-amber-800 leading-relaxed">
            {tldr}
          </p>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="prose prose-sm max-w-none">
              <div className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                {formatContent(content)}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>Thu gọn</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                <span>Xem chi tiết</span>
              </>
            )}
          </button>

          {isExpanded && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã copy!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

