import { useState, type Key } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Flex, message, Switch, Table, Typography } from "antd";
import PortfolioFormModal from "./components/PortfolioFormModal";
import type { IPortfolio, IPortfolioForm, PortfolioFormMode } from "./types";
import {
    createPortfolio,
    deletePortfolioById,
    fetchPortfolios,
    updatePortfolioActiveStatusById,
    updatePortfolioById,
} from "./services/portfolioApi";
import { fetchProjects } from "../project/services/projectApi";

export function PortfolioScreen() {
    const portfolioQueryKey = "portfolio";
    const [activePortfolio, setActivePortfolio] = useState<IPortfolio | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<PortfolioFormMode>("create");

    const queryClient = useQueryClient();
    const {
        data: portfolios,
        isLoading: isPortfolioLoading,
        isError,
        error: portfolioError,
    } = useQuery({
        queryKey: [portfolioQueryKey],
        queryFn: fetchPortfolios,
    });

    const { data: projects } = useQuery({
        queryKey: ["project"],
        queryFn: fetchProjects,
    });

    const updatePortfolioActiveStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
            const portfolioUpdated = portfolios?.find((p) => p.id === id);
            if (!portfolioUpdated) throw new Error("Portfolio not found");
            portfolioUpdated.isActive = isActive;
            await updatePortfolioActiveStatusById(id, isActive);
            return portfolioUpdated;
        },
        onSuccess: (portfolioUpdated) => {
            queryClient.setQueryData(
                [portfolioQueryKey],
                (oldPortfolios: IPortfolio[] | undefined) =>
                    oldPortfolios?.map((p) => (p.id === portfolioUpdated.id ? portfolioUpdated : p))
            );
            message.success("Portfolio updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update portfolio.");
        },
    });

    const updatePortfolioMutation = useMutation({
        mutationFn: async (data: IPortfolioForm) => {
            await updatePortfolioById(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [portfolioQueryKey] });
            message.success("Portfolio updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update portfolio.");
        },
    });

    const createPortfolioMutation = useMutation({
        mutationFn: async (data: Omit<IPortfolioForm, 'id' | 'isActive'>) => {
            return await createPortfolio(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [portfolioQueryKey] });
            message.success("Portfolio created successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to create portfolio.");
        },
    });

    const deletePortfolioMutation = useMutation({
        mutationFn: async (id: string) => {
            await deletePortfolioById(id);
            return id;
        },
        onSuccess: (id: string) => {
            queryClient.setQueryData(
                [portfolioQueryKey],
                (oldPortfolios: IPortfolio[] | undefined) => oldPortfolios?.filter((p) => p.id !== id)
            );
            message.success("Portfolio deleted successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to delete portfolio.");
        },
    });

    const showModal = () => setIsModalOpen(true);

    const handleOk = (data: IPortfolioForm) => {
        if (formMode === "update") {
            updatePortfolioMutation.mutate(data);
        } else {
            createPortfolioMutation.mutate(data);
        }
        handleCancel();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setActivePortfolio(null);
    };

    const onClickCreatePortfolioButton = () => {
        setFormMode("create");
        showModal();
    };

    const renderCurrentBalancePercent = (record: IPortfolio) => {
        if (!record.initBalance) return '-';
        const percent = ((record.currentBalance - record.initBalance) / record.initBalance) * 100;
        const isPositive = percent >= 0;
        return (
            <span style={{ color: isPositive ? "#3f8600" : "#cf1322" }}>
                {record.currentBalance} ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
            </span>
        );
    };

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: "80px",
            render: (_: unknown, record: IPortfolio) => (
                <Switch
                    checked={record.isActive}
                    onClick={() => {
                        updatePortfolioActiveStatusMutation.mutate({
                            id: record.id,
                            isActive: !record.isActive,
                        });
                    }}
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Project',
            dataIndex: 'projectName',
            key: 'projectName',
            filters: projects?.map((p) => ({ text: p.name, value: p.id })),
            onFilter: (value: boolean | Key, record: IPortfolio) => record.projectId === value,
        },
        {
            title: 'Init Balance',
            dataIndex: 'initBalance',
            key: 'initBalance',
        },
        {
            title: 'Current Balance (%)',
            dataIndex: 'currentBalance',
            key: 'currentBalance',
            render: (_: unknown, record: IPortfolio) => renderCurrentBalancePercent(record),
        },
        {
            title: 'Strategy',
            dataIndex: 'strategyName',
            key: 'strategyName',
            render: (value: string | null | undefined) => value ?? '-',
        },
        {
            title: 'Total Trade',
            dataIndex: 'totalTrade',
            key: 'totalTrade',
        },
        {
            title: 'Win Rate',
            dataIndex: 'winRatePercent',
            key: 'winRatePercent',
            render: (value: number) => `${value}%`,
        },
        {
            title: 'Asset Type',
            dataIndex: 'assetTypeName',
            key: 'assetTypeName',
            render: (value: string | undefined) => value ?? '-',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (_: unknown, record: IPortfolio) => (
                <Flex gap={16}>
                    <span
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setFormMode("update");
                            setActivePortfolio(record);
                            showModal();
                        }}
                    >
                        View
                    </span>
                    <span
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={() => {
                            deletePortfolioMutation.mutate(record.id);
                        }}
                    >
                        Delete
                    </span>
                </Flex>
            ),
        },
    ];

    return (
        <div>
            <Typography.Title>Portfolio</Typography.Title>
            {!isError ? (
                <>
                    <Flex justify="end" style={{ marginBottom: 8 }}>
                        <Button
                            type="primary"
                            ghost
                            onClick={onClickCreatePortfolioButton}
                        >
                            New Portfolio
                        </Button>
                    </Flex>
                    <Table
                        rowKey="id"
                        dataSource={portfolios}
                        columns={columns}
                        loading={isPortfolioLoading}
                    />
                </>
            ) : (
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(portfolioError)}
                    type="error"
                />
            )}

            <PortfolioFormModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                data={activePortfolio}
            />
        </div>
    );
}
