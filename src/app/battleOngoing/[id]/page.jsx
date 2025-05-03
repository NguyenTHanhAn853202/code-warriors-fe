'use client';

import { Editor } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FaCode, FaPlay } from 'react-icons/fa6';
import { RiFullscreenLine } from 'react-icons/ri';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { LuTerminal } from 'react-icons/lu';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { useEffect, useRef, useState } from 'react';
import { Button, Popover, Spin } from 'antd';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import request from '@/utils/server';

export default function BattlePage() {

    const [fullCodeEditor, setFullCodeEditor] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [idLanguage, setIdLanguage] = useState({});
    const [open, setOpen] = useState(false);
    const [sourceCode, setSourceCode] = useState('// Type your code here...');
    const [isLoading, setIsLoading] = useState(true);
    const [testResult, setTestResult] = useState(null);
    const [problem, setProblem] = useState(null);
    const [hasSubmission, setHasSubmission] = useState(false);
    
    // Refs
    const editorRef = useRef(null);
    const submitButtonRef = useRef(null);
    
    // Hooks
    const router = useRouter();
    const searchParams = useSearchParams();
    const matchId = searchParams.get('matchId');

    // Editor setup
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    // Fetch languages
    useEffect(() => {
        (async () => {
            try {
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
                    setLanguages(data);
                    setIdLanguage({
                        id: data[4].id,
                        name: data[4].name,
                    });
                }
            } catch (error) {
                console.error('Error fetching languages:', error);
            }
        })();
    }, []);

    // Fetch problem data
    useEffect(() => {
        if (!matchId) return;

        const fetchProblem = async () => {
            //kết nối api random bài toán ở be
        };

        fetchProblem();
    }, [matchId]);

    // Run code function
    const handleRunCode = async () => {
        try {
            setIsLoading(true);
            const response = await request.post('/submission/run', {
                sourceCode: editorRef.current.getValue(),
                languageId: idLanguage.id,
                problemId: problem?.id,
            });
            
            if (response.status === 200) {
                setTestResult(response.data);
            }
        } catch (error) {
            console.error('Error running code:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Submit solution function
    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setHasSubmission(true);
            
            const response = await request.post('/submission/submit', {
                languageId: idLanguage.id,
                sourceCode: editorRef.current.getValue(),
                matchId: matchId,
            });
            
            if (response.status === 200) {
                alert('Submission successful!');
            }
        } catch (error) {
            console.error('Error submitting code:', error);
            alert('Submission failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle page exit
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (!hasSubmission) {
                event.preventDefault();
                return (event.returnValue = 'Are you sure you want to leave? Your progress will be lost.');
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasSubmission]);

    // Loading state
    if (isLoading && !problem) {
        return (
            <div className="min-h-[88vh] flex items-center justify-center">
                <Spin size="large" />
                <span className="ml-2">Loading problem...</span>
            </div>
        );
    }

    return (
        <div className="min-h-[88vh] relative bg-gray-100">
            <PanelGroup className="!h-[88vh]" direction="horizontal">
                {/* Problem description panel */}
                <Panel defaultSize={fullCodeEditor ? 0 : 50}>
                    <div className="bg-white h-full rounded-lg overflow-hidden shadow-md p-4">
                        {problem ? (
                            <div className="h-full overflow-y-auto">
                                <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
                                <div className="mb-4 p-2 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-500">
                                        Difficulty: <span className="font-medium text-yellow-600">{problem.difficulty || 'Medium'}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Time Limit: <span className="font-medium">{problem.timeLimit || '1000ms'}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Memory Limit: <span className="font-medium">{problem.memoryLimit || '256MB'}</span>
                                    </p>
                                </div>
                                <div className="prose max-w-none">
                                    <h2 className="text-lg font-semibold">Description</h2>
                                    <p className="whitespace-pre-line">{problem.description}</p>
                                    
                                    {problem.inputDescription && (
                                        <>
                                            <h2 className="text-lg font-semibold mt-4">Input</h2>
                                            <p className="whitespace-pre-line">{problem.inputDescription}</p>
                                        </>
                                    )}
                                    
                                    {problem.outputDescription && (
                                        <>
                                            <h2 className="text-lg font-semibold mt-4">Output</h2>
                                            <p className="whitespace-pre-line">{problem.outputDescription}</p>
                                        </>
                                    )}
                                    
                                    {problem.sampleTestcases && problem.sampleTestcases.length > 0 && (
                                        <div className="mt-4">
                                            <h2 className="text-lg font-semibold">Sample Cases</h2>
                                            {problem.sampleTestcases.map((testcase, index) => (
                                                <div key={index} className="mt-2">
                                                    <div className="bg-gray-50 p-3 rounded-md">
                                                        <h3 className="text-md font-medium">Sample Input {index + 1}</h3>
                                                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{testcase.input}</pre>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-md mt-2">
                                                        <h3 className="text-md font-medium">Sample Output {index + 1}</h3>
                                                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{testcase.output}</pre>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {problem.notes && (
                                        <>
                                            <h2 className="text-lg font-semibold mt-4">Notes</h2>
                                            <p className="whitespace-pre-line">{problem.notes}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                Problem not found
                            </div>
                        )}
                    </div>
                </Panel>
                
                <PanelResizeHandle className="w-3 bg-transparent cursor-ew-resize" />
                
                {/* Code editor panel */}
                <Panel defaultSize={fullCodeEditor ? 100 : 50}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={95}>
                            <div className="bg-white rounded-lg overflow-hidden relative h-full shadow-md">
                                {/* Code editor header */}
                                <div className="flex bg-gray-100 items-center justify-between h-[30px] space-x-3 px-3 py-2">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <FaCode className="text-green-500 text-xl" />
                                            <span>Code</span>
                                        </div>
                                        <button
                                            disabled={hasSubmission}
                                            onClick={handleRunCode}
                                            className="flex items-center space-x-1 hover:opacity-60 hover:bg-gray-200 px-2"
                                        >
                                            <FaPlay className="text-sm" />
                                            <span className="text-base">Run</span>
                                        </button>
                                        <button
                                            ref={submitButtonRef}
                                            disabled={hasSubmission}
                                            onClick={handleSubmit}
                                            className="flex items-center text-green-500 space-x-1 hover:opacity-60 hover:bg-gray-200 px-2"
                                        >
                                            <MdOutlineCloudUpload className="text-xl" />
                                            <span>Submit</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setFullCodeEditor(!fullCodeEditor)}
                                        >
                                            <RiFullscreenLine className="text-xl" />
                                        </button>
                                        <button>
                                            <IoIosArrowUp className="text-xl" />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Language selector */}
                                <div>
                                    <Popover
                                        open={open}
                                        onOpenChange={() => setOpen(!open)}
                                        placement="bottomLeft"
                                        content={
                                            <div className="max-h-[300px] overflow-y-scroll space-y-1">
                                                {languages.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => {
                                                            setIdLanguage({
                                                                id: item.id,
                                                                name: item.name,
                                                            });
                                                            setOpen(!open);
                                                        }}
                                                        className="block hover:opacity-60 p-1"
                                                    >
                                                        {item.name}
                                                    </button>
                                                ))}
                                            </div>
                                        }
                                        title="Select Language"
                                        trigger="click"
                                    >
                                        <Button
                                            className="!border-none hover:!text-black"
                                            iconPosition="end"
                                            icon={<IoIosArrowDown />}
                                        >
                                            {idLanguage.name || "Select Language"}
                                        </Button>
                                    </Popover>
                                </div>
                                
                                {/* Monaco editor */}
                                <Editor
                                    className="h-full"
                                    defaultLanguage={(idLanguage?.name || '').toLowerCase()}
                                    defaultValue={sourceCode}
                                    theme="vs-dark"
                                    onMount={handleEditorDidMount}
                                    onChange={(value) => setSourceCode(value)}
                                    options={{
                                        lineNumbers: 'on',
                                        minimap: { enabled: true },
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                        fontSize: 14,
                                    }}
                                />
                            </div>
                        </Panel>
                        
                        <PanelResizeHandle className="w-full h-3 bg-transparent cursor-ew-resize" />
                        
                        {/* Test results panel */}
                        <Panel className="min-h-[47px]">
                            <div className="bg-white h-full rounded-lg overflow-y-auto shadow-md">
                                <div className="bg-gray-200 p-3">
                                    {isLoading ? (
                                        <Spin />
                                    ) : (
                                        <div className="flex items-center">
                                            <LuTerminal className="text-xl text-green-500" />
                                            <span className="text-sm ml-1">Test Result</span>
                                        </div>
                                    )}
                                </div>
                                
                                {testResult && testResult.status === 'success' && (
                                    <div className="p-4">
                                        <h2 className="text-green-600 text-3xl">Success</h2>
                                        <h3 className="mt-2 text-yellow-600">Memory: {testResult.data.memory}(KB)</h3>
                                        <h3 className="text-purple-600">Time: {testResult.data.time}(ms)</h3>
                                        <h3 className="text-sky-600">Point: {testResult.data.score}</h3>
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
                                                Expected output: <span>{testResult?.data?.testcase?.expectedOutput}</span>
                                            </h3>
                                            <h3 className="text-sky-600">
                                                Actual output: <span>{testResult?.data?.result?.stdout}</span>
                                            </h3>
                                        </div>
                                    </div>
                                )}
                                
                                {!testResult && !isLoading && (
                                    <div className="p-4 text-gray-500">
                                        Run your code to see the results here
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