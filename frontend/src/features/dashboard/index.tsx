import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card, Empty, Flex, Select, Space, Typography, message } from "antd";
import { fetchProjects } from "../project/services/projectApi";
import { fetchPortfolios } from "../portfolio/services/portfolioApi";
import { fetchTransactions, createTransaction } from "../transaction/services/transactionApi";
import type { ITransactionForm } from "../transaction/types";
import { SummaryCards } from "./components/SummaryCards";
import { PnlCharts } from "./components/PnlCharts";
import { PnlCalendar } from "./components/PnlCalendar";
import { TransactionTable } from "./components/TransactionTable";
import { TransactionFormModal } from "./components/TransactionFormModal";

export function DashboardScreen() {
    const queryClient = useQueryClient();
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: projects } = useQuery({
        queryKey: ["project"],
        queryFn: fetchProjects,
    });

    const {
        data: portfolios,
        isError: isPortfolioError,
        error: portfolioError,
    } = useQuery({
        queryKey: ["portfolio"],
        queryFn: fetchPortfolios,
    });

    const {
        data: transactions,
        isLoading: isTransactionsLoading,
    } = useQuery({
        queryKey: ["transaction", selectedPortfolioId],
        queryFn: () => fetchTransactions(selectedPortfolioId),
        enabled: !!selectedPortfolioId,
    });

    const filteredPortfolios = useMemo(() => {
        if (!portfolios) return [];
        if (!selectedProjectId) return portfolios;
        return portfolios.filter((p) => p.projectId === selectedProjectId);
    }, [portfolios, selectedProjectId]);

    const selectedPortfolio = useMemo(
        () => portfolios?.find((p) => p.id === selectedPortfolioId) ?? null,
        [portfolios, selectedPortfolioId],
    );

    const createTransactionMutation = useMutation({
        mutationFn: async (data: ITransactionForm) => createTransaction(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["portfolio"] });
            queryClient.invalidateQueries({ queryKey: ["transaction", selectedPortfolioId] });
            message.success("Transaction created successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to create transaction.");
        },
    });

    const handleProjectChange = (value: string | undefined) => {
        setSelectedProjectId(value);
        setSelectedPortfolioId(undefined);
    };

    const handleCreateTransaction = (data: ITransactionForm) => {
        createTransactionMutation.mutate(data);
        setIsModalOpen(false);
    };

    if (isPortfolioError) {
        return (
            <div>
                <Typography.Title>Dashboard</Typography.Title>
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(portfolioError)}
                    type="error"
                />
            </div>
        );
    }

    return (
        <div>
            <Typography.Title>Dashboard</Typography.Title>

            <Card style={{ marginBottom: 16 }}>
                <Flex gap={16} wrap="wrap" align="center" justify="space-between">
                    <Space wrap>
                        <Select
                            allowClear
                            style={{ minWidth: 220 }}
                            placeholder="Select project"
                            value={selectedProjectId}
                            onChange={handleProjectChange}
                            options={projects?.map((p) => ({ label: p.name, value: p.id }))}
                        />
                        <Select
                            style={{ minWidth: 260 }}
                            placeholder="Select portfolio"
                            value={selectedPortfolioId}
                            onChange={setSelectedPortfolioId}
                            options={filteredPortfolios.map((p) => ({
                                label: `${p.name} (${p.projectName ?? "-"})`,
                                value: p.id,
                            }))}
                        />
                    </Space>
                    <Button
                        type="primary"
                        disabled={!selectedPortfolio}
                        onClick={() => setIsModalOpen(true)}
                    >
                        New Transaction
                    </Button>
                </Flex>
            </Card>

            {!selectedPortfolio ? (
                <Card>
                    <Empty description="Select a portfolio to view its trading summary" />
                </Card>
            ) : (
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                    <SummaryCards portfolio={selectedPortfolio} />
                    <PnlCharts
                        initBalance={selectedPortfolio.initBalance}
                        transactions={transactions ?? []}
                    />
                    <PnlCalendar transactions={transactions ?? []} />
                    <Card title="Transactions">
                        <TransactionTable
                            transactions={transactions ?? []}
                            loading={isTransactionsLoading}
                        />
                    </Card>
                </Space>
            )}

            <TransactionFormModal
                open={isModalOpen}
                portfolio={selectedPortfolio}
                onOk={handleCreateTransaction}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}
