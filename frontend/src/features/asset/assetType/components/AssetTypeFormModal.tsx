import { Button, Form, Input, Modal, Switch } from "antd";
import type { IAssetType, IAssetTypeForm } from "../types";
import { useEffect } from "react";

interface Props {
    open: boolean;
    onOk: (data: IAssetTypeForm) => void;
    onCancel: () => void;
    data: IAssetType | null;
}

function AssetTypeFormModal(props: Props) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (props.data) form.setFieldsValue(props.data);
    }, [form, props.data]);

    const handleSubmit = (values: IAssetType) => {
        props.onOk(values);
    }

    return (
        <Modal
            title="Asset Type"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={props.open}
            onCancel={props.onCancel}
            footer={null}
        >
            <Form 
                form={form}
                onFinish={handleSubmit}
                style={{ padding: "16px 0" }}
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input your name' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item name="isActive" hidden>
                    <Switch />
                </Form.Item>
                <Button type="primary" htmlType="submit">Save</Button>
            </Form>
      </Modal>
    )
};

export default AssetTypeFormModal;