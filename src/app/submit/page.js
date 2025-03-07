"use client"

import DetailProblem from "@/src/components/DetailProblem";
import { Editor } from "@monaco-editor/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";


function Submit() {
    return (
        <div className="h-full">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={50}>
                    <DetailProblem />
                </Panel>
                <PanelResizeHandle className="w-1 bg-gray-300 cursor-ew-resize" />
                <Panel defaultSize={50}>
                    <Editor
                        height="500px"
                        defaultLanguage="javascript"
                        defaultValue="// Type your code here..."
                        options={{
                            lineNumbers: "on", // Hiển thị số dòng
                            minimap: { enabled: true }, // Hiển thị bản đồ thu nhỏ
                        }}
                    />
                </Panel>
            </PanelGroup>
        </div>

    );
}

export default Submit;