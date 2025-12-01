import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  Radio,
  Space,
  Switch,
  Card,
  Typography,
  Divider,
} from "antd";

const { Title, Text, Paragraph } = Typography;

/**
 * Demo 说明：
 * - 通过在 document 上注册全局事件（模拟画布的全局交互拦截），
 *   在捕获阶段对 "点击标签" 的默认行为进行 preventDefault，从而复现：
 *   文字标签不可点击，但圆点（input）可点击的现象。
 * - 提供“开启修复”开关，在弹窗内容容器使用 Capture 阶段的 stopPropagation，
 *   阻断事件上行到 document 的全局监听，从而恢复标签点击。
 */
const LabelClickModalBugDemo: React.FC = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [value, setValue] = useState<string>("A");
  const [intercept, setIntercept] = useState<boolean>(true);

  return (
    <div
      style={{ padding: 24 }}
      onClick={(e) => {
        console.log(e);
        if (intercept) {
          e.preventDefault();
        }
        console.log("div");
      }}
    >
      <Title level={3}>Modal 中 Radio 标签点击 bug 演示</Title>
      <Paragraph>
        这个 Demo 模拟“画布”在全局捕获 click 事件并取消默认行为，导致{" "}
        <Text code>label</Text> 的联动失效：
        点击文字无法选择，但点击圆点（input）可以选择。
      </Paragraph>

      <Card style={{ marginBottom: 16 }}>
        <Space size={16} wrap>
          <Space>
            <Text strong>画布全局拦截（复现 bug）：</Text>
            <Switch checked={intercept} onChange={setIntercept} />
          </Space>

          <Button type="primary" onClick={() => setOpen(true)}>
            打开弹窗
          </Button>
        </Space>
        <Divider />
        <Paragraph type="secondary">
          说明：当“拦截”开启时，点击文字会被取消默认行为，不会触发关联 input；
          开启“边界修复”后，在弹窗内容上截断事件传播，文字点击即可恢复。
        </Paragraph>
      </Card>

      <Card title="模拟画布区域" style={{ height: 320 }}>
        <svg
          width="100%"
          height="100%"
          style={{ background: "#fafafa", border: "1px dashed #ddd" }}
        >
          <g>
            <text x={20} y={40} style={{ userSelect: "none" }}>
              这里是画布（Canvas），用于展示事件日志。打开控制台查看 [canvas]
              打印。
            </text>
            <rect
              x={20}
              y={60}
              width={120}
              height={60}
              fill="#d6e4ff"
              stroke="#adc6ff"
            />
            <rect
              x={180}
              y={60}
              width={120}
              height={60}
              fill="#fff1f0"
              stroke="#ffa39e"
            />
            <rect
              x={340}
              y={60}
              width={120}
              height={60}
              fill="#f6ffed"
              stroke="#b7eb8f"
            />
          </g>
        </svg>
      </Card>

      <Modal
        open={open}
        title="演示弹窗（Portal 到 body）"
        onCancel={() => setOpen(false)}
        footer={null}
        maskClosable={false}
      >
        {/* 在弹窗内容处加捕获阶段的 stopPropagation，隔离到 document 的全局监听 */}
        <div
          onClick={(e) => {
            if (!intercept) {
              e.stopPropagation();
            }
          }}
        >
          <Space direction="vertical" size={12}>
            <Text>请尝试点击“文字”与“圆点”，观察是否能选中：</Text>
            <Radio.Group
              value={value}
              onChange={(e) => setValue(e.target.value)}
            >
              <Space direction="vertical">
                <Radio value="A">选项 A（点击文字）</Radio>
                <Radio value="B">选项 B（点击文字）</Radio>
                <Radio value="C">选项 C（点击文字）</Radio>
              </Space>
            </Radio.Group>
            <Text type="secondary">当前选择：{value}</Text>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default LabelClickModalBugDemo;
