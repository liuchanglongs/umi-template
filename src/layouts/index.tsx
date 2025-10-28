/**
 * @Author: 刘昌隆
 * @Date: 2024/5/15
 */
import { Link, Outlet } from "umi";
import "./index.less";
import { useEffect, useState } from "react";
import { Button } from "antd";

export default function Layout() {
  return <Outlet />;
}
