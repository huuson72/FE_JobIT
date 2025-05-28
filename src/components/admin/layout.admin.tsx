import React, { useState, useEffect } from 'react';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    ApiOutlined,
    UserOutlined,
    BankOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AliwangwangOutlined,
    BugOutlined,
    ScheduleOutlined,
    CrownOutlined,
    TeamOutlined,
    BarsOutlined,
    DatabaseOutlined,
    ShopOutlined,
    AuditOutlined,
    DollarOutlined,
    FileDoneOutlined,
    CheckCircleOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, message, Avatar, Button } from 'antd';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { callLogout } from 'config/api';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { isMobile } from 'react-device-detect';
import type { MenuProps } from 'antd';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import { ALL_PERMISSIONS } from '@/config/permissions';
import { motion } from 'framer-motion';
import { useFavorites } from '@/contexts/FavoriteContext';
import './layout.admin.css';

const { Content, Sider } = Layout;

const LayoutAdmin = () => {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('');
    const user = useAppSelector(state => state.account.user);

    const permissions = useAppSelector(state => state.account.user.role.permissions);
    const [menuItems, setMenuItems] = useState<MenuProps['items']>([]);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { favoriteJobs } = useFavorites();

    useEffect(() => {
        const ACL_ENABLE = import.meta.env.VITE_ACL_ENABLE;
        if (permissions?.length || ACL_ENABLE === 'false') {

            const viewCompany = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.COMPANIES.GET_PAGINATE.method
            )

            const viewUser = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.USERS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const viewJob = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.JOBS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.JOBS.GET_PAGINATE.method
            )

            const viewResume = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.RESUMES.GET_PAGINATE.method
            )

            const viewRole = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.ROLES.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.ROLES.GET_PAGINATE.method
            )

            const viewPermission = permissions?.find(item =>
                item.apiPath === ALL_PERMISSIONS.PERMISSIONS.GET_PAGINATE.apiPath
                && item.method === ALL_PERMISSIONS.USERS.GET_PAGINATE.method
            )

            const full = [
                ...(user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin'>Tổng quan</Link>,
                    key: '/admin',
                    icon: <AppstoreOutlined />
                }] : []),
                ...(viewUser || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/user'>Người dùng</Link>,
                    key: '/admin/user',
                    icon: <UserOutlined />
                }] : []),
                ...(viewCompany || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/company'>Công ty</Link>,
                    key: '/admin/company',
                    icon: <BankOutlined />,
                }] : []),
                ...(viewJob || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/job'>Việc làm</Link>,
                    key: '/admin/job',
                    icon: <ScheduleOutlined />
                }] : []),
                ...(viewResume && user?.role?.name !== 'SUPER_ADMIN' || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/resume'>Trạng thái</Link>,
                    key: '/admin/resume',
                    icon: <AliwangwangOutlined />
                }] : []),
                // ...(viewPermission && user?.role?.name !== 'HR' ? [{
                //     label: <Link to='/admin/permission'>Quyền hạn</Link>,
                //     key: '/admin/permission',
                //     icon: <ApiOutlined />
                // }] : []),
                ...(viewRole && user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin/role'>Vai trò</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),
                ...(user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin/subscription'>Gói VIP</Link>,
                    key: '/admin/subscription',
                    icon: <CrownOutlined />
                }] : []),
                ...(user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin?tab=revenue'>Doanh thu</Link>,
                    key: '/admin?tab=revenue',
                    icon: <DollarOutlined />
                }] : []),
                ...(user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin/employer-verification'>Duyệt nhà tuyển dụng</Link>,
                    key: '/admin/employer-verification',
                    icon: <CheckCircleOutlined />
                }] : []),
            ];

            setMenuItems(full);
        }
    }, [permissions, user])
    useEffect(() => {
        const currentPath = location.pathname;
        const currentSearch = location.search;

        if (currentPath === '/admin' && currentSearch === '?tab=revenue') {
            setActiveMenu('/admin?tab=revenue');
        } else {
            setActiveMenu(currentPath);
        }

        // Redirect HR users to jobs page when accessing admin dashboard
        if (user?.role?.name === 'HR' && location.pathname === '/admin') {
            navigate('/admin/job');
        }
    }, [location, user, navigate])

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    // if (isMobile) {
    //     items.push({
    //         label: <label
    //             style={{ cursor: 'pointer' }}
    //             onClick={() => handleLogout()}
    //         >Đăng xuất</label>,
    //         key: 'logout',
    //         icon: <LogoutOutlined />
    //     })
    // }

    const itemsDropdown = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <Link to={'/favourites'}>Công việc yêu thích ({favoriteJobs.length})</Link>,
            key: 'favourites',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },
    ];

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >

                {!isMobile ?
                    <Sider
                        theme='dark'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}
                        style={{
                            background: 'linear-gradient(180deg, #001529 0%, #003a70 100%)',
                            boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            zIndex: 1,
                        }}
                        width={256}
                    >
                        <div
                            style={{
                                height: 64,
                                margin: '16px 0',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                padding: '0 16px',
                            }}
                        >
                            <CrownOutlined style={{ fontSize: 24, color: '#fff', marginRight: collapsed ? 0 : 12 }} />
                            {!collapsed && (
                                <span style={{
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: 500,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    Admin Panel
                                </span>
                            )}
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={(e) => setActiveMenu(e.key)}
                            style={{
                                borderRight: 0,
                                background: 'transparent',
                                padding: '8px 0',
                            }}
                            theme="dark"
                        />
                    </Sider>
                    :
                    <Menu
                        selectedKeys={[activeMenu]}
                        items={menuItems}
                        onClick={(e) => setActiveMenu(e.key)}
                        mode="horizontal"
                    />
                }


                <Layout>
                    {!isMobile &&
                        <div
                            className='admin-header'
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: '0 24px',
                                background: 'linear-gradient(90deg, #001529 0%, #003a70 100%)',
                                height: 64,
                                color: '#fff',
                                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.15)',
                                position: 'relative',
                                zIndex: 1,
                            }}
                        >
                            <Button
                                type="text"
                                icon={collapsed ? React.createElement(MenuUnfoldOutlined) : React.createElement(MenuFoldOutlined)}
                                onClick={() => setCollapsed(!collapsed)}
                                style={{
                                    fontSize: '16px',
                                    width: 64,
                                    height: 64,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            />

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space className="admin-user-dropdown">
                                    <span style={{
                                        fontWeight: 500,
                                        fontSize: '14px',
                                    }}>Welcome, {user?.name}</span>
                                    <Avatar
                                        style={{
                                            backgroundColor: '#1890ff',
                                            color: '#fff',
                                            verticalAlign: 'middle',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {user?.name?.substring(0, 2)?.toUpperCase()}
                                    </Avatar>
                                </Space>
                            </Dropdown>
                        </div>
                    }
                    <Content
                        style={{
                            padding: '24px',
                            background: '#f0f2f5',
                            minHeight: 'calc(100vh - 64px)',
                            position: 'relative',
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background: '#fff',
                                padding: 24,
                                borderRadius: 8,
                                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
                                minHeight: 'calc(100vh - 112px)',
                            }}
                        >
                            <Outlet />
                        </motion.div>
                    </Content>
                    {/* <Footer style={{ padding: 10, textAlign: 'center' }}>
                        
                    </Footer> */}
                </Layout>
            </Layout>

        </>
    );
};

export default LayoutAdmin;