import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Quote from '@/models/Quote';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/admin/quotes/[id]/convert - Convertir un devis en commande
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const quote = await Quote.findById(params.id);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Devis non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier le statut
    if (quote.status === 'converted') {
      return NextResponse.json(
        { error: 'Ce devis a déjà été converti en commande' },
        { status: 400 }
      );
    }

    if (quote.status === 'rejected' || quote.status === 'expired') {
      return NextResponse.json(
        { error: 'Impossible de convertir un devis rejeté ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier les stocks
    for (const item of quote.items) {
      if (item.product_id) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return NextResponse.json(
            { error: `Produit ${item.product_name} non trouvé` },
            { status: 404 }
          );
        }

        if (product.stock_quantity < item.quantity && !product.allow_backorders) {
          return NextResponse.json(
            { error: `Stock insuffisant pour ${item.product_name}` },
            { status: 400 }
          );
        }
      }
    }

    // Données supplémentaires de la requête
    const { 
      shipping_address, 
      billing_address, 
      payment_method = 'bank_transfer' 
    } = await request.json();

    // Créer la commande depuis le devis
    const orderData = {
      customer_id: quote.customer_id,
      customer_email: quote.customer_email,
      customer_name: quote.customer_name,
      customer_phone: quote.customer_phone,
      
      status: 'pending',
      source: 'quote' as const,
      quote_id: quote._id,
      
      items: quote.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.unit_price,
        total: item.total,
        customization: item.customization,
      })),
      
      subtotal: quote.subtotal,
      shipping_cost: quote.shipping_cost,
      tax_amount: quote.tax_amount,
      discount_amount: quote.discount_amount,
      total: quote.total,
      
      shipping_address: shipping_address || {
        full_name: quote.customer_name,
        street: '',
        city: '',
        postal_code: '',
        country: 'France',
      },
      billing_address: billing_address || {
        full_name: quote.customer_name,
        street: '',
        city: '',
        postal_code: '',
        country: 'France',
      },
      
      payment_status: 'pending',
      payment_method,
      
      sales_person: quote.sales_person,
      commission_rate: quote.commission_rate,
      
      notes: quote.notes,
      internal_notes: quote.internal_notes,
    };

    const order = await Order.create(orderData);

    // Mettre à jour les stocks
    for (const item of quote.items) {
      if (item.product_id) {
        await Product.findByIdAndUpdate(
          item.product_id,
          { $inc: { stock_quantity: -item.quantity } }
        );
      }
    }

    // Mettre à jour le devis
    quote.status = 'converted';
    quote.converted_to_order = order._id;
    quote.converted_at = new Date();
    await quote.save();

    return NextResponse.json({
      message: 'Devis converti en commande avec succès',
      order,
      quote,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la conversion du devis:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
