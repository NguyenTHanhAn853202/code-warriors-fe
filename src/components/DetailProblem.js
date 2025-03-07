import { TbNotes } from 'react-icons/tb';
import { GrPowerCycle } from 'react-icons/gr';
import { useState } from 'react';
import { Descriptions } from 'antd';

const tags = {
    description: 'description',
    submissions: 'submissions',
};

function DetailProblem() {
    const [tag, setTag] = useState(tags.description);
    return (
        <div>
            <div className="flex bg-gray-100 items-center space-x-3 px-3 py-2">
                <button
                    onClick={(e) => {
                        setTag(e.currentTarget.value);
                    }}
                    value={tags.description}
                    className={'flex items-center cursor-pointer ' + `${tag !== tags.description ? 'opacity-60' : ''}`}
                >
                    <TbNotes className="text-2xl text-sky-300" />
                    <span className='block ml-1'>Description</span>
                </button>
                <div className="h-[20px] w-[2px] rounded-lg bg-gray-300 "></div>
                <button
                    onClick={(e) => {
                        setTag(e.currentTarget.value);
                    }}
                    value={tags.submissions}
                    className={'flex items-center cursor-pointer space-x-2' + `${tag !== tags.submissions ? 'opacity-60' : ''}`}
                >
                    <GrPowerCycle className="text-2xl text-amber-300" />
                    <span className='block ml-2'>Submissions</span>
                </button>
            </div>
        </div>
    );
}

export default DetailProblem;
