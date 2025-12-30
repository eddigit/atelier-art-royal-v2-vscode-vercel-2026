import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Deal from '@/models/Deal';

// GET /api/admin/deals - Liste affaires (Kanban CRM)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const stage = searchParams.get('stage');
    const assigned_to = searchParams.get('assigned_to');
    const view = searchParams.get('view'); // 'kanban' or 'list'

    const query: any = {};
    if (stage) query.stage = stage;
    if (assigned_to) query.assigned_to = assigned_to;

    const deals = await Deal.find(query)
      .populate('assigned_to', 'name email')
      .populate('lead_id')
      .sort({ priority: -1, expected_close_date: 1 })
      .lean();

    // Stats pipeline
    const pipelineStats = await Deal.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          total_value: { $sum: '$estimated_value' },
          weighted_value: { $sum: { $multiply: ['$estimated_value', { $divide: ['$probability', 100] }] } }
        }
      }
    ]);

    // Organiser par colonnes Kanban
    const kanbanColumns = {
      lead: deals.filter(d => d.stage === 'lead'),
      qualification: deals.filter(d => d.stage === 'qualification'),
      proposal: deals.filter(d => d.stage === 'proposal'),
      negotiation: deals.filter(d => d.stage === 'negotiation'),
      closing: deals.filter(d => d.stage === 'closing'),
      won: deals.filter(d => d.stage === 'won'),
      lost: deals.filter(d => d.stage === 'lost'),
    };

    return NextResponse.json({
      deals: view === 'kanban' ? kanbanColumns : deals,
      stats: {
        byStage: pipelineStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat;
          return acc;
        }, {}),
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/deals error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/deals - Créer affaire
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const deal = await Deal.create(body);
    await deal.populate('assigned_to', 'name email');

    return NextResponse.json(deal, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/deals error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
