import { useEffect } from 'react';
import { Button, Form, Input, Modal, Switch } from 'antd';
import type { ITransactionStatus, ITransactionStatusForm } from '../types';

interface Props {
    open: boolean;
    onOk: (data: ITransactionStatusForm) => void;
    onCancel: () => void;
    data: ITransactionStatus | null;
}

function TransactionStatusFormModal(props: Props) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (props.open) {
            if (props.data) {
                form.setFieldsValue(props.data);
            } else {
                form.resetFields();
            }
        }
    }, [form, props.data, props.open]);

    const handleSubmit = (values: ITransactionStatusForm) => {
        props.onOk(values);
    };

    return (
        <Modal
            title="Trade Result"
            closable={{ 'aria-label': 'Custom Close Button' }}
            open={props.open}
            onCancel={props.onCancel}
            footer={null}
            destroyOnHidden
        >
            <Form
                form={form}
                onFinish={handleSubmit}
                style={{ padding: '16px 0' }}
                layout="vertical"
            >
                <Form.Item
                    label="Text"
                    name="text"
                    rules={[{ required: true, message: 'Please input the status text' }]}
                >
                    <Input placeholder="e.g. win" />
                </Form.Item>

                <Form.Item
                    label="Value"
                    name="value"
                    rules={[
                        { required: true, message: 'Please input the status value' },
                        { max: 3, message: 'Value must be at most 3 characters' },
                    ]}
                >
                    <Input placeholder="e.g. W" maxLength={3} />
                </Form.Item>

                <Form.Item
                    label="Color Code"
                    name="colorCode"
                    rules={[{ required: true, message: 'Please input a color code' }]}
                >
                    <Input placeholder="e.g. #52c41a" />
                </Form.Item>

                <Form.Item name="id" hidden>
                    <Input />
                </Form.Item>

                <Form.Item name="isActive" hidden>
                    <Switch />
                </Form.Item>

                <Button type="primary" htmlType="submit">
                    Save
                </Button>
            </Form>
        </Modal>
    );
}

export default TransactionStatusFormModal;
