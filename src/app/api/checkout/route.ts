import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import CartItem from '@/models/CartItem';
import Product from '@/models/Product';
import User from '@/models/User';

const SUMUP_API_KEY = process.env.SUMUP_API_KEY;
const SUMUP_MERCHANT_CODE = process.env.SUMUP_MERCHANT_CODE;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://artroyal.fr';

// Frais de port
const SHIPPING_COST = 6.90;
const FREE_SHIPPING_THRESHOLD = 100;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    // Support ancien et nouveau format
    const customerEmail = body.customer_email || body.customerEmail;
    const customerName = body.customer_name || body.customerName;
    const customerPhone = body.customer_phone || body.customerPhone;
    const shippingAddress = body.shipping_address || body.shippingAddress;
    const billingAddress = body.billing_address || body.billingAddress;
    const notes = body.notes;
    const paymentMethod = body.payment_method || 'phone_validation';

    // Validation
    if (!customerEmail || !customerName || !shippingAddress) {
      return NextResponse.json(
        { error: 'Informations client requises' },
        { status: 400 }
      );
    }

    // Récupérer le panier
    let cartItems = body.cartItems || body.cart_items;
    
    // Si pas de panier dans le body, récupérer depuis la BDD (utilisateur connecté)
    if (!cartItems || cartItems.length === 0) {
      if (session?.user?.email) {
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          const dbCartItems = await CartItem.find({ user_id: user._id }).populate('product_id');
          cartItems = dbCartItems.map(item => ({
            productId: item.product_id._id,
            quantity: item.quantity,
          }));
        }
      }
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
      const productId = item.productId || item.product_id;
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: `Produit ${productId} non trouvé` },
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

    // Calcul frais de port
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shippingCost;

    // Trouver l'utilisateur si connecté
    let customerId = null;
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        customerId = user._id;
        
        // Mettre à jour les statistiques utilisateur
        await User.findByIdAndUpdate(user._id, {
          $inc: { total_orders: 1, total_spent: total },
          last_order_date: new Date(),
        });
      }
    }

    // Formater l'adresse de livraison
    const formattedShippingAddress = {
      full_name: shippingAddress.full_name || shippingAddress.fullName || customerName,
      street: shippingAddress.street,
      city: shippingAddress.city,
      postal_code: shippingAddress.postal_code || shippingAddress.postalCode,
      country: shippingAddress.country || 'France',
      phone: shippingAddress.phone || customerPhone,
    };

    // Formater l'adresse de facturation
    const formattedBillingAddress = billingAddress ? {
      full_name: billingAddress.full_name || billingAddress.fullName || customerName,
      street: billingAddress.street,
      city: billingAddress.city,
      postal_code: billingAddress.postal_code || billingAddress.postalCode,
      country: billingAddress.country || 'France',
      phone: billingAddress.phone || customerPhone,
    } : formattedShippingAddress;

    // Créer la commande
    const order = await Order.create({
      customer_id: customerId,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      status: 'pending',
      items: orderItems,
      subtotal,
      shipping_cost: shippingCost,
      tax_amount: 0,
      discount_amount: 0,
      total,
      shipping_address: formattedShippingAddress,
      billing_address: formattedBillingAddress,
      payment_status: 'pending',
      payment_method: paymentMethod,
      source: 'web',
      notes: notes,
    });

    // Si paiement par validation téléphonique, pas besoin de SumUp
    if (paymentMethod === 'phone_validation') {
      // Vider le panier de l'utilisateur
      if (session?.user?.email) {
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          await CartItem.deleteMany({ user_id: user._id });
        }
      }

      return NextResponse.json({
        success: true,
        order_id: order._id,
        order_number: order.order_number,
        total,
        message: 'Commande créée avec succès. Vous serez contacté pour la validation.',
      });
    }

    // Sinon, créer le checkout SumUp
    if (!SUMUP_API_KEY || !SUMUP_MERCHANT_CODE) {
      // Si SumUp non configuré, basculer sur validation téléphonique
      if (session?.user?.email) {
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          await CartItem.deleteMany({ user_id: user._id });
        }
      }

      return NextResponse.json({
        success: true,
        order_id: order._id,
        order_number: order.order_number,
        total,
        message: 'Commande créée. Paiement par validation téléphonique.',
      });
    }

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
      
      // En cas d'erreur SumUp, on garde la commande en validation téléphonique
      await Order.findByIdAndUpdate(order._id, {
        payment_method: 'phone_validation',
      });
      
      if (session?.user?.email) {
        const user = await User.findOne({ email: session.user.email });
        if (user) {
          await CartItem.deleteMany({ user_id: user._id });
        }
      }

      return NextResponse.json({
        success: true,
        order_id: order._id,
        order_number: order.order_number,
        total,
        message: 'Commande créée. Paiement par validation téléphonique.',
      });
    }

    const checkoutData = await checkoutResponse.json();

    // Mettre à jour la commande avec l'ID SumUp
    await Order.findByIdAndUpdate(order._id, {
      payment_intent_id: checkoutData.id,
    });

    // Vider le panier
    if (session?.user?.email) {
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        await CartItem.deleteMany({ user_id: user._id });
      }
    }

    return NextResponse.json({
      success: true,
      order_id: order._id,
      order_number: order.order_number,
      checkout_url: checkoutData.hosted_checkout_url,
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
