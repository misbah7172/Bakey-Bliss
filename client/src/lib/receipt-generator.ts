import { jsPDF } from 'jspdf';
import { formatCurrency } from './utils';

type ReceiptItem = {
  name: string;
  price: number;
  quantity: number;
  customization?: Record<string, any>;
};

type OrderInfo = {
  orderId: number;
  orderDate: Date | string;
  totalAmount: number;
  paymentMethod: string;
  items: ReceiptItem[];
  deliveryInfo: {
    address: string;
    city: string;
    zipCode: string;
    phone: string;
    specialInstructions?: string;
  };
  customerName: string;
};

export function generateReceipt(orderInfo: OrderInfo): void {
  const doc = new jsPDF();
  
  // Set up fonts and styles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  
  // Header
  doc.text('BakeryBliss', 105, 20, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('123 Bakery Street, Sweet City, 12345', 105, 27, { align: 'center' });
  doc.text('Phone: (123) 456-7890 | Email: info@bakerybliss.com', 105, 32, { align: 'center' });
  
  // Add line separator
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);
  
  // Receipt Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RECEIPT', 105, 45, { align: 'center' });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Order Information:', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Order ID: #${orderInfo.orderId}`, 20, 62);
  doc.text(`Date: ${new Date(orderInfo.orderDate).toLocaleDateString()}`, 20, 67);
  doc.text(`Customer: ${orderInfo.customerName}`, 20, 72);
  doc.text(`Payment Method: ${formatPaymentMethod(orderInfo.paymentMethod)}`, 20, 77);
  
  // Delivery Information
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Delivery Information:', 20, 87);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Address: ${orderInfo.deliveryInfo.address}`, 20, 94);
  doc.text(`City: ${orderInfo.deliveryInfo.city}`, 20, 99);
  doc.text(`Zip Code: ${orderInfo.deliveryInfo.zipCode}`, 20, 104);
  doc.text(`Phone: ${orderInfo.deliveryInfo.phone}`, 20, 109);
  
  if (orderInfo.deliveryInfo.specialInstructions) {
    doc.text(`Special Instructions: ${orderInfo.deliveryInfo.specialInstructions}`, 20, 114);
  }
  
  // Order Items
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Order Items:', 20, 124);
  
  // Table header
  doc.line(20, 127, 190, 127);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Item', 22, 132);
  doc.text('Quantity', 120, 132);
  doc.text('Price', 145, 132);
  doc.text('Subtotal', 170, 132);
  doc.line(20, 134, 190, 134);
  
  // Table content
  doc.setFont('helvetica', 'normal');
  let yPos = 139;
  
  orderInfo.items.forEach((item, index) => {
    let itemName = item.name;
    
    // If it has customization, append details
    if (item.customization && Object.keys(item.customization).length > 0) {
      let customDetails = '';
      for (const [key, value] of Object.entries(item.customization)) {
        if (key !== 'id' && key !== 'type') {
          customDetails += `${key.replace(/_/g, ' ')}: ${value}, `;
        }
      }
      
      if (customDetails) {
        itemName += ` (${customDetails.slice(0, -2)})`;
      }
    }
    
    // Handle long item names by wrapping text
    const nameLines = doc.splitTextToSize(itemName, 95);
    doc.text(nameLines, 22, yPos);
    
    // If text wraps to multiple lines, adjust yPos
    const lineHeight = 5;
    const textHeight = nameLines.length * lineHeight;
    
    doc.text(item.quantity.toString(), 124, yPos);
    doc.text(formatCurrency(item.price), 145, yPos);
    doc.text(formatCurrency(item.price * item.quantity), 170, yPos);
    
    yPos += Math.max(textHeight, lineHeight) + 2;
    
    // Add a thin line between items
    if (index < orderInfo.items.length - 1) {
      doc.setLineWidth(0.2);
      doc.line(20, yPos - 1, 190, yPos - 1);
    }
  });
  
  // Add a thicker line after items
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 145, yPos + 10);
  doc.text(formatCurrency(orderInfo.totalAmount), 170, yPos + 10);
  
  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Thank you for your order! We appreciate your business.', 105, 250, { align: 'center' });
  doc.text(`This receipt was generated on ${new Date().toLocaleString()}`, 105, 255, { align: 'center' });
  
  // Save the PDF
  doc.save(`BakeryBliss_Receipt_Order_${orderInfo.orderId}.pdf`);
}

function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'credit_card':
      return 'Credit Card';
    case 'paypal':
      return 'PayPal';
    case 'cash_on_delivery':
      return 'Cash on Delivery';
    default:
      return method.charAt(0).toUpperCase() + method.slice(1).replace(/_/g, ' ');
  }
}