import { useState, useEffect, useRef } from "react";

// 长列表组件：使用 requestAnimationFrame 分帧渲染
const OptimizedLongList = ({ totalItems = 1000 }) => {
  // 存储已渲染的列表项
  const [renderedItems, setRenderedItems] = useState<any[]>([]);
  if (renderedItems.length === totalItems) {
    console.log("renderedItems", renderedItems);
  }

  // 记录当前渲染到的索引（避免重复渲染）
  const currentIndexRef = useRef(0);

  // 存储 requestAnimationFrame 的 ID（用于组件卸载时取消）
  const animationRef = useRef<any>(null);

  // 生成模拟数据（实际项目中可替换为接口数据）
  const generateItem = (index: number) => ({
    id: index,
    content: `列表项 ${index + 1} - 这是一条模拟数据，用于测试长列表渲染优化`,
  });

  // 分帧渲染函数：每帧渲染 20 条
  const renderInFrames = () => {
    // 每帧最多渲染 20 条，避免单次操作过多
    const batchSize = 20;
    let newItems = [];
    let count = 0;

    // 循环渲染，直到达到批次上限或所有数据渲染完成
    while (currentIndexRef.current < totalItems && count < batchSize) {
      // 生成当前项数据
      newItems.push(generateItem(currentIndexRef.current));
      currentIndexRef.current++;
      count++;
    }

    // 更新已渲染列表（合并新渲染的项）
    setRenderedItems((prev) => [...prev, ...newItems]);

    // 如果还有未渲染的项，继续请求下一帧渲染
    if (currentIndexRef.current < totalItems) {
      animationRef.current = requestAnimationFrame(renderInFrames);
    }
  };

  // 初始加载：组件挂载时开始分帧渲染
  useEffect(() => {
    // 第一帧开始渲染
    animationRef.current = requestAnimationFrame(renderInFrames);

    // 组件卸载时取消未完成的动画帧，避免内存泄漏
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [totalItems]);

  return (
    <div className="long-list">
      <h3>优化后的长列表（共 {totalItems} 条）</h3>
      <div className="list-container">
        {renderedItems.map((item) => (
          <div key={item.id} className="list-item">
            {item.content}
          </div>
        ))}
      </div>
      {/* 显示加载状态 */}
      {currentIndexRef.current < totalItems && (
        <div className="loading">
          加载中...已加载 {currentIndexRef.current}/{totalItems}
        </div>
      )}
    </div>
  );
};

export default OptimizedLongList;
