import { useState, useEffect } from "react";

export default function DeviceInfo() {
    const [deviceData, setDeviceData] = useState({
        hover: "unknown",
        pointer: "unknown",
        screenWidth: 0,
        innerWidth: 0,
        userAgent: "",
    });

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Показываем только при ?debug в URL
        const params = new URLSearchParams(window.location.search);
        setIsVisible(params.has("debug"));

        const updateData = () => {
            if (typeof window === "undefined") return;

            setDeviceData({
                hover: window.matchMedia("(hover: hover)").matches
                    ? "hover: hover"
                    : "hover: none",
                pointer: window.matchMedia("(pointer: coarse)").matches
                    ? "coarse"
                    : window.matchMedia("(pointer: fine)").matches
                    ? "fine"
                    : "none",
                screenWidth: window.screen?.width || 0,
                innerWidth: window.innerWidth,
                userAgent: navigator.userAgent || "",
            });
        };

        updateData();
        window.addEventListener("resize", updateData);
        return () => window.removeEventListener("resize", updateData);
    }, []);

    if (!isVisible) return null;

    return (
        <div
            style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                background: "rgba(0,0,0,0.7)",
                color: "white",
                padding: "10px",
                fontSize: "12px",
                zIndex: 9999,
                fontFamily: "monospace",
            }}
        >
            <div>Hover: {deviceData.hover}</div>
            <div>Pointer: {deviceData.pointer}</div>
            <div>Screen.width: {deviceData.screenWidth}px</div>
            <div>Window.innerWidth: {deviceData.innerWidth}px</div>
            <div>
                Ratio:{" "}
                {(deviceData.screenWidth / deviceData.innerWidth).toFixed(2)}
            </div>
        </div>
    );
}
