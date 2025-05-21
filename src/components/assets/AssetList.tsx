import React from 'react';
import { Asset } from '@/types/asset';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, AlertCircle } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onAssetSelect: (asset: Asset) => void;
  searchQuery: string;
  isLoading: boolean;
}

const AssetList: React.FC<AssetListProps> = ({ assets, onAssetSelect, searchQuery, isLoading }) => {
  // Filter assets based on search query
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('AssetList received assets:', assets);
  console.log('Filtered assets:', filteredAssets);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (filteredAssets.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No assets found matching your search.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-2">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => onAssetSelect(asset)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <div className="flex-shrink-0">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{asset.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {asset.category} • {asset.manufacturer} {asset.model}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default AssetList;
