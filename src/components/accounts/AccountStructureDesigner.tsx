// src/components/accounts/AccountStructureDesigner.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, X, Move } from 'lucide-react';
import { AccountCodeSegment } from '@/lib/types/account.types';

interface AccountStructureDesignerProps {
  segments: AccountCodeSegment[];
  onChange: (segments: AccountCodeSegment[]) => void;
}

export function AccountStructureDesigner({ segments, onChange }: AccountStructureDesignerProps) {
  const [editingSegment, setEditingSegment] = useState<AccountCodeSegment | null>(null);

  const addSegment = () => {
    const newSegment: AccountCodeSegment = {
      name: `segment-${segments.length + 1}`,
      length: 4,
      padding: 'left',
      padChar: '0',
      description: '',
    };
    onChange([...segments, newSegment]);
  };

  const removeSegment = (index: number) => {
    onChange(segments.filter((_, i) => i !== index));
  };

  const updateSegment = (index: number, updates: Partial<AccountCodeSegment>) => {
    onChange(
      segments.map((seg, i) => (i === index ? { ...seg, ...updates } : seg))
    );
  };

  const moveSegment = (fromIndex: number, toIndex: number) => {
    const newSegments = [...segments];
    const [moved] = newSegments.splice(fromIndex, 1);
    newSegments.splice(toIndex, 0, moved);
    onChange(newSegments);
  };

  const previewCode = segments
    .map((seg) => 'X'.repeat(seg.length))
    .join('-');

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Account Code Structure</h3>
        
        <div className="space-y-4">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2 pt-2">
                <Move className="h-5 w-5 text-gray-400 cursor-move" />
                <span className="text-sm font-medium">#{index + 1}</span>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <Label>Segment Name</Label>
                  <Input
                    value={segment.name}
                    onChange={(e) => updateSegment(index, { name: e.target.value })}
                    placeholder="e.g., company, department"
                  />
                </div>

                <div>
                  <Label>Length</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={segment.length}
                    onChange={(e) => updateSegment(index, { length: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Padding</Label>
                  <select
                    className="w-full h-10 px-3 border rounded-md"
                    value={segment.padding}
                    onChange={(e) => updateSegment(index, { padding: e.target.value as 'left' | 'right' })}
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <Label>Pad Character</Label>
                  <Input
                    maxLength={1}
                    value={segment.padChar || '0'}
                    onChange={(e) => updateSegment(index, { padChar: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Input
                    value={segment.description || ''}
                    onChange={(e) => updateSegment(index, { description: e.target.value })}
                    placeholder="What does this segment represent?"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-red-600"
                onClick={() => removeSegment(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addSegment} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Segment
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Preview</h3>
        <div className="bg-gray-50 p-4 rounded font-mono text-center text-lg">
          {previewCode || 'No segments defined'}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Example account code format. Actual codes will use numbers.
        </p>
      </Card>

      {segments.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Examples</h3>
          <div className="space-y-2">
            <div className="bg-blue-50 p-2 rounded font-mono text-sm">
              {segments.map((seg) => '1'.repeat(seg.length)).join('-')}
            </div>
            <div className="bg-green-50 p-2 rounded font-mono text-sm">
              {segments.map((seg) => '9'.repeat(seg.length)).join('-')}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}