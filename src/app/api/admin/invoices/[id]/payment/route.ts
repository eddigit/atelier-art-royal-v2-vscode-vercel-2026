import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/admin/invoices/[id]/payment - Ajouter un paiement à une facture
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

    const { amount, method, reference, notes } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      );
    }

    if (!['card', 'bank_transfer', 'cash', 'check'].includes(method)) {
      return NextResponse.json(
        { error: 'Méthode de paiement invalide' },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(params.id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Facture non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que le paiement ne dépasse pas le montant dû
    if (amount > invoice.amount_due) {
      return NextResponse.json(
        { error: 'Le montant du paiement dépasse le montant dû' },
        { status: 400 }
      );
    }

    // Ajouter le paiement
    invoice.payments.push({
      date: new Date(),
      amount,
      method,
      reference,
      notes,
    } as any);

    // Mettre à jour les montants
    invoice.amount_paid += amount;
    invoice.amount_due -= amount;

    // Mettre à jour le statut
    if (invoice.amount_due === 0) {
      invoice.status = 'paid';
      invoice.paid_at = new Date();
    } else if (invoice.amount_paid > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    return NextResponse.json({
      message: 'Paiement enregistré avec succès',
      invoice,
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du paiement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
