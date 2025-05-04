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
  { value: 'round', label: 'Round', price: 0 },
  { value: 'square', label: 'Square', price: 3 },
  { value: 'heart', label: 'Heart', price: 5 },
  { value: 'custom', label: 'Custom', price: 10 },
];

// Size options with pricing
const SIZES = [
  { value: '6', label: '6" (Serves 6-8)', price: 25 },
  { value: '8', label: '8" (Serves 10-12)', price: 35 },
  { value: '10', label: '10" (Serves 16-20)', price: 50 },
  { value: '12', label: '12" (Serves 24-30)', price: 65 },
  { value: 'tiered', label: 'Tiered (Custom)', price: 100 },
];

// Flavor options with pricing
const FLAVORS = [
  { value: 'vanilla', label: 'Vanilla', price: 0 },
  { value: 'chocolate', label: 'Chocolate', price: 0 },
  { value: 'red_velvet', label: 'Red Velvet', price: 5 },
  { value: 'carrot', label: 'Carrot', price: 5 },
  { value: 'lemon', label: 'Lemon', price: 3 },
  { value: 'marble', label: 'Marble', price: 3 },
];

// Filling options with pricing
const FILLINGS = [
  { value: 'vanilla_buttercream', label: 'Vanilla Buttercream', price: 0 },
  { value: 'chocolate_ganache', label: 'Chocolate Ganache', price: 3 },
  { value: 'strawberry_preserve', label: 'Strawberry Preserve', price: 3 },
  { value: 'cream_cheese', label: 'Cream Cheese', price: 5 },
  { value: 'lemon_curd', label: 'Lemon Curd', price: 5 },
  { value: 'raspberry', label: 'Raspberry', price: 3 },
];

// Frosting options with pricing
const FROSTINGS = [
  { value: 'vanilla_buttercream', label: 'Vanilla Buttercream', price: 0 },
  { value: 'chocolate_buttercream', label: 'Chocolate Buttercream', price: 0 },
  { value: 'cream_cheese', label: 'Cream Cheese', price: 5 },
  { value: 'chocolate_ganache', label: 'Chocolate Ganache', price: 3 },
  { value: 'whipped_cream', label: 'Whipped Cream', price: 3 },
  { value: 'fondant', label: 'Fondant', price: 10 },
];

interface CustomCakeData {
  shape: string;
  size: string;
  flavor: string;
  filling: string;
  frosting: string;
  message: string;
  specialInstructions: string;
  imageUploaded: boolean;
}

interface CakeCustomizerProps {
  preview?: boolean;
}

