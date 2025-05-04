import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { formatCurrency } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';

// Shape options with pricing
const SHAPES = [
  { value: 'rectangular', label: 'Rectangular', price: 0 },
  { value: 'square', label: 'Square', price: 0 },
  { value: 'round', label: 'Round', price: 2 },
  { value: 'heart', label: 'Heart', price: 3 },
  { value: 'custom', label: 'Custom Shape', price: 5 },
];

// Size options with pricing
const SIZES = [
  { value: 'small', label: 'Small Box (12 pieces)', price: 20 },
  { value: 'medium', label: 'Medium Box (24 pieces)', price: 35 },
  { value: 'large', label: 'Large Box (36 pieces)', price: 50 },
  { value: 'gift', label: 'Gift Basket (48 pieces)', price: 70 },
  { value: 'custom', label: 'Custom Size', price: 85 },
];

// Flavor options with pricing
const FLAVORS = [
  { value: 'milk', label: 'Milk Chocolate', price: 0 },
  { value: 'dark', label: 'Dark Chocolate', price: 0 },
  { value: 'white', label: 'White Chocolate', price: 0 },
  { value: 'ruby', label: 'Ruby Chocolate', price: 5 },
  { value: 'mixed', label: 'Mixed Varieties', price: 3 },
  { value: 'sugar_free', label: 'Sugar Free', price: 5 },
];

// Filling options with pricing
const FILLINGS = [
  { value: 'none', label: 'No Filling', price: 0 },
  { value: 'caramel', label: 'Caramel', price: 3 },
  { value: 'hazelnut', label: 'Hazelnut', price: 3 },
  { value: 'fruit', label: 'Fruit Jelly', price: 3 },
  { value: 'liqueur', label: 'Liqueur', price: 5 },
  { value: 'peanut_butter', label: 'Peanut Butter', price: 3 },
];

// Packaging options with pricing
const PACKAGING = [
  { value: 'standard', label: 'Standard Box', price: 0 },
  { value: 'premium', label: 'Premium Gift Box', price: 5 },
  { value: 'ribbon', label: 'With Ribbon & Card', price: 3 },
  { value: 'basket', label: 'Gift Basket', price: 10 },
  { value: 'custom', label: 'Custom Packaging', price: 15 },
];

interface CustomChocolateData {
  shape: string;
  size: string;
  flavor: string;
  filling: string;
  packaging: string;
  message: string;
  specialInstructions: string;
  imageUploaded: boolean;
}

