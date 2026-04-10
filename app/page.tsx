import Image from "next/image";
import Link from "next/link";

export default function Home() {
  // 模拟轮播图数据
  const carouselItems = [
    { id: 1, image: "/banner1.jpg", title: "专业代练平台", desc: "安全可靠，快速上分" },
    { id: 2, image: "/banner2.jpg", title: "全网最低价", desc: "高品质服务，价格透明" },
    { id: 3, image: "/banner3.jpg", title: "24小时客服", desc: "随时为您解决疑问" },
  ];

  // 模拟游戏分类数据
  const gameCategories = [
    { id: 1, name: "王者荣耀", icon: "🎮", count: 123 },
    { id: 2, name: "和平精英", icon: "🔫", count: 89 },
    { id: 3, name: "原神", icon: "🌍", count: 67 },
    { id: 4, name: "英雄联盟", icon: "⚔️", count: 156 },
    { id: 5, name: "永劫无间", icon: "🗡️", count: 45 },
    { id: 6, name: "CS2", icon: "🎯", count: 78 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">代</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">代练妈妈</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* 轮播图 */}
      <section className="px-4 py-4">
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="absolute inset-0 flex items-center justify-center text-white p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">专业游戏代练平台</h2>
              <p className="opacity-90">安全、高效、信誉保障</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {carouselItems.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-white' : 'bg-white/50'}`}></div>
            ))}
          </div>
        </div>
      </section>

      {/* 快捷功能 */}
      <section className="px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <Link href="/orders" className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">📝</span>
            </div>
            <span className="text-sm font-medium">订单大厅</span>
          </Link>
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🚀</span>
            </div>
            <span className="text-sm font-medium">发布订单</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <span className="text-sm font-medium">我的钱包</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">👤</span>
            </div>
            <span className="text-sm font-medium">个人中心</span>
          </div>
        </div>
      </section>

      {/* 游戏分类 */}
      <section className="px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">热门游戏</h3>
          <Link href="/games" className="text-blue-600 text-sm">查看全部 &gt;</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {gameCategories.map((game) => (
            <div key={game.id} className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center">
              <div className="text-3xl mb-2">{game.icon}</div>
              <span className="font-medium text-gray-800">{game.name}</span>
              <span className="text-xs text-gray-500 mt-1">{game.count}个订单</span>
            </div>
          ))}
        </div>
      </section>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-3 grid grid-cols-5">
          <Link href="/" className="flex flex-col items-center text-blue-600">
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">首页</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center text-gray-500">
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