'use client';
import { useRef, useState } from 'react';
import Resolution from '@unstoppabledomains/resolution';

const Home = () => {
  const [domain, setDomain] = useState<string>('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);

  const [copySuccess, setCopySuccess] = useState<string>('');

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const ethereumProviderUrl = 'https://rpc.ankr.com/eth';
  const polygonProviderUrl = 'https://rpc.ankr.com/polygon';

  const resolution = new Resolution({
    sourceConfig: {
      uns: {
        locations: {
          Layer1: {
            url: ethereumProviderUrl,
            network: 'mainnet',
          },
          Layer2: {
            url: polygonProviderUrl,
            network: 'polygon-mainnet',
          },
        },
      },
    },
  });

  const resolveDomain = async () => {
    try {
      const currency = 'ETH';
      const address = await resolution.addr(
        domain.replace('did:ud:', '').trim(),
        currency
      );
      if (!address) {
        return;
      }
      setResolvedAddress(address);
    } catch (error) {
      console.error('Error resolving domain:', error);
    }
  };

  const copyToClipboard = (e: React.MouseEvent) => {
    if (textAreaRef.current) {
      textAreaRef.current.select();
      document.execCommand('copy');
      setCopySuccess('Copied!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-2xl mb-4 font-bold">Domain Resolver</h1>

      <div className="w-1/3 p-6 bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center mb-4 border rounded">
          <div className="p-3 bg-gray-700 text-white">did:ud:</div>
          <input
            className="flex-grow p-3 rounded-r text-black bg-white focus:outline-none"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter the rest of the domain"
          />
        </div>
        <button
          className="w-full p-3 mt-4 border-0 rounded bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
          onClick={resolveDomain}
        >
          Resolve
        </button>
        {resolvedAddress && (
          <div className="mt-4 flex items-center justify-between">
            <textarea
              ref={textAreaRef}
              readOnly
              value={resolvedAddress}
              className="w-3/4 border p-3 rounded bg-white text-black"
            />
            <button
              onClick={copyToClipboard}
              className="ml-4 p-3 bg-green-600 rounded hover:bg-green-700 transition duration-200"
            >
              Copy
            </button>
          </div>
        )}
        {copySuccess && (
          <div className="mt-4 text-center text-green-500">{copySuccess}</div>
        )}
      </div>
    </div>
  );
};

export default Home;