export default function ChocolateCustomizer() {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // State for chocolate customization
  const [customChocolate, setCustomChocolate] = useState<CustomChocolateData>({
    shape: 'rectangular',
    size: 'medium',
    flavor: 'milk',
    filling: 'none',
    packaging: 'standard',
    message: '',
    specialInstructions: '',
    imageUploaded: false
  });
  
  // State for price calculation
  const [basePrice, setBasePrice] = useState(0);
  const [additionalPrice, setAdditionalPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Calculate price whenever customization changes
  useEffect(() => {
    // Get base price from size
    const sizePrice = SIZES.find(size => size.value === customChocolate.size)?.price || 0;
    setBasePrice(sizePrice);
    
    // Calculate additional price from other options
    let additionalCost = 0;
    
    // Add shape price
    additionalCost += SHAPES.find(shape => shape.value === customChocolate.shape)?.price || 0;
    
    // Add flavor price
    additionalCost += FLAVORS.find(flavor => flavor.value === customChocolate.flavor)?.price || 0;
    
    // Add filling price if not 'none'
    if (customChocolate.filling !== 'none') {
      additionalCost += FILLINGS.find(filling => filling.value === customChocolate.filling)?.price || 0;
    }
    
    // Add packaging price
    additionalCost += PACKAGING.find(pkg => pkg.value === customChocolate.packaging)?.price || 0;
    
    // Add message price if not empty
    if (customChocolate.message) {
      additionalCost += 3;
    }
    
    // Add image upload price
    if (customChocolate.imageUploaded) {
      additionalCost += 5;
    }
    
    setAdditionalPrice(additionalCost);
    setTotalPrice(sizePrice + additionalCost);
  }, [customChocolate]);
  
  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/validate/custom-chocolate', data);
      return await res.json();
    },
  });
  
  // Handle form input changes
  const handleChange = (field: keyof CustomChocolateData, value: string | boolean) => {
    setCustomChocolate(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    // In a real app, this would handle actual file uploads
    // For this demo, we'll just set imageUploaded to true
    handleChange('imageUploaded', true);
    toast({
      title: 'Image Uploaded',
      description: 'Your reference image has been uploaded successfully.',
    });
  };
  
  // Add custom chocolate to cart
  const handleAddToCart = async () => {
    // Validate the chocolate data
    try {
      await validateMutation.mutateAsync({
        shape: customChocolate.shape,
        size: customChocolate.size,
        flavor: customChocolate.flavor,
        filling: customChocolate.filling,
        packaging: customChocolate.packaging,
        message: customChocolate.message,
        specialInstructions: customChocolate.specialInstructions,
      });
      
      // Get option labels for display
      const shapeLabel = SHAPES.find(s => s.value === customChocolate.shape)?.label;
      const sizeLabel = SIZES.find(s => s.value === customChocolate.size)?.label;
      const flavorLabel = FLAVORS.find(f => f.value === customChocolate.flavor)?.label;
      const fillingLabel = FILLINGS.find(f => f.value === customChocolate.filling)?.label;
      const packagingLabel = PACKAGING.find(p => p.value === customChocolate.packaging)?.label;
      
      // Add to cart
      addToCart({
        id: Date.now(), // Generate unique ID
        name: `Custom ${flavorLabel} Chocolates`,
        price: totalPrice,
        image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        type: 'custom_chocolate',
        customization: {
          shape: shapeLabel,
          size: sizeLabel,
          flavor: flavorLabel,
          filling: fillingLabel !== 'No Filling' ? fillingLabel : undefined,
          packaging: packagingLabel,
          message: customChocolate.message || undefined,
          special_instructions: customChocolate.specialInstructions || undefined,
          includes_image: customChocolate.imageUploaded
        }
      });
      
      toast({
        title: 'Added to Cart',
        description: 'Your custom chocolates have been added to your cart.',
      });
      
      // Reset form
      setCustomChocolate({
        shape: 'rectangular',
        size: 'medium',
        flavor: 'milk',
        filling: 'none',
        packaging: 'standard',
        message: '',
        specialInstructions: '',
        imageUploaded: false
      });
    } catch (error) {
      toast({
        title: 'Validation Error',
        description: 'Please check your chocolate customization details.',
        variant: 'destructive',
      });
    }
  };
  
  // Get appropriate chocolate image based on selections
  const getChocolateImageUrl = () => {
    // Simple image selection based on flavor and filling
    if (customChocolate.flavor === 'dark') {
      return 'https://images.unsplash.com/photo-1511381939415-e44015466834?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    } else if (customChocolate.flavor === 'white') {
      return 'https://images.unsplash.com/photo-1548907040-4d42bea35bc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    } else if (customChocolate.flavor === 'ruby') {
      return 'https://images.unsplash.com/photo-1605697361937-85e1827bae6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    } else {
      return 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Preview Section */}
      <div className="lg:w-1/2 bg-neutral-light rounded-lg p-6 shadow-md">
        <h3 className="font-heading text-2xl font-bold text-neutral-dark mb-4">Your Custom Chocolates</h3>
        
        <div className="h-64 bg-white rounded-lg flex items-center justify-center border border-neutral-dark/20 mb-4">
          <motion.img 
            src={getChocolateImageUrl()}
            alt="Custom Chocolate Preview" 
            className="h-48 w-48 object-cover rounded-lg shadow-lg"
            key={customChocolate.flavor} // Re-render animation when flavor changes
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-neutral-dark/20">
          <h4 className="font-bold text-neutral-dark mb-2">Chocolate Summary</h4>
          <ul className="space-y-1 text-sm">
            {Object.entries({
              Shape: SHAPES.find(s => s.value === customChocolate.shape)?.label,
              Size: SIZES.find(s => s.value === customChocolate.size)?.label,
              Flavor: FLAVORS.find(f => f.value === customChocolate.flavor)?.label,
              Filling: FILLINGS.find(f => f.value === customChocolate.filling)?.label,
              Packaging: PACKAGING.find(p => p.value === customChocolate.packaging)?.label,
              Message: customChocolate.message || 'None',
              "Reference Image": customChocolate.imageUploaded ? "Uploaded" : "None"
            }).map(([key, value]) => (
              <li key={key} className="flex justify-between">
                <span className="text-neutral-dark/70">{key}:</span>
                <span className="font-medium text-neutral-dark">{value}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-4 border-t border-neutral-dark/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="font-bold text-lg text-primary">{formatCurrency(totalPrice)}</div>
                <div className="text-xs text-neutral-dark/70">
                  Base: {formatCurrency(basePrice)} + Add-ons: {formatCurrency(additionalPrice)}
                </div>
              </div>
              <Button 
                className="bg-primary hover:bg-primary-light"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Customization Options */}
      <div className="lg:w-1/2">
        <div className="bg-neutral-light rounded-lg p-6 shadow-md">
          <h3 className="font-heading text-2xl font-bold text-neutral-dark mb-4">Customize Your Chocolates</h3>
          
          {/* Shape Selection */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Select Chocolate Shape</Label>
            <div className="flex flex-wrap gap-3">
              {SHAPES.map(shape => (
                <button 
                  key={shape.value}
                  className={`bg-white hover:bg-primary hover:text-white border ${
                    customChocolate.shape === shape.value 
                      ? 'border-primary text-primary' 
                      : 'border-neutral-dark/30 text-neutral-dark'
                  } px-4 py-2 rounded-full text-sm transition duration-300`}
                  onClick={() => handleChange('shape', shape.value)}
                >
                  {shape.label} {shape.price > 0 && `(+$${shape.price})`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Size Selection */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Select Box Size</Label>
            <select 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={customChocolate.size}
              onChange={(e) => handleChange('size', e.target.value)}
            >
              {SIZES.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label} (${size.price})
                </option>
              ))}
            </select>
          </div>
          
          {/* Flavor Selection */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Select Chocolate Type</Label>
            <div className="flex flex-wrap gap-3">
              {FLAVORS.map(flavor => (
                <button 
                  key={flavor.value}
                  className={`bg-white hover:bg-primary hover:text-white border ${
                    customChocolate.flavor === flavor.value 
                      ? 'bg-primary text-white border-primary' 
                      : 'border-neutral-dark/30 text-neutral-dark'
                  } px-4 py-2 rounded-full text-sm transition duration-300`}
                  onClick={() => handleChange('flavor', flavor.value)}
                >
                  {flavor.label} {flavor.price > 0 && `(+$${flavor.price})`}
                </button>
              ))}
            </div>
          </div>
          
          {/* Filling Selection */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Select Filling (Optional)</Label>
            <select 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={customChocolate.filling}
              onChange={(e) => handleChange('filling', e.target.value)}
            >
              {FILLINGS.map(filling => (
                <option key={filling.value} value={filling.value}>
                  {filling.label} {filling.price > 0 ? `(+$${filling.price})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Packaging Selection */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Select Packaging</Label>
            <select 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={customChocolate.packaging}
              onChange={(e) => handleChange('packaging', e.target.value)}
            >
              {PACKAGING.map(pkg => (
                <option key={pkg.value} value={pkg.value}>
                  {pkg.label} {pkg.price > 0 ? `(+$${pkg.price})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Message Text */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Gift Message (Optional) (+$3)</Label>
            <Input 
              type="text" 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Write a gift message" 
              value={customChocolate.message}
              onChange={(e) => handleChange('message', e.target.value)}
            />
          </div>
          
          {/* Upload Image */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Upload Logo/Image (Optional) (+$5)</Label>
            <div className="border-2 border-dashed border-neutral-dark/30 rounded-md p-4 text-center">
              <svg 
                className="mx-auto h-12 w-12 text-primary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              <p className="text-sm text-neutral-dark/70 mt-2">Upload a logo for corporate gifts or a custom design</p>
              <input type="file" className="hidden" />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={handleFileUpload}
              >
                Browse Files
              </Button>
            </div>
            <p className="text-xs text-neutral-dark/60 mt-1">
              Image will be printed on packaging or on chocolate molds depending on selection
            </p>
          </div>
          
          {/* Special Instructions */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Special Instructions</Label>
            <Textarea 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-20" 
              placeholder="Any additional details, allergies, or special requests..."
              value={customChocolate.specialInstructions}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
