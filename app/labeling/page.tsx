'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Tag, Clock, Loader2, Trash2, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { zebraPrinter } from '@/lib/printer/zebra-client';
import { toast } from 'sonner';

interface Ingredient {
  name: string;
  category: string;
  storageMethod: string;
  shelfLifeDays: number;
  optimalTempMin: number | null;
  optimalTempMax: number | null;
  allergenType: string | null;
  safetyNotes: string;
}

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
  analyzedIngredients?: Ingredient[];
  isAnalyzingIngredients?: boolean;
}

interface MenuData {
  uploadedAt: string;
  uploadedBy: string;
  items: FoodItem[];
}

const loadingStages = [
  { emoji: '🔍', text: 'Scanning your menu with AI vision...', subtext: 'Reading every pixel like a food critic' },
  { emoji: '🍽️', text: 'Extracting food items...', subtext: 'Found the spaghetti hiding behind the salad!' },
  { emoji: '🧪', text: 'Analyzing ingredients...', subtext: 'Chemistry class was useful after all' },
  { emoji: '🚨', text: 'Detecting allergens...', subtext: 'Making sure no one has a bad day' },
  { emoji: '⏰', text: 'Calculating shelf life...', subtext: 'Time traveling into the future' },
  { emoji: '🏷️', text: 'Generating printable labels...', subtext: 'Making it look pretty for the printer' },
  { emoji: '✨', text: 'Almost there...', subtext: 'Putting the final touches!' },
];

const round2Stages = [
  { emoji: '🔬', text: 'Round 2: Deep diving into ingredients...', subtext: 'Breaking down each component!' },
  { emoji: '📊', text: 'Analyzing individual shelf life...', subtext: 'Every ingredient tells a story' },
  { emoji: '🌡️', text: 'Determining storage requirements...', subtext: 'Temperature matters!' },
  { emoji: '💾', text: 'Saving detailed data...', subtext: 'Building your ingredient library' },
  { emoji: '🎉', text: 'Complete!', subtext: 'Everything is ready!' },
];