export default function CakeCustomizer({ preview = false }: CakeCustomizerProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // State for cake customization
  const [customCake, setCustomCake] = useState<CustomCakeData>({
    shape: 'round',
    size: '8',
    flavor: 'chocolate',
    filling: 'vanilla_buttercream',
    frosting: 'chocolate_ganache', 
    message: 'Happy Birthday!',
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
    const sizePrice = SIZES.find(size => size.value === customCake.size)?.price || 0;
    setBasePrice(sizePrice);
    
    // Calculate additional price from other options
    let additionalCost = 0;
    
    // Add shape price
    additionalCost += SHAPES.find(shape => shape.value === customCake.shape)?.price || 0;
    
    // Add flavor price
    additionalCost += FLAVORS.find(flavor => flavor.value === customCake.flavor)?.price || 0;
    
    // Add filling price
    additionalCost += FILLINGS.find(filling => filling.value === customCake.filling)?.price || 0;
    
    // Add frosting price
    additionalCost += FROSTINGS.find(frosting => frosting.value === customCake.frosting)?.price || 0;
    
    // Add message price if not empty (excluding "Happy Birthday!")
    if (customCake.message && customCake.message !== 'Happy Birthday!') {
      additionalCost += 3;
    }
    
    // Add image upload price
    if (customCake.imageUploaded) {
      additionalCost += 5;
    }
    
    setAdditionalPrice(additionalCost);
    setTotalPrice(sizePrice + additionalCost);
  }, [customCake]);
  
  // Validation mutation
  const validateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/validate/custom-cake', data);
      return await res.json();
    },
  });
  
  // Handle form input changes
  const handleChange = (field: keyof CustomCakeData, value: string | boolean) => {
    setCustomCake(prev => ({
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
  
  // Add custom cake to cart
  const handleAddToCart = async () => {
    // Validate the cake data
    try {
      await validateMutation.mutateAsync({
        shape: customCake.shape,
        size: customCake.size,
        flavor: customCake.flavor,
        filling: customCake.filling,
        frosting: customCake.frosting,
        message: customCake.message,
        specialInstructions: customCake.specialInstructions,
      });
      
      // Get option labels for display
      const shapeLabel = SHAPES.find(s => s.value === customCake.shape)?.label;
      const sizeLabel = SIZES.find(s => s.value === customCake.size)?.label;
      const flavorLabel = FLAVORS.find(f => f.value === customCake.flavor)?.label;
      const fillingLabel = FILLINGS.find(f => f.value === customCake.filling)?.label;
      const frostingLabel = FROSTINGS.find(f => f.value === customCake.frosting)?.label;
      
      // Add to cart
      addToCart({
        id: Date.now(), // Generate unique ID
        name: `Custom ${flavorLabel} Cake`,
        price: totalPrice,
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
        type: 'custom_cake',
        customization: {
          shape: shapeLabel,
          size: sizeLabel,
          flavor: flavorLabel,
          filling: fillingLabel,
          frosting: frostingLabel,
          message: customCake.message,
          special_instructions: customCake.specialInstructions,
          includes_image: customCake.imageUploaded
        }
      });
      
      toast({
        title: 'Added to Cart',
        description: 'Your custom cake has been added to your cart.',
      });
      
      // Reset form if not in preview mode
      if (!preview) {
        setCustomCake({
          shape: 'round',
          size: '8',
          flavor: 'chocolate',
          filling: 'vanilla_buttercream',
          frosting: 'chocolate_ganache',
          message: 'Happy Birthday!',
          specialInstructions: '',
          imageUploaded: false
        });
      }
    } catch (error) {
      toast({
        title: 'Validation Error',
        description: 'Please check your cake customization details.',
        variant: 'destructive',
      });
    }
  };
  
  // Define what cake image to show based on selections
  const getCakeImageUrl = () => {
    // In a real app, you might have different images for different cake combinations
    // For simplicity, we'll use a basic switch on flavor
    switch (customCake.flavor) {
      case 'chocolate':
        return 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'red_velvet':
        return 'https://images.unsplash.com/photo-1616031036458-49a21e1d756d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'carrot':
        return 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      default:
        return 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
  };
  
  // If in preview mode, render a simplified version
  if (preview) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Preview Section */}
        <div className="lg:w-1/2 bg-neutral-light rounded-lg p-6 shadow-md">
          <h3 className="font-heading text-2xl font-bold text-neutral-dark mb-4">Your Custom Cake</h3>
          
          <div className="h-64 bg-white rounded-lg flex items-center justify-center border border-neutral-dark/20 mb-4">
            <motion.img 
              src={getCakeImageUrl()}
              alt="Custom Cake Preview" 
              className="h-48 w-48 object-cover rounded-full shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-neutral-dark/20">
            <h4 className="font-bold text-neutral-dark mb-2">Cake Summary</h4>
            <ul className="space-y-1 text-sm">
              {Object.entries({
                Shape: SHAPES.find(s => s.value === customCake.shape)?.label,
                Size: SIZES.find(s => s.value === customCake.size)?.label,
                Flavor: FLAVORS.find(f => f.value === customCake.flavor)?.label,
                Filling: FILLINGS.find(f => f.value === customCake.filling)?.label,
                Frosting: FROSTINGS.find(f => f.value === customCake.frosting)?.label,
                Message: customCake.message || 'None'
              }).map(([key, value]) => (
                <li key={key} className="flex justify-between">
                  <span className="text-neutral-dark/70">{key}:</span>
                  <span className="font-medium text-neutral-dark">{value}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-4 pt-4 border-t border-neutral-dark/20">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg text-primary">{formatCurrency(totalPrice)}</span>
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
        
        {/* Link to full customizer */}
        <div className="lg:w-1/2 flex items-center justify-center">
          <div className="max-w-md text-center">
            <h3 className="font-heading text-2xl font-bold text-neutral-dark mb-3">
              Create Your Own Cake
            </h3>
            <p className="text-neutral-dark/80 mb-6">
              Customize every detail of your perfect cake with our easy-to-use cake builder.
            </p>
            <Button 
              className="bg-primary hover:bg-primary-light"
              size="lg"
              asChild
            >
              <a href="/custom-cake">
                Start Building Your Cake
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Preview Section */}
      <div className="lg:w-1/2 bg-neutral-light rounded-lg p-6 shadow-md">
        <h3 className="font-heading text-2xl font-bold text-neutral-dark mb-4">Your Custom Cake</h3>
        
        <div className="h-64 bg-white rounded-lg flex items-center justify-center border border-neutral-dark/20 mb-4">
          <motion.img 
            src={getCakeImageUrl()}
            alt="Custom Cake Preview" 
            className="h-48 w-48 object-cover rounded-full shadow-lg"
            key={customCake.flavor + customCake.shape} // Re-render animation when these change
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-neutral-dark/20">
          <h4 className="font-bold text-neutral-dark mb-2">Cake Summary</h4>
          <ul className="space-y-1 text-sm">
            {Object.entries({
              Shape: SHAPES.find(s => s.value === customCake.shape)?.label,
              Size: SIZES.find(s => s.value === customCake.size)?.label,
              Flavor: FLAVORS.find(f => f.value === customCake.flavor)?.label,
              Filling: FILLINGS.find(f => f.value === customCake.filling)?.label,
              Frosting: FROSTINGS.find(f => f.value === customCake.frosting)?.label,
              Message: customCake.message || 'None',
              "Reference Image": customCake.imageUploaded ? "Uploaded" : "None"
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
          <h3 className="font-heading text-2xl font-bold text-neutral-dark mb-4">Customize Your Cake</h3>
          
          {/* Shape Selection */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Select Shape</Label>
            <div className="flex flex-wrap gap-3">
              {SHAPES.map(shape => (
                <button 
                  key={shape.value}
                  className={`bg-white hover:bg-primary hover:text-white border ${
                    customCake.shape === shape.value 
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
            <Label className="block text-neutral-dark font-medium mb-2">Select Size</Label>
            <select 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={customCake.size}
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
            <Label className="block text-neutral-dark font-medium mb-2">Select Flavor</Label>
            <div className="flex flex-wrap gap-3">
              {FLAVORS.map(flavor => (
                <button 
                  key={flavor.value}
                  className={`bg-white hover:bg-primary hover:text-white border ${
                    customCake.flavor === flavor.value 
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
            <Label className="block text-neutral-dark font-medium mb-2">Select Filling</Label>
            <select 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={customCake.filling}
              onChange={(e) => handleChange('filling', e.target.value)}
            >
              {FILLINGS.map(filling => (
                <option key={filling.value} value={filling.value}>
                  {filling.label} {filling.price > 0 ? `(+$${filling.price})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Frosting Selection */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Select Frosting</Label>
            <select 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={customCake.frosting}
              onChange={(e) => handleChange('frosting', e.target.value)}
            >
              {FROSTINGS.map(frosting => (
                <option key={frosting.value} value={frosting.value}>
                  {frosting.label} {frosting.price > 0 ? `(+$${frosting.price})` : ''}
                </option>
              ))}
            </select>
          </div>
          
          {/* Message Text */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Cake Message</Label>
            <Input 
              type="text" 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Write your message" 
              value={customCake.message}
              onChange={(e) => handleChange('message', e.target.value)}
            />
            <p className="text-xs text-neutral-dark/60 mt-1">
              Custom messages other than "Happy Birthday!" incur a $3 fee.
            </p>
          </div>
          
          {/* Upload Image */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Upload Reference Image (Optional) (+$5)</Label>
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
              <p className="text-sm text-neutral-dark/70 mt-2">Drag & drop an image or click to browse</p>
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
          </div>
          
          {/* Special Instructions */}
          <div className="mb-4">
            <Label className="block text-neutral-dark font-medium mb-2">Special Instructions</Label>
            <Textarea 
              className="w-full p-2 border border-neutral-dark/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary h-20" 
              placeholder="Any additional details or requests..."
              value={customCake.specialInstructions}
              onChange={(e) => handleChange('specialInstructions', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
