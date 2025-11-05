import React, { useState } from "react";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { Outlet, useNavigate } from "umi";
import store from "../reactRedux";
import { Provider } from "react-redux";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("VideoJS", "/videojs", <PieChartOutlined />),
  getItem("语音播放", "/yuying", <DesktopOutlined />),
  getItem("代码编辑器react-ace", "/react-ace", <DesktopOutlined />),
  getItem("视频帧预览", "/video-frame-preview", <DesktopOutlined />),
  getItem("标签页通信", "/cross-tab-communication", <DesktopOutlined />),
  getItem(
    "requestAnimationFrame",
    "/requestAnimationFrame",
    <DesktopOutlined />
  ),

  //   getItem("代码编辑器react-ace", "/react-ace", <UserOutlined />, [
  //     getItem("Tom", "3"),
  //     getItem("Bill", "4"),
  //     getItem("Alex", "5"),
  //   ]),
  getItem("Team", "sub2", <TeamOutlined />, [
    getItem("Team 1", "6"),
    getItem("Team 2", "8"),
  ]),
  getItem("Files", "9", <FileOutlined />),
];

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          //   defaultSelectedKeys={["1"]}
          mode="inline"
          onClick={({ key }) => {
            navigate(key);
          }}
          items={items}
        />
      </Sider>
      <Layout>
        {/* <Header style={{ padding: 0, background: colorBgContainer }} /> */}
        <Content>
          {/* <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[{ title: "User" }, { title: "Bill" }]}
          /> */}
          <div
            style={{
              boxSizing: "border-box",
              padding: 8,
              //   minHeight: 360,
              height: "100%",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Provider store={store}>
              <Outlet />
            </Provider>
          </div>
        </Content>
        {/* <Footer style={{ textAlign: "center" }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer> */}
      </Layout>
    </Layout>
  );
};

export default App;
