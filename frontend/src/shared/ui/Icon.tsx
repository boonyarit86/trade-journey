import { 
    ApartmentOutlined, 
    HomeOutlined,
    BorderOutlined,
    SettingOutlined,
} from '@ant-design/icons';

export type AntIconType = 
    "ApartmentOutlined" |
    "HomeOutlined" |
    "SettingOutlined";

export interface AntIconProps {
    icon: AntIconType;
}

function AntIcon(props: AntIconProps) {
    const { 
        icon,
    } = props;

    let IconSelected = BorderOutlined;

    switch (icon) {
        case "ApartmentOutlined":
            IconSelected = ApartmentOutlined;
            break;
        case "HomeOutlined":
            IconSelected = HomeOutlined;
            break
        case "SettingOutlined":
            IconSelected = SettingOutlined;
    }

    return <IconSelected />
}

export default AntIcon;