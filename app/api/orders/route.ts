import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// 直接定义枚举，避免导入问题
const OrderStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

const Role = {
  POSTER: 'POSTER',
  ACCEPTER: 'ACCEPTER',
  BOTH: 'BOTH'
} as const

type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus]
type RoleType = typeof Role[keyof typeof Role]

// GET /api/orders - 获取订单大厅列表或单个订单
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    const gameId = searchParams.get('gameId')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // 如果提供了orderId，返回单个订单（包装在数组中保持兼容性）
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: {
          game: true,
          poster: {
            select: {
              id: true,
              phone: true
            }
          },
          accepter: {
            select: {
              id: true,
              phone: true
            }
          }
        }
      })

      if (!order) {
        return NextResponse.json(
          { success: false, message: '订单不存在' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: [order] // 包装在数组中保持前端兼容性
      })
    }

    // 否则返回订单列表
    // 构建查询条件
    const where: any = {
      status: OrderStatus.PENDING // 只显示待接单订单
    }

    if (gameId) {
      where.gameId = parseInt(gameId)
    }

    // 构建排序条件
    const orderBy: any = {}
    if (sortBy === 'price') {
      orderBy.price = order
    } else {
      orderBy.createdAt = order
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        game: true,
        poster: {
          select: {
            id: true,
            phone: true
          }
        }
      },
      orderBy
    })

    return NextResponse.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('获取订单失败:', error)
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `获取订单失败: ${error instanceof Error ? error.message : String(error)}`
      : '获取订单失败'
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/orders - 发布新订单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必要字段
    const requiredFields = ['gameId', 'region', 'currentRank', 'targetRank', 'requirements', 'price', 'securityDeposit', 'posterId']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `缺少必要字段: ${field}` },
          { status: 400 }
        )
      }
    }

    // 检查发布者是否存在且有足够余额
    const poster = await prisma.user.findUnique({
      where: { id: body.posterId }
    })

    if (!poster) {
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      )
    }

    // 检查用户角色
    if (poster.role !== Role.POSTER && poster.role !== Role.BOTH) {
      return NextResponse.json(
        { success: false, message: '用户没有发布订单的权限' },
        { status: 403 }
      )
    }

    // 生成订单号
    const orderNumber = `DL${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNumber,
        gameId: parseInt(body.gameId),
        region: body.region,
        currentRank: body.currentRank,
        targetRank: body.targetRank,
        requirements: body.requirements,
        price: parseFloat(body.price),
        securityDeposit: parseFloat(body.securityDeposit),
        posterId: body.posterId,
        status: OrderStatus.PENDING
      },
      include: {
        game: true
      }
    })

    return NextResponse.json({
      success: true,
      data: order,
      message: '订单发布成功'
    }, { status: 201 })
  } catch (error) {
    console.error('发布订单失败:', error)
    return NextResponse.json(
      { success: false, message: '发布订单失败' },
      { status: 500 }
    )
  }
}