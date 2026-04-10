import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/games - 获取游戏列表
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: games
    })
  } catch (error) {
    console.error('获取游戏列表失败:', error)
    return NextResponse.json(
      { success: false, message: '获取游戏列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/games - 创建游戏（管理用）
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: '游戏名称不能为空' },
        { status: 400 }
      )
    }

    const game = await prisma.game.create({
      data: {
        name: body.name,
        icon: body.icon,
        description: body.description
      }
    })

    return NextResponse.json({
      success: true,
      data: game,
      message: '游戏创建成功'
    }, { status: 201 })
  } catch (error) {
    console.error('创建游戏失败:', error)
    return NextResponse.json(
      { success: false, message: '创建游戏失败' },
      { status: 500 }
    )
  }
}