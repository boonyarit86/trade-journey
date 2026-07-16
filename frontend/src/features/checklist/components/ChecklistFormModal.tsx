import { Button, Checkbox, Form, Input, Modal, Switch } from "antd";
import type { IChecklist, IChecklistForm } from "../types";
import { useEffect } from "react";

interface Props {
    open: boolean;
    onOk: (data: IChecklistForm) => void;
    onCancel: () => void;
    data: IChecklist | null;
}

function ChecklistFormModal(props: Props) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (props.data) {
            form.setFieldsValue(props.data);
        } else {
            form.resetFields();
        }
    }, [form, props.data]);

    const handleSubmit = (values: IChecklistForm) => {
        props.onOk(values);
    }

    return (
        <Modal
            title="Checklist"
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
                    rules={[{ required: true, message: 'Please input checklist name' }]}
                >
                    <Input placeholder="e.g. Without emotional" />
                </Form.Item>

                <Form.Item
                    name="isRequired"
                    valuePropName="checked"
                    initialValue={false}
                >
                    <Checkbox>Required</Checkbox>
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

export default ChecklistFormModal;
