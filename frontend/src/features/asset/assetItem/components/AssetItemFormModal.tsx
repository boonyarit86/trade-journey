import { Button, Form, Input, Modal, Select, Switch } from "antd";
import type { IAsset, IAssetForm } from "../types";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAssetTypes } from "../../assetType/services/assetTypeApi";

interface Props {
    open: boolean;
    onOk: (data: IAssetForm) => void;
    onCancel: () => void;
    data: IAsset | null;
}

function AssetItemFormModal(props: Props) {
    const [form] = Form.useForm();

    const { data: assetTypes, isLoading: isAssetTypesLoading } = useQuery({
        queryKey: ["assetType"],
        queryFn: fetchAssetTypes,
    });

    useEffect(() => {
        if (props.data) {
            form.setFieldsValue(props.data);
        }
    }, [form, props.data]);

    const handleSubmit = (values: IAssetForm) => {
        props.onOk(values);
    }

    return (
        <Modal
            title="Asset Item"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={props.open}
            onCancel={props.onCancel}
            footer={null}
        >
            <Form 
                form={form}
                onFinish={handleSubmit}
                style={{ padding: "16px 0" }}
                layout="vertical"
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: 'Please input asset name' }]}
                >
                    <Input placeholder="e.g. XAUUSD" />
                </Form.Item>

                <Form.Item
                    label="Asset Type"
                    name="assetTypeId"
                    rules={[{ required: true, message: 'Please select asset type' }]}
                >
                    <Select
                        placeholder="Select asset type"
                        loading={isAssetTypesLoading}
                        options={assetTypes?.map(type => ({
                            label: type.name,
                            value: type.id,
                        }))}
                    />
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

export default AssetItemFormModal;
