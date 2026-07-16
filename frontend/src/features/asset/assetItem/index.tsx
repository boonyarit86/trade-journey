import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Flex, message, Switch, Table, Typography } from "antd";
import AssetItemFormModal from "./components/AssetItemFormModal";
import type { AssetFormMode, IAsset, IAssetForm } from "./types";
import { createAsset, deleteAssetById, fetchAssets, updateAssetActiveStatusById, updateAssetById } from "./services/assetItemApi";

export function AssetItemScreen() {
    const assetQueryKey = "asset";
    const [activeAsset, setActiveAsset] = useState<IAsset | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formMode, setFormMode] = useState<AssetFormMode>("create");

    const queryClient = useQueryClient();
    const { 
        data: assets, 
        isLoading: isAssetLoading, 
        isError,
        error: assetError,
    } = useQuery({
        queryKey: [assetQueryKey],
        queryFn: fetchAssets,
    });

    const updateAssetActiveStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
            let assetUpdated = assets.find((a) => a.id === id);
            assetUpdated.isActive = isActive;
            await updateAssetActiveStatusById(id, isActive);
            return assetUpdated;
        },
        onSuccess: (assetUpdated) => {
            queryClient.setQueryData(
                [assetQueryKey],
                (oldAssets: IAsset[] | undefined) =>
                    oldAssets?.map((a) => a.id === assetUpdated.id ? assetUpdated : a
                )
            );
            
            message.success("Asset updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update asset.");
        }
    });

    const updateAssetMutation = useMutation({
        mutationFn: (async (assetUpdated: IAssetForm) => {
            await updateAssetById(assetUpdated);
            return assetUpdated;
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [assetQueryKey] });
            message.success("Asset updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to update asset.");
        }
    });

    const createAssetMutation = useMutation({
        mutationFn: (async (data: Omit<IAssetForm, 'id' | 'isActive'>) => {
            const newAssetId = await createAsset(data);
            return newAssetId;
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [assetQueryKey] });
            message.success("Asset created successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to create asset.");
        }
    });

    const deleteAssetMutation = useMutation({
        mutationFn: (async (id: string) => {
            await deleteAssetById(id);
            return id;
        }),
        onSuccess: (id: string) => {
            queryClient.setQueryData(
                [assetQueryKey],
                (oldAssets: IAsset[] | undefined) => oldAssets?.filter((i) => i.id !== id)
            );
            
            message.success("Asset deleted successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.error("Failed to delete asset.");
        }
    });

    const showModal = () => {
        setIsModalOpen(true);
    };
    
    const handleOk = (data: IAssetForm) => {
        if (formMode === "update") {
            updateAssetMutation.mutate(data);
        } else {
            createAssetMutation.mutate(data);
        }
        handleCancel();
    };
    
    const handleCancel = () => {
        setIsModalOpen(false);
        setActiveAsset(null);
    };

    const onClickCreateAssetButton = () => {
        setFormMode("create");
        showModal();
    }

    const isLoading = isAssetLoading;

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: "80px",
            render: (_, record: IAsset) => {
                return (
                    <Switch
                        checked={record.isActive}
                        onClick={() => {
                            updateAssetActiveStatusMutation.mutate({ 
                                id: record.id, 
                                isActive: !record.isActive 
                            });
                        }}
                    />
                );
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Asset Type',
            dataIndex: 'assetTypeName',
            key: 'assetTypeName',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            render: (_, record: IAsset) => {
                return (
                    <div>
                        <Flex gap={16}>
                            <span 
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    setFormMode("update");
                                    setActiveAsset(record);
                                    showModal();
                                }}
                            >
                                View
                            </span>
                            <span 
                                style={{ color: "red", cursor: "pointer" }}
                                onClick={() => {
                                    deleteAssetMutation.mutate(record.id);
                                }}
                            >
                                Delete
                            </span>
                        </Flex>
                    </div>
                )
            }
        },
    ];

    return (
        <div>
            <Typography.Title>Asset Item</Typography.Title>
            {!isError ?
                (
                <>
                    <Flex justify="end" style={{ marginBottom: 8 }}>
                        <Button 
                            type="primary" 
                            ghost
                            onClick={onClickCreateAssetButton}
                        >
                            New Asset
                        </Button>
                    </Flex>
                    <Table 
                        rowKey="id"
                        dataSource={assets} 
                        columns={columns} 
                        loading={isLoading}
                    />
                </>
                ) :
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(assetError)}
                    type="error"
                />
            }

            <AssetItemFormModal
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                data={activeAsset}
            />
        </div>
    )
}
