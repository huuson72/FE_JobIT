import { useState, useEffect } from 'react';
import {
    CodeOutlined,
    ContactsOutlined,
    FireOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    SearchOutlined,
    UserOutlined,
    GlobalOutlined,
    FileTextOutlined,
    EnvironmentOutlined,
    MonitorOutlined,
    DollarOutlined,
    CrownOutlined
} from '@ant-design/icons';
import { Avatar, Drawer, Dropdown, MenuProps, Space, message, Button, Input, Select, Form, InputNumber, Row, Col, notification } from 'antd';
import { Menu, ConfigProvider } from 'antd';
import styles from '@/styles/client.module.scss';
import { isMobile } from 'react-device-detect';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { callLogout, callFetchAllSkill, callFetchJobCount } from '@/config/api';
import { setLogoutAction } from '@/redux/slice/accountSlide';
import ManageAccount from './modal/manage.account';
import logoHSJob from '@/assets/Hsjob.png';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { ISkill } from '@/types/backend';
import { useFavorites } from '@/contexts/FavoriteContext';

const LEVELS = [
    { label: 'INTERN', value: 'INTERN' },
    { label: 'FRESHER', value: 'FRESHER' },
    { label: 'JUNIOR', value: 'JUNIOR' },
    { label: 'MIDDLE', value: 'MIDDLE' },
    { label: 'SENIOR', value: 'SENIOR' }
];

