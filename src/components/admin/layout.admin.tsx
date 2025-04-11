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
                    label: <Link to='/admin'>Dashboard</Link>,
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
                ...(viewResume || ACL_ENABLE === 'false' ? [{
                    label: <Link to='/admin/resume'>Trạng thái</Link>,
                    key: '/admin/resume',
                    icon: <AliwangwangOutlined />
                }] : []),
                ...(viewPermission && user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin/permission'>Quyền hạn</Link>,
                    key: '/admin/permission',
                    icon: <ApiOutlined />
                }] : []),
                ...(viewRole && user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin/role'>Vai trò</Link>,
                    key: '/admin/role',
                    icon: <ExceptionOutlined />
                }] : []),
                ...(user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin/subscription'>Quản lý gói VIP</Link>,
                    key: '/admin/subscription',
                    icon: <CrownOutlined />
                }] : []),
                ...(user?.role?.name !== 'HR' ? [{
                    label: <Link to='/admin?tab=revenue'>Thống kê doanh thu</Link>,
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
        const currentPath = location.pathname + location.search;
        setActiveMenu(currentPath);

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
                        theme='light'
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}
                        style={{
                            background: 'linear-gradient(to right, #000000, #8B0000)',
                            boxShadow: '2px 0 8px 0 rgba(0, 0, 0, 0.2)', // Shadow đậm hơn
                            transition: 'all 0.3s ease', // Thêm animation
                        }}
                    >
                        <div style={{ height: 64, margin: 16, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CrownOutlined style={{ fontSize: 24, color: '#fff' }} /> {/* Thay thế icon */}
                            {!collapsed && <span style={{ marginLeft: 8, fontWeight: 'bold', fontSize: 18, color: '#fff' }}>ADMIN</span>}
                        </div>
                        <Menu
                            selectedKeys={[activeMenu]}
                            mode="inline"
                            items={menuItems}
                            onClick={(e) => setActiveMenu(e.key)}
                            style={{ borderRight: 0, background: 'transparent' }}
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
                                padding: '0 20px',
                                background: 'linear-gradient(to right, #000000, #8B0000)',
                                boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.2)', // Shadow đậm hơn
                                height: 64,
                                color: '#fff', // Màu chữ trắng
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
                                    color: '#fff', // Màu icon trắng
                                }}
                            />

                            <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                <Space style={{ cursor: "pointer" }}>
                                    <span style={{ fontWeight: 500 }}>Welcome, {user?.name}</span>
                                    <Avatar
                                        style={{ backgroundColor: '#fff', color: '#1890ff', verticalAlign: 'middle' }}
                                        size="default"
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
                            background: 'linear-gradient(135deg, #f0f2f5, #e6e9ef)', // Gradient nhẹ
                            minHeight: 'calc(100vh - 64px)', // Đảm bảo content chiếm hết chiều cao còn lại
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