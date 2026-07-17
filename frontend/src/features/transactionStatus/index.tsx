import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Flex, message, Switch, Table, Tag, Typography } from 'antd';
import TransactionStatusFormModal from './components/TransactionStatusFormModal';
import type { ITransactionStatus, ITransactionStatusForm, TransactionStatusFormMode } from './types';
import {
    createTransactionStatus,
    fetchTransactionStatuses,
    updateTransactionStatus,
    updateTransactionStatusActiveStatus,
} from './services/transactionStatusApi';

const QUERY_KEY = 'transactionStatus';

export function TransactionStatusScreen() {
    const [activeStatus, setActiveStatus] = useState<ITransactionStatus | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<TransactionStatusFormMode>('create');

    const queryClient = useQueryClient();

    const {
        data: statuses,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: [QUERY_KEY],
        queryFn: fetchTransactionStatuses,
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            await updateTransactionStatusActiveStatus(id, isActive);
            return { id, isActive };
        },
        onSuccess: ({ id, isActive }) => {
            queryClient.setQueryData(
                [QUERY_KEY],
                (old: ITransactionStatus[] | undefined) =>
                    old?.map((s) => (s.id === id ? { ...s, isActive } : s)),
            );
            message.success('Status updated successfully!');
        },
        onError: (err) => {
            console.error(err);
            message.error('Failed to update status.');
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: ITransactionStatusForm) => updateTransactionStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            message.success('Status updated successfully!');
        },
        onError: (err) => {
            console.error(err);
            message.error('Failed to update status.');
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: Pick<ITransactionStatusForm, 'text' | 'value' | 'colorCode'>) =>
            createTransactionStatus(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            message.success('Status created successfully!');
        },
        onError: (err) => {
            console.error(err);
            message.error('Failed to create status.');
        },
    });

    const handleOk = (data: ITransactionStatusForm) => {
        if (formMode === 'update') {
            updateMutation.mutate(data);
        } else {
            createMutation.mutate(data);
        }
        handleCancel();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveStatus(null);
    };

    const onClickCreate = () => {
        setFormMode('create');
        setActiveStatus(null);
        setIsModalOpen(true);
    };

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: 80,
            render: (_: unknown, record: ITransactionStatus) => (
                <Switch
                    checked={record.isActive}
                    onClick={() =>
                        toggleActiveMutation.mutate({ id: record.id, isActive: !record.isActive })
                    }
                />
            ),
        },
        {
            title: 'Text',
            dataIndex: 'text',
            key: 'text',
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
        },
        {
            title: 'Color',
            dataIndex: 'colorCode',
            key: 'colorCode',
            render: (colorCode: string, record: ITransactionStatus) => (
                <Tag color={colorCode}>{record.text}</Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: unknown, record: ITransactionStatus) => (
                <Flex gap={16}>
                    <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setFormMode('update');
                            setActiveStatus(record);
                            setIsModalOpen(true);
                        }}
                    >
                        View
                    </span>
                </Flex>
            ),
        },
    ];

    return (
        <div>
            <Typography.Title>Trade Result</Typography.Title>
            {isError ? (
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(error)}
                    type="error"
                />
            ) : (
                <>
                    <Flex justify="end" style={{ marginBottom: 8 }}>
                        <Button type="primary" ghost onClick={onClickCreate}>
                            New Status
                        </Button>
                    </Flex>
                    <Table
                        rowKey="id"
                        dataSource={statuses}
                        columns={columns}
                        loading={isLoading}
                    />
                </>
            )}

            <TransactionStatusFormModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                data={activeStatus}
            />
        </div>
    );
}
