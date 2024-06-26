import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';
import { FaChartBar } from 'react-icons/fa';
import { useAppContext } from '@/context/appContext';

import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/logo-icon.png';
import logoText from '@/style/images/logo.png';
import { useNavigate } from 'react-router-dom';
import useResponsive from '@/hooks/useResponsive';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined,
  FileOutlined,
  ShopOutlined,
  FilterOutlined,
  WalletOutlined,
  MailOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { FaUserPlus } from 'react-icons/fa';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? <MobileSidebar /> : <Sidebar collapsible={false} />;
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const translate = useLanguage();
  const navigate = useNavigate();

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>{translate('dashboard')}</Link>,
    },
    {
      key: 'informes',
      icon: <FaChartBar />,
      label: <Link to={'/informes'}>Informes</Link>,
    },

    {
      key: 'customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to={'/customer'}>Clientes</Link>,
    },
    {
      key: 'company',
      icon: <ShopOutlined />,
      label: <Link to={'/company'}>Empresas</Link>,
    },

    // { key: 'order', icon: <ShopOutlined />, label: <Link to={'/'}>Lead</Link> Order },
    // { key: 'inventory', icon: <InboxOutlined />, label: <Link to={'/'}>Lead</Link> Inventory },

    {
      key: 'invoice',
      icon: <ContainerOutlined />,
      label: <Link to={'/invoice'}>{translate('facturas')}</Link>,
    },
    {
      key: 'quote',
      icon: <FileSyncOutlined />,
      label: <Link to={'/quote'}>{translate('Albaranes')}</Link>,
    },

    {
      key: 'pedidos',
      icon: <ShoppingCartOutlined />,
      label: <Link to={'/pedidos'}>{translate('Pedidos Web')}</Link>,
    },
    {
      key: 'leadsweb',
      icon: <FaUserPlus />,
      label: <Link to={'/leads-web'}>{translate('Leads Web')}</Link>,
    },
    {
      key: 'payment',
      icon: <CreditCardOutlined />,
      label: <Link to={'/payment'}>Pagos</Link>,
    },
    {
      key: 'expenses',
      icon: <WalletOutlined />,
      label: <Link to={'/expenses'}>{translate('expense')}</Link>,
    },
    {
      key: 'product',
      icon: <TagOutlined />,
      label: <Link to={'/product'}>{translate('productos')}</Link>,
    },
    {
      key: 'categoryproduct',
      icon: <TagsOutlined />,
      label: <Link to={'/category/product'}>{translate('product_category')}</Link>,
    },
    // {
    //   key: 'employee',
    //   icon: <UserOutlined />,
    //   label: <Link to={'/employee'}>{translate('employee')}</Link>,
    // },

    {
      label: translate('Settings'),
      key: 'settings',
      icon: <SettingOutlined />,
      children: [
        {
          key: 'admin',
          // icon: <TeamOutlined />,
          label: <Link to={'/admin'}>{translate('admin')}</Link>,
        },
        {
          key: 'generalSettings',
          label: <Link to={'/settings'}>{translate('general_settings')}</Link>,
        },
        {
          key: 'expensesCategory',
          label: <Link to={'/category/expenses'}>{translate('expenses_Category')}</Link>,
        },
        // {
        //   key: 'emailTemplates',
        //   label: <Link to={'/email'}>{translate('email_templates')}</Link>,
        // },
        {
          key: 'paymentMode',
          label: <Link to={'/payment/mode'}>{translate('payment_mode')}</Link>,
        },
        {
          key: 'taxes',
          label: <Link to={'/taxes'}>{translate('taxes')}</Link>,
        },
        // {
        //   key: 'advancedSettings',
        //   label: <Link to={'/settings/advanced'}>{translate('advanced_settings')}</Link>,
        // },
      ],
    },
  ];

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);
  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <>
      <Sider
        collapsible={collapsible}
        collapsed={collapsible ? isNavMenuClose : collapsible}
        onCollapse={onCollapse}
        className="navigation"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          bottom: '20px',
          ...(!isMobile && {
            background: 'none',
            border: 'none',
            left: '20px',
            top: '20px',
            borderRadius: '8px',
          }),
        }}
        theme={'light'}
      >
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src={logoText} alt="Logo" style={{ marginLeft: '', height: '58px' }} />
        </div>
        <div className="bg-[#ff0000] h-auto rounded-2xl mb-5 w-[45%] items-center justify-center ml-[25%]"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: '25%',
          width: '45%',
          height: 'auto',
          borderRadius: '2rem',
          background: '#ff0000',
          marginBottom: '15px',

        
        }}>
          <h3 className="mt-5 text-white font-bold text-md text-center p-1" style={{
            color: 'white',
            fontWeight: 'bold',
            fontSize: '15px',
            marginTop: '5px',
            textAlign: 'center',
          
          }}>Empresa</h3>
        </div>
        <Menu
          items={items}
          mode="inline"
          theme={'light'}
          selectedKeys={[currentPath]}
          style={{
            background: 'none',
            border: 'none',
          }}
        />
      </Sider>
    </>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };
  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ marginLeft: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        contentWrapperStyle={{
          boxShadow: 'none',
        }}
        style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
        placement="left"
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
