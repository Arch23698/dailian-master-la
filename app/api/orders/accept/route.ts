import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'  // ← 添加这一行！

// 直接定义枚举，避免导入问题
const OrderStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const
// ... 其余代码不变


const Role = {
  POSTER: 'POSTER',
  ACCEPTER: 'ACCEPTER',
  BOTH: 'BOTH'
} as const

type OrderStatusType = typeof OrderStatus[keyof typeof OrderStatus]
type RoleType = typeof Role[keyof typeof Role]

// POST /api/orders/accept - 接单
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证必要字段
    const requiredFields = ['orderId', 'accepterId']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, message: `缺少必要字段: ${field}` },
          { status: 400 }
        )
      }
    }

    const { orderId, accepterId } = body

    // 检查订单是否存在且状态为待接单
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        game: true,
        poster: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, message: '订单不存在' },
        { status: 404 }
      )
    }

    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json(
        { success: false, message: '订单已被接取或已完成' },
        { status: 400 }
      )
    }

    // 检查接单者是否存在
    const accepter = await prisma.user.findUnique({
      where: { id: accepterId }
    })

    if (!accepter) {
      return NextResponse.json(
        { success: false, message: '接单者不存在' },
        { status: 404 }
      )
    }

    // 检查用户角色
    if (accepter.role !== Role.ACCEPTER && accepter.role !== Role.BOTH) {
      return NextResponse.json(
        { success: false, message: '用户没有接单的权限' },
        { status: 403 }
      )
    }

    // 检查接单者是否有足够的保证金
    if (accepter.deposit < order.securityDeposit) {
      return NextResponse.json(
        {
          success: false,
          message: '保证金不足',
          requiredDeposit: order.securityDeposit,
          currentDeposit: accepter.deposit
        },
        { status: 400 }
      )
    }

    // 检查接单者是否是自己发布的订单
    if (order.posterId === accepterId) {
      return NextResponse.json(
        { success: false, message: '不能接取自己发布的订单' },
        { status: 400 }
      )
    }

    // 更新订单状态和接单者
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.IN_PROGRESS,
        accepterId: accepterId
      },
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

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: '接单成功'
    })
  } catch (error) {
    console.error('接单失败:', error)
    return NextResponse.json(
      { success: false, message: '接单失败' },
      { status: 500 }
    )
  }
}
