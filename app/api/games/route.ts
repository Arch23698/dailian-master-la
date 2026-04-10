import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json({ error: '获取游戏列表失败' }, { status: 500 });
  }
}
