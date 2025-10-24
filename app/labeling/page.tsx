'use client';

import { useState, useRef, useEffect } from 'react';
import { Tag, Clock, Loader2, RefreshCw, Plus, Search, Beaker, Upload, FileText, Mic, History, TrendingUp, ChevronDown, LayoutGrid, List, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { zebraPrinter } from '@/lib/printer/zebra-client';
import { toast } from 'sonner';

interface FoodLibraryItem {
  id: string;
  name: string;
  type: 'food_item' | 'ingredient'; // Main distinction
  category: string;
  shelfLifeDays: number;
  storageMethod?: string;
  allergens: string[];
  ingredients?: string[]; // For food items
  source: 'menu_upload' | 'manual' | 'extracted' | 'integration'; // How it was added
  printCount: number;
  lastPrinted: string | null;
  printHistory: { timestamp: string; user?: string }[];
  createdAt: string;
  metadata?: {
    day?: string;
    meal?: string;
    optimalTempMin?: number;
    optimalTempMax?: number;
    safetyNotes?: string;
    parentItem?: string; // For extracted ingredients
  };
}

interface MenuData {
  uploadedAt: string;
  uploadedBy: string;
  items: FoodLibraryItem[];
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

export default function PrepLabelsPage() {
  // Unified Food Library
  const [foodLibrary, setFoodLibrary] = useState<FoodLibraryItem[]>([]);
  
  // UI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false); // Voice search
  const [filterType, setFilterType] = useState<'all' | 'food_item' | 'ingredient'>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'menu_upload' | 'manual' | 'extracted' | 'integration'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'popular'>('name');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [tableSortColumn, setTableSortColumn] = useState<string | null>(null);
  const [tableSortDirection, setTableSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Processing State
  const [isExtractingIngredients, setIsExtractingIngredients] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0, currentItem: '' });
  
  // Add Item Dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'food_item' as 'food_item' | 'ingredient',
    category: '',
    shelfLifeDays: 3,
    storageMethod: 'refrigerated',
    allergens: [] as string[],
    ingredients: [] as string[],
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load library from database on mount
  useEffect(() => {
    const loadLibraryFromDatabase = async () => {
      try {
        const response = await fetch('/api/food-items/library');
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            setFoodLibrary(data.items);
            console.log(`📚 Loaded ${data.items.length} items from database`);
          }
        }
      } catch (error) {
        console.error('Error loading library from database:', error);
      }
    };

    loadLibraryFromDatabase();
  }, []);

  // Cycle through loading stages
  useEffect(() => {
    if (!isAnalyzing) {
      setLoadingStage(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStage(prev => (prev + 1) % loadingStages.length);
    }, 2000); // Change stage every 2 seconds

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Enhanced deduplication with normalization and merging
  const normalizeItemName = (name: string): string => {
    return name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
  };

  const findDuplicate = (newItem: FoodLibraryItem): FoodLibraryItem | undefined => {
    const normalizedNew = normalizeItemName(newItem.name);
    return foodLibrary.find(
      item => 
        normalizeItemName(item.name) === normalizedNew && 
        item.type === newItem.type
    );
  };

  const mergeDuplicateItem = (existing: FoodLibraryItem, newItem: FoodLibraryItem): FoodLibraryItem => {
    // Merge print history and counts
    return {
      ...existing,
      printHistory: [...existing.printHistory, ...newItem.printHistory],
      printCount: existing.printCount + newItem.printCount,
      // Keep existing data but merge metadata if new has more info
      metadata: {
        ...existing.metadata,
        ...newItem.metadata,
      },
    };
  };

  const deduplicateItem = (newItem: FoodLibraryItem): { shouldAdd: boolean; merged?: FoodLibraryItem } => {
    const existing = findDuplicate(newItem);
    
    if (existing) {
      // Merge instead of rejecting
      const merged = mergeDuplicateItem(existing, newItem);
      setFoodLibrary(prev => prev.map(item => item.id === existing.id ? merged : item));
      return { shouldAdd: false, merged };
    }
    return { shouldAdd: true };
  };

  // Add items to library with smart deduplication AND database persistence
  const addToLibrary = async (items: FoodLibraryItem[]) => {
    let addedCount = 0;
    let mergedCount = 0;
    const newItems: FoodLibraryItem[] = [];

    items.forEach(item => {
      const result = deduplicateItem(item);
      if (result.shouldAdd) {
        setFoodLibrary(prev => [...prev, item]);
        newItems.push(item);
        addedCount++;
      } else if (result.merged) {
        mergedCount++;
      }
    });

    // Persist new items to database
    if (newItems.length > 0) {
      try {
        const response = await fetch('/api/food-items/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems }),
        });

        if (response.ok) {
          console.log(`💾 Saved ${newItems.length} items to database`);
        } else {
          console.warn('Failed to save to database, but items added to local state');
        }
      } catch (error) {
        console.error('Error saving to database:', error);
      }
    }

    // Show helpful feedback
    if (addedCount > 0 && mergedCount > 0) {
      toast.success(`Added ${addedCount} new items, merged ${mergedCount} duplicates`);
    } else if (addedCount > 0) {
      toast.success(`Added ${addedCount} new items to library`);
    } else if (mergedCount > 0) {
      toast.info(`All ${mergedCount} items were duplicates and merged`);
    }

    return addedCount;
  };

  // Utility: Deduplicate entire library
  const deduplicateLibrary = () => {
    const seen = new Map<string, FoodLibraryItem>();
    let duplicatesFound = 0;

    foodLibrary.forEach(item => {
      const normalized = normalizeItemName(item.name) + '-' + item.type;
      const existing = seen.get(normalized);

      if (existing) {
        // Merge this duplicate into the existing one
        const merged = mergeDuplicateItem(existing, item);
        seen.set(normalized, merged);
        duplicatesFound++;
      } else {
        seen.set(normalized, item);
      }
    });

    if (duplicatesFound > 0) {
      setFoodLibrary(Array.from(seen.values()));
      toast.success(`Removed ${duplicatesFound} duplicates from library!`);
    } else {
      toast.info('No duplicates found - library is clean! ✨');
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsAnalyzing(true);
    setLoadingStage(0);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;

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
          
          // Convert to unified library format
          const libraryItems: FoodLibraryItem[] = data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: 'food_item' as const,
            category: item.category || 'uncategorized',
            shelfLifeDays: item.shelfLifeDays || 3,
            allergens: item.allergens || [],
            ingredients: item.ingredients || [],
            source: 'menu_upload' as const,
            printCount: 0,
            lastPrinted: null,
            printHistory: [],
            createdAt: new Date().toISOString(),
            metadata: {
              day: item.day,
              meal: item.meal,
            },
          }));

          const addedCount = addToLibrary(libraryItems);

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
              console.log('Saved to database');
            }
          } catch (saveError) {
            console.error('Error saving to database:', saveError);
          }

          toast.success(`✅ Added ${addedCount} items to library!`);
          setIsAnalyzing(false);
        } catch (error) {
          console.error('Analysis error:', error);
          toast.error('Failed to analyze menu');
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

  // Extract all individual ingredients from food items in library
  const handleExtractIngredients = async () => {
    const foodItems = foodLibrary.filter(item => item.type === 'food_item' && item.ingredients && item.ingredients.length > 0);
    
    if (foodItems.length === 0) {
      toast.error('No food items with ingredients to extract from');
      return;
    }

    setIsExtractingIngredients(true);
    setExtractionProgress({ current: 0, total: foodItems.length, currentItem: '' });

    try {
      const newIngredients: FoodLibraryItem[] = [];
      let processedCount = 0;
      
      for (const item of foodItems) {
        if (!item.ingredients || item.ingredients.length === 0) continue;

        setExtractionProgress({ current: processedCount + 1, total: foodItems.length, currentItem: item.name });

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
            
            // Log stats about master library hits
            if (data.stats) {
              console.log(`📊 Ingredient Analysis Stats for "${item.name}":`, {
                total: data.stats.total,
                fromMasterLibrary: data.stats.fromMasterLibrary,
                fromAI: data.stats.fromAI,
                accuracy: data.stats.accuracy,
              });
            }
            
            // Convert to library format
            const ingredientItems: FoodLibraryItem[] = data.ingredients.map((ing: any) => ({
              id: `ing-${Date.now()}-${Math.random()}`,
              name: ing.name,
              type: 'ingredient' as const,
              category: ing.category || 'other',
              shelfLifeDays: ing.shelfLifeDays || 3,
              storageMethod: ing.storageMethod,
              allergens: ing.allergenType && ing.allergenType !== 'none' ? [ing.allergenType] : [],
              source: 'extracted' as const,
              printCount: 0,
              lastPrinted: null,
              printHistory: [],
              createdAt: new Date().toISOString(),
              metadata: {
                optimalTempMin: ing.optimalTempMin,
                optimalTempMax: ing.optimalTempMax,
                safetyNotes: ing.safetyNotes,
                parentItem: item.name,
              },
            }));
            
            newIngredients.push(...ingredientItems);
          }
        } catch (error) {
          console.error(`Error analyzing ingredients for ${item.name}:`, error);
        }

        processedCount++;
      }

      const addedCount = addToLibrary(newIngredients);
      toast.success(`✅ Extracted ${addedCount} individual ingredients!`);
    } catch (error) {
      console.error('Error extracting ingredients:', error);
      toast.error('Failed to extract ingredients');
    } finally {
      setIsExtractingIngredients(false);
      setExtractionProgress({ current: 0, total: 0, currentItem: '' });
    }
  };

  // Manual add item
  const handleManualAdd = () => {
    if (!newItem.name || !newItem.category) {
      toast.error('Please fill in name and category');
      return;
    }

    const libraryItem: FoodLibraryItem = {
      id: `manual-${Date.now()}`,
      name: newItem.name,
      type: newItem.type,
      category: newItem.category,
      shelfLifeDays: newItem.shelfLifeDays,
      storageMethod: newItem.storageMethod,
      allergens: newItem.allergens,
      ingredients: newItem.type === 'food_item' ? newItem.ingredients : undefined,
      source: 'manual',
      printCount: 0,
      lastPrinted: null,
      printHistory: [],
      createdAt: new Date().toISOString(),
    };

    const result = deduplicateItem(libraryItem);
    if (result.shouldAdd) {
      setFoodLibrary(prev => [...prev, libraryItem]);
      toast.success(`✅ Added "${newItem.name}" to library`);
      setShowAddDialog(false);
      // Reset form
      setNewItem({
        name: '',
        type: 'food_item',
        category: '',
        shelfLifeDays: 3,
        storageMethod: 'refrigerated',
        allergens: [],
        ingredients: [],
      });
    } else {
      toast.info(`"${newItem.name}" already exists and was merged`);
      setShowAddDialog(false);
      setNewItem({
        name: '',
        type: 'food_item',
        category: '',
        shelfLifeDays: 3,
        storageMethod: 'refrigerated',
        allergens: [],
        ingredients: [],
      });
    }
  };

  // Voice search (placeholder for now)
  const handleVoiceSearch = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search not supported in this browser');
      return;
    }

    setIsListening(true);
    toast.info('🎤 Listening... speak the item name');

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      toast.success(`Heard: "${transcript}"`);
      setIsListening(false);
    };

    recognition.onerror = () => {
      toast.error('Voice search failed');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Print label with history tracking
  const handlePrintLabel = async (item: FoodLibraryItem) => {
    try {
      const now = new Date();
      const expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + item.shelfLifeDays);

      await zebraPrinter.printFoodPrepLabel({
        name: item.name,
        prepDate: now.toLocaleDateString(),
        expirationDate: expirationDate.toLocaleDateString(),
        ingredients: item.ingredients || [item.name],
        allergens: item.allergens,
      });

      // Update print history
      setFoodLibrary(prev => prev.map(i =>
        i.id === item.id
          ? {
              ...i,
              printCount: i.printCount + 1,
              lastPrinted: now.toISOString(),
              printHistory: [...i.printHistory, { timestamp: now.toISOString() }],
            }
          : i
      ));

      toast.success(`✅ Label printed for ${item.name}`);
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print label');
    }
  };

  // Filter and sort library items
  // Handle table column sorting
  const handleTableSort = (column: string) => {
    if (tableSortColumn === column) {
      // Toggle direction if same column
      setTableSortDirection(tableSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      setTableSortColumn(column);
      setTableSortDirection('asc');
    }
  };

  const getFilteredAndSortedItems = () => {
    let items = foodLibrary;

    // Filter by type
    if (filterType !== 'all') {
      items = items.filter(item => item.type === filterType);
    }

    // Filter by source
    if (filterSource !== 'all') {
      items = items.filter(item => item.source === filterSource);
    }

    // Filter by search query
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.ingredients && item.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    // Sort - use table sort if in table view and column selected
    if (viewMode === 'table' && tableSortColumn) {
      items.sort((a, b) => {
        let aVal: any, bVal: any;
        
        switch (tableSortColumn) {
          case 'type':
            aVal = a.type;
            bVal = b.type;
            break;
          case 'name':
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
            break;
          case 'category':
            aVal = a.category.toLowerCase();
            bVal = b.category.toLowerCase();
            break;
          case 'storage':
            aVal = a.storageMethod || '';
            bVal = b.storageMethod || '';
            break;
          case 'shelfLife':
            aVal = a.shelfLifeDays;
            bVal = b.shelfLifeDays;
            break;
          case 'allergens':
            aVal = a.allergens.length;
            bVal = b.allergens.length;
            break;
          case 'prints':
            aVal = a.printCount;
            bVal = b.printCount;
            break;
          case 'source':
            aVal = a.source;
            bVal = b.source;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return tableSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return tableSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Card view sorting
      switch (sortBy) {
        case 'name':
          items.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'recent':
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
          items.sort((a, b) => b.printCount - a.printCount);
          break;
      }
    }

    return items;
  };

  const filteredItems = getFilteredAndSortedItems();

  // Stats
  const stats = {
    total: foodLibrary.length,
    foodItems: foodLibrary.filter(i => i.type === 'food_item').length,
    ingredients: foodLibrary.filter(i => i.type === 'ingredient').length,
    totalPrints: foodLibrary.reduce((sum, i) => sum + i.printCount, 0),
  };

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-[1800px] space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-2 md:gap-3">
                  <Tag className="h-6 w-6 md:h-10 md:w-10 text-[#c4dfc4]" />
                  Labeling
                </h1>
                <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
                  Manage food items & ingredients, search, and print labels
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                
                {/* Clean Duplicates Button (show when library has items) */}
                {foodLibrary.length > 0 && (
                  <Button 
                    onClick={deduplicateLibrary}
                    size="sm"
                    variant="outline"
                    className="bg-white/5 hover:bg-white/10 border-white/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Clean Duplicates</span>
                  </Button>
                )}
                
                {/* Add Item Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isAnalyzing} size="sm" className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/10">
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="text-white hover:bg-white/10 cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Menu/PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowAddDialog(true)} className="text-white hover:bg-white/10 cursor-pointer">
                      <FileText className="h-4 w-4 mr-2" />
                      Manual Entry
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleExtractIngredients}
                      disabled={isExtractingIngredients || foodLibrary.filter(i => i.type === 'food_item').length === 0}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Beaker className="h-4 w-4 mr-2" />
                      Extract Ingredients
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Stats Cards */}
            {foodLibrary.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="p-3 bg-white/5 border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Total Items</div>
                  <div className="text-2xl font-bold text-white">{stats.total}</div>
                </Card>
                <Card className="p-3 bg-white/5 border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Food Items</div>
                  <div className="text-2xl font-bold text-[#c4dfc4]">{stats.foodItems}</div>
                </Card>
                <Card className="p-3 bg-white/5 border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Ingredients</div>
                  <div className="text-2xl font-bold text-[#c8e0f5]">{stats.ingredients}</div>
                </Card>
                <Card className="p-3 bg-white/5 border-white/10">
                  <div className="text-xs text-gray-400 mb-1">Total Prints</div>
                  <div className="text-2xl font-bold text-white">{stats.totalPrints}</div>
                </Card>
              </div>
            )}

            {/* Search & Filters */}
            {foodLibrary.length > 0 && (
              <div className="flex flex-col md:flex-row gap-3">
                {/* View Mode Toggle - Far Left */}
                <div className="flex gap-1 bg-gradient-to-r from-[#c4dfc4]/10 to-[#b5d0b5]/10 border border-[#c4dfc4]/30 rounded-md p-1">
                  <Button
                    onClick={() => setViewMode('card')}
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-10 p-0 ${viewMode === 'card' ? 'bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] shadow-md' : 'text-[#c4dfc4]/60 hover:bg-[#c4dfc4]/20 hover:text-[#c4dfc4]'}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode('table')}
                    size="sm"
                    variant="ghost"
                    className={`h-8 w-10 p-0 ${viewMode === 'table' ? 'bg-[#c4dfc4] text-[#0a0a0a] hover:bg-[#b5d0b5] shadow-md' : 'text-[#c4dfc4]/60 hover:bg-[#c4dfc4]/20 hover:text-[#c4dfc4]'}`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
                  <SelectTrigger className="w-full md:w-[150px] bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="all" className="text-white">All Types</SelectItem>
                    <SelectItem value="food_item" className="text-white">Food Items</SelectItem>
                    <SelectItem value="ingredient" className="text-white">Ingredients</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-full md:w-[150px] bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    <SelectItem value="name" className="text-white">Name (A-Z)</SelectItem>
                    <SelectItem value="recent" className="text-white">Recent</SelectItem>
                    <SelectItem value="popular" className="text-white">Most Printed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search food items or ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-[#c4dfc4] hover:bg-[#b5d0b5] shadow-lg shadow-[#c4dfc4]/50"
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'text-red-500 animate-pulse' : 'text-[#0a0a0a]'}`} />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Analyzing State - Fun Loading Screen as Full-Page Overlay */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
              <Card className="p-8 md:p-12 relative overflow-hidden max-w-2xl w-full mx-4 bg-gradient-to-br from-[#c4dfc4]/10 via-white/5 to-[#c8e0f5]/10 border-[#c4dfc4]/30">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-10 left-10 text-4xl animate-bounce opacity-20">🍕</div>
                  <div className="absolute top-20 right-20 text-5xl animate-pulse opacity-20" style={{ animationDelay: '0.5s' }}>🍔</div>
                  <div className="absolute bottom-20 left-1/4 text-3xl animate-bounce opacity-20" style={{ animationDelay: '1s' }}>🥗</div>
                  <div className="absolute bottom-10 right-1/3 text-4xl animate-pulse opacity-20" style={{ animationDelay: '1.5s' }}>🍰</div>
                  <div className="absolute top-1/2 left-10 text-3xl animate-bounce opacity-20" style={{ animationDelay: '0.8s' }}>🌮</div>
                  <div className="absolute top-1/3 right-10 text-5xl animate-pulse opacity-20" style={{ animationDelay: '0.3s' }}>🍜</div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-6 min-h-[400px]">
                  {/* Main emoji - huge and animated */}
                  <div className="text-8xl md:text-9xl animate-bounce mb-4">
                    {loadingStages[loadingStage].emoji}
                  </div>

                  {/* Status text */}
                  <div className="text-center space-y-3 max-w-lg">
                    <h3 className="text-2xl md:text-3xl font-bold text-white animate-pulse">
                      {loadingStages[loadingStage].text}
                    </h3>
                    <p className="text-base md:text-lg text-gray-300 italic">
                      {loadingStages[loadingStage].subtext}
                    </p>
                  </div>

                  {/* Progress dots */}
                  <div className="flex gap-2 mt-4">
                    {loadingStages.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                          index === loadingStage
                            ? 'bg-[#c4dfc4] w-8 scale-125'
                            : index < loadingStage
                            ? 'bg-[#c4dfc4]/50'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Spinner at bottom */}
                  <div className="mt-6 flex items-center gap-3 text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[#c4dfc4]" />
                    <span className="text-sm">Processing with AI magic...</span>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Extraction Progress (inline) */}
          {isExtractingIngredients && !isAnalyzing && (
            <Card className="p-6 bg-white/5 border-white/10">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Extracting Ingredients</h3>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#c8e0f5] to-[#b8d0e5] h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${(extractionProgress.current / extractionProgress.total) * 100}%` }}
                  >
                    <span className="text-xs font-semibold text-[#0a0a0a]">
                      {Math.round((extractionProgress.current / extractionProgress.total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-white font-medium">
                    Processing {extractionProgress.current} of {extractionProgress.total} items
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                    Analyzing: {extractionProgress.currentItem}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Unified Library - Card or Table View */}
          {foodLibrary.length > 0 ? (
            viewMode === 'card' ? (
              // Card View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <Card key={item.id} className="p-4 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                    <div className="space-y-3">
                      {/* Item Header with Type Badge */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-semibold text-white flex-1">{item.name}</h3>
                          <Badge className={item.type === 'food_item' ? 'bg-[#c4dfc4]/20 text-[#c4dfc4]' : 'bg-[#c8e0f5]/20 text-[#c8e0f5]'}>
                            {item.type === 'food_item' ? '🍽️' : '🧪'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                            {item.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            {item.source === 'menu_upload' && <Upload className="h-3 w-3 mr-1 inline" />}
                            {item.source === 'manual' && <FileText className="h-3 w-3 mr-1 inline" />}
                            {item.source === 'extracted' && <Beaker className="h-3 w-3 mr-1 inline" />}
                            {item.source}
                          </Badge>
                        </div>
                      </div>

                      {/* Ingredients (for food items) */}
                      {item.type === 'food_item' && item.ingredients && item.ingredients.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Ingredients:</p>
                          <p className="text-xs text-gray-300 line-clamp-2">{item.ingredients.join(', ')}</p>
                        </div>
                      )}

                      {/* Storage (for ingredients) */}
                      {item.type === 'ingredient' && item.storageMethod && (
                        <div className="text-xs text-gray-400">
                          Storage: <span className="text-gray-300">{item.storageMethod}</span>
                        </div>
                      )}

                      {/* Shelf Life & Allergens */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[#c4dfc4]">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.shelfLifeDays} days shelf life</span>
                        </div>
                        {item.allergens.length > 0 && (
                          <div className="text-xs text-yellow-400 flex items-center gap-1">
                            ⚠️ <span>{item.allergens.join(', ')}</span>
                          </div>
                        )}
                      </div>

                      {/* Print History */}
                      {item.printCount > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <History className="h-3 w-3" />
                          <span>Printed {item.printCount}x</span>
                          {item.lastPrinted && (
                            <span className="text-gray-500">
                              • {new Date(item.lastPrinted).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Print Button */}
                      <Button
                        onClick={() => handlePrintLabel(item)}
                        size="sm"
                        className="w-full bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] text-black hover:from-[#b5d0b5] hover:to-[#a5c0a5]"
                      >
                        <Tag className="h-4 w-4 mr-2" />
                        Print Label
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              // Table View
              <Card className="bg-white/5 border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('type')}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          {tableSortColumn === 'type' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Name
                          {tableSortColumn === 'name' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('category')}
                      >
                        <div className="flex items-center gap-1">
                          Category
                          {tableSortColumn === 'category' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('storage')}
                      >
                        <div className="flex items-center gap-1">
                          Storage
                          {tableSortColumn === 'storage' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('shelfLife')}
                      >
                        <div className="flex items-center gap-1">
                          Shelf Life
                          {tableSortColumn === 'shelfLife' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('allergens')}
                      >
                        <div className="flex items-center gap-1">
                          Allergens
                          {tableSortColumn === 'allergens' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('prints')}
                      >
                        <div className="flex items-center gap-1">
                          Prints
                          {tableSortColumn === 'prints' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-gray-300 cursor-pointer hover:text-[#c4dfc4] transition-colors select-none"
                        onClick={() => handleTableSort('source')}
                      >
                        <div className="flex items-center gap-1">
                          Source
                          {tableSortColumn === 'source' ? (
                            tableSortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-[#c4dfc4]" /> : <ArrowDown className="h-3 w-3 text-[#c4dfc4]" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-gray-300 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map(item => (
                      <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <Badge className={item.type === 'food_item' ? 'bg-[#c4dfc4]/20 text-[#c4dfc4]' : 'bg-[#c8e0f5]/20 text-[#c8e0f5]'}>
                            {item.type === 'food_item' ? '🍽️' : '🧪'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-white">{item.name}</TableCell>
                        <TableCell className="text-gray-300">{item.category}</TableCell>
                        <TableCell className="text-gray-300">{item.storageMethod || '-'}</TableCell>
                        <TableCell className="text-[#c4dfc4]">{item.shelfLifeDays} days</TableCell>
                        <TableCell>
                          {item.allergens.length > 0 ? (
                            <span className="text-xs text-yellow-400">{item.allergens.join(', ')}</span>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {item.printCount > 0 ? `${item.printCount}x` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                            {item.source === 'menu_upload' && <Upload className="h-3 w-3 mr-1 inline" />}
                            {item.source === 'manual' && <FileText className="h-3 w-3 mr-1 inline" />}
                            {item.source === 'extracted' && <Beaker className="h-3 w-3 mr-1 inline" />}
                            {item.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handlePrintLabel(item)}
                            size="sm"
                            className="bg-gradient-to-r from-[#c4dfc4] to-[#b5d0b5] text-black hover:from-[#b5d0b5] hover:to-[#a5c0a5]"
                          >
                            <Tag className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )
          ) : !isAnalyzing && !isExtractingIngredients ? (
            <Card className="p-12 bg-white/5 border-white/10">
              <div className="flex flex-col items-center justify-center gap-4">
                <Tag className="h-16 w-16 text-gray-500" />
                <h3 className="text-xl font-semibold text-white">No Labels Yet</h3>
                <p className="text-gray-400 text-center max-w-md">
                  Start by uploading a menu, manually adding items, or integrating with your systems
                </p>
                <Button onClick={() => fileInputRef.current?.click()} className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Menu
                </Button>
              </div>
            </Card>
          ) : null}

          {/* Manual Add Item Dialog */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Item Manually</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a food item or ingredient to your library
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="e.g., Chicken Breast"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Type *</Label>
                    <Select value={newItem.type} onValueChange={(v: any) => setNewItem({ ...newItem, type: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        <SelectItem value="food_item">Food Item</SelectItem>
                        <SelectItem value="ingredient">Ingredient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Input
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="e.g., Protein, Produce"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>Shelf Life (days) *</Label>
                    <Input
                      type="number"
                      value={newItem.shelfLifeDays}
                      onChange={(e) => setNewItem({ ...newItem, shelfLifeDays: parseInt(e.target.value) || 3 })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Storage Method</Label>
                  <Select value={newItem.storageMethod} onValueChange={(v) => setNewItem({ ...newItem, storageMethod: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="room_temp">Room Temperature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-white/10">
                    Cancel
                  </Button>
                  <Button onClick={handleManualAdd} className="bg-[#c4dfc4] hover:bg-[#b5d0b5] text-[#0a0a0a]">
                    Add to Library
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

