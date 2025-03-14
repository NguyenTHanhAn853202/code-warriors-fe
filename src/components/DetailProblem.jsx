import { TbNotes } from 'react-icons/tb';
import { GrPowerCycle } from 'react-icons/gr';
import { useEffect, useState } from 'react';
import TagLevel from './TagLevel';
import DOMPurify from 'dompurify';
import request from '../utils/server';
import { Table } from 'antd';
import formatDate from '../utils/formatDay';

const tags = {
    description: 'description',
    submissions: 'submissions',
};

const columns = [
    {
        title: 'Index',
        dataIndex: 'index',
        key: 'index',
        width: '10%',
        align: 'center',
        render: (text, record, index) => index + 1,
    },
    {
        title: 'Date',
        dataIndex: 'date',
        sorter: (a, b) => new Date(a.date) - new Date(b.date),
        width: '18%',
        align: 'center',
    },
    {
        title: 'Language',
        dataIndex: 'language',
        onFilter: (value, record) => record.language === value,
        filterSearch: true,
        width: '18%',
        align: 'center',
    },
    {
        title: 'Runtime (ms)',
        dataIndex: 'runtime',
        sorter: (a, b) => a.runtime - b.runtime,
        width: '18%',
        align: 'center',
    },
    {
        title: 'Memory (MB)',
        dataIndex: 'memory',
        sorter: (a, b) => a.memory - b.memory,
        width: '18%',
        align: 'center',
    },
    {
        title: 'Score',
        dataIndex: 'score',
        sorter: (a, b) => a.score - b.score,
        width: '18%',
        align: 'center',
    },
];

function DetailProblem({ problemId, languages }) {
    const [tag, setTag] = useState(tags.description);
    const [data, setData] = useState({
        _id: '',
        title: '',
        description: '',
    });
    const [submission, setSubmission] = useState([]);

    const onChange = (pagination, filters, sorter, extra) => {
        console.log('params', pagination, filters, sorter, extra);
    };

    const checkLanguage = (languageId) => {
        for (let item of languages) {
            if (item.id == languageId) return item.name;
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const response = await request.get(`/problems/${problemId}`);
                if (response.status === 200) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [problemId]);

    useEffect(() => {
        if (tag == tags.submissions) {
            async function query() {
                const response = await request.get('/submission/history/' + problemId);
                if (response.status === 200) {
                    let dataSource = response.data.data;
                    dataSource = dataSource.map((item, index) => ({
                        key: index,
                        date: formatDate(item.createdAt),
                        language: checkLanguage(item.languageId),
                        runtime: item.time,
                        memory: item.memory,
                        score: item.score,
                    }));
                    setSubmission(dataSource);
                }
            }
            query();
        }
    }, [tag]);

    return (
        <div className=" h-full">
            <div className="flex bg-gray-50 items-center h-[30px] space-x-3 px-3 py-2">
                <button
                    onClick={(e) => {
                        setTag(e.currentTarget.value);
                    }}
                    value={tags.description}
                    className={'flex items-center cursor-pointer ' + `${tag !== tags.description ? 'opacity-60' : ''}`}
                >
                    <TbNotes className="text-xl text-sky-300" />
                    <span className="block ml-1 text-sm ">Description</span>
                </button>
                <div className="h-[20px] w-[2px] rounded-lg bg-gray-300 "></div>
                <button
                    onClick={(e) => {
                        setTag(e.currentTarget.value);
                    }}
                    value={tags.submissions}
                    className={'flex items-center cursor-pointer ' + `${tag !== tags.submissions ? 'opacity-60' : ''}`}
                >
                    <GrPowerCycle className="text-xl text-amber-300" />
                    <span className="block ml-2 text-sm">Submissions</span>
                </button>
            </div>
            {tag === tags.description ? (
                <div className="px-4 py-5 space-y-3 overflow-y-scroll pb-12  h-full">
                    <h1 className="text-3xl">
                        {'#' + data._id.slice(data._id.length - 6, data._id.length) + '. ' + data?.title}
                    </h1>
                    <div>
                        <span className="text-base font-light">Level: </span>
                        <TagLevel />
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data?.description || '') }}></div>
                </div>
            ) : (
                <div>
                    <Table pagination={false} columns={columns} dataSource={submission} onChange={onChange} />
                </div>
            )}
        </div>
    );
}

export default DetailProblem;
