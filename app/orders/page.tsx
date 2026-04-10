"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// API基础URL - 改为相对路径
const API_BASE_URL = '/api';  // ← 原来是 'http://localhost:3001/api'


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
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  useEffect(() => {
    fetchOrders();
  }, [selectedGame, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/orders`;
      const params = new URLSearchParams();
      if (selectedGame !== "all") {
        params.append("gameId", selectedGame);
      }
      params.append("sortBy", sortBy);
      params.append("order", "desc");

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("获取订单失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 游戏分类 - 根据数据库中的游戏
  const gameFilters = [
    { id: "all", name: "全部游戏" },
    { id: "1", name: "王者荣耀" },
    { id: "2", name: "和平精英" },
    { id: "3", name: "金铲铲" },
  ];

  const getRankColor = (rank: string) => {
    if (rank.includes("王者")) return "text-red-600";
    if (rank.includes("星耀")) return "text-purple-600";
    if (rank.includes("钻石")) return "text-blue-600";
    if (rank.includes("铂金")) return "text-green-600";
    if (rank.includes("黄金")) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">订单大厅</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 筛选栏 */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {gameFilters.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedGame === game.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-sm text-gray-600">
            共 <span className="font-bold">{orders.length}</span> 个订单
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border rounded-lg text-sm"
          >
            <option value="createdAt">最新发布</option>
            <option value="price">价格最低</option>
          </select>
        </div>
      </div>

      {/* 订单列表 */}
      <main className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">暂无订单</h3>
            <p className="text-gray-500">暂时没有可接取的订单</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{order.game.icon || "🎮"}</span>
                      <span className="font-bold text-gray-800">{order.game.name}</span>
                      <span className="text-sm text-gray-500">{order.region}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      订单号: {order.orderNumber}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {order.status === "PENDING" ? "待接单" : "进行中"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">当前段位</div>
                    <div className={`font-bold ${getRankColor(order.currentRank)}`}>
                      {order.currentRank}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">目标段位</div>
                    <div className={`font-bold ${getRankColor(order.targetRank)}`}>
                      {order.targetRank}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-1">代练要求</div>
                  <div className="text-gray-800 line-clamp-2">{order.requirements}</div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      ¥{order.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      保证金: 400¥{order.securityDeposit}
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                    立即抢单
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-3 grid grid-cols-5">
          <Link href="/" className="flex flex-col items-center text-gray-500">
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">首页</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center text-blue-600">
            <span className="text-2xl">📋</span>
            <span className="text-xs mt-1">订单</span>
          </Link>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-full -mt-6 flex items-center justify-center shadow-lg">
              <span className="text-2xl text-white">+</span>
            </div>
            <span className="text-xs mt-1 text-gray-500">发布</span>
          </div>
          <div className="flex flex-col items-center text-gray-500">
            <span className="text-2xl">💬</span>
            <span className="text-xs mt-1">消息</span>
          </div>
          <div className="flex flex-col items-center text-gray-500">
            <span className="text-2xl">👤</span>
            <span className="text-xs mt-1">我的</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
