export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col h-full animate-pulse">
      {/* Resim İskeleti (Shimmer Efekti) */}
      <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
      
      {/* İçerik İskeleti */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Kategori */}
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        {/* Ürün İsmi */}
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        
        {/* Puan ve Fiyat Alanı */}
        <div className="mt-auto pt-4 flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="w-16 h-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
