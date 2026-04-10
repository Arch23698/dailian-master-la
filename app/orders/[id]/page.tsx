"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// API基础URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Order {
  id: number;
  orderNumber: string;
  gameId: number;
  region: string;
  currentRank: string;
  targetRank: string;
  requirements: string;
  price: number;
  securityDeposit: number;
  status: string;
  posterId: number;
  accepterId: number | null;
  createdAt: string;
  updatedAt: string;
  game: {
    id: number;
    name: string;
    icon: string | null;
    description: string | null;
  };
  poster: {
    id: number;
    phone: string;
  };
  accepter: {
    id: number;
    phone: string;
  } | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders?orderId=${orderId}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setOrder(data.data[0]);
      } else {
        setOrder(null);
      }
    } catch (error) {
      console.error("获取订单详情失败:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!order) return;

    try {
      setAccepting(true);
      setMessage(null);

      // 模拟用户ID，实际应用中应该从用户状态获取
      const accepterId = 2;

      const response = await fetch(`${API_BASE_URL}/orders/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          accepterId: accepterId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "接单成功！" });
        setOrder(data.data);
        // 2秒后跳转到订单列表
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      } else {
        setMessage({ type: "error", text: data.message || "接单失败" });
      }
    } catch (error) {
      console.error("接单失败:", error);
      setMessage({ type: "error", text: "网络错误，请重试" });
    } finally {
      setAccepting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "待接单";
      case "IN_PROGRESS": return "进行中";
      case "COMPLETED": return "已完成";
      case "CANCELLED": return "已取消";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-gray-100 text-gray-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRankColor = (rank: string) => {
    if (rank.includes("王者")) return "text-red-600";
    if (rank.includes("星耀")) return "text-purple-600";
    if (rank.includes("钻石")) return "text-blue-600";
    if (rank.includes("铂金")) return "text-green-600";
    if (rank.includes("黄金")) return "text-yellow-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">订单不存在</h3>
          <Link href="/orders" className="text-blue-600 hover:underline">
            返回订单大厅
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/orders" className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">订单详情</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
      </header>

      <main className="p-4">
        {/* 订单基本信息 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-3xl">{order.game.icon || "🎮"}</div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{order.game.name}</h2>
              <p className="text-gray-500">订单号: {order.orderNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500 mb-1">当前段位</div>
              <div className={`text-xl font-bold ${getRankColor(order.currentRank)}`}>
                {order.currentRank}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-500 mb-1">目标段位</div>
              <div className={`text-xl font-bold ${getRankColor(order.targetRank)}`}>
                {order.targetRank}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">游戏大区</div>
              <div className="font-medium">{order.region}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">发布时间</div>
              <div className="font-medium">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">发布者</div>
              <div className="font-medium">{order.poster.phone}</div>
            </div>
          </div>
        </div>

        {/* 代练要求 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">代练要求</h3>
          <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-line">
            {order.requirements}
          </div>
        </div>

        {/* 价格信息 */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">费用明细</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">代练价格</span>
              <span className="text-2xl font-bold text-orange-600">¥{order.price}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">安全保证金</span>
              <span className="text-lg font-bold">¥{order.securityDeposit}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold">接单需冻结</span>
                <span className="text-xl font-bold text-red-600">¥{order.securityDeposit}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                接单成功后，保证金将被冻结，订单完成后返还
              </p>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">注意事项</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              禁止使用外挂、脚本等违规工具
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              按时完成订单，逾期将扣除部分保证金
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              订单进行中不可单方面取消
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              完成订单后需提交截图或录像证明
            </li>
          </ul>
        </div>

        {/* 消息提示 */}
        {message && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg ${
            message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
            {message.text}
          </div>
        )}
      </main>

      {/* 悬浮抢单按钮 */}
      {order.status === "PENDING" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <button
            onClick={handleAcceptOrder}
            disabled={accepting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          >
            {accepting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                处理中...
              </span>
            ) : (
              "立即抢单"
            )}
          </button>
          <p className="text-center text-sm text-gray-500 mt-2">
            点击即表示同意平台协议
          </p>
        </div>
      )}
    </div>
  );
}