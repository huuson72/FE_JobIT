import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchPendingEmployers } from "@/redux/slice/employerVerificationSlide";
import { IUser } from "@/types/backend";
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, message, notification, Drawer, Descriptions, Badge } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import { callVerifyEmployer, callRejectEmployer } from "@/config/api";
import queryString from 'query-string';
import DataTable from "@/components/client/data-table";
import { CheckOutlined, CloseOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import Access from "@/components/share/access";
import { ALL_PERMISSIONS } from "@/config/permissions";
import { sfLike } from "spring-filter-query-builder";

const EmployerVerificationPage = () => {
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [selectedEmployer, setSelectedEmployer] = useState<IUser | null>(null);

    const tableRef = useRef<ActionType>();

    const isFetching = useAppSelector(state => state.employerVerification.isFetching);
    const meta = useAppSelector(state => state.employerVerification.meta);
    const employers = useAppSelector(state => state.employerVerification.result);
    const dispatch = useAppDispatch();

    const handleVerifyEmployer = async (id: string | undefined) => {
        if (id) {
            try {
                const res = await callVerifyEmployer(id);
                if (res.data) {
                    message.success('Duyệt nhà tuyển dụng thành công');
                    reloadTable();
                }
            } catch (error: any) {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: error.message
                });
            }
        }
    }

    const handleRejectEmployer = async (id: string | undefined) => {
        if (id) {
            try {
                const res = await callRejectEmployer(id);
                if (res.data) {
                    message.success('Từ chối nhà tuyển dụng thành công');
                    reloadTable();
                }
            } catch (error: any) {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: error.message
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<IUser>[] = [
        {
            title: 'Tên',
            dataIndex: 'name',
            valueType: 'text',
            render: (dom, entity) => {
                return (
                    <div>
                        <div>{entity.name}</div>
                        <div>{entity.email}</div>
                    </div>
                );
            },
        },
        {
            title: 'Công ty',
            dataIndex: 'company',
            valueType: 'text',
            render: (dom, entity) => {
                return (
                    <div>
                        <div>{entity.company?.name}</div>
                        <div>{entity.company?.address}</div>
                    </div>
                );
            },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            valueType: 'text',
        },
        {
            title: 'Giấy phép kinh doanh',
            dataIndex: 'businessLicense',
            valueType: 'image',
            render: (dom, entity) => {
                return (
                    <div>
                        {entity.businessLicense && (
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${entity.businessLicense}`}
                                alt="Business License"
                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                            />
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            render: (dom, entity) => {
                return (
                    <div>
                        {dayjs(entity.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                    </div>
                );
            },
        },
        {
            title: 'Hành động',
            valueType: 'option',
            render: (_, record) => [
                <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedEmployer(record);
                        setOpenViewDetail(true);
                    }}
                >
                    Xem chi tiết
                </Button>,
                <Button
                    key="verify"
                    type="link"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleVerifyEmployer(record.id)}
                >
                    Duyệt
                </Button>,
                <Button
                    key="reject"
                    type="link"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleRejectEmployer(record.id)}
                >
                    Từ chối
                </Button>,
            ],
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        const clone = { ...params };
        if (clone.page) clone.page = clone.page - 1;
        if (clone?.pageSize) clone.limit = clone.pageSize;
        delete clone.pageSize;

        let temp = queryString.stringify(clone);
        let final = `${temp}&${queryString.stringify(sort)}&${queryString.stringify(filter)}`;
        return final;
    }

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.USERS.GET_PAGINATE}
            >
                <DataTable<IUser>
                    actionRef={tableRef}
                    headerTitle="Danh sách nhà tuyển dụng đang chờ duyệt"
                    rowKey="id"
                    loading={isFetching}
                    columns={columns}
                    dataSource={employers}
                    request={async (params, sort, filter): Promise<any> => {
                        const query = buildQuery(params, sort, filter);
                        dispatch(fetchPendingEmployers(query))
                    }}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.current,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                />
            </Access>

            <Drawer
                title="Chi tiết nhà tuyển dụng"
                placement="right"
                onClose={() => setOpenViewDetail(false)}
                open={openViewDetail}
                width={720}
            >
                {selectedEmployer && (
                    <Descriptions column={1}>
                        <Descriptions.Item label="Tên">{selectedEmployer.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{selectedEmployer.email}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{selectedEmployer.phone}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedEmployer.address}</Descriptions.Item>
                        <Descriptions.Item label="Công ty">{selectedEmployer.company?.name}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ công ty">{selectedEmployer.company?.address}</Descriptions.Item>
                        <Descriptions.Item label="Giấy phép kinh doanh">
                            {selectedEmployer.businessLicense && (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}/storage/company/${selectedEmployer.businessLicense}`}
                                    alt="Business License"
                                    style={{ maxWidth: '100%' }}
                                />
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(selectedEmployer.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Badge status="warning" text="Đang chờ duyệt" />
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Drawer>
        </div>
    );
};

export default EmployerVerificationPage; 