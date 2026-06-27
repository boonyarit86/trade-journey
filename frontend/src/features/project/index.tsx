import type { IProject } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Flex, message, Switch, Table, Typography } from "antd";
import { fetchProjects, updateProjectActiveStatus } from "./services/projectApi";

export function ProjectScreen() {
    const projectQueryKey = "projects";
    const queryClient = useQueryClient();
    const { 
        data: projects, 
        isLoading: isProjectLoading, 
        isError,
        error: projectError,
    } = useQuery({
        queryKey: [projectQueryKey],
        queryFn: fetchProjects,
    });

    const updateProjectActiveStatusMutation = useMutation({
        mutationFn: async ({ id, isActive }: { id: string, isActive: boolean }) => {
            let projectsUpdated = projects.find((p) => p.id === id);
            projectsUpdated.isActive = isActive;
            await updateProjectActiveStatus(id, isActive);
            return projectsUpdated;
        },
        onSuccess: (projectsUpdated) => {
            queryClient.setQueryData(
                [projectQueryKey],
                (oldProjects: IProject[] | undefined) =>
                    oldProjects?.map((p) => p.id === projectsUpdated.id ? projectsUpdated : p
                )
            );
            
            message.success("Project updated successfully!");
        },
        onError: (error) => {
            console.error(error);
            message.success("Failed to update user.");
        }
    })

    const isLoading = isProjectLoading;

    const columns = [
        {
            title: '',
            dataIndex: 'isActive',
            key: 'isActive',
            width: "80px",
            render: (_, record: IProject) => {
                return (
                    <Switch
                        checked={record.isActive}
                        onClick={() => {
                            updateProjectActiveStatusMutation.mutate({ 
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
            title: 'Action',
            dataIndex: 'action',
            render: (_, record: IProject) => {
                return (
                    <div>
                        <Flex gap={16}>
                            <span style={{ cursor: "pointer" }}>View</span>
                            <span style={{ color: "red", cursor: "pointer" }}>Delete</span>
                        </Flex>
                    </div>
                )
            }
        },
    ];

    return (
        <div>
            <Typography.Title>Project</Typography.Title>
            {!isError ?
                <Table dataSource={projects} columns={columns} loading={isLoading} />:
                <Alert
                    title="Error"
                    showIcon
                    description={JSON.stringify(projectError)}
                    type="error"
                />
            }
        </div>
    )
}