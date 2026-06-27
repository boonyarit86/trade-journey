import type { AntIconType } from "../shared/ui/Icon";

export interface IRoutePath {
    id: string;
    icon: AntIconType;
    label: string;
    path: string;
}
export const routePaths: IRoutePath[] = [
    {id: "1", icon: "HomeOutlined", label: "Home", path: "/"},
    {id: "2", icon: "ApartmentOutlined", label: "Project", path: "/project"},
];