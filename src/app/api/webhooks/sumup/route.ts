import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

// Webhook SumUp pour les notifications de paiement
// Documentation: https://developer.sumup.com/docs/online-payments/webhooks/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('SumUp Webhook received:', JSON.stringify(body, null, 2));
    
    const {
      id,
      checkout_reference,
      status,
      amount,
      currency,
      transaction_id,
      transaction_code,
      merchant_code,
      event_type,
    } = body;
    
    // Validation basique
    if (!checkout_reference) {
      console.error('Missing checkout_reference in webhook');
      return NextResponse.json({ error: 'Missing checkout_reference' }, { status: 400 });
    }
    
    await connectDB();
    
    // Trouver la commande par le numéro de commande (checkout_reference)
    const order = await Order.findOne({ order_number: checkout_reference });
    
    if (!order) {
      console.error(`Order not found for reference: ${checkout_reference}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Mapper le statut SumUp vers notre statut de paiement
    let paymentStatus = order.payment_status;
    let orderStatus = order.status;
    
    switch (status) {
      case 'PAID':
      case 'SUCCESSFUL':
        paymentStatus = 'paid';
        // Passer la commande en préparation si elle était en attente
        if (orderStatus === 'pending') {
          orderStatus = 'design'; // Première étape de production
        }
        break;
      case 'FAILED':
      case 'CANCELLED':
        paymentStatus = 'failed';
        break;
      case 'PENDING':
        paymentStatus = 'pending';
        break;
      default:
        console.log(`Unknown SumUp status: ${status}`);
    }
    
    // Mettre à jour la commande
    await Order.findByIdAndUpdate(order._id, {
      payment_status: paymentStatus,
      status: orderStatus,
      payment_intent_id: id || order.payment_intent_id,
      $push: {
        internal_notes: `[${new Date().toISOString()}] SumUp Webhook: status=${status}, transaction_id=${transaction_id || 'N/A'}`,
      },
    });
    
    console.log(`Order ${checkout_reference} updated: payment_status=${paymentStatus}, status=${orderStatus}`);
    
    // TODO: Envoyer un email de confirmation au client si paiement réussi
    // TODO: Envoyer une notification à l'admin
    
    return NextResponse.json({ 
      success: true,
      order_number: checkout_reference,
      payment_status: paymentStatus,
    });
  } catch (error) {
    console.error('SumUp Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

// GET: Pour vérifier que le webhook est accessible
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'SumUp webhook endpoint active',
    timestamp: new Date().toISOString(),
  });
}
