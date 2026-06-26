import React, { useEffect, useState } from 'react'
import { ApartmentOutlined, HomeOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router';

const { Header, Footer, Sider, Content } = Layout;

export function AppLayout() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const items2: MenuProps['items'] = [
    {key: '1', icon: <HomeOutlined />, label: 'Home', onClick: () => navigate("/")},
    {key: '2', icon: <ApartmentOutlined />, label: 'Project', onClick: () => navigate("/project")}
  ];

  useEffect(() => {
    navigate("/");
  }, []);
  
  return (
    <Layout style={{ height: "100%" }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
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
              style={{ height: '100%', padding: "16px 0" }}
              items={items2}
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
