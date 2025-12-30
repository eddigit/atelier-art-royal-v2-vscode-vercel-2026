import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import dbConnect from '@/lib/mongodb';
import ChatSettings from '@/models/ChatSettings';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages requis' }, { status: 400 });
    }

    // Récupérer les instructions système depuis MongoDB
    await dbConnect();
    const settings = await ChatSettings.findOne({ key: 'commercial_assistant', is_active: true });
    
    if (!settings) {
      return NextResponse.json({ error: 'Configuration IA non disponible' }, { status: 503 });
    }

    // Préparer les messages avec les instructions système
    const systemMessage = {
      role: 'system',
      content: settings.instructions
    };

    const chatMessages = [systemMessage, ...messages];

    // Appel à l'API Groq
    const completion = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',
      messages: chatMessages as any,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false
    });

    const response = completion.choices[0]?.message?.content || '';

    return NextResponse.json({
      response,
      model: 'mixtral-8x7b-32768',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Erreur Groq API:', error);
    
    // Gestion des erreurs spécifiques
    if (error.status === 401) {
      return NextResponse.json({ error: 'Clé API Groq invalide' }, { status: 500 });
    }
    
    if (error.status === 429) {
      return NextResponse.json({ error: 'Limite de requêtes atteinte, réessayez plus tard' }, { status: 429 });
    }

    return NextResponse.json({ 
      error: 'Erreur lors de la communication avec l\'IA',
      details: error.message 
    }, { status: 500 });
  }
}

// OPTIONS pour CORS (si nécessaire)
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
