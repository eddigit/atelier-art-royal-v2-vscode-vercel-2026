import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import Lead from '@/models/Lead';
import Deal from '@/models/Deal';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats - Statistiques complètes
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // jours
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Stats e-commerce
    const [
      ordersStats,
      revenueBySource,
      topProducts,
      customerStats,
      leadStats,
      dealStats
    ] = await Promise.all([
      // Commandes
      Order.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
            revenue: { $sum: '$total_amount' },
            avgValue: { $avg: '$total_amount' }
          }
        }
      ]),
      
      // Revenus par source
      Order.aggregate([
        { $match: { created_at: { $gte: startDate }, status: { $in: ['processing', 'shipped', 'delivered'] } } },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 },
            revenue: { $sum: '$total_amount' }
          }
        }
      ]),
      
      // Top produits
      Order.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product_id',
            name: { $first: '$items.name' },
            quantity: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 }
      ]),
      
      // Stats clients
      User.aggregate([
        { $match: { role: 'customer', created_at: { $gte: startDate } } },
        { $group: { _id: null, new_customers: { $sum: 1 } } }
      ]),
      
      // Stats leads
      Lead.aggregate([
        { $match: { created_at: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Stats affaires
      Deal.aggregate([
        {
          $group: {
            _id: '$stage',
            count: { $sum: 1 },
            total_value: { $sum: '$estimated_value' },
            weighted_value: { $sum: { $multiply: ['$estimated_value', { $divide: ['$probability', 100] }] } }
          }
        }
      ])
    ]);

    return NextResponse.json({
      period: parseInt(period),
      ecommerce: {
        orders: ordersStats[0] || { total: 0, completed: 0, revenue: 0, avgValue: 0 },
        revenueBySource: revenueBySource.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat;
          return acc;
        }, {}),
        topProducts,
      },
      customers: customerStats[0] || { new_customers: 0 },
      leads: {
        byStatus: leadStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
      },
      deals: {
        byStage: dealStats.reduce((acc: any, stat: any) => {
          acc[stat._id] = stat;
          return acc;
        }, {}),
      },
    });
  } catch (error: any) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
