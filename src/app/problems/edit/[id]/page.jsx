'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Input, Button, message, Select, Divider, Row, Col } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import Description from '@/app/contest/create/Description';

const { Option } = Select;
const { TextArea } = Input;

export default function EditProblemPage() {
    const { id } = useParams();
    const router = useRouter();
    const [form] = Form.useForm();
    const [descriptions, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [ranks, setRanks] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [problemRes, ranksRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/v1/problems/viewOneProblems/${id}`),
                    axios.get('http://localhost:8080/api/v1/rank/viewAllRanks'),
                ]);

                const problem = problemRes.data.problem;
                console.log('Fetched problem:', problem);
                form.setFieldsValue({
                    title: problem.title,
                    difficulty: problem.difficulty?.[0]?._id,
                    testCases:
                        problem.testCases?.map((tc) => ({
                            input: tc.input,
                            expectedOutput: tc.expectedOutput,
                        })) || [],
                    description: problem.description,
                });
                setDescription(problem.description);
                setRanks(ranksRes.data.data.ranks || []);
            } catch (err) {
                message.error('Failed to load problem data');
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            let updatedDescription = descriptions;

            if (values.testCases && values.testCases.length > 0) {
                const firstTestCase = values.testCases[0];
                const testCaseText = `
<br/>
<b>Example:</b><br/>
<pre>
Input:
${firstTestCase.input}

Expected Output:
${firstTestCase.expectedOutput}
</pre>
            `;
                updatedDescription += testCaseText;
            }
            await axios.patch(`http://localhost:8080/api/v1/problems/updateProblems/${id}`, {
                ...values,
                description: updatedDescription,
                testCases: values.testCases || [],
            });
            message.success('Problem updated successfully');
            router.push('/problems');
        } catch (err) {
            message.error('Failed to update problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Edit Problem</h1>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Description">
                    <Description value={descriptions} setValue={setDescription} />
                </Form.Item>

                <Form.Item name="difficulty" label="Difficulty" rules={[{ required: true }]}>
                    <Select>
                        {ranks.map((difficulty) => (
                            <Option key={difficulty._id} value={difficulty._id}>
                                {difficulty.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Divider>Test Cases</Divider>

                <Form.List name="testCases">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="mb-4 p-4 border border-dashed rounded">
                                    <Row gutter={16}>
                                        <Col span={11}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'input']}
                                                label="Input"
                                                rules={[{ required: true }]}
                                            >
                                                <TextArea rows={3} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={11}>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'expectedOutput']}
                                                label="Expected Output"
                                                rules={[{ required: true }]}
                                            >
                                                <TextArea rows={3} />
                                            </Form.Item>
                                        </Col>
                                        <Col span={2} className="flex items-center justify-center">
                                            <Button danger type="text" onClick={() => remove(name)}>
                                                Remove
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            ))}
                            <Button type="dashed" onClick={() => add()} block>
                                Add Test Case
                            </Button>
                        </>
                    )}
                </Form.List>

                <Form.Item className="mt-6">
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Update Problem
                    </Button>
                    <Button className="ml-4" onClick={() => router.push('/problems')}>
                        Cancel
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
