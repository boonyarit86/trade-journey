import React, { useEffect, useMemo, useState } from 'react';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { routePaths } from '../routes/config';
import AntIcon from '../shared/ui/Icon';
import type { ItemType } from 'antd/es/menu/interface';

const { Header, Footer, Sider, Content } = Layout;

export function AppLayout() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pathKey, setPathKey] = useState("1");

  const items2: MenuProps['items'] = useMemo(() => routePaths.map((r): ItemType => (
    {
      key: r.id,
      icon: <AntIcon icon={r.icon} />,
      label: r.label,
      onClick: () => {
        setPathKey(r.id);
        navigate(r.path);
      },
    }
  )), []);

  useEffect(() => {
    const currPathKey = routePaths.find((r) => r.path === location.pathname);
    if (currPathKey) setPathKey(currPathKey.id);

    navigate(location.pathname);
  }, []);
  
  return (
    <Layout style={{ height: "100%" }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["1"]}
          items={[]}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <div>
        <Layout>
          <Sider
            // collapsible 
            // collapsed={collapsed} 
            // onCollapse={(value) => setCollapsed(value)} 
            width={200}
          >
            <Menu
              mode="inline"
              theme="dark"
              defaultSelectedKeys={['1']}
              defaultOpenKeys={['sub1']}
              items={items2}
              selectedKeys={[pathKey]}
              style={{ height: '100%', padding: "16px 0" }}
            />
          </Sider>
          <Content style={{ padding: 24, minHeight: "calc(100vh - 64px)" }}>
            <Outlet />
          </Content>
        </Layout>
      </div>
      {/* <Footer style={{ textAlign: 'center' }}>Ant Design ©{currentYear} Created by Ant UED</Footer> */}
    </Layout>
  )
}