export default function PrepLabelsPage() {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRound2, setIsRound2] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle through loading stages
  useEffect(() => {
    if (!isAnalyzing) {
      setLoadingStage(0);
      return;
    }

    const stages = isRound2 ? round2Stages : loadingStages;
    const interval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % stages.length);
    }, 2000); // Change stage every 2 seconds

    return () => clearInterval(interval);
  }, [isAnalyzing, isRound2]);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsAnalyzing(true);
    setLoadingStage(0); // Reset loading stage

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
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

          // Save items to database
          try {
            const saveResponse = await fetch('/api/food-items/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageUrl: base64,
                imageSize: file.size,
                items: data.items,
              }),
            });

            if (saveResponse.ok) {
              const saveData = await saveResponse.json();
              console.log('Saved to database:', saveData);
              toast.success(`✅ Found ${data.items.length} items! Starting Round 2...`);
              
              // Start Round 2: Analyze ingredients for each item
              await performRound2Analysis(data.items);
            } else {
              toast.success(`✅ Found ${data.items.length} items from menu!`);
              console.warn('Failed to save to database, but analysis succeeded');
              setIsAnalyzing(false);
            }
          } catch (saveError) {
            console.error('Error saving to database:', saveError);
            toast.success(`✅ Found ${data.items.length} items from menu!`);
            setIsAnalyzing(false);
          }
        } catch (error) {
          console.error('Analysis error:', error);
          toast.error('Failed to analyze menu');
          setImagePreview(null); // Clear preview on error
        } finally {
          // Turn off loading screen after processing completes
          setIsAnalyzing(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read image file');
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setIsAnalyzing(false);
    }
  };

  // Round 2: Analyze all ingredients for all items
  const performRound2Analysis = async (items: FoodItem[]) => {
    setIsRound2(true);
    setLoadingStage(0);

    try {
      const updatedItems = [...items];

      // Analyze ingredients for each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (!item.ingredients || item.ingredients.length === 0) {
          continue;
        }

        try {
          const response = await fetch('/api/ingredients/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              foodItemId: item.id,
              ingredients: item.ingredients,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            updatedItems[i] = {
              ...updatedItems[i],
              analyzedIngredients: data.ingredients,
            };
          }
        } catch (error) {
          console.error(`Error analyzing ingredients for ${item.name}:`, error);
        }
      }

      // Update menu data with all analyzed ingredients
      setMenuData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: updatedItems,
        };
      });

      toast.success(`🎉 Complete! Analyzed ingredients for ${items.length} items!`);
    } catch (error) {
      console.error('Error in Round 2 analysis:', error);
      toast.error('Round 2 analysis had some errors, but continuing...');
    } finally {
      setIsAnalyzing(false);
      setIsRound2(false);
    }
  };

  // Analyze ingredients for a food item (manual trigger)
  const handleAnalyzeIngredients = async (item: FoodItem) => {
    if (!item.ingredients || item.ingredients.length === 0) {
      toast.error('No ingredients to analyze');
      return;
    }

    // Mark this item as analyzing
    setMenuData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(i =>
          i.id === item.id ? { ...i, isAnalyzingIngredients: true } : i
        ),
      };
    });

    try {
      const response = await fetch('/api/ingredients/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodItemId: item.id,
          ingredients: item.ingredients,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze ingredients');
      }

      const data = await response.json();
      
      // Update the item with analyzed ingredients
      setMenuData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(i =>
            i.id === item.id
              ? {
                  ...i,
                  analyzedIngredients: data.ingredients,
                  isAnalyzingIngredients: false,
                }
              : i
          ),
        };
      });

      setExpandedItemId(item.id);
      toast.success(`✅ Analyzed ${data.ingredients.length} ingredients!`);
    } catch (error) {
      console.error('Error analyzing ingredients:', error);
      toast.error('Failed to analyze ingredients');
      
      // Remove analyzing state
      setMenuData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(i =>
            i.id === item.id ? { ...i, isAnalyzingIngredients: false } : i
          ),
        };
      });
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
    
      <div className="w-full h-full overflow-auto">
        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                    <Tag className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                    Labeling
                  </h1>
                  <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                    Upload menu photo, AI generates labels for all items
                  </p>
                </div>

                <div className="flex gap-2 md:gap-3 shrink-0">
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
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Add Menu</span>
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
                      <RefreshCw className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Clear</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

        {/* Analyzing State - Fun Loading Screen as Full-Page Overlay */}
        {isAnalyzing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <Card className={`p-8 md:p-12 relative overflow-hidden max-w-2xl w-full mx-4 ${
              isRound2 
                ? 'bg-gradient-to-br from-[#c8e0f5]/10 via-white/5 to-[#c4dfc4]/10 border-[#c8e0f5]/30' 
                : 'bg-gradient-to-br from-[#c4dfc4]/10 via-white/5 to-[#c8e0f5]/10 border-[#c4dfc4]/30'
            }`}>
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {isRound2 ? (
                <>
                  <div className="absolute top-10 left-10 text-4xl animate-bounce opacity-20">🥕</div>
                  <div className="absolute top-20 right-20 text-5xl animate-pulse opacity-20" style={{ animationDelay: '0.5s' }}>🥛</div>
                  <div className="absolute bottom-20 left-1/4 text-3xl animate-bounce opacity-20" style={{ animationDelay: '1s' }}>🧀</div>
                  <div className="absolute bottom-10 right-1/3 text-4xl animate-pulse opacity-20" style={{ animationDelay: '1.5s' }}>🍅</div>
                  <div className="absolute top-1/2 left-10 text-3xl animate-bounce opacity-20" style={{ animationDelay: '0.8s' }}>🥬</div>
                  <div className="absolute top-1/3 right-10 text-5xl animate-pulse opacity-20" style={{ animationDelay: '0.3s' }}>🥩</div>
                </>
              ) : (
                <>
                  <div className="absolute top-10 left-10 text-4xl animate-bounce opacity-20">🍕</div>
                  <div className="absolute top-20 right-20 text-5xl animate-pulse opacity-20" style={{ animationDelay: '0.5s' }}>🍔</div>
                  <div className="absolute bottom-20 left-1/4 text-3xl animate-bounce opacity-20" style={{ animationDelay: '1s' }}>🥗</div>
                  <div className="absolute bottom-10 right-1/3 text-4xl animate-pulse opacity-20" style={{ animationDelay: '1.5s' }}>🍰</div>
                  <div className="absolute top-1/2 left-10 text-3xl animate-bounce opacity-20" style={{ animationDelay: '0.8s' }}>🌮</div>
                  <div className="absolute top-1/3 right-10 text-5xl animate-pulse opacity-20" style={{ animationDelay: '0.3s' }}>🍜</div>
                </>
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center gap-6 min-h-[400px]">
              {/* Round indicator */}
              {isRound2 && (
                <div className="absolute top-4 right-4 px-4 py-2 bg-[#c8e0f5]/20 rounded-lg border border-[#c8e0f5]/30">
                  <span className="text-sm font-semibold text-[#c8e0f5]">ROUND 2</span>
                </div>
              )}

              {/* Main emoji - huge and animated */}
              <div className="text-8xl md:text-9xl animate-bounce mb-4">
                {(isRound2 ? round2Stages : loadingStages)[loadingStage].emoji}
              </div>

              {/* Status text */}
              <div className="text-center space-y-3 max-w-lg">
                <h3 className="text-2xl md:text-3xl font-bold text-white animate-pulse">
                  {(isRound2 ? round2Stages : loadingStages)[loadingStage].text}
                </h3>
                <p className="text-base md:text-lg text-gray-300 italic">
                  {(isRound2 ? round2Stages : loadingStages)[loadingStage].subtext}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2 mt-4">
                {(isRound2 ? round2Stages : loadingStages).map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      index === loadingStage
                        ? `${isRound2 ? 'bg-[#c8e0f5]' : 'bg-[#c4dfc4]'} w-8 scale-125`
                        : index < loadingStage
                        ? `${isRound2 ? 'bg-[#c8e0f5]/50' : 'bg-[#c4dfc4]/50'}`
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Fun random facts */}
              <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 max-w-md">
                <p className="text-sm text-gray-400 text-center">
                  <span className={`${isRound2 ? 'text-[#c8e0f5]' : 'text-[#c4dfc4]'} font-semibold`}>
                    {isRound2 ? 'Deep Dive:' : 'Fun Fact:'}
                  </span>{' '}
                  {!isRound2 && (
                    <>
                      {loadingStage === 0 && "AI can read menus faster than a hungry teenager! 🏃‍♂️"}
                      {loadingStage === 1 && "The average restaurant menu has 32 items. Let's find yours! 📊"}
                      {loadingStage === 2 && "Our AI knows over 10,000 ingredients. Even the weird ones! 🤓"}
                      {loadingStage === 3 && "Fun fact: 8% of people have food allergies. We check for all of them! 🛡️"}
                      {loadingStage === 4 && "Some foods last days, some last months. We calculate it all! ⏳"}
                      {loadingStage === 5 && "Your printer is about to become very productive! 🖨️"}
                      {loadingStage === 6 && "Almost done! Your labels will look amazing! 🎨"}
                    </>
                  )}
                  {isRound2 && (
                    <>
                      {loadingStage === 0 && "Analyzing each ingredient's molecular structure... just kidding! 😄"}
                      {loadingStage === 1 && "Did you know lettuce lasts 5-7 days but dried pasta lasts 2 years? 📅"}
                      {loadingStage === 2 && "Temperature control is everything! Even 2°C makes a difference 🌡️"}
                      {loadingStage === 3 && "Building your personal ingredient database for future uploads! 💾"}
                      {loadingStage === 4 && "You now have a complete food safety system! 🎊"}
                    </>
                  )}
                </p>
              </div>

              {/* Silly animation of food items being processed */}
              <div className="flex gap-3 mt-4 text-3xl">
                {!isRound2 ? (
                  <>
                    <span className="animate-bounce" style={{ animationDelay: '0s' }}>🍕</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>➡️</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🤖</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>➡️</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🏷️</span>
                  </>
                ) : (
                  <>
                    <span className="animate-bounce" style={{ animationDelay: '0s' }}>🧪</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>➡️</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🔬</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>➡️</span>
                    <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>💾</span>
                  </>
                )}
              </div>

              {/* Spinner at bottom */}
              <div className="mt-6 flex items-center gap-3 text-gray-400">
                <Loader2 className={`h-5 w-5 animate-spin ${isRound2 ? 'text-[#c8e0f5]' : 'text-[#c4dfc4]'}`} />
                <span className="text-sm">{isRound2 ? 'Deep analyzing ingredients...' : 'Processing with AI magic...'}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Menu Preview (if uploaded) */}
        {imagePreview && !isAnalyzing && (
          <Card className="p-4 md:p-6 bg-white/5 border-white/10">
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
              <img
                src={imagePreview}
                alt="Menu"
                className="w-full md:w-64 h-auto rounded-lg border border-white/10"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
    
  );
}

