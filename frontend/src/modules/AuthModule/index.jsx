import useLanguage from '@/locale/useLanguage';

import { Layout, Col, Divider, Typography } from 'antd';

import AuthLayout from '@/layout/AuthLayout';
import SideContent from './SideContent';
import SelectLanguage from '@/components/SelectLanguage';

import logo from '@/style/images/logo.png';

const { Content } = Layout;
const { Title } = Typography;

const AuthModule = ({ authContent, AUTH_TITLE }) => {
  const translate = useLanguage();

  return (
    <AuthLayout sideContent={<SideContent />}>
      <Content
        style={{
          padding: '10px 20px',
        }}
      >
        <SelectLanguage />
      </Content>
      <Content
        style={{
          padding: '80px 30px 30px',
          maxWidth: '440px',
          margin: '0 auto',
        }}
      >
        <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 0 }} span={0}>
           <img
            src={logo}
            alt="Logo"
            style={{
              margin: '-80px 200px -20px -20px',
              display: 'flex',
              width: "350px",
            }}
          />
          <div className="space10" />
        </Col>
        <Title level={1}>{translate(AUTH_TITLE)}</Title>

        <Divider />
        <div className="site-layout-content">{authContent}</div>
      </Content>
    </AuthLayout>
  );
};

export default AuthModule;
