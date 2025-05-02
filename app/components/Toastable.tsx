import { Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toastable from "react-native-toastable";

const ToastableWrapper = ({
    offset = 20,
    statusMap = {
        success: "#198754",
        danger: "#ff0000",
        warning: "#ffcc00",
        info: "#0000ff",
    },
}) => {
    const { top } = useSafeAreaInsets();

    return (
        <Toastable
            offset={top || offset}
            statusMap={statusMap}
            containerStyle={{
                position: "absolute",
                top: 0,
                left: Dimensions.get("window").width / 2 - (Dimensions.get("window").width * 0.25) / 2,
                zIndex: 9999,
                width: "25%",
            }}
            swipeDirection={["up", "left"]}
        />
    );
};

export default ToastableWrapper;