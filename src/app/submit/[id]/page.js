'use client';

import DetailProblem from '@/src/components/DetailProblem';
import { Editor } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FaCode } from 'react-icons/fa6';
import { RiFullscreenLine } from 'react-icons/ri';
import { IoIosArrowUp } from 'react-icons/io';
import { LuTerminal } from 'react-icons/lu';
import { FaPlay } from 'react-icons/fa6';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
import { useEffect, useRef, useState } from 'react';
import { Button, Popover, Spin } from 'antd';
import axios from 'axios';
import request from '@/src/utils/server';

function Submit({ params }) {
    const [fullCodeEditor, setFullCodeEditor] = useState(false);
    const [languages, setLanguges] = useState([]);
    const [idLanguage, setIdlanguage] = useState({});
    const [open, setOpen] = useState(false);
    const [sourseCode, setSourceCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const editorRef = useRef(null);
    const [testResult, setTestResult] = useState(null);

    const { id: problemId } = params;

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    useEffect(() => {
        (async () => {
            const response = await axios.get('https://ce.judge0.com/languages');
            if (response.status === 200) {
                let data = response.data || [];
                data = data.reverse();
                const dataDic = {};
                data.forEach((item) => {
                    const name = item.name.split(' ')[0];
                    if (!dataDic.hasOwnProperty(name)) {
                        dataDic[name] = item.id;
                    }
                });
                data = [];
                for (const item in dataDic) {
                    data.push({
                        id: dataDic[item],
                        name: item,
                    });
                }
                data = data.reverse();

                setLanguges(data);
                setIdlanguage({
                    id: data[4].id,
                    name: data[4].name,
                });
            }
        })();
    }, []);

    const handleSubmit = async () => {
        try {
            if (!problemId) {
                alert('Vui long chon ngon ngu');
            }
            if (!editorRef.current.getValue()) {
                alert('Vui long viet ma truoc khi chay');
            }
            setIsLoading(true);
            const response = await request.post('/submission', {
                sourceCode: editorRef.current.getValue(),
                languageId: idLanguage.id,
                problemId: problemId,
            });
            if (response.status === 200) {
                setTestResult(response.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunCode = async () => {
        try {
            if (!problemId) {
                alert('Vui long chon ngon ngu');
            }
            if (!editorRef.current.getValue()) {
                alert('Vui long viet ma truoc khi chay');
            }
            setIsLoading(true);
            const response = await request.post('/submission/run', {
                sourceCode: editorRef.current.getValue(),
                languageId: idLanguage.id,
                problemId: problemId,
            });
            if (response.status === 200) {
                setTestResult(response.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full bg-gray-100">
            <PanelGroup direction="horizontal">
                <Panel defaultSize={fullCodeEditor ? 0 : 50} style={{ flexGrow: fullCodeEditor ? 0 : 50 }}>
                    <div className="bg-white h-full rounded-lg overflow-hidden">
                        <DetailProblem />
                    </div>
                </Panel>
                <PanelResizeHandle className="w-3 bg-transparent cursor-ew-resize" />
                <Panel defaultSize={fullCodeEditor ? 100 : 50} style={{ flexGrow: fullCodeEditor ? 100 : 50 }}>
                    <PanelGroup>
                        <Panel defaultSize={95}>
                            <div className="bg-white rounded-lg overflow-hidden relative h-full">
                                <div className="flex bg-gray-100 items-center justify-between h-[30px] space-x-3 px-3 py-2 ">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <FaCode className="text-green-500 text-xl " />
                                            <span>Code</span>
                                        </div>
                                        <button
                                            onClick={handleRunCode}
                                            className="flex items-center space-x-1 hover:opacity-60 hover:bg-gray-200 px-2"
                                        >
                                            <FaPlay className="text-sm" />
                                            <span className="text-base">Run</span>
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className="flex items-center text-green-500 space-x-1 hover:opacity-60 hover:bg-gray-200 px-2"
                                        >
                                            <MdOutlineCloudUpload className="text-xl" />
                                            <span>Submit</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => {
                                                setFullCodeEditor(!fullCodeEditor);
                                            }}
                                        >
                                            <RiFullscreenLine className="text-xl" />
                                        </button>
                                        <button>
                                            <IoIosArrowUp className="text-xl" />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <Popover
                                        open={open}
                                        onOpenChange={() => setOpen(!open)}
                                        placement="bottomLeft"
                                        content={
                                            <div className="max-h-[300px] overflow-y-scroll space-y-1">
                                                {languages.map((item) => (
                                                    <button
                                                        onClick={() => {
                                                            setIdlanguage({
                                                                id: item.id,
                                                                name: item.name,
                                                            });
                                                            setOpen(!open);
                                                        }}
                                                        className="block hover:opacity-60"
                                                    >
                                                        {item.name}
                                                    </button>
                                                ))}
                                            </div>
                                        }
                                        title="Title"
                                        trigger="click"
                                    >
                                        <Button
                                            className="!border-none hover:!text-black"
                                            iconPosition="end"
                                            icon={<IoIosArrowDown />}
                                        >
                                            {idLanguage.name}
                                        </Button>
                                    </Popover>
                                </div>
                                <Editor
                                    className="h-full"
                                    defaultLanguage={(idLanguage?.name || '').toUpperCase()}
                                    defaultValue="// Type your code here..."
                                    theme="dark"
                                    onMount={handleEditorDidMount}
                                    onChange={(value) => {
                                        setSourceCode(value);
                                    }}
                                    options={{
                                        lineNumbers: 'on', // Hiển thị số dòng
                                        minimap: { enabled: true }, // Hiển thị bản đồ thu nhỏ
                                    }}
                                />
                            </div>
                        </Panel>
                        <PanelResizeHandle className="w-full h-3 bg-transparent cursor-ew-resize" />
                        <Panel className="min-h-[47px]">
                            <div className="bg-white h-full rounded-lg overflow-hidden">
                                <div className="bg-gray-200 p-3">
                                    {isLoading ? (
                                        <Spin />
                                    ) : (
                                        <button className="flex items-center">
                                            <LuTerminal className="text-xl text-green-500" />
                                            <span className="text-sm">Test Result</span>
                                        </button>
                                    )}
                                </div>
                                {testResult && testResult.status === 'success' && (
                                    <div className="p-4">
                                        <h2 className="text-green-600 text-3xl">Success</h2>
                                        <h3 className="mt-2 text-yellow-600">Memory: {testResult.data.memory}(KB)</h3>
                                        <h3 className="text-purple-600">Time: {testResult.data.time}(ms)</h3>
                                        <h3 className="text-sky-600">point: {testResult.data.score}</h3>
                                    </div>
                                )}
                                {testResult && testResult.status === 'warning' && (
                                    <div className="p-4">
                                        <h2 className="text-red-600 text-3xl">Error</h2>
                                        <p className="mt-2 text-orange-600">{testResult.message}</p>
                                        <div className="mt-2">
                                            <h3 className="text-green-600">
                                                Input: <span>{testResult?.data?.testcase?.input}</span>
                                            </h3>
                                            <h3 className="text-purple-600">
                                                Expected output:{' '}
                                                <span>{testResult?.data?.testcase?.expectedOutput}</span>
                                            </h3>
                                            <h3 className="text-sky-600">
                                                Actual output: <span>{testResult?.data?.result?.stdout}</span>
                                            </h3>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}

export default Submit;
