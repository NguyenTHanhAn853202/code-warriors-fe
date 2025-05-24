'use client';

import { Editor } from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FaCode, FaPlay } from 'react-icons/fa6';
import { RiFullscreenLine } from 'react-icons/ri';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import { LuTerminal } from 'react-icons/lu';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { use, useEffect, useRef, useState } from 'react';
import { Button, Popover, Spin } from 'antd';
import axios from 'axios';
import DetailProblem from '@/components/DetailProblem';
import request from '@/utils/server';
import { toastInfo, toastSuccess } from '@/utils/toasty';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/ContextProvider';

function Submit({ params }) {
    const [fullCodeEditor, setFullCodeEditor] = useState(false);
    const [languages, setLanguages] = useState([]);
    const [idLanguage, setIdLanguage] = useState({});
    const [open, setOpen] = useState(false);
    const [sourceCode, setSourceCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const editorRef = useRef(null);
    const [testResult, setTestResult] = useState(null);
    const router = useRouter();
    const problemId = useSearchParams().get('problemId');
    const { id } = use(params);
    const roomId = id;
    const socket = useSocket();
    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    useEffect(() => {
        if (!socket) return;
        socket.on('connect', () => {
            console.log('Connected to socket server');
        });
    }, [socket]);

    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await axios.get('https://ce.judge0.com/languages');
                if (response.status === 200) {
                    const data = response.data || [];
                    const languageMap = {};

                    // Process language data
                    data.forEach((item) => {
                        const name = item.name.split(' ')[0];
                        if (!languageMap[name]) {
                            languageMap[name] = item.id;
                        }
                    });

                    // Convert to array format
                    const languages = Object.entries(languageMap).map(([name, id]) => ({
                        id,
                        name,
                    }));

                    setLanguages(languages);
                    setIdLanguage({
                        id: languages[4]?.id,
                        name: languages[4]?.name,
                    });
                }
            } catch (error) {
                console.error('Error fetching languages:', error);
                toastInfo('Failed to load languages');
            }
        };

        fetchLanguages();
    }, []);

    useEffect(() => {
        if (!socket) return;

        // Listen for submission success
        socket.on('submission_success', (submission) => {
            setTestResult({
                status: 'success',
                data: {
                    status: submission.status,
                    score: `${submission.grade}/${submission.total}`,
                    memory: submission.memoryUsage,
                    time: submission.executionTime,
                },
            });
            toastSuccess('Nộp bài thành công');
            setIsSubmitting(false);
        });

        // Listen for submission updates with full information
        socket.on('submission_update', ({ submission, isComplete, redirectUrl }) => {
            setTestResult({
                status: 'success',
                data: {
                    status: submission.status,
                    score: `${submission.grade}/${submission.total}`,
                    memory: submission.memoryUsage,
                    time: submission.executionTime,
                    timeSubmission: submission.timeSubmission, // Add submission time
                },
            });

            if (isComplete) {
                toastSuccess('Tất cả người chơi đã nộp bài!');
                if (redirectUrl) {
                    router.push(redirectUrl);
                }
            }
        });

        // Update battle_finished handling
        socket.on('battle_finished', ({ message, room, rankings, winner, redirectUrl }) => {
            toastSuccess(message || 'Trận đấu đã kết thúc!');

            // Save rankings information to localStorage for use on the result page
            localStorage.setItem(
                'battleResult',
                JSON.stringify({
                    rankings,
                    winner,
                    room,
                }),
            );

            // Redirect to the result page
            if (redirectUrl) {
                router.push(redirectUrl);
            }
        });

        socket.on('submission_error', ({ message }) => {
            setTestResult({
                status: 'warning',
                message: message,
            });
            setIsSubmitting(false);
            setIsLoading(false);
            toastInfo(message);
        });

        return () => {
            socket.off('submission_success');
            socket.off('submission_update');
            socket.off('submission_error');
            socket.off('battle_finished');
        };
    }, [socket, router, roomId]);

    const handleSubmit = async () => {
        try {
            if (isSubmitting) return;

            const code = editorRef.current?.getValue();
            if (!code) {
                toastInfo('Please fill your code');
                return;
            }

            setIsLoading(true);
            setIsSubmitting(true);

            socket.emit('submit_code', {
                roomId,
                username: localStorage.getItem('username'),
                sourceCode: code,
                languageId: idLanguage.id,
            });
            router.push(`/battleOngoing/matchResult/${roomId}`);
        } catch (error) {
            console.error('Submission error:', error);
            setTestResult({
                status: 'warning',
                message: 'Failed to submit solution',
            });
            toastInfo('Failed to submit solution');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRunCode = async () => {
        try {
            const code = editorRef.current?.getValue();
            if (!code) {
                toastInfo('Please fill your code');
                return;
            }

            setIsLoading(true);
            const response = await request.post('/submission/run', {
                sourceCode: code,
                languageId: idLanguage.id,
                problemId: problemId,
            });

            if (response.data) {
                setTestResult(response.data);
            }
        } catch (error) {
            console.error('Run code error:', error);
            setTestResult({
                status: 'warning',
                message: error.response?.data?.message || 'Failed to run code',
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchAndSetupProblem = async () => {
            try {
                if (!problemId || !idLanguage?.name) {
                    return;
                }

                const response = await request.get(`/problems/${problemId}`);
                const problemData = response.data?.data;

                if (!problemData?.description) {
                    throw new Error('Invalid problem data');
                }

                const text = `
                    Create a code template for the following programming problem:

                    Problem: ${problemData.description}

                    Requirements:
                    - Have an empty solve() function for implementation
                    - solve() function should have // write code here comment
                    - main() function should be pre-written for I/O
                    - Do not modify main() function
                    - Note: Don't write code in solve(), but include parameters

                    Language: ${idLanguage.name}
                `.trim();

                const source = await request.post('/user/chatbot', { text });
                const sourceCode = source?.data?.data?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (editorRef.current && sourceCode) {
                    editorRef.current.setValue(sourceCode);
                    setSourceCode(sourceCode);
                }
            } catch (error) {
                console.error('Error fetching problem:', error);
                toastInfo('Failed to load problem');
            }
        };

        fetchAndSetupProblem();
    }, [idLanguage?.id, problemId]);

    return (
        <div className="min-h-[88vh] relative bg-gray-100">
            <PanelGroup className="!h-[88vh]" direction="horizontal">
                {/* Problem Details Panel */}
                <Panel defaultSize={fullCodeEditor ? 0 : 50}>
                    <div className="bg-white h-full rounded-lg overflow-hidden">
                        <DetailProblem languages={languages} problemId={problemId} />
                    </div>
                </Panel>

                <PanelResizeHandle className="w-3 bg-transparent cursor-ew-resize" />

                {/* Code Editor Panel */}
                <Panel defaultSize={fullCodeEditor ? 100 : 50}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={95}>
                            <div className="bg-white rounded-lg overflow-hidden h-full">
                                {/* Toolbar */}
                                <div className="flex bg-gray-100 items-center justify-between h-[30px] px-3 py-2">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <FaCode className="text-green-500 text-xl" />
                                            <span>Code</span>
                                        </div>
                                        <button
                                            onClick={handleRunCode}
                                            className="flex items-center space-x-1 hover:opacity-60 hover:bg-gray-200 px-2"
                                            disabled={isLoading}
                                        >
                                            <FaPlay className="text-sm" />
                                            <span>Run</span>
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            className={`flex items-center text-green-500 space-x-1 hover:opacity-60 hover:bg-gray-200 px-2
                                                        ${isLoading || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={isLoading || isSubmitting}
                                        >
                                            <MdOutlineCloudUpload className="text-xl" />
                                            <span>Submit</span>
                                        </button>
                                    </div>

                                    {/* Right side controls */}
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => setFullCodeEditor(!fullCodeEditor)}>
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
                                                            setIdLanguage(item);
                                                            setOpen(false);
                                                        }}
                                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                    >
                                                        {item.name}
                                                    </button>
                                                ))}
                                            </div>
                                        }
                                    >
                                        <Button className="!border-none hover:!text-black" icon={<IoIosArrowDown />}>
                                            {idLanguage.name || 'Select Language'}
                                        </Button>
                                    </Popover>
                                </div>

                                {/* Code editor */}
                                <Editor
                                    height="calc(100% - 80px)"
                                    defaultLanguage={(idLanguage?.name || '').toLowerCase()}
                                    value={sourceCode}
                                    theme="vs-dark"
                                    onMount={handleEditorDidMount}
                                    onChange={setSourceCode}
                                    options={{
                                        minimap: { enabled: true },
                                        lineNumbers: 'on',
                                        fontSize: 14,
                                        tabSize: 2,
                                    }}
                                />
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-2 bg-transparent cursor-ns-resize" />

                        {/* Results Panel */}
                        <Panel className="min-h-[47px]">
                            <div className="bg-white h-full rounded-lg overflow-y-auto">
                                <div className="bg-gray-200 p-3 sticky top-0">
                                    {isLoading ? (
                                        <Spin />
                                    ) : (
                                        <div className="flex items-center">
                                            <LuTerminal className="text-xl text-green-500 mr-2" />
                                            <span className="text-sm">Test Result</span>
                                        </div>
                                    )}
                                </div>

                                {/* Success result */}
                                {testResult?.status === 'success' && (
                                    <div className="p-4">
                                        <h2
                                            className={`text-3xl ${
                                                testResult.data.status === 'Accepted'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {testResult.data.status}
                                        </h2>
                                        <div className="mt-4 space-y-2">
                                            <h3 className="text-yellow-600">Score: {testResult.data.score}</h3>
                                            <h3 className="text-purple-600">Time: {testResult.data.time} ms</h3>
                                            <h3 className="text-sky-600">Memory: {testResult.data.memory} KB</h3>
                                        </div>
                                    </div>
                                )}

                                {/* Error result */}
                                {testResult?.status === 'warning' && (
                                    <div className="p-4">
                                        <h2 className="text-red-600 text-3xl">Error</h2>
                                        <p className="mt-2 text-orange-600">{testResult.message}</p>
                                        {testResult.data && (
                                            <div className="mt-4 space-y-2">
                                                <h3 className="text-green-600">
                                                    Input:{' '}
                                                    <span className="font-mono">{testResult.data.testcase?.input}</span>
                                                </h3>
                                                <h3 className="text-purple-600">
                                                    Expected:{' '}
                                                    <span className="font-mono">
                                                        {testResult.data.testcase?.expectedOutput}
                                                    </span>
                                                </h3>
                                                <h3 className="text-sky-600">
                                                    Output:{' '}
                                                    <span className="font-mono">{testResult.data.result?.stdout}</span>
                                                </h3>
                                            </div>
                                        )}
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
