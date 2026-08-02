import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Smartphone, Zap } from 'lucide-react';

interface QRProps {
  accountNumber: string;
  customerName: string;
  upiId?: string;
  amount?: number;
}

export const PigmyQRCode: React.FC<QRProps> = ({ 
  accountNumber, 
  customerName, 
  upiId = "SRIROJASHABARISHGURUJI@KBL",
  amount
}) => {
  // UPI URL format: upi://pay?pa=upi_id&pn=name&am=amount&cu=INR&tn=note
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(customerName)}&tn=${encodeURIComponent(`Pigmy Deposit ${accountNumber}`)}${amount ? `&am=${amount}` : ''}`;

  return (
    <Card className="max-w-md mx-auto overflow-hidden border-4 border-blue-900 rounded-2xl shadow-2xl">
      <div className="bg-blue-900 text-white p-4 text-center">
        <div className="flex items-center justify-between mb-2">
           <img src="/logo.png" alt="Bank Logo" className="h-8 invert" onError={(e) => e.currentTarget.style.display='none'} />
           <h2 className="text-sm font-extrabold tracking-tight leading-none uppercase">Sri Roja Shabarish Guruji</h2>
        </div>
        <p className="text-[9px] opacity-80 uppercase font-black tracking-widest">Souharada Sahakara Niyamitha</p>
      </div>

      <div className="bg-white p-6 text-center space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest border-b pb-2">
          {customerName}
        </h3>
        
        <div className="bg-blue-900 text-white inline-block px-8 py-1 rounded-full text-xs font-bold mb-4">
          SCAN & PAY
        </div>

        <div className="flex justify-center p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <QRCodeSVG 
            value={upiUrl} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="space-y-1">
          <p className="text-[10px] text-gray-500 font-bold uppercase">UPI ID: {upiId}</p>
          <div className="flex justify-center gap-4 py-2">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo.png/640px-UPI-Logo.png" alt="UPI" className="h-4 object-contain" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" alt="GPay" className="h-4 object-contain" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/PhonePe_Logo.png/800px-PhonePe_Logo.png" alt="PhonePe" className="h-4 object-contain" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
           <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-[8px] font-bold uppercase">Secure</span>
           </div>
           <div className="flex flex-col items-center border-x border-gray-100">
              <Zap className="h-5 w-5 text-orange-500 mb-1" />
              <span className="text-[8px] font-bold uppercase">Instant</span>
           </div>
           <div className="flex flex-col items-center">
              <Smartphone className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-[8px] font-bold uppercase">Digital</span>
           </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-2 text-center">
        <p className="text-[9px] font-bold text-blue-900 uppercase">
          Digital Rupee Accepted Here
        </p>
      </div>
    </Card>
  );
};
