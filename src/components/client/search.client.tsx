import { Button, Col, Form, InputNumber, Row, Select, notification } from 'antd';
import { EnvironmentOutlined, MonitorOutlined, DollarOutlined } from '@ant-design/icons';
import { LOCATION_LIST } from '@/config/utils';
import { ProForm } from '@ant-design/pro-components';
import { useEffect, useState } from 'react';
import { callFetchAllSkill } from '@/config/api';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const LEVELS = [
    { label: 'INTERN', value: 'INTERN' },
    { label: 'FRESHER', value: 'FRESHER' },
    { label: 'JUNIOR', value: 'JUNIOR' },
    { label: 'MIDDLE', value: 'MIDDLE' },
    { label: 'SENIOR', value: 'SENIOR' }
];

interface SearchClientProps {
    hidden?: boolean;
}

const SearchClient = ({ hidden = false }: SearchClientProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const optionsLocations = LOCATION_LIST;
    const [form] = Form.useForm();
    const [optionsSkills, setOptionsSkills] = useState<{ label: string; value: string }[]>([]);

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
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
    }, [location.search]);

    useEffect(() => {
        fetchSkill();
    }, []);

    const fetchSkill = async () => {
        let query = `page=1&size=100&sort=createdAt,desc`;
        const res = await callFetchAllSkill(query);
        if (res && res.data) {
            const arr = res?.data?.result?.map(item => ({
                label: item.name as string,
                value: item.id + "" as string
            })) ?? [];
            setOptionsSkills(arr);
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
        console.log('Query string:', query); // Kiểm tra query string

        if (!query) {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: "Vui lòng chọn tiêu chí để search"
            });
            return;
        }

        navigate(`/job?${query}`);
    };

    if (hidden) {
        return null;
    }

    return (
        <ProForm
            form={form}
            onFinish={onFinish}
            submitter={{ render: () => <></> }}
        >
            <Row gutter={[20, 20]}>
                <Col span={24}><h2>IT Job For Developer</h2></Col>

                <Col span={12} md={4}>
                    <ProForm.Item name="location">
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={<><EnvironmentOutlined /> Địa điểm...</>}
                            optionLabelProp="label"
                            options={optionsLocations}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12} md={4}>
                    <ProForm.Item name="level">
                        <Select
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="Chọn cấp bậc..."
                            options={LEVELS}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12} md={4}>
                    <ProForm.Item name="minSalary">
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Lương tối thiểu..."
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                        />
                    </ProForm.Item>
                </Col>
                <Col span={12} md={4}>
                    <ProForm.Item name="maxSalary">
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Lương tối đa..."
                            min={0}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={24} md={16}>
                    <ProForm.Item name="skills">
                        <Select
                            mode="multiple"
                            allowClear
                            suffixIcon={null}
                            style={{ width: '100%' }}
                            placeholder={<><MonitorOutlined /> Tìm theo kỹ năng...</>}
                            optionLabelProp="label"
                            options={optionsSkills}
                        />
                    </ProForm.Item>
                </Col>

                <Col span={12} md={4}>
                    <Button
                        type="primary"
                        style={{ backgroundColor: '#c70000', borderColor: '#a00000' }}
                        onClick={() => form.submit()}
                    >
                        Search
                    </Button>
                </Col>
            </Row>
        </ProForm>
    );
};

export default SearchClient;
