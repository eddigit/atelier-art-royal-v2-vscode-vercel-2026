import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import CartItem from '@/models/CartItem';
import Product from '@/models/Product';

const SUMUP_API_KEY = process.env.SUMUP_API_KEY;
const SUMUP_MERCHANT_CODE = process.env.SUMUP_MERCHANT_CODE;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://artroyal.fr';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const {
      customerEmail,
      customerName,
      shippingAddress,
      billingAddress,
      cartItems,
    } = await request.json();

    // Validation
    if (!customerEmail || !customerName || !shippingAddress) {
      return NextResponse.json(
        { error: 'Informations client requises' },
        { status: 400 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Panier vide' },
        { status: 400 }
      );
    }

    // Vérifier les produits et calculer le total
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produit ${item.productId} non trouvé` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product._id,
        product_name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        customization: item.customization,
      });
    }

    // Calcul frais de port (gratuit au-dessus de 500€)
    const shippingCost = subtotal >= 500 ? 0 : 15;
    const total = subtotal + shippingCost;

    // Créer la commande en attente
    const order = await Order.create({
      customer_email: customerEmail,
      customer_name: customerName,
      status: 'pending',
      items: orderItems,
      subtotal,
      shipping_cost: shippingCost,
      total,
      shipping_address: {
        full_name: shippingAddress.fullName,
        street: shippingAddress.street,
        city: shippingAddress.city,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country || 'France',
        phone: shippingAddress.phone,
      },
      billing_address: billingAddress ? {
        full_name: billingAddress.fullName,
        street: billingAddress.street,
        city: billingAddress.city,
        postal_code: billingAddress.postalCode,
        country: billingAddress.country || 'France',
        phone: billingAddress.phone,
      } : {
        full_name: shippingAddress.fullName,
        street: shippingAddress.street,
        city: shippingAddress.city,
        postal_code: shippingAddress.postalCode,
        country: shippingAddress.country || 'France',
        phone: shippingAddress.phone,
      },
      payment_status: 'pending',
      payment_method: 'card',
      sales_channel: 'website',
    });

    // Créer le checkout SumUp
    const checkoutResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUMUP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkout_reference: order.order_number,
        amount: total,
        currency: 'EUR',
        merchant_code: SUMUP_MERCHANT_CODE,
        description: `Commande ${order.order_number} - Atelier Art Royal`,
        return_url: `${APP_URL}/order-confirmation?order=${order._id}`,
        hosted_checkout: {
          enabled: true,
        },
      }),
    });

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error('SumUp error:', errorData);
      
      // Supprimer la commande si erreur
      await Order.findByIdAndDelete(order._id);
      
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement' },
        { status: 500 }
      );
    }

    const checkoutData = await checkoutResponse.json();

    // Mettre à jour la commande avec l'ID SumUp
    await Order.findByIdAndUpdate(order._id, {
      payment_intent_id: checkoutData.id,
    });

    return NextResponse.json({
      orderId: order._id,
      orderNumber: order.order_number,
      checkoutUrl: checkoutData.hosted_checkout_url,
      total,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}
