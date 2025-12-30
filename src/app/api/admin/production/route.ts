import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Production from '@/models/Production';
import Order from '@/models/Order';

// GET /api/admin/production - Liste production
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const [productions, total] = await Promise.all([
      Production.find(query)
        .populate('order_id')
        .sort({ priority: -1, due_date: 1, created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Production.countDocuments(query),
    ]);

    const statusStats = await Production.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      productions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        byStatus: statusStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/production error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

// POST /api/admin/production - Créer ordre de production
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const production = await Production.create(body);
    await production.populate('order_id');

    return NextResponse.json(production, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/production error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
