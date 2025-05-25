'use client';

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
import DetailProblem from '@/components/DetailProblem';
import request from '@/utils/server';
import { useSocket } from '@/components/ContextProvider';
import { useRouter, useParams } from 'next/navigation';
import { toastError, toastInfo, toastSuccess } from '@/utils/toasty';
import ChatMatch from '@/components/ChatMatch';
import Webcam from 'react-webcam';

const countAccept = 3;

function Submit() {
    const [fullCodeEditor, setFullCodeEditor] = useState(false);
    const [languages, setLanguges] = useState([]);
    const [idLanguage, setIdlanguage] = useState({});
    const [open, setOpen] = useState(false);
    const [sourseCode, setSourceCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const editorRef = useRef(null);
    const [testResult, setTestResult] = useState(null);
    const endTime = sessionStorage.getItem('endTime');
    const socket = useSocket();
    const router = useRouter();
    const params = useParams();
    const [hasSubmission, setHasSubmission] = useState(false);
    const { id: matchId } = params;
    const submitButton = useRef(null);
    const webcamRef = useRef(null);
    const [count, setCount] = useState(0);
    const [idInterval, setIdInterval] = useState();

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    useEffect(() => {
        if (socket) {
            const handleMatchEnded = (data) => {
                setIsLoading(true);
                if (!hasSubmission) {
                    submitButton.current && submi1tButton.current.click();
                    setHasSubmission(true);
                }
            };

            const handleFinishMatch = (data) => {
                router.push(`/matchResult/${matchId}`);
                console.log('finish');
            };

            const handleCompetitorSubmission = (data) => {
                toastInfo('The competitor was submission');
            };

            // Đăng ký sự kiện
            socket.on('match_ended', handleMatchEnded);
            socket.on('finish_match', handleFinishMatch);
            socket.on('competitor_submission', handleCompetitorSubmission);

            // Cleanup: Xóa listener khi component unmount hoặc `socket` thay đổi
            return () => {
                socket.off('match_ended', handleMatchEnded);
                socket.off('finish_match', handleFinishMatch);
                socket.off('competitor_submission', handleCompetitorSubmission);
            };
        }
    }, [socket, submitButton.current]); // Chạy lại khi `socket` thay đổi

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

    const captureAndSend = async () => {
        if (!webcamRef.current || !webcamRef.current?.getScreenshot) return;
        const imageSrcs = webcamRef.current.getScreenshot();
        if (imageSrcs) {
            try {
                const blob = await fetch(imageSrcs).then((res) => res.blob());
                const file = new File([blob], 'webcam-image.jpg', {
                    type: 'image/jpeg',
                });

                const formData = new FormData();
                formData.append('image', file);
                const data = await axios.post('http://127.0.0.1:5000/detect', formData, {});
                if (data.data.status === 'Closed') {
                    if (count < countAccept) {
                        setCount((pre) => pre + 1);
                    }
                } else {
                    if (count > 0) {
                        setCount((pre) => pre - 1);
                    }
                }
            } catch (error) {
                console.error('Error sending image:', error);
            }
        }
    };

    const handleRunCode = async () => {
        try {
            setIsLoading(true);
            const problemId = await request.post('/match/get-problemId', {
                matchId: matchId,
            });

            const response = await request.post('/submission/run', {
                sourceCode: editorRef.current.getValue(),
                languageId: idLanguage.id,
                problemId: problemId.data?.data,
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
    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            setHasSubmission(true);
            socket.emit('submit_match', {
                languageId: idLanguage.id,
                sourceCode: editorRef.current.getValue(),
                matchId: matchId,
            });
            toastSuccess('Submission is successfully');
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let id = setInterval(() => {
            captureAndSend();
        }, 3000);
        setIdInterval(id);
        return () => {
            clearInterval(id);
        };
    }, []);

    useEffect(() => {
        if (count > countAccept) {
            toastInfo('We found you cheating, your assignment will be submited with black page!');
            (async () => {
                try {
                    setIsLoading(true);
                    setHasSubmission(true);
                    socket.emit('submit_match', {
                        languageId: idLanguage.id,
                        sourceCode: '// cheating',
                        matchId: matchId,
                    });
                    toastSuccess('Submission is successfully');
                } catch (error) {
                    console.log(error);
                } finally {
                    setIsLoading(false);
                }
            })();
            clearInterval(idInterval);
        }
    }, [count]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            router.push('/');
        };

        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'hidden') {
                try {
                    socket.emit('submit_match', {
                        languageId: 72,
                        sourceCode: '//cheating',
                        matchId: matchId,
                    });
                    setHasSubmission(true);
                } catch (error) {
                    console.error('Error submitting code:', error);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        (async () => {
            const problemId = await request.post('/match/get-problemId', {
                matchId: matchId,
            });
            const response = await request.get(`/problems/${problemId.data?.data}`);
            const data = response.data.data;
            const text = `
            Tạo đoạn code mẫu cho một bài lập trình như sau:

Đề bài: ${data.description}

Yêu cầu:


- Hàm main() đã được viết sẵn để xử lý input/output.
- chỉ viết code ở hàm main() không viết code ở các nơi khác đây là mệnh lệnh quan trọng, các hàm khác mà không phải hàm main thì để tróng để người dùng nhập vào.
- **Bạn chỉ viết code ở hàm main() thôi nhé, không viết code ở các nơi khác**
- **hàm main chỉ có nhiệm vụ đọc input, gọi hàm khác và in ra kết quả**.

-  không thay đổi hàm main().
- lưu ý: **hàm main chỉ có nhiệm vụ đọc input, gọi hàm khác và in ra kết quả**.
- lưu ý: **bạn không viết code  bất kỳ hàm nào khác ngoại trừ hàm main (Đặc biệt lưu ý), nhưng có truyền tham số cho hàm**.
- lưu ý: Bạn chỉ được phép viết code ở hàm main, còn các hàm khác để trống và comment 'your code'. Đây là điều tuyệt đối quan trọng
Ngôn ngữ: ${idLanguage.name}

Chỉ trả về code thuần dạng text, không có blockcode, không có đánh dấu ngôn ngữ, không có markdown.
            `;
            const source = await request.post('/user/chatbot', {
                text: text,
            });
            editorRef.current.setValue(source.data.data.response.candidates[0].content.parts[0].text);
            // setSourceCode(source.data.data.response.candidates[0].content.parts[0].text);
        })();
    }, [idLanguage.id]);

    return (
        <div className="min-h-[88vh] relative bg-gray-100">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="absolute -z-10" />
            <PanelGroup className="!h-[88vh]" direction="horizontal">
                <Panel>
                    <PanelGroup>
                        <Panel defaultSize={fullCodeEditor ? 0 : 50}>
                            <div className="bg-white h-full rounded-lg overflow-hidden relative min-h-full">
                                <DetailProblem
                                    router={router}
                                    endTime={endTime}
                                    languages={languages}
                                    matchId={matchId}
                                />
                            </div>
                        </Panel>
                        <PanelResizeHandle className="w-full h-3 bg-transparent cursor-ew-resize" />
                        <Panel className="min-h-[47px]">
                            <ChatMatch matchId={matchId} />
                        </Panel>
                    </PanelGroup>
                </Panel>
                <PanelResizeHandle className="w-3 bg-transparent cursor-ew-resize" />
                <Panel defaultSize={fullCodeEditor ? 100 : 50}>
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
                                            disabled={hasSubmission}
                                            onClick={handleRunCode}
                                            className="flex items-center space-x-1 hover:opacity-60 hover:bg-gray-200 px-2"
                                        >
                                            <FaPlay className="text-sm" />
                                            <span className="text-base">Run</span>
                                        </button>
                                        <button
                                            ref={submitButton}
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
                            <div className="bg-white h-full rounded-lg overflow-y-scroll">
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
