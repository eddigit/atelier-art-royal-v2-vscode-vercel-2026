import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import User from '@/models/User';

// GET /api/admin/leads - Liste des leads avec filtres
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
    const source = searchParams.get('source');
    const assigned_to = searchParams.get('assigned_to');
    const search = searchParams.get('search');

    const query: any = {};

    if (status) query.status = status;
    if (source) query.source = source;
    if (assigned_to) query.assigned_to = assigned_to;
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate('assigned_to', 'name email')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);

    // Stats par statut
    const statusStats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: statusStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/leads error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/leads - Créer un lead
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      obedience,
      rite,
      degree,
      source,
      status,
      interest,
      estimated_value,
      notes,
      assigned_to,
      next_follow_up,
      tags,
    } = body;

    // Validation
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'Prénom, nom et email requis' },
        { status: 400 }
      );
    }

    // Vérifier si le lead existe déjà
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return NextResponse.json(
        { error: 'Un lead avec cet email existe déjà' },
        { status: 400 }
      );
    }

    const lead = await Lead.create({
      first_name,
      last_name,
      email,
      phone,
      company,
      obedience,
      rite,
      degree,
      source: source || 'website',
      status: status || 'new',
      interest,
      estimated_value,
      notes,
      assigned_to,
      next_follow_up,
      tags,
      last_contact: new Date(),
    });

    await lead.populate('assigned_to', 'name email');

    return NextResponse.json(lead, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/leads error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
