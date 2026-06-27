import { 
    ApartmentOutlined, 
    HomeOutlined,
    BorderOutlined,
} from '@ant-design/icons';

export type AntIconType = 
    "ApartmentOutlined" |
    "HomeOutlined";

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
    }

    return <IconSelected />
}

export default AntIcon;