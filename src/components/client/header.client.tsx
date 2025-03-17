import { useState, useEffect } from 'react';
import { CodeOutlined, ContactsOutlined, FireOutlined, LogoutOutlined, MenuFoldOutlined, RiseOutlined, TwitterOutlined } from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message } from 'antd';
import { Menu, ConfigProvider } from 'antd';
import styles from '@/styles/client.module.scss';
import { isMobile } from 'react-device-detect';
import { FaReact } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import logoHS from '@/assets/logoHS.png';
import logoHSJob from '@/assets/Hsjob.png';
import { HomeOutlined, LaptopOutlined } from '@ant-design/icons';


const Header = (props: any) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

    const [current, setCurrent] = useState('home');
    const location = useLocation();

    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);

    useEffect(() => {
        setCurrent(location.pathname);
    }, [location])



    const items: MenuProps['items'] = [
        {
            label: <Link to={'/'} style={{ color: current === '/' ? '#fff' : '#a7a7a7' }}>Trang Chủ</Link>,
            key: '/',
            icon: <HomeOutlined style={{ color: current === '/' ? '#fff' : '#a7a7a7' }} />,
        },
        {
            label: <Link to={'/job'} style={{ color: current === '/job' ? '#fff' : '#a7a7a7' }}>
                Việc Làm IT &gt;
            </Link>,
            key: '/job',
            icon: <LaptopOutlined style={{ color: current === '/job' ? '#fff' : '#a7a7a7' }} />,
        },
        {
            label: <Link to={'/company'} style={{ color: current === '/company' ? '#fff' : '#a7a7a7' }}>Top Công ty IT</Link>,
            key: '/company',
            icon: <RiseOutlined style={{ color: current === '/company' ? '#fff' : '#a7a7a7' }} />,
        }
    ];



    const onClick: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
    };

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res && +res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/')
        }
    }

    const itemsDropdown = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => setOpenManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'manage-account',
            icon: <ContactsOutlined />
        },
        // ...(user.role?.permissions?.length ? [{
        //     label: <Link
        //         to={"/admin"}
        //     >Trang Quản Trị</Link>,
        //     key: 'admin',
        //     icon: <FireOutlined />
        // },] : []),
        ...(user.role?.name === "HR" || user.role?.name === "SUPER_ADMIN"
            ? [{
                label: <Link to={"/admin"}>Trang Quản Trị</Link>,
                key: 'admin',
                icon: <FireOutlined />
            }]
            : []),

        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    const itemsMobiles = [...items, ...itemsDropdown];

    return (
        <>
            <div className={styles["header-section"]}>
                <div className={styles["container"]}>
                    {!isMobile ?
                        <div style={{ display: "flex", gap: 30 }}>
                            <div className={styles['brand']}>
                                <img
                                    src={logoHSJob}
                                    alt="HSJob Logo"
                                    onClick={() => navigate('/')}
                                    title="HSJob"
                                    style={{
                                        width: '50px',
                                        height: '50px', // Đảm bảo ảnh là hình vuông để bo tròn hiệu quả
                                        cursor: 'pointer',
                                        borderRadius: '50%', // Bo tròn hoàn toàn
                                        objectFit: 'cover', // Đảm bảo ảnh không bị méo
                                    }}
                                />
                            </div>


                            <div className={styles['top-menu']}>
                                <ConfigProvider
                                    theme={{
                                        token: {
                                            colorBgContainer: 'transparent', // Nền trong suốt
                                            colorText: '#a7a7a7', // Màu chữ mặc định
                                            colorPrimary: '#fff', // Màu chữ khi được chọn
                                            colorTextDisabled: '#a7a7a7', // Màu chữ khi không được chọn
                                        },
                                    }}
                                >

                                    <Menu
                                        // onClick={onClick}
                                        selectedKeys={[current]}
                                        mode="horizontal"
                                        items={items}
                                    />
                                </ConfigProvider>

                                <div className={styles['extra']}>
                                    {isAuthenticated === false ?
                                        <Link to={'/login'} style={{ color: '#ffffff', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
                                            Đăng Nhập
                                        </Link>

                                        :
                                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                            <Space style={{ cursor: "pointer", fontWeight: "bold", color: "#ffffff" }}>
                                                <span>Welcome {user?.name}</span>
                                                <Avatar> {user?.name?.substring(0, 2)?.toUpperCase()} </Avatar>
                                            </Space>
                                        </Dropdown>
                                    }

                                </div>

                            </div>
                        </div>
                        :
                        <div className={styles['header-mobile']}>
                            <span>Your APP</span>
                            <MenuFoldOutlined onClick={() => setOpenMobileMenu(true)} />
                        </div>
                    }
                </div>
            </div>
            <Drawer title="Chức năng"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
            >
                <Menu
                    onClick={onClick}
                    selectedKeys={[current]}
                    mode="vertical"
                    items={itemsMobiles}
                />
            </Drawer>
            <ManageAccount
                open={openMangeAccount}
                onClose={setOpenManageAccount}
            />
        </>
    )
};

export default Header;