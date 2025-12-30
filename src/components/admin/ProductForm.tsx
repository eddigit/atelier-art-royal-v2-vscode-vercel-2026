'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Save, X, Upload, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  rite_ids: string[];
  obedience_ids: string[];
  degree_order_ids: string[];
  category_ids: string[];
  images: string[];
  video_url?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  allow_backorders: boolean;
  sku?: string;
  is_active: boolean;
  featured: boolean;
  sold_individually: boolean;
  sizes: string[];
  colors: string[];
  materials: string[];
  tags: string[];
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  product_type?: string;
}

interface ProductFormProps {
  product?: any;
  isEditing?: boolean;
}

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Listes de référence
  const [rites, setRites] = useState<any[]>([]);
  const [obediences, setObediences] = useState<any[]>([]);
  const [degrees, setDegrees] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState<ProductFormData>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    price: product?.price || 0,
    compare_at_price: product?.compare_at_price || undefined,
    rite_ids: product?.rite_ids?.map((r: any) => r._id || r) || [],
    obedience_ids: product?.obedience_ids?.map((o: any) => o._id || o) || [],
    degree_order_ids: product?.degree_order_ids?.map((d: any) => d._id || d) || [],
    category_ids: product?.category_ids?.map((c: any) => c._id || c) || [],
    images: product?.images || [],
    video_url: product?.video_url || '',
    stock_quantity: product?.stock_quantity || 0,
    low_stock_threshold: product?.low_stock_threshold || 5,
    allow_backorders: product?.allow_backorders || false,
    sku: product?.sku || '',
    is_active: product?.is_active !== undefined ? product.is_active : true,
    featured: product?.featured || false,
    sold_individually: product?.sold_individually || false,
    sizes: product?.sizes || [],
    colors: product?.colors || [],
    materials: product?.materials || [],
    tags: product?.tags || [],
    weight: product?.weight || undefined,
    length: product?.length || undefined,
    width: product?.width || undefined,
    height: product?.height || undefined,
    product_type: product?.product_type || '',
  });

  // Champs temporaires pour les listes
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');

  useEffect(() => {
    loadReferences();
  }, []);

  const loadReferences = async () => {
    try {
      const [ritesRes, obediencesRes, degreesRes, categoriesRes] = await Promise.all([
        fetch('/api/rites'),
        fetch('/api/obediences'),
        fetch('/api/degrees'),
        fetch('/api/categories'),
      ]);

      const [ritesData, obediencesData, degreesData, categoriesData] = await Promise.all([
        ritesRes.json(),
        obediencesRes.json(),
        degreesRes.json(),
        categoriesRes.json(),
      ]);

      setRites(ritesData.rites || ritesData || []);
      setObediences(obediencesData.obediences || obediencesData || []);
      setDegrees(degreesData.degrees || degreesData || []);
      setCategories(categoriesData.categories || categoriesData || []);
    } catch (error) {
      console.error('Erreur chargement références:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de référence',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/admin/products/${product._id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la sauvegarde');
      }

      toast({
        title: 'Succès',
        description: `Produit ${isEditing ? 'modifié' : 'créé'} avec succès`,
      });

      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-générer le slug depuis le nom
    if (field === 'name' && !isEditing) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const toggleArrayItem = (field: 'rite_ids' | 'obedience_ids' | 'degree_order_ids' | 'category_ids', id: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((item) => item !== id)
        : [...prev[field], id],
    }));
  };

  const addToArray = (field: 'sizes' | 'colors' | 'materials' | 'tags' | 'images', value: string) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeFromArray = (field: 'sizes' | 'colors' | 'materials' | 'tags' | 'images', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informations de base */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#0A1628] mb-4">Informations de base</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du produit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description courte
            </label>
            <textarea
              rows={2}
              value={formData.short_description}
              onChange={(e) => handleChange('short_description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description complète
            </label>
            <textarea
              rows={6}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix (€) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix barré (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.compare_at_price || ''}
              onChange={(e) => handleChange('compare_at_price', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de produit
            </label>
            <input
              type="text"
              value={formData.product_type}
              onChange={(e) => handleChange('product_type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Relations (Rites, Obédiences, Degrés, Catégories) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#0A1628] mb-4">Relations</h2>

        <div className="space-y-6">
          {/* Rites */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rites</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {rites.map((rite) => (
                <label key={rite._id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rite_ids.includes(rite._id)}
                    onChange={() => toggleArrayItem('rite_ids', rite._id)}
                    className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                  />
                  <span className="text-sm">{rite.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Obédiences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Obédiences</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {obediences.map((obedience) => (
                <label key={obedience._id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.obedience_ids.includes(obedience._id)}
                    onChange={() => toggleArrayItem('obedience_ids', obedience._id)}
                    className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                  />
                  <span className="text-sm">{obedience.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Degrés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Degrés</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {degrees.map((degree) => (
                <label key={degree._id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.degree_order_ids.includes(degree._id)}
                    onChange={() => toggleArrayItem('degree_order_ids', degree._id)}
                    className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                  />
                  <span className="text-sm">
                    {degree.name} <span className="text-xs text-gray-500">({degree.loge_type})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Catégories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégories</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map((category) => (
                <label key={category._id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.category_ids.includes(category._id)}
                    onChange={() => toggleArrayItem('category_ids', category._id)}
                    className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stock */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#0A1628] mb-4">Stock</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantité en stock
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seuil stock bas
            </label>
            <input
              type="number"
              min="0"
              value={formData.low_stock_threshold}
              onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 pt-8">
            <input
              type="checkbox"
              id="allow_backorders"
              checked={formData.allow_backorders}
              onChange={(e) => handleChange('allow_backorders', e.target.checked)}
              className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
            />
            <label htmlFor="allow_backorders" className="text-sm text-gray-700">
              Autoriser précommandes
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#0A1628] mb-4">Images</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="URL de l'image"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
            <Button
              type="button"
              onClick={() => {
                addToArray('images', newImage);
                setNewImage('');
              }}
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square relative border border-gray-200 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFromArray('images', index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Vidéo (YouTube, Vimeo)
          </label>
          <input
            type="url"
            value={formData.video_url}
            onChange={(e) => handleChange('video_url', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
          />
        </div>
      </div>

      {/* Attributs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#0A1628] mb-4">Attributs</h2>
        
        <div className="space-y-4">
          {/* Tailles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tailles</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ex: S, M, L, XL"
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('sizes', newSize);
                    setNewSize('');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
              />
              <Button
                type="button"
                onClick={() => {
                  addToArray('sizes', newSize);
                  setNewSize('');
                }}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.sizes.map((size, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2">
                  {size}
                  <button type="button" onClick={() => removeFromArray('sizes', index)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Couleurs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleurs</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ex: Bleu, Rouge, Vert"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('colors', newColor);
                    setNewColor('');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
              />
              <Button
                type="button"
                onClick={() => {
                  addToArray('colors', newColor);
                  setNewColor('');
                }}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.colors.map((color, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2">
                  {color}
                  <button type="button" onClick={() => removeFromArray('colors', index)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Matériaux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Matériaux</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ex: Coton, Soie, Cuir"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('materials', newMaterial);
                    setNewMaterial('');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
              />
              <Button
                type="button"
                onClick={() => {
                  addToArray('materials', newMaterial);
                  setNewMaterial('');
                }}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.materials.map((material, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2">
                  {material}
                  <button type="button" onClick={() => removeFromArray('materials', index)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Ex: premium, nouveau, promo"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToArray('tags', newTag);
                    setNewTag('');
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
              />
              <Button
                type="button"
                onClick={() => {
                  addToArray('tags', newTag);
                  setNewTag('');
                }}
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                  #{tag}
                  <button type="button" onClick={() => removeFromArray('tags', index)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#0A1628] mb-4">Dimensions et poids</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longueur (cm)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.length || ''}
              onChange={(e) => handleChange('length', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Largeur (cm)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.width || ''}
              onChange={(e) => handleChange('width', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hauteur (cm)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.height || ''}
              onChange={(e) => handleChange('height', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poids (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B8860B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#0A1628] mb-4">Options</h2>
        
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
            />
            <span className="text-sm text-gray-700">Produit actif (visible dans le catalogue)</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
            />
            <span className="text-sm text-gray-700">Produit mis en avant</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.sold_individually}
              onChange={(e) => handleChange('sold_individually', e.target.checked)}
              className="rounded border-gray-300 text-[#B8860B] focus:ring-[#B8860B]"
            />
            <span className="text-sm text-gray-700">Vendu individuellement (1 max par commande)</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-2" />
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#B8860B] hover:bg-[#C9A84C]"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer le produit'}
        </Button>
      </div>
    </form>
  );
}