const Header = (props: any) => {
    const { hideSearch = false } = props;
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated);
    const user = useAppSelector(state => state.account.user);
    const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);
    const [current, setCurrent] = useState('home');
    const [openMangeAccount, setOpenManageAccount] = useState<boolean>(false);
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);
    const [suggestionSkills, setSuggestionSkills] = useState<{ label: string; value: string }[]>([]);
    const [jobCount, setJobCount] = useState<number>(0);
    const [form] = Form.useForm();
    const { favoriteJobs } = useFavorites();

    useEffect(() => {
        setCurrent(location.pathname);
        // Set initial search values from URL
        if (location.search) {
            const queryLocation = searchParams.get("location");
            const querySkills = searchParams.get("skills");
            const queryMinSalary = searchParams.get("minSalary");
            const queryMaxSalary = searchParams.get("maxSalary");
            const queryLevel = searchParams.get("level");

            if (queryLocation) form.setFieldValue("location", queryLocation.split(","));
            if (querySkills) form.setFieldValue("skills", querySkills.split(","));
            if (queryMinSalary) form.setFieldValue("minSalary", Number(queryMinSalary));
            if (queryMaxSalary) form.setFieldValue("maxSalary", Number(queryMaxSalary));
            if (queryLevel) form.setFieldValue("level", queryLevel);
        }
    }, [location]);

    useEffect(() => {
        fetchSkill();
        fetchJobCount();
    }, []);

    const fetchSkill = async () => {
        const res = await callFetchAllSkill('page=1&size=100&sort=createdAt,desc');
        if (res?.data) {
            const skills = res.data.result?.map((item: ISkill) => ({
                label: item.name as string,
                value: item.id + "" as string
            })) ?? [];
            setOptionsSkills(skills);
            // Set suggestion skills from the first 8 skills
            setSuggestionSkills(skills.slice(0, 8));
        }
    };

    const fetchJobCount = async () => {
        try {
            const res = await callFetchJobCount();

            // Log cấu trúc đầy đủ để debug
            console.log("Job count API full response:", JSON.stringify(res, null, 2));

            // Xử lý trường hợp response là IBackendRes
            if (res && typeof res === 'object') {
                // Với cấu trúc { data: { data: { data: number } } }
                if (res.data && res.data.data && typeof res.data.data.data === 'number') {
                    setJobCount(res.data.data.data);
                }
                // Với cấu trúc { data: { data: number } }
                else if (res.data && typeof res.data.data === 'number') {
                    setJobCount(res.data.data);
                }
                // Với cấu trúc khác, hiển thị số mặc định
                else {
                    console.log("Dữ liệu không có cấu trúc như mong đợi, sử dụng giá trị mặc định");
                    setJobCount(15);
                }
            } else {
                console.log("Response không phải là object, sử dụng giá trị mặc định");
                setJobCount(15);
            }
        } catch (error) {
            console.error("Error fetching job count:", error);
            setJobCount(15); // Giá trị mặc định nếu API lỗi
        }
    };

    const items: MenuProps['items'] = [
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: '/',
        },
        {
            label: <Link to={'/job'}>Công việc mới</Link>,
            key: '/job',
        },
        {
            label: <Link to={'/company'}>Nhà tuyển dụng</Link>,
            key: '/company',
        }
    ];

    const handleLogout = async () => {
        const res = await callLogout();
        if (res && res.statusCode === 200) {
            dispatch(setLogoutAction({}));
            message.success('Đăng xuất thành công');
            navigate('/');
        }
    };

    const onFinish = async (values: any) => {
        let queryParts = [];

        if (values?.location?.length) queryParts.push(`location=${values?.location?.join(",")}`);
        if (values?.skills?.length) queryParts.push(`skills=${values?.skills?.join(",")}`);
        if (values?.level) queryParts.push(`level=${values.level}`);

        if (values?.minSalary !== undefined && values?.minSalary !== null && !isNaN(values.minSalary)) {
            queryParts.push(`minSalary=${Number(values.minSalary)}`);
        }
        if (values?.maxSalary !== undefined && values?.maxSalary !== null && !isNaN(values.maxSalary)) {
            queryParts.push(`maxSalary=${Number(values.maxSalary)}`);
        }

        const query = queryParts.join('&');
        console.log('Query string:', query);

        // Nếu không có tiêu chí tìm kiếm, vẫn chuyển hướng đến trang /job
        navigate(`/job${query ? `?${query}` : ''}`);
    };

    const itemsDropdown = [
        {
            label: <label style={{ cursor: 'pointer' }} onClick={() => setOpenManageAccount(true)}>
                Quản lý tài khoản
            </label>,
            key: 'manage-account',
            icon: <UserOutlined />
        },
        {
            label: <Link to="/favourites">Công việc yêu thích ({favoriteJobs.length})</Link>,
            key: 'favourites',
            icon: <FireOutlined />
        },

        ...(user.role?.name === "HR" || user.role?.name === "SUPER_ADMIN" ? [
            {
                label: <Link to={"/admin"}>Trang Quản Trị</Link>,
                key: 'admin',
                icon: <FireOutlined />
            },
            {
                label: <Link to="/subscription">Gói VIP</Link>,
                key: 'vip-packages',
                icon: <CrownOutlined />
            }
        ] : []),
        {
            label: <label style={{ cursor: 'pointer' }} onClick={() => handleLogout()}>
                Đăng xuất
            </label>,
            key: 'logout',
            icon: <LogoutOutlined />
        },
    ];

    return (
        <>
            <div className={styles["header-container"]}>
                <div className={styles["header-content"]}>
                    <div className={styles["left-content"]}>
                        <div className={styles["logo"]} onClick={() => navigate('/')}>
                            <img src={logoHSJob} alt="HSJob" />
                        </div>
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorBgContainer: 'transparent',
                                    colorText: '#ffffff',
                                    colorPrimary: '#ffffff',
                                },
                            }}
                        >
                            <Menu
                                mode="horizontal"
                                items={items}
                                selectedKeys={[current]}
                                className={styles["main-menu"]}
                            />
                        </ConfigProvider>
                    </div>

                    <div className={styles["right-content"]}>
                        {!isAuthenticated ? (
                            <div className={styles["auth-buttons"]}>
                                <Link
                                    to="/auth/employer-register"
                                    className={styles["employer-link"]}
                                >
                                    Đăng ký nhà tuyển dụng
                                </Link>
                                <Link
                                    to="/login"
                                    className={styles["login-button"]}
                                >
                                    Đăng nhập / Đăng ký
                                </Link>
                            </div>
                        ) : (
                            <Space size="middle">
                                <Button
                                    type="primary"
                                    icon={<FileTextOutlined />}
                                    onClick={() => navigate('/cv/create')}
                                    className={styles["create-cv-button"]}
                                >
                                    Tạo CV
                                </Button>
                                <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                                    <Space className={styles["user-menu"]}>
                                        <Avatar>{user?.name?.substring(0, 2)?.toUpperCase()}</Avatar>
                                        <span className={styles["username"]}>
                                            {user?.name}
                                        </span>
                                    </Space>
                                </Dropdown>
                                {/* <Select
                                    defaultValue="en"
                                    style={{ width: 70 }}
                                    options={[
                                        { value: 'en', label: 'EN' },
                                        { value: 'vi', label: 'VI' },
                                    ]}
                                    className={styles["language-select"]}
                                /> */}
                            </Space>
                        )}
                    </div>
                </div>
            </div>

            {!hideSearch && (
                <div className={styles["search-container"]}>
                    <div className={styles["search-content"]}>
                        <h1>
                            <span>{jobCount}</span> Job chờ Dev khám phá
                        </h1>
                        <ProForm
                            form={form}
                            onFinish={onFinish}
                            submitter={{ render: () => <></> }}
                        >
                            <div className={styles["search-box"]}>
                                <ProForm.Item name="location" style={{ width: '20%', margin: 0 }}>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder={<><EnvironmentOutlined /> Địa điểm...</>}
                                        options={LOCATION_LIST}
                                        className={styles["location-select"]}
                                        suffixIcon={<EnvironmentOutlined />}
                                        bordered={false}
                                    />
                                </ProForm.Item>
                                <ProForm.Item name="skills" style={{ flex: 1, margin: 0 }}>
                                    <Select
                                        mode="multiple"
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder={<><MonitorOutlined /> Tìm theo kỹ năng...</>}
                                        className={styles["search-input"]}
                                        options={optionsSkills}
                                        maxTagCount={3}
                                        suffixIcon={<MonitorOutlined />}
                                        bordered={false}
                                    />
                                </ProForm.Item>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={() => form.submit()}
                                    className={styles["search-button"]}
                                    style={{ marginLeft: '8px' }}
                                >
                                    Search
                                </Button>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <ProForm.Item name="level">
                                    <Select
                                        allowClear
                                        style={{ width: 200 }}
                                        placeholder="Chọn cấp bậc..."
                                        options={LEVELS}
                                    />
                                </ProForm.Item>
                                <ProForm.Item name="minSalary">
                                    <InputNumber
                                        style={{ width: 200 }}
                                        placeholder="Lương tối thiểu..."
                                        prefix={<DollarOutlined />}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                        controls={false}
                                    />
                                </ProForm.Item>
                                <ProForm.Item name="maxSalary">
                                    <InputNumber
                                        style={{ width: 200 }}
                                        placeholder="Lương tối đa..."
                                        prefix={<DollarOutlined />}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                                        controls={false}
                                    />
                                </ProForm.Item>
                            </div>
                        </ProForm>

                        <div className={styles["search-suggestions"]}>
                            <span>Suggestions for you:</span>
                            {suggestionSkills.map((skill) => (
                                <Button
                                    key={skill.value}
                                    className={styles["suggestion-tag"]}
                                    onClick={() => {
                                        form.setFieldsValue({
                                            skills: [skill.value],
                                            location: undefined,
                                            level: undefined,
                                            minSalary: undefined,
                                            maxSalary: undefined
                                        });
                                        form.submit();
                                    }}
                                >
                                    {skill.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Drawer
                title="Menu"
                placement="right"
                onClose={() => setOpenMobileMenu(false)}
                open={openMobileMenu}
            >
                <Menu
                    mode="vertical"
                    items={[...items, ...itemsDropdown]}
                    selectedKeys={[current]}
                />
            </Drawer>

            <ManageAccount
                open={openMangeAccount}
                onClose={setOpenManageAccount}
            />
        </>
    );
};

export default Header;