'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  FileText,
  Edit,
  Printer,
  Send,
  Globe,
  Store,
  AlertCircle,
  Save,
  ImageOff,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  product_id: {
    _id: string;
    name: string;
    images?: string[];
  };
  product_name: string;
  sku?: string;
  quantity: number;
  price: number;
  total: number;
  customization?: string;
}

interface Address {
  full_name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone?: string;
}

interface Order {
  _id: string;
  order_number: string;
  customer_id?: { _id: string; name: string; email: string; phone?: string };
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  shipping_address: Address;
  billing_address: Address;
  payment_status: string;
  payment_method: string;
  tracking_number?: string;
  carrier?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  internal_notes?: string;
  source: 'web' | 'pos' | 'quote';
  quote_id?: { quote_number: string; sales_person?: string };
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType; bgColor: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-600', icon: Clock, bgColor: 'bg-yellow-50' },
  design: { label: 'Design', color: 'text-blue-600', icon: FileText, bgColor: 'bg-blue-50' },
  production: { label: 'Production', color: 'text-purple-600', icon: Package, bgColor: 'bg-purple-50' },
  quality_control: { label: 'Contrôle qualité', color: 'text-indigo-600', icon: CheckCircle, bgColor: 'bg-indigo-50' },
  packaging: { label: 'Emballage', color: 'text-teal-600', icon: Package, bgColor: 'bg-teal-50' },
  shipped: { label: 'Expédiée', color: 'text-blue-600', icon: Truck, bgColor: 'bg-blue-50' },
  delivered: { label: 'Livrée', color: 'text-green-600', icon: CheckCircle, bgColor: 'bg-green-50' },
  cancelled: { label: 'Annulée', color: 'text-red-600', icon: XCircle, bgColor: 'bg-red-50' },
};

const paymentStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  paid: { label: 'Payée', color: 'text-green-600', bgColor: 'bg-green-50' },
  partial: { label: 'Partiel', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  failed: { label: 'Échoué', color: 'text-red-600', bgColor: 'bg-red-50' },
  refunded: { label: 'Remboursée', color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

const sourceConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  web: { label: 'Site web', color: 'text-blue-600', icon: Globe },
  pos: { label: 'Atelier POS', color: 'text-green-600', icon: Store },
  quote: { label: 'Devis', color: 'text-purple-600', icon: FileText },
};

const paymentMethodLabels: Record<string, string> = {
  card: 'Carte bancaire',
  bank_transfer: 'Virement bancaire',
  cash: 'Espèces',
  check: 'Chèque',
  phone_validation: 'Validation téléphonique',
};

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedStatus, setEditedStatus] = useState('');
  const [editedPaymentStatus, setEditedPaymentStatus] = useState('');
  const [editedTrackingNumber, setEditedTrackingNumber] = useState('');
  const [editedCarrier, setEditedCarrier] = useState('');
  const [editedInternalNotes, setEditedInternalNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (!response.ok) throw new Error('Commande non trouvée');
      const data = await response.json();
      setOrder(data.order);
      setEditedStatus(data.order.status);
      setEditedPaymentStatus(data.order.payment_status);
      setEditedTrackingNumber(data.order.tracking_number || '');
      setEditedCarrier(data.order.carrier || '');
      setEditedInternalNotes(data.order.internal_notes || '');
    } catch (error) {
      console.error('Erreur:', error);
      toast({ title: 'Erreur', description: 'Commande non trouvée', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editedStatus,
          payment_status: editedPaymentStatus,
          tracking_number: editedTrackingNumber || undefined,
          carrier: editedCarrier || undefined,
          internal_notes: editedInternalNotes || undefined,
        }),
      });

      if (!response.ok) throw new Error('Erreur mise à jour');
      
      const data = await response.json();
      setOrder(data.order);
      setEditMode(false);
      toast({ title: 'Succès', description: 'Commande mise à jour' });
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour', variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Commande non trouvée</h2>
        <Link href="/admin/orders" className="text-blue-600 hover:underline mt-4 inline-block">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const paymentStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
  const source = sourceConfig[order.source] || sourceConfig.web;
  const StatusIcon = status.icon;
  const SourceIcon = source.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Commande #{order.order_number}
            </h1>
            <p className="text-gray-500 text-sm">
              Créée le {formatDate(order.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Imprimer
          </button>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Modifier
            </button>
          ) : (
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${status.bgColor} rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-8 h-8 ${status.color}`} />
            <div>
              <p className="text-sm text-gray-600">Statut</p>
              {editMode ? (
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              ) : (
                <p className={`font-semibold ${status.color}`}>{status.label}</p>
              )}
            </div>
          </div>
        </div>

        <div className={`${paymentStatus.bgColor} rounded-lg p-4`}>
          <div className="flex items-center gap-3">
            <CreditCard className={`w-8 h-8 ${paymentStatus.color}`} />
            <div>
              <p className="text-sm text-gray-600">Paiement</p>
              {editMode ? (
                <select
                  value={editedPaymentStatus}
                  onChange={(e) => setEditedPaymentStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {Object.entries(paymentStatusConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              ) : (
                <p className={`font-semibold ${paymentStatus.color}`}>{paymentStatus.label}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <SourceIcon className={`w-8 h-8 ${source.color}`} />
            <div>
              <p className="text-sm text-gray-600">Source</p>
              <p className={`font-semibold ${source.color}`}>{source.label}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">€</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="font-bold text-green-600 text-lg">{formatCurrency(order.total)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Articles */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Articles commandés</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product_id?.images?.[0] ? (
                      <Image
                        src={item.product_id.images[0]}
                        alt={item.product_name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                    {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                    {item.customization && (
                      <p className="text-sm text-blue-600">Personnalisation: {item.customization}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.price)}</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de port</span>
                  <span className="text-gray-900">
                    {order.shipping_cost === 0 ? 'Gratuit' : formatCurrency(order.shipping_cost)}
                  </span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remise</span>
                    <span className="text-green-600">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-green-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expédition */}
          {editMode && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Informations d'expédition</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporteur</label>
                  <input
                    type="text"
                    value={editedCarrier}
                    onChange={(e) => setEditedCarrier(e.target.value)}
                    placeholder="Ex: Colissimo, Chronopost..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">N° de suivi</label>
                  <input
                    type="text"
                    value={editedTrackingNumber}
                    onChange={(e) => setEditedTrackingNumber(e.target.value)}
                    placeholder="Numéro de suivi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Suivi si expédié */}
          {order.tracking_number && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Colis expédié</p>
                  <p className="text-sm text-blue-700">
                    {order.carrier && `${order.carrier} - `}N° {order.tracking_number}
                  </p>
                  {order.shipped_at && (
                    <p className="text-sm text-blue-600">Expédié le {formatDate(order.shipped_at)}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
            {order.notes && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Note du client</p>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Notes internes</p>
              {editMode ? (
                <textarea
                  value={editedInternalNotes}
                  onChange={(e) => setEditedInternalNotes(e.target.value)}
                  rows={3}
                  placeholder="Notes internes (non visibles par le client)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-gray-600">{order.internal_notes || 'Aucune note'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Client */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Client
            </h2>
            <div className="space-y-3">
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${order.customer_email}`} className="hover:text-blue-600">
                  {order.customer_email}
                </a>
              </div>
              {order.customer_phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${order.customer_phone}`} className="hover:text-blue-600">
                    {order.customer_phone}
                  </a>
                </div>
              )}
              {order.customer_id && (
                <Link
                  href={`/admin/customers/${order.customer_id._id}`}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mt-2"
                >
                  Voir le profil client
                </Link>
              )}
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Adresse de livraison
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.street}</p>
              <p>{order.shipping_address.postal_code} {order.shipping_address.city}</p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && <p>Tél: {order.shipping_address.phone}</p>}
            </div>
          </div>

          {/* Adresse de facturation */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Adresse de facturation
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.billing_address.full_name}</p>
              <p>{order.billing_address.street}</p>
              <p>{order.billing_address.postal_code} {order.billing_address.city}</p>
              <p>{order.billing_address.country}</p>
            </div>
          </div>

          {/* Paiement */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Paiement
            </h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Méthode</span>
                <span className="font-medium text-gray-900">
                  {paymentMethodLabels[order.payment_method] || order.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Statut</span>
                <span className={`font-medium ${paymentStatus.color}`}>{paymentStatus.label}</span>
              </div>
            </div>
          </div>

          {/* Devis lié */}
          {order.quote_id && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-900">Devis lié</p>
                  <Link
                    href={`/admin/quotes/${order.quote_id}`}
                    className="text-sm text-purple-700 hover:underline"
                  >
                    #{order.quote_id.quote_number}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
