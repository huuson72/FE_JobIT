import { CheckSquareOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { FooterToolbar, ModalForm, ProCard, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, App } from "antd";
import 'styles/reset.scss';
import { isMobile } from 'react-device-detect';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState, useMemo } from "react";
import { callCreateCompany, callUpdateCompany, callUploadSingleFile } from "@/config/api";
import { ICompany } from "@/types/backend";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';

// Cấu hình Quill để khắc phục cảnh báo DOMNodeInserted
const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link'],
        ['clean']
    ],
};

const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
];

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: ICompany | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface ICompanyForm {
    name: string;
    address: string;
}

interface ICompanyLogo {
    name: string;
    uid: string;
}

const ModalCompanyWithApp = (props: IProps) => {
    return (
        <App>
            <ModalCompanyContent {...props} />
        </App>
    );
}

// Đổi tên component cũ thành ModalCompanyContent và tách rời khỏi export
const ModalCompanyContent = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const { message, notification } = App.useApp(); // Chỉ sử dụng hook này trong component được bọc bởi App

    //modal animation
    const [animation, setAnimation] = useState<string>('open');

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataLogo, setDataLogo] = useState<ICompanyLogo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [value, setValue] = useState<string>("");
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id && dataInit?.description) {
            setValue(dataInit.description);
            form.setFieldsValue({
                name: dataInit.name,
                address: dataInit.address,
            })
            setDataLogo([{
                name: dataInit.logo,
                uid: uuidv4(),
            }])

        }
    }, [dataInit])

    const submitCompany = async (valuesForm: ICompanyForm) => {
        const { name, address } = valuesForm;

        if (dataLogo.length === 0) {
            message.error('Vui lòng upload ảnh Logo')
            return;
        }

        if (dataInit?.id) {
            //update
            const res = await callUpdateCompany(dataInit.id, name, address, value, dataLogo[0].name);
            if (res.data) {
                message.success("Cập nhật company thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const res = await callCreateCompany(name, address, value, dataLogo[0].name);
            if (res.data) {
                message.success("Thêm mới company thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setValue("");
        setDataInit(null);

        //add animation when closing modal
        setAnimation('close')
        await new Promise(r => setTimeout(r, 400))
        setOpenModal(false);
        setAnimation('open')
    }

    const handleRemoveFile = (file: any) => {
        setDataLogo([])
    }

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj).then(url => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        }).catch(error => {
            console.error("Error getting base64:", error);
        });
    };

    const getBase64 = (img: any): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result as string));
            reader.addEventListener('error', reject);
            reader.readAsDataURL(img);
        });
    };

    const beforeUpload = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleChange = (info: any) => {
        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
        }
        if (info.file.status === 'done') {
            setLoadingUpload(false);
        }
        if (info.file.status === 'error') {
            setLoadingUpload(false);
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        try {
            const res = await callUploadSingleFile(file, "company");
            console.log("Upload response:", res);

            // Xử lý kết quả trả về từ API
            let fileName = '';

            // Nếu kết quả là một object với data
            if (res && typeof res === 'object') {
                // Trường hợp 1: res.data.data.fileName
                if (res.data && res.data.data && res.data.data.fileName) {
                    fileName = res.data.data.fileName;
                }
                // Trường hợp 2: res.data.fileName
                else if (res.data && res.data.fileName) {
                    fileName = res.data.fileName;
                }
                // Trường hợp 3: res.data là string
                else if (res.data && typeof res.data === 'string') {
                    fileName = res.data;
                }
                // Trường hợp 4: res.fileName
                else if (res.fileName) {
                    fileName = res.fileName;
                }
            }
            // Nếu kết quả là một string
            else if (typeof res === 'string') {
                fileName = res;
            }

            if (fileName) {
                setDataLogo([{
                    name: fileName,
                    uid: uuidv4()
                }]);
                if (onSuccess) onSuccess('ok');
            } else {
                throw new Error('Không thể lấy được tên file từ response');
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            setDataLogo([]);
            if (onError) {
                onError({ event: new Error(error.message || 'Lỗi khi upload file') });
            }
            message.error('Đã có lỗi xảy ra khi upload file: ' + (error.message || 'Lỗi không xác định'));
        }
    };


    return (
        <>
            {openModal &&
                <>
                    <ModalForm
                        title={<>{dataInit?.id ? "Cập nhật Company" : "Tạo mới Company"}</>}
                        open={openModal}
                        modalProps={{
                            onCancel: () => { handleReset() },
                            afterClose: () => handleReset(),
                            destroyOnClose: true,
                            width: isMobile ? "100%" : 900,
                            footer: null,
                            keyboard: false,
                            maskClosable: false,
                            className: `modal-company ${animation}`,
                            rootClassName: `modal-company-root ${animation}`
                        }}
                        scrollToFirstError={true}
                        preserve={false}
                        form={form}
                        onFinish={submitCompany}
                        initialValues={dataInit?.id ? dataInit : {}}
                        submitter={{
                            render: (_: any, dom: any) => <FooterToolbar>{dom}</FooterToolbar>,
                            submitButtonProps: {
                                icon: <CheckSquareOutlined />
                            },
                            searchConfig: {
                                resetText: "Hủy",
                                submitText: <>{dataInit?.id ? "Cập nhật" : "Tạo mới"}</>,
                            }
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <ProFormText
                                    label="Tên công ty"
                                    name="name"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập tên công ty"
                                />
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    label="Ảnh Logo"
                                    name="logo"
                                    rules={[{
                                        required: true,
                                        message: 'Vui lòng không bỏ trống',
                                        validator: () => {
                                            if (dataLogo.length > 0) return Promise.resolve();
                                            else return Promise.reject(false);
                                        }
                                    }]}
                                >
                                    <ConfigProvider locale={enUS}>
                                        <Upload
                                            name="logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            maxCount={1}
                                            multiple={false}
                                            customRequest={handleUploadFileLogo}
                                            beforeUpload={beforeUpload}
                                            onChange={handleChange}
                                            onRemove={(file) => handleRemoveFile(file)}
                                            onPreview={handlePreview}
                                            defaultFileList={
                                                dataInit?.id ?
                                                    [
                                                        {
                                                            uid: uuidv4(),
                                                            name: dataInit?.logo ?? "",
                                                            status: 'done',
                                                            url: `${import.meta.env.VITE_BACKEND_URL}/storage/company/${dataInit?.logo}`,
                                                        }
                                                    ] : []
                                            }

                                        >
                                            <div>
                                                {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                                <div style={{ marginTop: 8 }}>Upload</div>
                                            </div>
                                        </Upload>
                                    </ConfigProvider>
                                </Form.Item>

                            </Col>

                            <Col span={16}>
                                <ProFormTextArea
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng không bỏ trống' }]}
                                    placeholder="Nhập địa chỉ công ty"
                                    fieldProps={{
                                        autoSize: { minRows: 4 }
                                    }}
                                />
                            </Col>

                            <ProCard
                                title="Miêu tả"
                                // subTitle="mô tả công ty"
                                headStyle={{ color: '#d81921' }}
                                style={{ marginBottom: 20 }}
                                headerBordered
                                size="small"
                                bordered
                            >
                                <Col span={24}>
                                    <ReactQuill
                                        theme="snow"
                                        value={value}
                                        onChange={setValue}
                                        modules={quillModules}
                                        formats={quillFormats}
                                    />
                                </Col>
                            </ProCard>
                        </Row>
                    </ModalForm>
                    <Modal
                        open={previewOpen}
                        title={previewTitle}
                        footer={null}
                        onCancel={() => setPreviewOpen(false)}
                        style={{ zIndex: 1500 }}
                    >
                        <img alt="example" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                </>
            }
        </>
    )
}

export default ModalCompanyWithApp;
