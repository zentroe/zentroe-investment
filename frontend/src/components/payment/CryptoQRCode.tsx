import React, { useMemo } from 'react';

interface CryptoQRCodeProps {
  address: string;
  amount?: number;
  currency?: string;
  label?: string;
  message?: string;
  size?: number;
  className?: string;
}

const CryptoQRCode: React.FC<CryptoQRCodeProps> = ({
  address,
  amount,
  currency = '',
  label = 'Zentroe Investment',
  message = 'Investment Payment',
  size = 200,
  className = ''
}) => {
  const qrCodeUrl = useMemo(() => {
    if (!address) return '';

    // Create payment URI based on cryptocurrency
    let paymentURI = '';

    if (currency.toLowerCase().includes('bitcoin') || currency.toLowerCase().includes('btc')) {
      // Bitcoin payment URI format: bitcoin:address?amount=0.1&label=Zentroe&message=Investment
      paymentURI = `bitcoin:${address}`;
      const params = new URLSearchParams();
      if (amount) {
        // Rough conversion for demo - in production, you'd get real-time BTC price
        const btcAmount = (amount / 50000).toString(); // Assuming ~$50k per BTC
        params.append('amount', btcAmount);
      }
      if (label) params.append('label', label);
      if (message) params.append('message', message);
      if (params.toString()) paymentURI += `?${params.toString()}`;
    } else if (currency.toLowerCase().includes('ethereum') || currency.toLowerCase().includes('eth')) {
      // Ethereum payment URI format
      paymentURI = `ethereum:${address}`;
      const params = new URLSearchParams();
      if (amount) {
        // Rough conversion for demo - in production, you'd get real-time ETH price
        const ethAmount = (amount / 2500).toString(); // Assuming ~$2.5k per ETH
        params.append('value', ethAmount);
      }
      if (params.toString()) paymentURI += `?${params.toString()}`;
    } else if (currency.toLowerCase().includes('usdt') || currency.toLowerCase().includes('tether')) {
      // USDT - 1:1 with USD
      paymentURI = `ethereum:${address}`;
      const params = new URLSearchParams();
      if (amount) params.append('value', amount.toString());
      if (params.toString()) paymentURI += `?${params.toString()}`;
    } else {
      // Generic format - just the address for other cryptocurrencies
      paymentURI = address;
    }

    // Use QR Server API to generate QR code
    const encodedURI = encodeURIComponent(paymentURI);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedURI}&margin=10`;
  }, [address, amount, currency, label, message, size]);

  if (!address) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-gray-500 text-sm">No Address</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <img
          src={qrCodeUrl}
          alt={`QR Code for ${currency} payment`}
          className="w-full h-auto rounded"
          style={{ maxWidth: size, maxHeight: size }}
          onError={(e) => {
            console.error('Failed to load QR code');
            e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
              <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f3f4f6"/>
                <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle" dy=".3em">
                  QR Code Error
                </text>
              </svg>
            `)}`;
          }}
        />
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Scan with your crypto wallet
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Contains: {currency} • ${amount?.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CryptoQRCode;