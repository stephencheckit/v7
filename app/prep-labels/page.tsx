'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Tag, Clock, Loader2, Trash2, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppLayout } from '@/components/app-layout';
import { zebraPrinter } from '@/lib/printer/zebra-client';
import { toast } from 'sonner';

interface FoodItem {
  id: string;
  name: string;
  day?: string;
  meal?: string;
  ingredients: string[];
  shelfLifeDays: number;
  category: string;
  allergens: string[];
  printCount: number;
  lastPrinted: string | null;
}

interface MenuData {
  uploadedAt: string;
  uploadedBy: string;
  items: FoodItem[];
}

export default function PrepLabelsPage() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setImagePreview(base64);

        // Send to AI for analysis
        const response = await fetch('/api/analyze-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('API Error:', errorData);
          throw new Error(errorData.error || 'Failed to analyze menu');
        }

        const data = await response.json();
        console.log('Analysis result:', data);
        
        setMenuData({
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Chef', // TODO: Get from auth
          items: data.items,
        });

        toast.success(`✅ Found ${data.items.length} items from menu!`);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to analyze menu');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Print label for an item
  const handlePrintLabel = async (item: FoodItem) => {
    try {
      const now = new Date();
      const expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + item.shelfLifeDays);

      // Print using optimized 2.25" x 1.25" label template
      await zebraPrinter.printFoodPrepLabel({
        name: item.name,
        prepDate: now.toLocaleDateString(),
        expirationDate: expirationDate.toLocaleDateString(),
        ingredients: item.ingredients,
        allergens: item.allergens,
      });

      // Update print count
      setMenuData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(i =>
            i.id === item.id
              ? { ...i, printCount: i.printCount + 1, lastPrinted: new Date().toISOString() }
              : i
          ),
        };
      });

      toast.success(`✅ Label printed for ${item.name}`);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print label');
    }
  };

  // Get unique categories
  const categories = menuData
    ? ['all', ...Array.from(new Set(menuData.items.map(item => item.category)))]
    : ['all'];

  // Filter items by category
  const filteredItems = menuData?.items.filter(
    item => selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  return (
    <AppLayout>
      <div className="w-full h-full overflow-auto">
        <div className="p-8">
          <div className="mx-auto max-w-[1600px] space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Tag className="h-10 w-10 text-[#c4dfc4]" />
                    Prep Labels
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Upload menu photo, AI generates labels for all items
                  </p>
                </div>

                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                    size="sm"
                    className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Menu
                  </Button>

                  {menuData && (
                    <Button
                      onClick={() => {
                        setMenuData(null);
                        setImagePreview(null);
                        setSelectedCategory('all');
                      }}
                      size="sm"
                      variant="outline"
                      className="bg-white/5 hover:bg-white/10"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

        {/* Analyzing State */}
        {isAnalyzing && (
          <Card className="p-12 bg-white/5 border-white/10">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#c4dfc4]" />
              <h3 className="text-xl font-semibold text-white">Analyzing Menu...</h3>
              <p className="text-gray-400">AI is extracting food items and shelf life data</p>
            </div>
          </Card>
        )}

        {/* Menu Preview (if uploaded) */}
        {imagePreview && !isAnalyzing && (
          <Card className="p-6 bg-white/5 border-white/10">
            <div className="flex items-start gap-6">
              <img
                src={imagePreview}
                alt="Menu"
                className="w-64 h-auto rounded-lg border border-white/10"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Menu Photo</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Uploaded: {menuData ? new Date(menuData.uploadedAt).toLocaleString() : 'Just now'}
                </p>
                {menuData && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Total Items:</span>
                      <span className="text-white font-medium">{menuData.items.length}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Labels Printed:</span>
                      <span className="text-white font-medium">
                        {menuData.items.reduce((sum, item) => sum + item.printCount, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Category Filters */}
        {menuData && (
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className={
                  selectedCategory === cat
                    ? 'bg-[#c4dfc4] text-black hover:bg-[#b5d0b5]'
                    : 'bg-white/5 hover:bg-white/10'
                }
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {/* Items Grid */}
        {menuData && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <Card
                key={item.id}
                className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="space-y-4">
                  {/* Item Header */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">{item.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                      {item.day && item.meal && (
                        <span className="text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded">
                          {item.day} - {item.meal}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Ingredients:</p>
                    <p className="text-sm text-gray-300">{item.ingredients.slice(0, 3).join(', ')}</p>
                  </div>

                  {/* Shelf Life */}
                  <div className="flex items-center gap-2 text-[#c4dfc4]">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.shelfLifeDays} day shelf life</span>
                  </div>

                  {/* Allergens */}
                  {item.allergens.length > 0 && (
                    <div className="text-xs text-yellow-400">
                      ⚠️ {item.allergens.join(', ')}
                    </div>
                  )}

                  {/* Print Status */}
                  {item.printCount > 0 && (
                    <div className="text-xs text-gray-400">
                      Printed {item.printCount}x
                      {item.lastPrinted && (
                        <span className="ml-1">
                          (Last: {new Date(item.lastPrinted).toLocaleTimeString()})
                        </span>
                      )}
                    </div>
                  )}

                  {/* Print Button */}
                  <Button
                    onClick={() => handlePrintLabel(item)}
                    className="w-full bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] text-black hover:from-[#b5d0b5] hover:to-[#a5c0a5]"
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Print Label
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : menuData && filteredItems.length === 0 ? (
          <Card className="p-12 bg-white/5 border-white/10">
            <div className="text-center text-gray-400">
              No items in this category
            </div>
          </Card>
        ) : !isAnalyzing && !menuData ? (
          <Card className="p-12 bg-white/5 border-white/10">
            <div className="flex flex-col items-center justify-center gap-4">
              <h3 className="text-xl font-semibold text-white">No Menu Uploaded</h3>
              <p className="text-gray-400 text-center max-w-md">
                Upload a photo of today's menu board and AI will extract all items,
                ingredients, and calculate shelf life for easy label printing.
              </p>
            </div>
          </Card>
        ) : null}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

