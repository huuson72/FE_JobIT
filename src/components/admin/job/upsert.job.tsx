import { Breadcrumb, Col, ConfigProvider, Divider, Form, Row, message, notification } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { DebounceSelect } from "../user/debouce.select";
import { FooterToolbar, ProForm, ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText } from "@ant-design/pro-components";
import styles from 'styles/admin.module.scss';
import { LOCATION_LIST, SKILLS_LIST } from "@/config/utils";
import { ICompanySelect } from "../user/modal.user";
import { useState, useEffect } from 'react';
import { callCreateJob, callFetchAllSkill, callFetchCompany, callFetchHRCompany, callFetchJobById, callUpdateJob } from "@/config/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { CheckSquareOutlined } from "@ant-design/icons";
import enUS from 'antd/lib/locale/en_US';
import dayjs from '@/config/dayjs';
import { IJob, ISkill, IHRCompanyResponse, IBackendRes } from "@/types/backend";
import { useAppSelector } from "@/redux/hooks";

interface ISkillSelect {
    label: string;
    value: string;
    key?: string;
}

const ViewUpsertJob = (props: any) => {
    const [companies, setCompanies] = useState<ICompanySelect[]>([]);
    const [skills, setSkills] = useState<ISkillSelect[]>([]);
    const user = useAppSelector(state => state.account.user);
    const isHR = user?.role?.name?.toUpperCase() === 'HR';
    const [hrCompany, setHrCompany] = useState<any>(null);

    console.log("User role:", user?.role?.name);
    console.log("Is HR:", isHR);
    console.log("User company:", user?.company);

    const navigate = useNavigate();
    const [value, setValue] = useState<string>("");

    let location = useLocation();
    let params = new URLSearchParams(location.search);
    const id = params?.get("id"); // job id
    const [dataUpdate, setDataUpdate] = useState<IJob | null>(null);
    const [form] = Form.useForm();

    // Load HR company data
    useEffect(() => {
        if (isHR) {
            const loadHRCompany = async () => {
                try {
                    const res = await callFetchHRCompany();
                    console.log("HR Company raw response:", res);
                    console.log("HR Company data:", res.data);

                    // Properly handle the nested response structure
                    if (res.data && typeof res.data === 'object') {
                        let company;

                        // Log all levels to help debug
                        console.log("Level 1:", res.data);
                        if (res.data.data) console.log("Level 2:", res.data.data);
                        if (res.data.data?.data) console.log("Level 3:", res.data.data.data);

                        // Try to find company data at different nesting levels
                        if (res.data.id) {
                            company = res.data; // Direct data
                        } else if (res.data.data?.id) {
                            company = res.data.data; // One level nesting
                        } else if (res.data.data?.data?.id) {
                            company = res.data.data.data; // Two level nesting
                        }

                        if (company && company.id) {
                            console.log("Found company data:", company);
                            setHrCompany(company);

                            const companyValue = {
                                label: company.name,
                                value: `${company.id}@#$${company.logo || ''}`,
                                key: company.id.toString()
                            };

                            console.log("Setting company value:", companyValue);
                            setCompanies([companyValue]);

                            // Only pre-fill the form if we're not editing an existing job
                            if (!id) {
                                form.setFieldsValue({
                                    company: companyValue
                                });
                            }
                        } else {
                            console.error("No valid company data found in response");
                        }
                    } else {
                        console.error("Invalid response format:", res.data);
                    }
                } catch (error) {
                    console.error("Error loading HR company:", error);
                }
            };
            loadHRCompany();
        }
    }, [isHR, id, form]);

    useEffect(() => {
        const init = async () => {
            const temp = await fetchSkillList();
            setSkills(temp);

            if (id) {
                const res = await callFetchJobById(id);
                if (res && res.data) {
                    setDataUpdate(res.data);
                    setValue(res.data.description);
                    setCompanies([
                        {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?.id
                        }
                    ])

                    //skills
                    const temp: any = res.data?.skills?.map((item: ISkill) => {
                        return {
                            label: item.name,
                            value: item.id,
                            key: item.id
                        }
                    })
                    form.setFieldsValue({
                        ...res.data,
                        company: {
                            label: res.data.company?.name as string,
                            value: `${res.data.company?.id}@#$${res.data.company?.logo}` as string,
                            key: res.data.company?.id
                        },
                        skills: temp
                    })
                }
            }
        }
        init();
        return () => form.resetFields()
    }, [id, form]);

    // Usage of DebounceSelect
    async function fetchCompanyList(name: string): Promise<ICompanySelect[]> {
        if (isHR) {
            try {
                const res = await callFetchHRCompany();
                console.log("HR Company dropdown response:", res);

                // Find company data at different nesting levels
                let company;
                if (res.data?.id) {
                    company = res.data;
                } else if (res.data?.data?.id) {
                    company = res.data.data;
                } else if (res.data?.data?.data?.id) {
                    company = res.data.data.data;
                }

                if (company && company.id) {
                    console.log("Using company for dropdown:", company);
                    return [{
                        label: company.name,
                        value: `${company.id}@#$${company.logo || ''}`,
                        key: company.id.toString()
                    }];
                } else {
                    console.error("No valid company found for dropdown");
                }
            } catch (error) {
                console.error("Error fetching HR company for dropdown:", error);
            }
            return [];
        }
        // Nếu không phải HR, tìm kiếm bình thường
        const res = await callFetchCompany(`page=1&size=100&name ~ '${name}'`);
        if (res && res.data) {
            const list = res.data.result;
            return list.map(item => ({
                label: item.name as string,
                value: `${item.id}@#$${item.logo || ''}` as string,
                key: item.id.toString()
            }));
        }
        return [];
    }

    async function fetchSkillList(): Promise<ISkillSelect[]> {
        const res = await callFetchAllSkill(`page=1&size=100`);
        if (res && res.data) {
            const list = res.data.result;
            const temp = list.map(item => {
                return {
                    label: item.name as string,
                    value: `${item.id}` as string
                }
            })
            return temp;
        } else return [];
    }

    const onFinish = async (values: any) => {
        if (dataUpdate?.id) {
            //update
            const cp = values?.company?.value?.split('@#$');

            let arrSkills = [];
            if (typeof values?.skills?.[0] === 'object') {
                arrSkills = values?.skills?.map((item: any) => { return { id: item.value } });
            } else {
                arrSkills = values?.skills?.map((item: any) => { return { id: +item } });
            }

            const job = {
                name: values.name,
                skills: arrSkills,
                company: {
                    id: cp && cp.length > 0 ? cp[0] : "",
                    name: values.company.label,
                    logo: cp && cp.length > 1 ? cp[1] : ""
                },
                location: values.location,
                salary: values.salary,
                quantity: values.quantity,
                level: values.level,
                description: value,
                startDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.startDate) ? dayjs(values.startDate, 'DD/MM/YYYY').toDate() : values.startDate,
                endDate: /[0-9]{2}[/][0-9]{2}[/][0-9]{4}$/.test(values.endDate) ? dayjs(values.endDate, 'DD/MM/YYYY').toDate() : values.endDate,
                active: values.active,

            }

            const res = await callUpdateJob(job, dataUpdate.id);
            if (res.data) {
                message.success("Cập nhật job thành công");
                navigate('/admin/job')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const cp = values?.company?.value?.split('@#$');
            const arrSkills = values?.skills?.map((item: string) => { return { id: +item } });
            const job = {
                name: values.name,
                skills: arrSkills,
                company: {
                    id: cp && cp.length > 0 ? cp[0] : "",
                    name: values.company.label,
                    logo: cp && cp.length > 1 ? cp[1] : ""
                },
                location: values.location,
                salary: values.salary,
                quantity: values.quantity,
                level: values.level,
                description: value,
                startDate: dayjs(values.startDate, 'DD/MM/YYYY').toDate(),
                endDate: dayjs(values.endDate, 'DD/MM/YYYY').toDate(),
                active: values.active
            }

            const res = await callCreateJob(job);
            if (res.data) {
                message.success("Tạo mới job thành công");
                navigate('/admin/job')
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }



    return (
        <div className={styles["upsert-job-container"]}>
            <div className={styles["title"]}>
                <Breadcrumb
                    separator=">"
                    items={[
                        {
                            title: <Link to="/admin/job">Manage Job</Link>,
                        },
                        {
                            title: 'Upsert Job',
                        },
                    ]}
                />
            </div>
            <div >

                <ConfigProvider locale={enUS}>
                    <ProForm
                        form={form}
                        onFinish={onFinish}
                        submitter={
                            {
                                searchConfig: {
                                    resetText: "Hủy",
                                    submitText: <>{dataUpdate?.id ? "Cập nhật Job" : "Tạo mới Job"}</>
                                },
                                onReset: () => navigate('/admin/job'),
                                render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                                submitButtonProps: {
                                    icon: <CheckSquareOutlined />
                                },
                            }
                        }
                    >
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={12}>
                                <ProFormText
                                    label="Tên Job"
                                    name="name"
                                    rules={[
                                        { required: true, message: 'Vui lòng không bỏ trống' },
                                    ]}
                                    placeholder="Nhập tên job"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="skills"
                                    label="Kỹ năng yêu cầu"
                                    options={skills}
                                    placeholder="Please select a skill"
                                    rules={[{ required: true, message: 'Vui lòng chọn kỹ năng!' }]}
                                    allowClear
                                    mode="multiple"
                                    fieldProps={{
                                        suffixIcon: null
                                    }}
                                />
                            </Col>

                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="location"
                                    label="Địa điểm"
                                    options={LOCATION_LIST}
                                    placeholder="Please select a location"
                                    rules={[{ required: true, message: 'Vui lòng chọn địa điểm!' }]}
                                    fieldProps={{
                                        showSearch: true,
                                        filterOption: (input, option) =>
                                            (typeof option?.label === 'string' ? option.label.toLowerCase() : '').includes(input.toLowerCase()),
                                        optionFilterProp: "label"
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Mức lương"
                                    name="salary"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập mức lương"
                                    fieldProps={{
                                        addonAfter: " đ",
                                        formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                        parser: (value) => +(value || '').replace(/\$\s?|(,*)/g, '')
                                    }}
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDigit
                                    label="Số lượng"
                                    name="quantity"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập số lượng"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSelect
                                    name="level"
                                    label="Trình độ"
                                    valueEnum={{
                                        INTERN: 'INTERN',
                                        FRESHER: 'FRESHER',
                                        JUNIOR: 'JUNIOR',
                                        MIDDLE: 'MIDDLE',
                                        SENIOR: 'SENIOR',
                                    }}
                                    placeholder="Please select a level"
                                    rules={[{ required: true, message: 'Vui lòng chọn level!' }]}
                                />
                            </Col>

                            {(dataUpdate?.id || !id) &&
                                <Col span={24} md={6}>
                                    <ProForm.Item
                                        name="company"
                                        label="Thuộc Công Ty"
                                        rules={[{ required: true, message: 'Vui lòng chọn company!' }]}
                                    >
                                        {isHR && companies.length > 0 ? (
                                            // Simple text display for HR users
                                            <div style={{
                                                padding: '4px 11px',
                                                border: '1px solid #d9d9d9',
                                                borderRadius: '2px',
                                                minHeight: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: '#f5f5f5'
                                            }}>
                                                {companies[0]?.label || 'Loading...'}
                                            </div>
                                        ) : (
                                            // Regular dropdown for non-HR users
                                            <DebounceSelect
                                                allowClear={false}
                                                showSearch={!isHR}
                                                value={companies[0] || null}
                                                placeholder="Chọn công ty"
                                                fetchOptions={fetchCompanyList}
                                                onChange={(newValue: any) => {
                                                    if (!isHR) { // Only allow changes for non-HR users
                                                        setCompanies([newValue]);
                                                        form.setFieldsValue({ company: newValue });
                                                    }
                                                }}
                                                style={{ width: '100%' }}
                                                disabled={isHR}
                                            />
                                        )}
                                    </ProForm.Item>
                                </Col>
                            }

                        </Row>
                        <Row gutter={[20, 20]}>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày bắt đầu"
                                    name="startDate"
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormDatePicker
                                    label="Ngày kết thúc"
                                    name="endDate"
                                    normalize={(value) => value && dayjs(value, 'DD/MM/YYYY')}
                                    fieldProps={{
                                        format: 'DD/MM/YYYY',

                                    }}
                                    // width="auto"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày cấp' }]}
                                    placeholder="dd/mm/yyyy"
                                />
                            </Col>
                            <Col span={24} md={6}>
                                <ProFormSwitch
                                    label="Trạng thái"
                                    name="active"
                                    checkedChildren="ACTIVE"
                                    unCheckedChildren="INACTIVE"
                                    initialValue={true}
                                    fieldProps={{
                                        defaultChecked: true,
                                    }}
                                />
                            </Col>
                            <Col span={24}>
                                <ProForm.Item
                                    name="description"
                                    label="Miêu tả job"
                                    rules={[{ required: true, message: 'Vui lòng nhập miêu tả job!' }]}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
                                    />
                                </ProForm.Item>
                            </Col>
                        </Row>
                        <Divider />
                    </ProForm>
                </ConfigProvider>

            </div>
        </div>
    )
}

export default ViewUpsertJob;